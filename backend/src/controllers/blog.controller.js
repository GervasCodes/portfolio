const blogService = require('../services/blog.service');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

const listPosts = asyncHandler(async (req, res) => {
  const { page, limit, tag } = req.query;
  const result = await blogService.paginatePublished({
    page: Number(page) || 1, limit: Number(limit) || 6, tag,
  });
  return ApiResponse.success(res, {
    data: result.items,
    meta: { total: result.total, page: result.page, limit: result.limit },
  });
});

const getPost = asyncHandler(async (req, res) => {
  const post = await blogService.getBySlugAndTrackView(req.params.slug);
  return ApiResponse.success(res, { data: post });
});

const listAllForAdmin = asyncHandler(async (_req, res) => {
  const posts = await blogService.list({ orderBy: 'id DESC' });
  return ApiResponse.success(res, { data: posts });
});

const createPost = asyncHandler(async (req, res) => {
  Validator.isString(req.body.title, 'title', { min: 2, max: 200 });
  Validator.isString(req.body.content, 'content', { min: 1 });
  const post = await blogService.create(req.body);
  return ApiResponse.created(res, { message: 'Post created', data: post });
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await blogService.update(req.params.id, req.body);
  return ApiResponse.success(res, { message: 'Post updated', data: post });
});

const deletePost = asyncHandler(async (req, res) => {
  await blogService.remove(req.params.id);
  return ApiResponse.success(res, { message: 'Post deleted' });
});

module.exports = { listPosts, getPost, listAllForAdmin, createPost, updatePost, deletePost };
