const router = require('express').Router();
const {
  listPosts, getPost, listAllForAdmin, createPost, updatePost, deletePost,
} = require('../controllers/blog.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', listPosts);
router.get('/admin/all', requireAuth, listAllForAdmin);
router.get('/:slug', getPost);
router.post('/', requireAuth, createPost);
router.put('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);

module.exports = router;
