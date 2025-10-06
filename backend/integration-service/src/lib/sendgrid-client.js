import { createLogger } from '../../common/logging/index.js';

const logger = createLogger('sendgrid-client');

export class SendGridClient {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || null;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@reggieanddro.com';
    
    if (!this.apiKey) {
      logger.warn('SENDGRID_API_KEY not set - using mock mode');
    }
  }

  // eslint-disable-next-line no-unused-vars
  async sendEmail(to, subject, _html, _text) {
    if (!this.apiKey) {
      logger.info('Mock email sent', { to, subject });
      return { success: true, messageId: 'mock-' + Date.now() };
    }

    // TODO: Implement real SendGrid API call
    // _html and _text will be used when real API is implemented
    logger.info(`Sending email to ${to}: ${subject}`);
    return { success: true, messageId: 'real-' + Date.now() };
  }

  async sendVerificationEmail(customerEmail, verificationLink) {
    const subject = 'Age Verification Required - Reggie & Dro';
    const html = `
      <h2>Age Verification Required</h2>
      <p>Please complete your age verification to continue shopping:</p>
      <a href="${verificationLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Age</a>
      <p>This link expires in 24 hours.</p>
    `;
    const text = `Age Verification Required. Please visit: ${verificationLink}`;

    return this.sendEmail(customerEmail, subject, html, text);
  }
}

export function getSendGridClient() {
  return new SendGridClient();
}
