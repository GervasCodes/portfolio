const certificateModel = require('../models/Certificate');
const achievementModel = require('../models/Achievement');
const settingsModel = require('../models/Settings');
const analyticsService = require('../services/analytics.service');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');

// --- Certificates ---
const listCertificates = asyncHandler(async (_req, res) =>
  ApiResponse.success(res, { data: await certificateModel.findAll({ orderBy: 'sort_order ASC' }) }));
const createCertificate = asyncHandler(async (req, res) =>
  ApiResponse.created(res, { data: await certificateModel.create(req.body) }));
const updateCertificate = asyncHandler(async (req, res) =>
  ApiResponse.success(res, { data: await certificateModel.update(req.params.id, req.body) }));
const deleteCertificate = asyncHandler(async (req, res) => {
  await certificateModel.delete(req.params.id);
  return ApiResponse.success(res, { message: 'Certificate deleted' });
});

// --- Achievements ---
const listAchievements = asyncHandler(async (_req, res) =>
  ApiResponse.success(res, { data: await achievementModel.findAll({ orderBy: 'sort_order ASC' }) }));
const createAchievement = asyncHandler(async (req, res) =>
  ApiResponse.created(res, { data: await achievementModel.create(req.body) }));
const updateAchievement = asyncHandler(async (req, res) =>
  ApiResponse.success(res, { data: await achievementModel.update(req.params.id, req.body) }));
const deleteAchievement = asyncHandler(async (req, res) => {
  await achievementModel.delete(req.params.id);
  return ApiResponse.success(res, { message: 'Achievement deleted' });
});

// --- Settings ---
const getSettings = asyncHandler(async (_req, res) =>
  ApiResponse.success(res, { data: await settingsModel.getAll() }));
const updateSettings = asyncHandler(async (req, res) => {
  const entries = Object.entries(req.body || {});
  await Promise.all(entries.map(([key, value]) => settingsModel.set(key, value)));
  return ApiResponse.success(res, { message: 'Settings updated', data: await settingsModel.getAll() });
});

// --- Analytics ---
const getAnalytics = asyncHandler(async (req, res) =>
  ApiResponse.success(res, { data: await analyticsService.getSummary({ days: Number(req.query.days) || 30 }) }));

// Records one real page view per call. Called explicitly by the frontend
// router on each public route change, instead of the old approach of
// logging every internal API request (which counted a single page load
// as many "visits" — one per data fetch — and made the numbers meaningless).
const recordPageView = asyncHandler(async (req, res) => {
  const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 255) : null;
  if (!path || !path.startsWith('/') || path.startsWith('/admin')) {
    return ApiResponse.success(res, { message: 'Ignored' });
  }
  await analyticsService.recordVisit({
    path,
    referrer: req.get('referer'),
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });
  return ApiResponse.success(res, { message: 'Recorded' });
});

module.exports = {
  listCertificates, createCertificate, updateCertificate, deleteCertificate,
  listAchievements, createAchievement, updateAchievement, deleteAchievement,
  getSettings, updateSettings, getAnalytics, recordPageView,
};
