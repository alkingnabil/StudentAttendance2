const { EvaluationSession, Evaluation, Student, StudyMonth, FacultySetting } = require('../models');
const { canAdminAccessStudent } = require('../services/permissions');

async function startSession(req, res) {
  const faculty = Number(req.body.faculty); const month = String(req.body.month || '').trim(); const date = String(req.body.date || ''); const max = Number(req.body.max);
  if (![3, 4].includes(faculty) || !month || !date || !Number.isFinite(max) || max <= 0) return res.status(400).json({ message: 'أكمل إعداد التقييم' });
  await EvaluationSession.updateMany({ faculty, status: 'open' }, { $set: { status: 'closed' } });
  const session = await EvaluationSession.create({ faculty, month, date, max, createdBy: req.user._id });
  await FacultySetting.updateOne({ faculty }, { $set: { approved: false } });
  res.status(201).json({ session });
}

async function saveEvaluation(req, res) {
  const { sessionId, code, score } = req.body;
  const session = await EvaluationSession.findOne({ _id: sessionId, status: 'open' });
  if (!session) return res.status(400).json({ message: 'جلسة التقييم غير موجودة أو مغلقة' });
  const cleanCode = String(code || '').padStart(3, '0'); const numericScore = Number(score);
  if (!/^\d{3}$/.test(cleanCode) || !Number.isFinite(numericScore) || numericScore < 0 || numericScore > session.max) return res.status(400).json({ message: 'البيانات غير صحيحة' });
  const student = await Student.findOne({ faculty: session.faculty, code: cleanCode });
  if (!student) return res.status(404).json({ message: 'لم يتم العثور على الطالب' });
  if (!(await canAdminAccessStudent(req.user, student))) return res.status(403).json({ message: 'الطالب خارج المجموعات المسئول عنها حسابك' });
  const row = await Evaluation.findOneAndUpdate(
    { faculty: student.faculty, studentId: student._id, month: session.month },
    { $set: { code: cleanCode, date: session.date, score: numericScore, max: session.max, createdBy: req.user._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await FacultySetting.updateOne({ faculty: student.faculty }, { $set: { approved: false } });
  res.json({ message: 'تم حفظ الدرجة', evaluation: row });
}

async function list(req, res) {
  const faculty = Number(req.query.faculty || 3);
  const rows = await Evaluation.find({ faculty }).populate('studentId', 'name code group').sort({ createdAt: -1 });
  const activeSession = await EvaluationSession.findOne({ faculty, status: 'open' }).sort({ createdAt: -1 });
  const months = await StudyMonth.find({ faculty }).sort({ createdAt: 1 });
  res.json({ rows, activeSession, months });
}

module.exports = { startSession, saveEvaluation, list };
