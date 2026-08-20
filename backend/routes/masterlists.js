const express = require('express');
const router = express.Router();
const MasterLists = require('../models/MasterLists');
const auth = require('../middleware/auth');

// GET master lists (single doc)
router.get('/', async (req, res) => {
  try {
    let m = await MasterLists.findOne();
    if (!m) {
      m = await MasterLists.create({ locations: [], facultyMembers: [], assistants: [], externals: [] });
    }
    res.json(m);
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

// PUT update (master only)
router.put('/', auth(['master']), async (req, res) => {
  try {
    const payload = req.body || {};
    let m = await MasterLists.findOne();
    if (!m) m = await MasterLists.create(payload);
    else { m.locations = payload.locations || m.locations; m.facultyMembers = payload.facultyMembers || m.facultyMembers; m.assistants = payload.assistants || m.assistants; m.externals = payload.externals || m.externals; await m.save(); }
    res.json(m);
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
