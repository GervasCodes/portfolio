const { mediaService } = require('../services/storage.service');
const mediaModel = require('../models/Media');
const { ApiResponse, AppError } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');

const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No file uploaded');

  const kind = req.body.kind || 'image'; // image | resume | document
  let result;
  if (kind === 'resume') result = await mediaService.uploadResume(req.file);
  else if (kind === 'document') result = await mediaService.uploadDocument(req.file);
  else result = await mediaService.uploadImage(req.file);

  const record = await mediaModel.create({
    file_name: req.file.originalname,
    file_url: result.url,
    file_type: kind,
    mime_type: req.file.mimetype,
    // Images may have been resized/recompressed before upload (see
    // MediaService.uploadImage) — `result.size` reflects what was
    // actually stored; other kinds pass through untouched, so fall
    // back to the original upload size.
    size_bytes: result.size ?? req.file.size,
    related_to: req.body.related_to || null,
  });

  return ApiResponse.created(res, { message: 'File uploaded', data: record });
});

const listMedia = asyncHandler(async (_req, res) => {
  const items = await mediaModel.findAll();
  return ApiResponse.success(res, { data: items });
});

const deleteMedia = asyncHandler(async (req, res) => {
  await mediaModel.delete(req.params.id);
  return ApiResponse.success(res, { message: 'Media deleted' });
});

module.exports = { uploadMedia, listMedia, deleteMedia };
