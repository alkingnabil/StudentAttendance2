const router = require('express').Router();
const c = require('../controllers/export.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
router.get('/faculty/:faculty/xlsx', requireAuth, requireRole('admin'), c.exportXlsx);
module.exports = router;
