const router = require('express').Router();
const {
  subscribe, confirm, unsubscribe, listSubscribers, removeSubscriber, getStats,
} = require('../controllers/newsletter.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { newsletterLimiter } = require('../middleware/rateLimiters');

router.post('/subscribe', newsletterLimiter, subscribe);
router.post('/confirm', confirm);
router.post('/unsubscribe', unsubscribe);

router.get('/subscribers', requireAuth, listSubscribers);
router.delete('/subscribers/:id', requireAuth, removeSubscriber);
router.get('/stats', requireAuth, getStats);

module.exports = router;
