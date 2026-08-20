const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// start session -- in this simple design we just accept session info and store in-memory per faculty
const sessions = {}; // sessions[faculty] = { month, date, max }

router.post('/session/start', auth(['admin','master']), async (req, res) => {
  const { faculty, month, date, max } = req.body;
  if (!faculty || !month || !date || !max) return res.status(400).json({ message: 'Missing fields' });
  sessions[String(faculty)] = { month, date, max };
  res.json({ ok: true, session: sessions[String(faculty)] });
});

router.get('/session/:faculty', auth(['admin','master']), (req, res) => {
  const f = String(req.params.faculty);
  res.json({ session: sessions[f] || null });
});

// save evaluation
router.post('/', auth(['admin','master']), async (req, res) => {
  try {
    const { code, score, faculty } = req.body;
    if (!code || score === undefined) return res.status(400).json({ message: 'Missing fields' });
    const a = sessions[String(faculty)];
    if (!a) return res.status(400).json({ message: 'No evaluation session started for this faculty' });
    const s = await Student.findOne({ faculty: String(faculty), code: String(code).padStart(3,'0') });
    if (!s) return res.status(404).json({ message: 'Student not found' });
    let e = await Evaluation.findOne({ faculty: String(faculty), code: String(code).padStart(3,'0'), month: a.month });
    if (e) { e.score = Number(score); e.date = a.date; e.max = a.max; await e.save(); }
    else { e = await Evaluation.create({ faculty: s.faculty, nationalId: s.nationalId, code: String(code).padStart(3,'0'), date: a.date, month: a.month, score: Number(score), max: a.max }); }
    res.json(e);
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

router.get('/', auth(['admin','master']), async (req, res) => {
  try { const { faculty } = req.query; const filter = {}; if (faculty) filter.faculty = String(faculty); const rows = await Evaluation.find(filter).limit(2000).lean(); res.json(rows); } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
