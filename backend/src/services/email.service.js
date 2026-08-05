const nodemailer = require('nodemailer');
const env = require('../config/env');

/**
 * NotificationService — common interface for any way of alerting the
 * admin about something (new contact message, new comment, etc).
 * `EmailNotification` is the implementation today; a `SmsNotification`
 * or `SlackNotification` could be dropped in later without touching
 * the callers (Polymorphism / Open-Closed Principle).
 */
class NotificationService {
  // eslint-disable-next-line no-unused-vars
  async send({ to, subject, message }) {
    throw new Error('send() must be implemented by subclass');
  }
}

class EmailNotification extends NotificationService {
  constructor() {
    super();
    this.transporter = null;
    if (env.SMTP_HOST && env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      });
    }
  }

  async send({ to, subject, message, html }) {
    if (!this.transporter) {
      console.warn('[email] SMTP not configured — skipping send. Message was:', { to, subject });
      return { skipped: true };
    }
    return this.transporter.sendMail({
      from: `"Portfolio" <${env.SMTP_USER}>`,
      to,
      subject,
      text: message,
      html: html || `<p>${message}</p>`,
    });
  }
}

/** Placeholder for a future channel — demonstrates the interface is extensible today. */
class FutureSMSNotification extends NotificationService {
  async send({ to, message }) {
    console.warn('[sms] SMS notifications are not yet implemented.', { to, message });
    return { skipped: true };
  }
}

const emailNotification = new EmailNotification();

async function notifyNewContactMessage(contact) {
  return emailNotification.send({
    to: env.CONTACT_RECEIVER_EMAIL,
    subject: `New portfolio contact message from ${contact.name}`,
    message: `From: ${contact.name} <${contact.email}>\nSubject: ${contact.subject || '(no subject)'}\n\n${contact.message}`,
  });
}

module.exports = {
  NotificationService,
  EmailNotification,
  FutureSMSNotification,
  emailNotification,
  notifyNewContactMessage,
};
