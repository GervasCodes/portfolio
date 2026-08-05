const experienceModel = require('../models/Experience');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

const listExperience = asyncHandler(async (req, res) => {
  const { type } = req.query; // 'work' | 'education'
  const items = type ? await experienceModel.findByType(type) : await experienceModel.findAll();
  return ApiResponse.success(res, { data: items });
});

const createExperience = asyncHandler(async (req, res) => {
  Validator.isString(req.body.title, 'title', { min: 1, max: 150 });
  Validator.isOneOf(req.body.type, 'type', ['work', 'education']);
  const item = await experienceModel.create(req.body);
  return ApiResponse.created(res, { message: 'Experience created', data: item });
});

const updateExperience = asyncHandler(async (req, res) => {
  const item = await experienceModel.update(req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Experience updated', data: item });
});

const deleteExperience = asyncHandler(async (req, res) => {
  await experienceModel.delete(req.params.id);
  return ApiResponse.success(res, { message: 'Experience deleted' });
});

module.exports = { listExperience, createExperience, updateExperience, deleteExperience };
