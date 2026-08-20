const router = require('express').Router();
const c = require('../controllers/student.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
router.get('/me', requireAuth, requireRole('student'), c.myProfile);
router.get('/group-preview/:group', c.groupPreview);
module.exports = router;
