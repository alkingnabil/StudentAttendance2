const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const Student = require('../models/Student');
const { parseBufferToStudents } = require('../utils/excelImport');
const auth = require('../middleware/auth');

// GET students with optional faculty and search
router.get('/', async (req, res) => {
  try {
    const { faculty, q } = req.query;
    const filter = {};
    if (faculty) filter.faculty = String(faculty);
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { nationalId: new RegExp(q, 'i') }, { seat: new RegExp(q, 'i') }, { code: new RegExp(q, 'i') }];
    const students = await Student.find(filter).limit(1000).lean();
    res.json(students);
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

// GET single
router.get('/:id', async (req, res) => {
  try { const s = await Student.findById(req.params.id); if (!s) return res.status(404).json({ message: 'Not found' }); res.json(s); } catch(e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

// IMPORT excel (master only)
router.post('/import', auth(['master']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const rows = parseBufferToStudents(req.file.buffer, req.query.faculty || '3');
    // upsert students by seat+name if nationalId provided update
    const results = [];
    for (const r of rows){
      const filter = { faculty: r.faculty, seat: r.seat };
      let s = await Student.findOne(filter);
      if (s) { Object.assign(s, r); await s.save(); }
      else { s = await Student.create(Object.assign(r, { code: r.code || '' })); }
      results.push(s);
    }
    res.json({ imported: results.length });
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
