const router = require('express').Router();
const {
  login,
  verifyMfa,
  refresh,
  logout,
  me,
  setupTotp,
  enableTotp,
  disableTotp,
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { loginLimiter, refreshLimiter } = require('../middleware/rateLimiters');

router.post('/login', loginLimiter, login);
router.post('/login/verify', loginLimiter, verifyMfa);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

// 2FA management — the admin must already be signed in to enroll or
// unenroll (bootstrapping 2FA over an unauthenticated connection would
// defeat the point of it).
router.get('/2fa/setup', requireAuth, setupTotp);
router.post('/2fa/enable', requireAuth, enableTotp);
router.post('/2fa/disable', requireAuth, disableTotp);

module.exports = router;
