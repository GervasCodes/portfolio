const router = require('express').Router();
const { getProfile, upsertProfile } = require('../controllers/profile.controller');
const { requireAuth, verifyCsrf } = require('../middleware/auth.middleware');

router.get('/', getProfile);
router.put('/', requireAuth, verifyCsrf, upsertProfile);

module.exports = router;
