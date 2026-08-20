const router = require('express').Router();
const c = require('../controllers/evaluation.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
router.use(requireAuth, requireRole('admin'));
router.get('/', c.list);
router.post('/sessions', c.startSession);
router.post('/', c.saveEvaluation);
module.exports = router;
