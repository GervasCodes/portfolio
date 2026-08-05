const router = require('express').Router();
const {
  listProjectMedia, uploadProjectMedia, updateProjectMedia, deleteProjectMedia, reorderProjectMedia,
} = require('../controllers/projectMedia.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadMedia } = require('../middleware/upload.middleware');

// Nested under /api/projects — distinct path shape (`/:id/media...`) from
// project.routes.js's `/:slug`, so both route files can share the prefix
// without colliding.
router.get('/:id/media', listProjectMedia);
router.post('/:id/media', requireAuth, uploadMedia.single('file'), uploadProjectMedia);
router.put('/:id/media/reorder', requireAuth, reorderProjectMedia);
router.put('/:id/media/:mediaId', requireAuth, updateProjectMedia);
router.delete('/:id/media/:mediaId', requireAuth, deleteProjectMedia);

module.exports = router;
