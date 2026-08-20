const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/AdminAccount');
const User = require('../models/User');

// Student login
router.post('/student/login', async (req, res) => {
  const { nationalId, password } = req.body;
  if (!nationalId || !password) return res.status(400).json({ message: 'Missing credentials' });
  try {
    const user = await User.findOne({ nationalId });
    if (!user) return res.status(404).json({ message: 'Account not found. Register first.' });
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const student = await Student.findOne({ nationalId });
    const token = jwt.sign({ sub: user.nationalId, role: 'student' , name: student?.name || '' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, student });
  } catch (e){
    console.error(e); return res.status(500).json({ message: 'Server error' });
  }
});

// Student register
router.post('/student/register', async (req, res) => {
  const { nationalId, password, name, seat, phone, group } = req.body;
  if (!nationalId || !password || !name || !seat) return res.status(400).json({ message: 'Missing fields' });
  try {
    const student = await Student.findOne({ name: name.trim(), seat: String(seat).trim() });
    if (!student) return res.status(400).json({ message: 'Name and seat not found in system' });
    // prevent duplicate user
    const existing = await User.findOne({ nationalId });
    if (existing) return res.status(400).json({ message: 'An account with this national ID already exists' });
    const hash = await bcrypt.hash(password, 10);
    await User.create({ nationalId, passwordHash: hash });
    student.nationalId = nationalId; student.phone = phone || student.phone; student.group = group || student.group; student.registered = true;
    await student.save();
    const token = jwt.sign({ sub: nationalId, role: 'student', name: student.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, student });
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

// Student reset (reset password to nationalId)
router.post('/student/reset', async (req, res) => {
  const { nationalId } = req.body;
  if (!nationalId) return res.status(400).json({ message: 'Missing nationalId' });
  try {
    const hash = await bcrypt.hash(nationalId, 10);
    let user = await User.findOne({ nationalId });
    if (!user) {
      user = await User.create({ nationalId, passwordHash: hash });
    } else {
      user.passwordHash = hash; await user.save();
    }
    res.json({ message: 'Password reset to national ID' });
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    const ok = await bcrypt.compare(password, admin.passwordHash || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: admin.email, role: admin.role, name: admin.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, admin: { email: admin.email, name: admin.name, groups: admin.groups, role: admin.role } });
  } catch (e){ console.error(e); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
