const router = require('express').Router();
const {
  listExperience, createExperience, updateExperience, deleteExperience,
} = require('../controllers/experience.controller');
const { requireAuth, verifyCsrf } = require('../middleware/auth.middleware');

router.get('/', listExperience);
router.post('/', requireAuth, verifyCsrf, createExperience);
router.put('/:id', requireAuth, verifyCsrf, updateExperience);
router.delete('/:id', requireAuth, verifyCsrf, deleteExperience);

module.exports = router;
