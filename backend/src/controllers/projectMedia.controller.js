const projectMediaService = require('../services/projectMedia.service');
const { ApiResponse, AppError } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');

const listProjectMedia = asyncHandler(async (req, res) => {
  const items = await projectMediaService.listByProject(req.params.id);
  return ApiResponse.success(res, { data: items });
});

const uploadProjectMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');

  const item = await projectMediaService.attach(req.params.id, req.file, {
    mediaType: req.body.media_type || (req.file.mimetype.startsWith('video/') ? 'video' : 'image'),
    caption: req.body.caption,
  });

  return ApiResponse.created(res, { message: 'Media attached to project', data: item });
});

const updateProjectMedia = asyncHandler(async (req, res) => {
  const item = await projectMediaService.updateItem(req.params.id, req.params.mediaId, req.body);
  return ApiResponse.success(res, { message: 'Media updated', data: item });
});

const deleteProjectMedia = asyncHandler(async (req, res) => {
  await projectMediaService.removeItem(req.params.id, req.params.mediaId);
  return ApiResponse.success(res, { message: 'Media removed' });
});

const reorderProjectMedia = asyncHandler(async (req, res) => {
  const items = await projectMediaService.reorder(req.params.id, req.body.orderedIds);
  return ApiResponse.success(res, { message: 'Order updated', data: items });
});

module.exports = {
  listProjectMedia, uploadProjectMedia, updateProjectMedia, deleteProjectMedia, reorderProjectMedia,
};
