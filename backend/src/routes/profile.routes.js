const router = require('express').Router();
const { getProfile, upsertProfile } = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', getProfile);
router.put('/', requireAuth, upsertProfile);

module.exports = router;
