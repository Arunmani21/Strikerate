/**
 * Email Configuration for Cricket Scoring App
 *
 * Features:
 * - Development mode: Redirects all emails to DEV_FALLBACK_EMAIL
 * - Production mode: Sends to actual recipient
 * - Toggle to enable/disable emails
 * - External email API integration
 */

export const mailConfig = {
  // Enable/disable email sending
  enabled: process.env.MAIL_ENABLED !== 'false', // Default: true

  // Email API configuration
  apiUrl: process.env.MAIL_API_URL || 'https://your-email-api.com/send',
  institution: process.env.MAIL_INSTITUTION || 'Cricket Scoring App',

  // Frontend URL for links in emails
  clientUrl: process.env.FRONTEND_URL || 'http://localhost:4200',

  // Fallback email for development (redirects all emails here)
  devFallbackEmail: process.env.DEV_FALLBACK_EMAIL || 'dev@cricketapp.com',

  // Environment
  environment: process.env.NODE_ENV || 'development',

  /**
   * Get the actual recipient email based on environment
   * - Development: Returns DEV_FALLBACK_EMAIL
   * - Production: Returns the actual user email
   */
  getRecipientEmail(userEmail: string): string {
    if (this.environment === 'development') {
      return this.devFallbackEmail;
    }
    return userEmail;
  },

  /**
   * Log email details in development mode
   */
  logEmail(details: {
    originalRecipient: string;
    actualRecipient: string;
    subject: string;
    context?: any;
  }) {
    if (this.environment === 'development') {
      console.log('\n════════════════════════════════════════');
      console.log('📧 EMAIL SERVICE (Development Mode)');
      console.log('════════════════════════════════════════');
      console.log(`Original Recipient: ${details.originalRecipient}`);
      console.log(`Actual Recipient: ${details.actualRecipient}`);
      console.log(`Subject: ${details.subject}`);
      if (details.context) {
        console.log(`Context:`, details.context);
      }
      console.log('════════════════════════════════════════\n');
    }
  },
};
