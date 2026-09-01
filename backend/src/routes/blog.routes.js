const router = require('express').Router();
const {
  listPosts, mostViewed, getPost, listAllForAdmin, createPost, updatePost, deletePost,
  getReactions, setReaction, removeReaction,
} = require('../controllers/blog.controller');
const { requireAuth, verifyCsrf } = require('../middleware/auth.middleware');

router.get('/', listPosts);
// Static sub-paths must come before the `/:slug` catch-all below.
router.get('/most-viewed', mostViewed);
router.get('/admin/all', requireAuth, listAllForAdmin);
router.get('/:slug', getPost);
router.get('/:slug/reactions', getReactions);
router.post('/:slug/reactions', setReaction);
router.delete('/:slug/reactions', removeReaction);
router.post('/', requireAuth, verifyCsrf, createPost);
router.put('/:id', requireAuth, verifyCsrf, updatePost);
router.delete('/:id', requireAuth, verifyCsrf, deletePost);

module.exports = router;
