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

  async send({ to, subject, message, html, bcc }) {
    if (!this.transporter) {
      console.warn('[email] SMTP not configured — skipping send. Message was:', { to, subject, bcc });
      return { skipped: true };
    }
    return this.transporter.sendMail({
      from: `"Portfolio" <${env.SMTP_USER}>`,
      to,
      ...(bcc && bcc.length ? { bcc } : {}),
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

/** Double opt-in step 1: ask a new/re-subscribing newsletter signup to confirm their email. */
async function notifyNewsletterConfirm(email, confirmUrl) {
  return emailNotification.send({
    to: email,
    subject: 'Confirm your subscription',
    message: `Thanks for subscribing! Confirm your email to start getting notified about new posts:\n\n${confirmUrl}\n\nIf you didn't request this, you can safely ignore this email — you won't be subscribed unless you click the link.`,
  });
}

/**
 * "Notify me on new posts" — fans a single new-post announcement out to
 * every confirmed subscriber via BCC (one send, and subscribers never see
 * each other's addresses) rather than one email per subscriber.
 */
async function notifyNewsletterOfNewPost(post, subscriberEmails) {
  if (!subscriberEmails.length) return { skipped: true, reason: 'no confirmed subscribers' };
  const url = `${env.CLIENT_URL}/blog/${post.slug}`;
  return emailNotification.send({
    to: env.CONTACT_RECEIVER_EMAIL,
    bcc: subscriberEmails,
    subject: `New post: ${post.title}`,
    message: `A new post just went up${post.excerpt ? `:\n\n${post.excerpt}` : '.'}\n\nRead it here: ${url}`,
  });
}

module.exports = {
  NotificationService,
  EmailNotification,
  FutureSMSNotification,
  emailNotification,
  notifyNewContactMessage,
  notifyNewsletterConfirm,
  notifyNewsletterOfNewPost,
};
