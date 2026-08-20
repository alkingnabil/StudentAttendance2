const { Student, User, Group, Attendance, Evaluation, StudyMonth, EvaluationSession, AdminPermission, FacultySetting, MasterList } = require('../models');
const { canAdminAccessStudent, getVisibleGroups } = require('../services/permissions');
const { buildStudentSummary } = require('../services/summary');

async function dashboard(req, res) {
  const faculty = Number(req.query.faculty || 3);
  const groups = await getVisibleGroups(req.user, faculty);
  const filter = { faculty };
  if (groups !== null) filter.group = { $in: groups };
  const [students, attendance, evaluations] = await Promise.all([
    Student.countDocuments(filter),
    Attendance.countDocuments({ faculty, dateKey: new Date().toISOString().slice(0, 10), ...(groups === null ? {} : { group: { $in: groups } }) }),
    Evaluation.countDocuments({ faculty })
  ]);
  const accounts = await Student.find(filter, { _id: 1 }).lean();
  const accountCount = await User.countDocuments({ role: 'student', studentId: { $in: accounts.map(x => x._id) } });
  res.json({ faculty, students, accounts: accountCount, attendanceToday: attendance, evaluations });
}

async function students(req, res) {
  const faculty = Number(req.query.faculty || 3);
  const search = String(req.query.search || '').trim();
  const groups = await getVisibleGroups(req.user, faculty);
  const filter = { faculty };
  if (groups !== null) filter.group = { $in: groups };
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { nationalId: { $regex: search, $options: 'i' } },
    { seatNumber: { $regex: search, $options: 'i' } },
    { code: { $regex: search, $options: 'i' } }
  ];
  const data = await Student.find(filter).sort({ code: 1 });
  res.json({ students: data });
}

async function studentProfile(req, res) {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'الطالب غير موجود' });
  if (!(await canAdminAccessStudent(req.user, student))) return res.status(403).json({ message: 'الطالب خارج المجموعات المسئول عنها حسابك' });
  const summary = await buildStudentSummary(student);
  res.json({ student, ...summary });
}

async function scanStudent(req, res) {
  const qrToken = String(req.body.qrToken || '').trim();
  if (!qrToken) return res.status(400).json({ message: 'QR غير صالح' });
  const student = await Student.findOne({ qrToken });
  if (!student) return res.status(404).json({ message: 'QR لا يطابق أي طالب' });
  if (!(await canAdminAccessStudent(req.user, student))) return res.status(403).json({ message: 'هذا الطالب خارج المجموعات المسئول عنها حسابك' });
  const summary = await buildStudentSummary(student);
  res.json({ student, ...summary });
}

async function markAttendance(req, res) {
  const id = req.body.studentId;
  const student = await Student.findById(id);
  if (!student) return res.status(404).json({ message: 'الطالب غير موجود' });
  if (!(await canAdminAccessStudent(req.user, student))) return res.status(403).json({ message: 'لا توجد صلاحية لهذا الطالب' });
  const dateKey = new Date().toISOString().slice(0, 10);
  const time = new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  try {
    const row = await Attendance.create({ studentId: student._id, faculty: student.faculty, group: student.group, dateKey, time, method: 'qr', scannedBy: req.user._id });
    res.status(201).json({ message: 'تم تسجيل الحضور', attendance: row });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: 'تم تسجيل حضور الطالب اليوم بالفعل' });
    throw err;
  }
}

async function listAttendance(req, res) {
  const faculty = Number(req.query.faculty || 3);
  const dateKey = String(req.query.date || new Date().toISOString().slice(0, 10));
  const groups = await getVisibleGroups(req.user, faculty);
  const filter = { faculty, dateKey };
  if (groups !== null) filter.group = { $in: groups };
  const rows = await Attendance.find(filter).populate('studentId', 'name code seatNumber group').sort({ createdAt: -1 });
  res.json({ rows });
}

async function permissions(req, res) {
  if (!req.user.isMaster) return res.status(403).json({ message: 'هذه الصفحة لحساب Master فقط' });
  const admins = await User.find({ role: 'admin', isMaster: false }).sort({ name: 1 });
  const result = [];
  for (const a of admins) {
    const perms = await AdminPermission.find({ adminId: a._id }).sort({ faculty: 1 });
    result.push({ admin: { id: a._id, name: a.name, email: a.email }, permissions: perms });
  }
  res.json({ admins: result });
}

async function savePermissions(req, res) {
  if (!req.user.isMaster) return res.status(403).json({ message: 'هذه العملية لحساب Master فقط' });
  const admin = await User.findOne({ _id: req.params.id, role: 'admin', isMaster: false });
  if (!admin) return res.status(404).json({ message: 'الحساب الإداري غير موجود' });
  const permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [];
  for (const faculty of [3, 4]) {
    const item = permissions.find((p) => Number(p.faculty) === faculty) || {};
    await AdminPermission.findOneAndUpdate(
      { adminId: admin._id, faculty },
      { $set: { groups: (item.groups || []).map(Number).filter((x) => x >= 1 && x <= 30), allowAll: !!item.allowAll } },
      { upsert: true }
    );
  }
  res.json({ message: 'تم حفظ الصلاحيات' });
}

async function settings(req, res) {
  const faculty = Number(req.query.faculty || 3);
  const [months, setting, lists, groups] = await Promise.all([
    StudyMonth.find({ faculty }).sort({ createdAt: 1 }),
    FacultySetting.findOne({ faculty }),
    MasterList.find({}),
    Group.find({ faculty }).sort({ group: 1 })
  ]);
  res.json({ months, setting, lists: Object.fromEntries(lists.map(x => [x.key, x.items])), groups });
}

async function saveStudyMonth(req, res) {
  const faculty = Number(req.body.faculty);
  const month = String(req.body.month || '').trim();
  const lectures = Number(req.body.lectures);
  const evaluationDate = String(req.body.evaluationDate || '');
  if (![3, 4].includes(faculty) || !month || !Number.isFinite(lectures) || lectures < 0) return res.status(400).json({ message: 'بيانات الشهر غير صحيحة' });
  const row = await StudyMonth.findOneAndUpdate({ faculty, month }, { $set: { faculty, month, lectures, evaluationDate } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await FacultySetting.updateOne({ faculty }, { $set: { approved: false } });
  res.json({ month: row });
}

async function deleteStudyMonth(req, res) {
  const faculty = Number(req.params.faculty);
  await StudyMonth.deleteOne({ faculty, month: String(req.params.month) });
  await FacultySetting.updateOne({ faculty }, { $set: { approved: false } });
  res.json({ message: 'تم حذف الشهر' });
}

async function saveGroup(req, res) {
  if (!req.user.isMaster) return res.status(403).json({ message: 'هذه العملية لحساب Master فقط' });
  const faculty = Number(req.body.faculty); const group = Number(req.body.group);
  const row = await Group.findOneAndUpdate({ faculty, group }, {
    $set: { location: String(req.body.location || ''), facultyMember: String(req.body.facultyMember || ''), assistant: String(req.body.assistant || ''), external: String(req.body.external || '') }
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await Student.updateMany({ faculty, group }, { $set: { training: row.location, facultyMember: row.facultyMember, assistant: row.assistant, external: row.external } });
  res.json({ group: row });
}

async function deleteGroup(req, res) {
  if (!req.user.isMaster) return res.status(403).json({ message: 'هذه العملية لحساب Master فقط' });
  const faculty = Number(req.params.faculty); const group = Number(req.params.group);
  await Group.deleteOne({ faculty, group });
  await Student.updateMany({ faculty, group }, { $set: { training: '', facultyMember: '', assistant: '', external: '' } });
  res.json({ message: 'تم حذف إعداد المجموعة' });
}

async function saveLectureGrade(req, res) {
  const faculty = Number(req.params.faculty); const lectureGrade = Number(req.body.lectureGrade);
  if (!Number.isFinite(lectureGrade) || lectureGrade < 0) return res.status(400).json({ message: 'درجة غير صحيحة' });
  await FacultySetting.findOneAndUpdate({ faculty }, { $set: { lectureGrade, approved: false } }, { upsert: true });
  res.json({ message: 'تم حفظ درجة المحاضرة' });
}

async function approve(req, res) {
  const faculty = Number(req.params.faculty);
  await FacultySetting.findOneAndUpdate({ faculty }, { $set: { approved: true, approvedBy: req.user._id, approvedAt: new Date() } }, { upsert: true });
  res.json({ message: 'تم اعتماد النتائج' });
}

module.exports = { dashboard, students, studentProfile, scanStudent, markAttendance, listAttendance, permissions, savePermissions, settings, saveStudyMonth, deleteStudyMonth, saveGroup, deleteGroup, saveLectureGrade, approve };
