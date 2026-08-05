const router = require('express').Router();
const { uploadMedia, listMedia, deleteMedia } = require('../controllers/media.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', requireAuth, listMedia);
router.post('/', requireAuth, upload.single('file'), uploadMedia);
router.delete('/:id', requireAuth, deleteMedia);

module.exports = router;
