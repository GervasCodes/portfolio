const router = require('express').Router();
const {
  listCertificates, createCertificate, updateCertificate, deleteCertificate,
  listAchievements, createAchievement, updateAchievement, deleteAchievement,
  getSettings, updateSettings, getAnalytics, recordPageView,
} = require('../controllers/misc.controller');
const { requireAuth, verifyCsrf } = require('../middleware/auth.middleware');

router.get('/certificates', listCertificates);
router.post('/certificates', requireAuth, verifyCsrf, createCertificate);
router.put('/certificates/:id', requireAuth, verifyCsrf, updateCertificate);
router.delete('/certificates/:id', requireAuth, verifyCsrf, deleteCertificate);

router.get('/achievements', listAchievements);
router.post('/achievements', requireAuth, verifyCsrf, createAchievement);
router.put('/achievements/:id', requireAuth, verifyCsrf, updateAchievement);
router.delete('/achievements/:id', requireAuth, verifyCsrf, deleteAchievement);

router.get('/settings', getSettings);
router.put('/settings', requireAuth, verifyCsrf, updateSettings);

router.get('/analytics', requireAuth, getAnalytics);
router.post('/analytics/pageview', recordPageView);

module.exports = router;
