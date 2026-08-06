const projectService = require('../services/project.service');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

const listProjects = asyncHandler(async (req, res) => {
  const { q, category, page, limit } = req.query;
  const result = await projectService.search({
    q, category, page: Number(page) || 1, limit: Number(limit) || 9,
  });
  return ApiResponse.success(res, {
    data: result.items,
    meta: { total: result.total, page: result.page, limit: result.limit },
  });
});

const featuredProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.featured(Number(req.query.limit) || 6);
  return ApiResponse.success(res, { data: projects });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getBySlug(req.params.slug);
  return ApiResponse.success(res, { data: project });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getById(req.params.id);
  return ApiResponse.success(res, { data: project });
});

const createProject = asyncHandler(async (req, res) => {
  Validator.isString(req.body.title, 'title', { min: 2, max: 150 });
  // Truncate summary gracefully instead of letting MySQL throw ER_DATA_TOO_LONG
  if (req.body.summary && req.body.summary.length > 65535) {
    req.body.summary = req.body.summary.substring(0, 65535);
  }
  const project = await projectService.create(req.body);
  return ApiResponse.created(res, { message: 'Project created', data: project });
});

const updateProject = asyncHandler(async (req, res) => {
  // Truncate summary gracefully instead of letting MySQL throw ER_DATA_TOO_LONG
  if (req.body.summary && req.body.summary.length > 65535) {
    req.body.summary = req.body.summary.substring(0, 65535);
  }
  const project = await projectService.update(req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Project updated', data: project });
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.remove(req.params.id);
  return ApiResponse.success(res, { message: 'Project deleted' });
});

module.exports = {
  listProjects, featuredProjects, getProject, getProjectById,
  createProject, updateProject, deleteProject,
};
