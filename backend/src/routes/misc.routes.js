const router = require('express').Router();
const {
  listCertificates, createCertificate, updateCertificate, deleteCertificate,
  listAchievements, createAchievement, updateAchievement, deleteAchievement,
  getSettings, updateSettings, getAnalytics, recordPageView,
} = require('../controllers/misc.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/certificates', listCertificates);
router.post('/certificates', requireAuth, createCertificate);
router.put('/certificates/:id', requireAuth, updateCertificate);
router.delete('/certificates/:id', requireAuth, deleteCertificate);

router.get('/achievements', listAchievements);
router.post('/achievements', requireAuth, createAchievement);
router.put('/achievements/:id', requireAuth, updateAchievement);
router.delete('/achievements/:id', requireAuth, deleteAchievement);

router.get('/settings', getSettings);
router.put('/settings', requireAuth, updateSettings);

router.get('/analytics', requireAuth, getAnalytics);
router.post('/analytics/pageview', recordPageView);

module.exports = router;
