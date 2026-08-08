const crypto = require('crypto');
const db = require('../config/database');
const newsletterModel = require('../models/NewsletterSubscriber');
const { notifyNewsletterConfirm, notifyNewsletterOfNewPost } = require('./email.service');
const { AppError } = require('../utills/responce');
const env = require('../config/env');

// How long a confirmation link stays valid. Re-submitting the signup form
// after this window issues a fresh token rather than erroring, so a slow
// reader isn't permanently stuck.
const CONFIRM_TOKEN_TTL_HOURS = 48;

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function tokenExpiry() {
  return new Date(Date.now() + CONFIRM_TOKEN_TTL_HOURS * 60 * 60 * 1000);
}

class NewsletterService {
  /**
   * Double opt-in step 1. Idempotent by email:
   * - already confirmed -> no-op, tell the caller so the UI can say "you're already subscribed"
   * - pending or previously unsubscribed -> (re)issue a token and resend the confirmation email
   * - new email -> create a pending row and send the confirmation email
   */
  async subscribe(email) {
    const existing = await newsletterModel.findByEmail(email);

    if (existing?.status === 'confirmed') {
      return { alreadyConfirmed: true, subscriber: existing };
    }

    const token = generateToken();
    const confirm_token_expires_at = tokenExpiry();

    const subscriber = existing
      ? await newsletterModel.update(existing.id, {
          status: 'pending', confirm_token: token, confirm_token_expires_at, unsubscribed_at: null,
        })
      : await newsletterModel.create({ email, status: 'pending', confirm_token: token, confirm_token_expires_at });

    const confirmUrl = `${env.CLIENT_URL}/newsletter/confirm?token=${token}`;
    await notifyNewsletterConfirm(email, confirmUrl);
    return { alreadyConfirmed: false, subscriber };
  }

  async confirm(token) {
    const subscriber = await newsletterModel.findByToken(token);
    if (!subscriber) throw AppError.notFound('Invalid or already-used confirmation link');
    if (subscriber.status === 'confirmed') return subscriber; // clicking the link twice is fine

    if (new Date(subscriber.confirm_token_expires_at) < new Date()) {
      throw AppError.badRequest('This confirmation link has expired — please subscribe again');
    }
    return newsletterModel.update(subscriber.id, {
      status: 'confirmed', confirmed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
  }

  async unsubscribe(token) {
    const subscriber = await newsletterModel.findByToken(token);
    if (!subscriber) throw AppError.notFound('Invalid unsubscribe link');
    if (subscriber.status === 'unsubscribed') return subscriber;
    return newsletterModel.update(subscriber.id, {
      status: 'unsubscribed', unsubscribed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
  }

  async listSubscribers({ limit = 200 } = {}) {
    return newsletterModel.findAll({ orderBy: 'created_at DESC', limit, offset: 0 });
  }

  // Signup-count-over-time data for the admin dashboard widget — same
  // { dailyTrend: [{ date, <count> }] } shape analytics.service.js's
  // getSummary() already produces, so the widget can chart either
  // dataset with the same component.
  async getSignupSummary({ days = 30 } = {}) {
    const totals = await db.query(
      `SELECT COUNT(*) AS total_subscribers,
              SUM(status = 'confirmed') AS confirmed_subscribers
       FROM newsletter_subscribers`
    );
    const dailyTrend = await db.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS signups FROM newsletter_subscribers
       WHERE created_at >= (NOW() - INTERVAL ? DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [days]
    );

    return {
      totalSubscribers: totals[0]?.total_subscribers ?? 0,
      confirmedSubscribers: Number(totals[0]?.confirmed_subscribers) || 0,
      dailyTrend,
    };
  }

  /** "Notify me on new posts" — the actual notification, fired when a post is (newly) published. */
  async notifyNewPost(post) {
    const confirmed = await newsletterModel.findAll({ where: { status: 'confirmed' } });
    const emails = confirmed.map((s) => s.email);
    return notifyNewsletterOfNewPost(post, emails);
  }
}

module.exports = new NewsletterService();
