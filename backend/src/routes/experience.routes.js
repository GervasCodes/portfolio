const router = require('express').Router();
const {
  listExperience, createExperience, updateExperience, deleteExperience,
} = require('../controllers/experience.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', listExperience);
router.post('/', requireAuth, createExperience);
router.put('/:id', requireAuth, updateExperience);
router.delete('/:id', requireAuth, deleteExperience);

module.exports = router;
