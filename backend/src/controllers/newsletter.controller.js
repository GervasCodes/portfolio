const newsletterService = require('../services/newsletter.service');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

/**
 * NOTE on response shape: the frontend's request() helper reads
 * `res.data.data`, so anything a component needs to display has to live
 * inside `data` — not only in the top-level `message`. Previously the
 * "you're already subscribed" copy was put in `message` alone, which meant
 * the signup form silently fell back to its generic "check your inbox"
 * text and a returning subscriber was never told they already existed.
 */
const subscribe = asyncHandler(async (req, res) => {
  const email = Validator.isEmail(req.body.email);
  const { alreadyConfirmed, alreadyPending } = await newsletterService.subscribe(email);

  let message;
  if (alreadyConfirmed) {
    message = "You're already on the list — this email is subscribed.";
  } else if (alreadyPending) {
    message = "You've already signed up — we've re-sent the confirmation link, check your inbox.";
  } else {
    message = 'Almost there — check your inbox to confirm your subscription.';
  }

  return ApiResponse.success(res, {
    message,
    data: {
      message,
      email,
      alreadyConfirmed,
      alreadyPending,
      status: alreadyConfirmed ? 'confirmed' : 'pending',
    },
  });
});

const confirm = asyncHandler(async (req, res) => {
  const token = Validator.isString(req.body.token, 'token', { min: 10, max: 128 });
  await newsletterService.confirm(token);
  const message = "Confirmed — you're all set to hear about new posts.";
  return ApiResponse.success(res, { message, data: { message } });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const token = Validator.isString(req.body.token, 'token', { min: 10, max: 128 });
  await newsletterService.unsubscribe(token);
  const message = "You've been unsubscribed.";
  return ApiResponse.success(res, { message, data: { message } });
});

// --- Admin ---
const ALLOWED_STATUSES = new Set(['all', 'pending', 'confirmed', 'unsubscribed']);

const listSubscribers = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const rawStatus = String(req.query.status || 'all');
  const status = ALLOWED_STATUSES.has(rawStatus) ? rawStatus : 'all';
  const search = String(req.query.search || '').trim().slice(0, 120);

  const { items, total, counts } = await newsletterService.listSubscribers({
    limit, offset: (page - 1) * limit, status, search,
  });

  return ApiResponse.success(res, {
    data: { items, counts },
    meta: { total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) },
  });
});

const removeSubscriber = asyncHandler(async (req, res) => {
  const data = await newsletterService.removeSubscriber(req.params.id);
  return ApiResponse.success(res, { message: 'Subscriber removed', data });
});

const getStats = asyncHandler(async (req, res) => {
  const data = await newsletterService.getSignupSummary({ days: Number(req.query.days) || 30 });
  return ApiResponse.success(res, { data });
});

module.exports = { subscribe, confirm, unsubscribe, listSubscribers, removeSubscriber, getStats };
