const router = require('express').Router();
const {
  listProjects, featuredProjects, getProject, getProjectById,
  createProject, updateProject, deleteProject,
} = require('../controllers/project.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', listProjects);
router.get('/featured', featuredProjects);
router.get('/id/:id', requireAuth, getProjectById);
router.get('/:slug', getProject);
router.post('/', requireAuth, createProject);
router.put('/:id', requireAuth, updateProject);
router.delete('/:id', requireAuth, deleteProject);

module.exports = router;
