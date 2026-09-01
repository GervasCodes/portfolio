const router = require('express').Router();
const { listSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skills.controller');
const { requireAuth, verifyCsrf } = require('../middleware/auth.middleware');

router.get('/', listSkills);
router.post('/', requireAuth, verifyCsrf, createSkill);
router.put('/:id', requireAuth, verifyCsrf, updateSkill);
router.delete('/:id', requireAuth, verifyCsrf, deleteSkill);

module.exports = router;
