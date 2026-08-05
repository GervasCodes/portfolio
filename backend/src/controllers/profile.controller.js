const profileService = require('../services/profile.service');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');

const getProfile = asyncHandler(async (_req, res) => {
  const profile = await profileService.get();
  return ApiResponse.success(res, { data: profile });
});

const upsertProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.save(req.body);
  return ApiResponse.success(res, { message: 'Profile saved', data: profile });
});

module.exports = { getProfile, upsertProfile };
