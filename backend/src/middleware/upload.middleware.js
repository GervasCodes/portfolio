const multer = require('multer');
const { AppError } = require('../utills/responce');

const ALLOWED_MIME = [
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf', 'video/mp4', 'video/webm', 'video/quicktime',
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB — images, resumes, documents
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB — project gallery videos

// Files are held in memory then streamed straight to Supabase Storage —
// no need to touch the local filesystem (important on ephemeral hosts like Render).
const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(AppError.badRequest(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

// Separate instance with a larger size limit for project gallery videos,
// so image/document uploads elsewhere aren't forced onto the same ceiling.
const uploadMedia = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter,
});

module.exports = { upload, uploadMedia };
