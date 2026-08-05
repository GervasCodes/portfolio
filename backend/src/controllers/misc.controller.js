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

module.exports = {
  listCertificates, createCertificate, updateCertificate, deleteCertificate,
  listAchievements, createAchievement, updateAchievement, deleteAchievement,
  getSettings, updateSettings, getAnalytics,
};
