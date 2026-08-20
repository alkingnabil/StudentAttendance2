const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// mark attendance by code (admin-only)
router.post('/mark', auth(['admin','master']), async (req, res) => {
  try {
    const code = String(req.body.code || '').padStart(3, '0');
    const faculty = req.body.faculty;
    if (!code) return res.status(400).json({ message: 'Missing code' });
    const student = await Student.findOne({ faculty, code });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const date = new Date().toISOString().slice(0,10);
    const key = `${student.nationalId}|${date}`;
    const exists = await Attendance.findOne({ key });
    if (exists) return res.status(400).json({ message: 'Already marked' });
    const d = new Date();
    const rec = await Attendance.create({ key, faculty: student.faculty, nationalId: student.nationalId, code, date, time: d.toLocaleTimeString('ar-EG',{ hour: '2-digit', minute: '2-digit' }) });
    res.json(rec);
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

// get attendance by faculty/date
router.get('/', auth(['admin','master']), async (req, res) => {
  try { const { faculty, date } = req.query; const filter = {}; if (faculty) filter.faculty = String(faculty); if (date) filter.date = String(date); const rows = await Attendance.find(filter).limit(2000).lean(); res.json(rows); } catch(e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
