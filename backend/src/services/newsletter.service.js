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

/**
 * Strips the opt-in/unsubscribe secret before a subscriber row ever leaves
 * the server. The admin console only ever needs email/status/dates, and a
 * leaked confirm_token would let anyone confirm or unsubscribe that address.
 */
function toPublicSubscriber(row) {
  if (!row) return row;
  const { confirm_token, confirm_token_expires_at, ...safe } = row;
  return safe;
}

class NewsletterService {
  /**
   * Double opt-in step 1. Idempotent by email:
   * - already confirmed -> no-op, tell the caller so the UI can say "you're already subscribed"
   * - pending -> resend the confirmation email, and flag it as already pending
   * - previously unsubscribed -> (re)issue a token and resend the confirmation email
   * - new email -> create a pending row and send the confirmation email
   */
  async subscribe(email) {
    const existing = await newsletterModel.findByEmail(email);

    if (existing?.status === 'confirmed') {
      return { alreadyConfirmed: true, alreadyPending: false, subscriber: toPublicSubscriber(existing) };
    }

    const alreadyPending = existing?.status === 'pending';
    const token = generateToken();
    const confirm_token_expires_at = tokenExpiry();

    const subscriber = existing
      ? await newsletterModel.update(existing.id, {
          status: 'pending', confirm_token: token, confirm_token_expires_at, unsubscribed_at: null,
        })
      : await newsletterModel.create({ email, status: 'pending', confirm_token: token, confirm_token_expires_at });

    const confirmUrl = `${env.CLIENT_URL}/newsletter/confirm?token=${token}`;
    await notifyNewsletterConfirm(email, confirmUrl);
    return { alreadyConfirmed: false, alreadyPending, subscriber: toPublicSubscriber(subscriber) };
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

  /**
   * Admin console listing: paginated, optionally filtered by status and by a
   * substring of the email address. Returns `{ items, total, counts }` so the
   * page can render the table, the pager and the status tabs from one call.
   */
  async listSubscribers({ limit = 50, offset = 0, status = null, search = '' } = {}) {
    const clauses = [];
    const params = [];

    if (status && status !== 'all') {
      clauses.push('status = ?');
      params.push(status);
    }
    if (search) {
      clauses.push('email LIKE ?');
      params.push(`%${search}%`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const items = await db.query(
      `SELECT id, email, status, created_at, confirmed_at, unsubscribed_at
       FROM newsletter_subscribers ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const totalRows = await db.query(
      `SELECT COUNT(*) AS total FROM newsletter_subscribers ${where}`,
      params
    );

    // Status tallies are deliberately unfiltered — the tabs should keep
    // showing every bucket's size even while one of them is selected.
    const countRows = await db.query(
      `SELECT status, COUNT(*) AS total FROM newsletter_subscribers GROUP BY status`
    );
    const counts = { all: 0, pending: 0, confirmed: 0, unsubscribed: 0 };
    for (const row of countRows) {
      counts[row.status] = Number(row.total) || 0;
      counts.all += Number(row.total) || 0;
    }

    return { items, total: Number(totalRows[0]?.total) || 0, counts };
  }

  /** Hard-delete a subscriber from the admin console (GDPR "forget me" requests). */
  async removeSubscriber(id) {
    const existing = await newsletterModel.findById(id);
    if (!existing) throw AppError.notFound('Subscriber not found');
    await newsletterModel.delete(id);
    return { id: existing.id, email: existing.email };
  }

  // Signup-count-over-time data for the admin dashboard widget — same
  // { dailyTrend: [{ date, <count> }] } shape analytics.service.js's
  // getSummary() already produces, so the widget can chart either
  // dataset with the same component.
  async getSignupSummary({ days = 30 } = {}) {
    const totals = await db.query(
      `SELECT COUNT(*) AS total_subscribers,
              SUM(status = 'confirmed') AS confirmed_subscribers,
              SUM(status = 'pending') AS pending_subscribers,
              SUM(status = 'unsubscribed') AS unsubscribed_subscribers
       FROM newsletter_subscribers`
    );
    const dailyTrend = await db.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS signups FROM newsletter_subscribers
       WHERE created_at >= (NOW() - INTERVAL ? DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [days]
    );

    return {
      totalSubscribers: Number(totals[0]?.total_subscribers) || 0,
      confirmedSubscribers: Number(totals[0]?.confirmed_subscribers) || 0,
      pendingSubscribers: Number(totals[0]?.pending_subscribers) || 0,
      unsubscribedSubscribers: Number(totals[0]?.unsubscribed_subscribers) || 0,
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
