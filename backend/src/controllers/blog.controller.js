const crypto = require('crypto');
const blogService = require('../services/blog.service');
const { blogEngagementService } = require('../services/blogEngagement.service');
const env = require('../config/env');
const { ApiResponse } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

// Anonymous, long-lived visitor cookie used to dedupe view counts and
// scope reactions to "one per visitor" without any login/auth.
const VIEWER_COOKIE = 'bvid';
const VIEWER_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

function ensureViewerKey(req, res) {
  let viewerKey = req.cookies?.[VIEWER_COOKIE];
  if (!viewerKey) {
    viewerKey = crypto.randomBytes(16).toString('hex');
    res.cookie(VIEWER_COOKIE, viewerKey, {
      httpOnly: true,
      secure: env.isProduction(),
      sameSite: 'lax',
      maxAge: VIEWER_COOKIE_MAX_AGE,
    });
  }
  return viewerKey;
}

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

const mostViewed = asyncHandler(async (req, res) => {
  const posts = await blogService.getMostViewed({ limit: Number(req.query.limit) || 5 });
  return ApiResponse.success(res, { data: posts });
});

const getPost = asyncHandler(async (req, res) => {
  const viewerKey = ensureViewerKey(req, res);
  const post = await blogService.getBySlugAndTrackView(req.params.slug, { viewerKey, ip: req.ip });
  return ApiResponse.success(res, { data: post });
});

const getReactions = asyncHandler(async (req, res) => {
  const post = await blogService.getBySlug(req.params.slug);
  const viewerKey = req.cookies?.[VIEWER_COOKIE] || null;
  const data = await blogEngagementService.getReactions(post.id, viewerKey);
  return ApiResponse.success(res, { data });
});

const setReaction = asyncHandler(async (req, res) => {
  const post = await blogService.getBySlug(req.params.slug);
  const viewerKey = ensureViewerKey(req, res);
  Validator.isString(req.body.emoji, 'emoji', { min: 1, max: 8 });
  const data = await blogEngagementService.setReaction(post.id, viewerKey, req.body.emoji);
  return ApiResponse.success(res, { message: 'Reaction saved', data });
});

const removeReaction = asyncHandler(async (req, res) => {
  const post = await blogService.getBySlug(req.params.slug);
  const viewerKey = req.cookies?.[VIEWER_COOKIE] || null;
  const data = viewerKey
    ? await blogEngagementService.removeReaction(post.id, viewerKey)
    : await blogEngagementService.getReactions(post.id, null);
  return ApiResponse.success(res, { message: 'Reaction removed', data });
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

module.exports = {
  listPosts, mostViewed, getPost, listAllForAdmin, createPost, updatePost, deletePost,
  getReactions, setReaction, removeReaction,
};
