const router = require('express').Router();
const {
  subscribe, confirm, unsubscribe, listSubscribers, getStats,
} = require('../controllers/newsletter.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/subscribe', subscribe);
router.post('/confirm', confirm);
router.post('/unsubscribe', unsubscribe);

router.get('/subscribers', requireAuth, listSubscribers);
router.get('/stats', requireAuth, getStats);

module.exports = router;
