const router = require('express').Router();
const {
  listProjects, featuredProjects, getProject, getProjectById,
  createProject, updateProject, deleteProject,
} = require('../controllers/project.controller');
const { requireAuth, attachUserIfPresent, verifyCsrf } = require('../middleware/auth.middleware');

router.get('/', attachUserIfPresent, listProjects);
router.get('/featured', featuredProjects);
router.get('/id/:id', requireAuth, getProjectById);
router.get('/:slug', getProject);
router.post('/', requireAuth, verifyCsrf, createProject);
router.put('/:id', requireAuth, verifyCsrf, updateProject);
router.delete('/:id', requireAuth, verifyCsrf, deleteProject);

module.exports = router;
