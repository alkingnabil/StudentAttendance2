const router = require('express').Router();
const multer = require('multer');
const c = require('../controllers/import.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.post('/students', requireAuth, requireRole('admin'), upload.single('file'), c.importStudents);
module.exports = router;
