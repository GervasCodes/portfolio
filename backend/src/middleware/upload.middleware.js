const multer = require('multer');
const { AppError } = require('../utills/responce');

const ALLOWED_MIME = [
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf', 'video/mp4',
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

// Files are held in memory then streamed straight to Supabase Storage —
// no need to touch the local filesystem (important on ephemeral hosts like Render).
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(AppError.badRequest(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

module.exports = { upload };
