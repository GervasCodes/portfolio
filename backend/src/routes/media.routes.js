const router = require('express').Router();
const { uploadMedia, listMedia, deleteMedia } = require('../controllers/media.controller');
const { requireAuth, verifyCsrf } = require('../middleware/auth.middleware');
const { uploadMedia: uploadMiddleware } = require('../middleware/upload.middleware');

router.get('/', requireAuth, listMedia);
// Uses the larger-limit multer instance (same one project gallery media
// uses) so a blog post's video upload isn't forced onto the 15MB image cap.
router.post('/', requireAuth, verifyCsrf, uploadMiddleware.single('file'), uploadMedia);
router.delete('/:id', requireAuth, verifyCsrf, deleteMedia);

module.exports = router;
