const { Student, Group } = require('../models');
const { buildStudentSummary } = require('../services/summary');

async function myProfile(req, res) {
  const student = await Student.findById(req.user.studentId);
  if (!student) return res.status(404).json({ message: 'بيانات الطالب غير موجودة' });
  const summary = await buildStudentSummary(student);
  res.json({ student, ...summary });
}

async function groupPreview(req, res) {
  const group = await Group.findOne({ group: Number(req.params.group) });
  if (!group) return res.json({ group: null });
  res.json({ group });
}

module.exports = { myProfile, groupPreview };
