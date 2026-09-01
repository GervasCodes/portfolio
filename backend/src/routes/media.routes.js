const router = require('express').Router();
const { uploadMedia, listMedia, deleteMedia } = require('../controllers/media.controller');
const { requireAuth, verifyCsrf } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', requireAuth, listMedia);
router.post('/', requireAuth, verifyCsrf, upload.single('file'), uploadMedia);
router.delete('/:id', requireAuth, verifyCsrf, deleteMedia);

module.exports = router;
