import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'strikerate_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    // Callback must be reachable by the BROWSER. Empty = passport derives it
    // from the request host (fine while not behind a proxy).
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },
}));
