const newsletterService = require('../services/newsletter.service');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

const subscribe = asyncHandler(async (req, res) => {
  const email = Validator.isEmail(req.body.email);
  const { alreadyConfirmed } = await newsletterService.subscribe(email);
  return ApiResponse.success(res, {
    message: alreadyConfirmed
      ? "You're already subscribed — thanks!"
      : 'Almost there — check your inbox to confirm your subscription.',
  });
});

const confirm = asyncHandler(async (req, res) => {
  const token = Validator.isString(req.body.token, 'token', { min: 10, max: 128 });
  await newsletterService.confirm(token);
  return ApiResponse.success(res, { message: "Confirmed — you're all set to hear about new posts." });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const token = Validator.isString(req.body.token, 'token', { min: 10, max: 128 });
  await newsletterService.unsubscribe(token);
  return ApiResponse.success(res, { message: "You've been unsubscribed." });
});

// --- Admin ---
const listSubscribers = asyncHandler(async (req, res) => {
  const data = await newsletterService.listSubscribers({ limit: Number(req.query.limit) || 200 });
  return ApiResponse.success(res, { data });
});

const getStats = asyncHandler(async (req, res) => {
  const data = await newsletterService.getSignupSummary({ days: Number(req.query.days) || 30 });
  return ApiResponse.success(res, { data });
});

module.exports = { subscribe, confirm, unsubscribe, listSubscribers, getStats };
