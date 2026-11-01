import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import type { Request } from 'express';

export interface GoogleProfilePayload {
  googleId: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Web flow: authorization-code redirect built by hand (passport's state
 * verification needs server sessions, which are disabled). The `state`
 * nonce round-trips through Google and is validated against an HttpOnly
 * cookie in the controller.
 * Mobile flow: Capacitor plugin returns an idToken; verified directly.
 * Both land in AuthService.loginWithGoogleProfile.
 */
@Injectable()
export class GoogleAuthService {
  constructor(private configService: ConfigService) {}

  isConfigured(): boolean {
    return !!this.configService.get('app.google.clientId');
  }

  /** The OAuth redirect_uri must be identical in the auth URL and the code
   *  exchange. GOOGLE_CALLBACK_URL overrides; otherwise derive from the
   *  incoming request (correct behind a proxy once TRUST_PROXY is on). */
  redirectUri(req: Request): string {
    const configured = this.configService.get<string>('app.google.callbackUrl');
    if (configured) return configured;
    return `${req.protocol}://${req.get('host')}/auth/google/callback`;
  }

  buildAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.configService.get<string>('app.google.clientId'),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    });
    return `${GOOGLE_AUTH_ENDPOINT}?${params}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<GoogleProfilePayload> {
    const client = new OAuth2Client(
      this.configService.get('app.google.clientId'),
      this.configService.get('app.google.clientSecret'),
      redirectUri,
    );
    try {
      const { tokens } = await client.getToken(code);
      if (!tokens.id_token) {
        throw new UnauthorizedException('Google did not return an id token');
      }
      return this.verifyIdToken(tokens.id_token);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Google sign-in failed. Please try again.');
    }
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfilePayload> {
    const clientId = this.configService.get<string>('app.google.clientId');
    const client = new OAuth2Client(clientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Google token has no account information');
    }
    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      emailVerified: payload.email_verified === true,
      name: payload.name || payload.email.split('@')[0],
    };
  }
}
