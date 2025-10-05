import fetch from 'node-fetch';
import { createLogger } from '../../../common/logging/index.js';

const logger = createLogger('sendgrid-client');

/**
 * SENDGRID EMAIL CLIENT
 *
 * SendGrid API integration for transactional emails
 * API Docs: https://docs.sendgrid.com/api-reference/mail-send/mail-send
 *
 * Environment Variables:
 * - SENDGRID_API_KEY: API key from SendGrid dashboard
 * - SENDGRID_FROM_EMAIL: Verified sender email
 * - SENDGRID_FROM_NAME: Sender name
 */

export class SendGridClient {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@reggieanddro.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Reggie & Dro';
    this.baseUrl = 'https://api.sendgrid.com/v3';

    this.available = !!this.apiKey;

    if (!this.available) {
      logger.warn('SendGrid API key not configured - email sending disabled');
    } else {
      logger.info('SendGrid client initialized', {
        fromEmail: this.fromEmail,
        fromName: this.fromName
      });
    }
  }

  isAvailable() {
    return this.available;
  }

  /**
   * Send verification request email
   */
  async sendVerificationEmail({ to, orderId, verificationUrl, deadline }) {
    try {
      logger.info('Sending verification email', { to, orderId });

      const response = await this.sendEmail({
        to,
        subject: '🔐 Complete Your Age Verification - 72 Hours',
        html: this.buildVerificationEmailHTML({ orderId, verificationUrl, deadline }),
        text: this.buildVerificationEmailText({ orderId, verificationUrl, deadline })
      });

      logger.info('Verification email sent', { to, orderId, messageId: response.messageId });

      return response;

    } catch (error) {
      logger.error('Failed to send verification email', {
        error: error.message,
        to,
        orderId
      });

      throw error;
    }
  }

  /**
   * Send verification confirmation email
   */
  async sendConfirmationEmail({ to, orderId, loyaltyId }) {
    try {
      logger.info('Sending confirmation email', { to, orderId });

      const response = await this.sendEmail({
        to,
        subject: '✅ Verification Complete - Welcome to Reggie & Dro!',
        html: this.buildConfirmationEmailHTML({ orderId, loyaltyId }),
        text: this.buildConfirmationEmailText({ orderId, loyaltyId })
      });

      logger.info('Confirmation email sent', { to, orderId, messageId: response.messageId });

      return response;

    } catch (error) {
      logger.error('Failed to send confirmation email', {
        error: error.message,
        to,
        orderId
      });

      throw error;
    }
  }

  /**
   * Send reminder email (48 hours before deadline)
   */
  async sendReminderEmail({ to, orderId, verificationUrl, hoursRemaining }) {
    try {
      logger.info('Sending reminder email', { to, orderId, hoursRemaining });

      const response = await this.sendEmail({
        to,
        subject: `⏰ Reminder: ${hoursRemaining} Hours Left to Verify`,
        html: this.buildReminderEmailHTML({ orderId, verificationUrl, hoursRemaining }),
        text: this.buildReminderEmailText({ orderId, verificationUrl, hoursRemaining })
      });

      logger.info('Reminder email sent', { to, orderId, messageId: response.messageId });

      return response;

    } catch (error) {
      logger.error('Failed to send reminder email', {
        error: error.message,
        to,
        orderId
      });

      throw error;
    }
  }

  /**
   * Send refund notification email
   */
  async sendRefundEmail({ to, orderId, refundAmount }) {
    try {
      logger.info('Sending refund email', { to, orderId, refundAmount });

      const response = await this.sendEmail({
        to,
        subject: '💰 Order Refund Processed',
        html: this.buildRefundEmailHTML({ orderId, refundAmount }),
        text: this.buildRefundEmailText({ orderId, refundAmount })
      });

      logger.info('Refund email sent', { to, orderId, messageId: response.messageId });

      return response;

    } catch (error) {
      logger.error('Failed to send refund email', {
        error: error.message,
        to,
        orderId
      });

      throw error;
    }
  }

  /**
   * Core send email function
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.available) {
      throw new Error('SendGrid not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }]
          }],
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid API error: ${error}`);
      }

      return {
        success: true,
        messageId: response.headers.get('x-message-id')
      };

    } catch (error) {
      logger.error('SendGrid send failed', {
        error: error.message,
        to
      });

      throw error;
    }
  }

  // Email templates

  buildVerificationEmailHTML({ orderId, verificationUrl, deadline }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2D5F3F; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 15px 30px; background: #2D5F3F; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Complete Your Age Verification</h1>
    </div>
    <div class="content">
      <p>Thank you for your order!</p>
      <p>To complete your purchase, please verify your age within <strong>72 hours</strong>.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Age Now</a>
      </p>
      <p><strong>What happens if I don't verify?</strong></p>
      <p>If you don't complete verification within 72 hours, your order will be automatically refunded to your original payment method.</p>
      <p><strong>Why do we need this?</strong></p>
      <p>Texas law requires age verification for cannabis purchases. We verify AFTER purchase to make checkout fast and easy.</p>
    </div>
    <div class="footer">
      <p>Reggie & Dro - Premium Cannabis Delivery</p>
      <p>San Antonio, TX | (210) 999-9999</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  buildVerificationEmailText({ orderId, verificationUrl, deadline }) {
    return `
Complete Your Age Verification

Thank you for your order!

To complete your purchase, please verify your age within 72 hours.

Order ID: ${orderId}
Deadline: ${new Date(deadline).toLocaleString()}

Verify Age Now: ${verificationUrl}

What happens if I don't verify?
If you don't complete verification within 72 hours, your order will be automatically refunded to your original payment method.

Why do we need this?
Texas law requires age verification for cannabis purchases. We verify AFTER purchase to make checkout fast and easy.

Reggie & Dro - Premium Cannabis Delivery
San Antonio, TX | (210) 999-9999
    `.trim();
  }

  buildConfirmationEmailHTML({ orderId, loyaltyId }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2D5F3F; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Verification Complete!</h1>
    </div>
    <div class="content">
      <p>Congratulations! Your age verification is complete.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      ${loyaltyId ? `<p><strong>Loyalty ID:</strong> ${loyaltyId}</p>` : ''}
      <p>Your order is now being processed and will be shipped within 1-2 business days.</p>
      ${loyaltyId ? `
      <p><strong>Welcome to our Loyalty Program!</strong></p>
      <ul>
        <li>Free product on first order</li>
        <li>Exclusive member pricing</li>
        <li>Early access to new strains</li>
        <li>Birthday rewards</li>
      </ul>
      ` : ''}
      <p>Thank you for choosing Reggie & Dro!</p>
    </div>
    <div class="footer">
      <p>Reggie & Dro - Premium Cannabis Delivery</p>
      <p>San Antonio, TX | (210) 999-9999</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  buildConfirmationEmailText({ orderId, loyaltyId }) {
    return `
Verification Complete!

Congratulations! Your age verification is complete.

Order ID: ${orderId}
${loyaltyId ? `Loyalty ID: ${loyaltyId}` : ''}

Your order is now being processed and will be shipped within 1-2 business days.

${loyaltyId ? `
Welcome to our Loyalty Program!
- Free product on first order
- Exclusive member pricing
- Early access to new strains
- Birthday rewards
` : ''}

Thank you for choosing Reggie & Dro!

Reggie & Dro - Premium Cannabis Delivery
San Antonio, TX | (210) 999-9999
    `.trim();
  }

  buildReminderEmailHTML({ orderId, verificationUrl, hoursRemaining }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #FF6B00; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 15px 30px; background: #FF6B00; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Reminder: ${hoursRemaining} Hours Left</h1>
    </div>
    <div class="content">
      <p>This is a friendly reminder that you have <strong>${hoursRemaining} hours remaining</strong> to complete your age verification.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Age Now</a>
      </p>
      <p><strong>Don't miss out!</strong></p>
      <p>If you don't complete verification before the deadline, your order will be automatically refunded.</p>
    </div>
    <div class="footer">
      <p>Reggie & Dro - Premium Cannabis Delivery</p>
      <p>San Antonio, TX | (210) 999-9999</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  buildReminderEmailText({ orderId, verificationUrl, hoursRemaining }) {
    return `
Reminder: ${hoursRemaining} Hours Left

This is a friendly reminder that you have ${hoursRemaining} hours remaining to complete your age verification.

Order ID: ${orderId}

Verify Age Now: ${verificationUrl}

Don't miss out!
If you don't complete verification before the deadline, your order will be automatically refunded.

Reggie & Dro - Premium Cannabis Delivery
San Antonio, TX | (210) 999-9999
    `.trim();
  }

  buildRefundEmailHTML({ orderId, refundAmount }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #666; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Order Refund Processed</h1>
    </div>
    <div class="content">
      <p>We're sorry, but your order has been refunded because age verification was not completed within 72 hours.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
      <p>Your refund has been processed and will appear on your original payment method within 5-7 business days.</p>
      <p><strong>Want to try again?</strong></p>
      <p>Visit our website to place a new order. Next time, make sure to complete verification within 72 hours!</p>
    </div>
    <div class="footer">
      <p>Reggie & Dro - Premium Cannabis Delivery</p>
      <p>San Antonio, TX | (210) 999-9999</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  buildRefundEmailText({ orderId, refundAmount }) {
    return `
Order Refund Processed

We're sorry, but your order has been refunded because age verification was not completed within 72 hours.

Order ID: ${orderId}
Refund Amount: $${refundAmount.toFixed(2)}

Your refund has been processed and will appear on your original payment method within 5-7 business days.

Want to try again?
Visit our website to place a new order. Next time, make sure to complete verification within 72 hours!

Reggie & Dro - Premium Cannabis Delivery
San Antonio, TX | (210) 999-9999
    `.trim();
  }
}

// Export singleton instance
let sendgridClient = null;

export function getSendGridClient() {
  if (!sendgridClient) {
    sendgridClient = new SendGridClient();
  }
  return sendgridClient;
}

export default SendGridClient;

// Created: 2025-10-04
// Real SendGrid integration for transactional emails
// Production-ready with HTML/text templates
