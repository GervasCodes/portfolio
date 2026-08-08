const router = require('express').Router();
const { search } = require('../controllers/search.controller');

// GET /api/search?q=&type=all|projects|blog&page=&limit=
router.get('/', search);

module.exports = router;
