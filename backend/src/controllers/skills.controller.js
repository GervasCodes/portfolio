const skillModel = require('../models/Skill');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

const listSkills = asyncHandler(async (_req, res) => {
  const grouped = await skillModel.findGroupedByCategory();
  return ApiResponse.success(res, { data: grouped });
});

const createSkill = asyncHandler(async (req, res) => {
  Validator.isString(req.body.name, 'name', { min: 1, max: 80 });
  const skill = await skillModel.create(req.body);
  return ApiResponse.created(res, { message: 'Skill created', data: skill });
});

const updateSkill = asyncHandler(async (req, res) => {
  const skill = await skillModel.update(req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Skill updated', data: skill });
});

const deleteSkill = asyncHandler(async (req, res) => {
  await skillModel.delete(req.params.id);
  return ApiResponse.success(res, { message: 'Skill deleted' });
});

module.exports = { listSkills, createSkill, updateSkill, deleteSkill };
