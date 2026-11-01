import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { mailConfig } from '../../config/mail.config';

@Injectable()
export class EmailService {
  /**
   * Generic send mail method
   */
  private async sendMail(
    userEmail: string,
    subject: string,
    htmlContent: string,
    context: any = {}
  ): Promise<{ success: boolean; response?: any; error?: any; reason?: string }> {
    try {
      // Check if mail is enabled
      if (!mailConfig.enabled) {
        console.log('[MAIL] Email sending is disabled');
        return { success: false, reason: 'disabled' };
      }

      // Get the actual recipient based on environment
      const actualRecipient = mailConfig.getRecipientEmail(userEmail);

      // Log email details in development mode
      mailConfig.logEmail({
        originalRecipient: userEmail,
        actualRecipient: actualRecipient,
        subject: subject,
        context: context,
      });

      // Prepare request body
      const bodyData = {
        institution: mailConfig.institution,
        subject: subject,
        type: 'general',
        message: htmlContent,
        mail_to: [actualRecipient],
      };

      try {
        const response = await axios.post(mailConfig.apiUrl, bodyData, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.data) {
          console.log('[MAIL] Email sent successfully');
          return { success: true, response: response.data };
        } else {
          return { success: false, response: null };
        }
      } catch (requestError) {
        console.log('[MAIL] Error sending email:', requestError.message);
        return { success: false, error: requestError.message };
      }
    } catch (error) {
      console.log('[MAIL] Exception:', error);
      return { success: false, error: error };
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOtpEmail(email: string, otp: string, userName?: string): Promise<any> {
    try {
      const templatePath = path.join(__dirname, './templates/otp-verification.html');
      const source = fs.readFileSync(templatePath, 'utf-8').toString();
      const template = handlebars.compile(source);

      const replacements = {
        userName: userName || 'Player',
        userEmail: email,
        otp: otp,
        clientUrl: mailConfig.clientUrl,
        year: new Date().getFullYear(),
      };

      const htmlToSend = template(replacements);

      return await this.sendMail(
        email,
        'Verify Your Email - Cricket Scoring App',
        htmlToSend,
        { userName: userName, otp: otp }
      );
    } catch (error) {
      console.log('[MAIL] Error sending OTP email:', error);
      return { success: false, error: error };
    }
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email: string, userName?: string): Promise<any> {
    try {
      const templatePath = path.join(__dirname, './templates/welcome.html');
      const source = fs.readFileSync(templatePath, 'utf-8').toString();
      const template = handlebars.compile(source);

      const replacements = {
        userName: userName || 'Player',
        userEmail: email,
        clientUrl: mailConfig.clientUrl,
        year: new Date().getFullYear(),
      };

      const htmlToSend = template(replacements);

      return await this.sendMail(
        email,
        'Welcome to Cricket Scoring App!',
        htmlToSend,
        { userName: userName }
      );
    } catch (error) {
      console.log('[MAIL] Error sending welcome email:', error);
      return { success: false, error: error };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<any> {
    try {
      const resetUrl = `${mailConfig.clientUrl}/reset-password?token=${resetToken}`;

      const templatePath = path.join(__dirname, './templates/password-reset.html');
      const source = fs.readFileSync(templatePath, 'utf-8').toString();
      const template = handlebars.compile(source);

      const replacements = {
        resetUrl: resetUrl,
        clientUrl: mailConfig.clientUrl,
        year: new Date().getFullYear(),
      };

      const htmlToSend = template(replacements);

      return await this.sendMail(
        email,
        'Reset Your Password - Cricket Scoring App',
        htmlToSend,
        { resetUrl: resetUrl }
      );
    } catch (error) {
      console.log('[MAIL] Error sending password reset email:', error);
      return { success: false, error: error };
    }
  }
}
