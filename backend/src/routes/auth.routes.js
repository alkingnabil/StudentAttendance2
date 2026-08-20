const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
router.post('/student/login', c.studentLogin);
router.post('/student/register', c.registerStudent);
router.post('/student/reset', c.resetStudent);
router.post('/admin/login', c.adminLogin);
router.get('/me', requireAuth, c.me);
module.exports = router;
