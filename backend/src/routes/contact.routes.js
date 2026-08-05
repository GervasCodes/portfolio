const router = require('express').Router();
const {
  submitContact, listContacts, markContactRead, deleteContact,
} = require('../controllers/contact.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', submitContact);
router.get('/', requireAuth, listContacts);
router.patch('/:id/read', requireAuth, markContactRead);
router.delete('/:id', requireAuth, deleteContact);

module.exports = router;
