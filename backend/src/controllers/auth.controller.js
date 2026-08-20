const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Group } = require('../models');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function sign(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
}

function publicUser(user) {
  return { id: String(user._id), role: user.role, name: user.name, email: user.email || null, isMaster: !!user.isMaster, studentId: user.studentId ? String(user.studentId) : null };
}

async function adminLogin(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email, role: 'admin' });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'البريد الإداري أو كلمة المرور غير صحيحة' });
  return res.json({ token: sign(user), user: publicUser(user) });
}

async function studentLogin(req, res) {
  const nationalId = String(req.body.nationalId || '').trim();
  const password = String(req.body.password || '');
  const student = await Student.findOne({ nationalId });
  if (!student) return res.status(404).json({ message: 'الطالب غير موجود. يجب استيراد بيانات الطالب أولًا.' });
  const user = await User.findOne({ role: 'student', studentId: student._id });
  if (!user) return res.status(403).json({ message: 'حساب الطالب غير منشأ بعد' });
  if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
  return res.json({ token: sign(user), user: publicUser(user) });
}

async function registerStudent(req, res) {
  const { name, nationalId, phone, seatNumber, group, password } = req.body;
  if (!name || !nationalId || !seatNumber || !group || !password) return res.status(400).json({ message: 'أكمل بيانات التسجيل' });
  if (!/^\d{14}$/.test(String(nationalId))) return res.status(400).json({ message: 'الرقم القومي يجب أن يكون 14 رقمًا' });
  if (String(password).length < 6) return res.status(400).json({ message: 'كلمة المرور 6 أحرف على الأقل' });
  const student = await Student.findOne({ name: String(name).trim(), seatNumber: String(seatNumber).trim() });
  if (!student) return res.status(404).json({ message: 'الاسم ورقم الجلوس غير موجودين في بيانات الطلاب المستوردة' });
  if (student.nationalId && student.nationalId !== String(nationalId)) return res.status(409).json({ message: 'بيانات الطالب لا تتطابق مع الرقم القومي المسجل' });
  const exists = await User.findOne({ role: 'student', studentId: student._id });
  if (exists) return res.status(409).json({ message: 'هذا الطالب لديه حساب بالفعل' });
  const groupDoc = await Group.findOne({ faculty: student.faculty, group: Number(group) });
  student.nationalId = String(nationalId);
  student.phone = String(phone || '');
  student.group = Number(group);
  student.registered = true;
  if (groupDoc) Object.assign(student, { training: groupDoc.location, facultyMember: groupDoc.facultyMember, assistant: groupDoc.assistant, external: groupDoc.external });
  await student.save();
  const user = await User.create({ name: student.name, passwordHash: await bcrypt.hash(password, 10), role: 'student', studentId: student._id });
  return res.status(201).json({ token: sign(user), user: publicUser(user) });
}

async function resetStudent(req, res) {
  const nationalId = String(req.body.nationalId || '').trim();
  const student = await Student.findOne({ nationalId });
  if (!student) return res.status(404).json({ message: 'الطالب غير موجود' });
  const user = await User.findOne({ role: 'student', studentId: student._id });
  if (!user) return res.status(404).json({ message: 'لا يوجد حساب للطالب' });
  user.passwordHash = await bcrypt.hash(nationalId, 10);
  await user.save();
  return res.json({ message: 'تمت إعادة كلمة المرور إلى الرقم القومي' });
}

async function me(req, res) { res.json({ user: publicUser(req.user) }); }

module.exports = { adminLogin, studentLogin, registerStudent, resetStudent, me };
