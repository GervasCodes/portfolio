const router = require('express').Router();
const {
  submitContact, listContacts, markContactRead, deleteContact,
} = require('../controllers/contact.controller');
const { requireAuth, verifyCsrf } = require('../middleware/auth.middleware');
const { contactLimiter } = require('../middleware/rateLimiters');

router.post('/', contactLimiter, submitContact);
router.get('/', requireAuth, listContacts);
router.patch('/:id/read', requireAuth, verifyCsrf, markContactRead);
router.delete('/:id', requireAuth, verifyCsrf, deleteContact);

module.exports = router;
