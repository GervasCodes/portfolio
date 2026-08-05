const router = require('express').Router();
const { listSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skills.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', listSkills);
router.post('/', requireAuth, createSkill);
router.put('/:id', requireAuth, updateSkill);
router.delete('/:id', requireAuth, deleteSkill);

module.exports = router;
