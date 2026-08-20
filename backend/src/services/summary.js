const { Attendance, Evaluation, StudyMonth, FacultySetting } = require('../models');

async function buildStudentSummary(student) {
  const [months, attendance, evaluations, setting] = await Promise.all([
    StudyMonth.find({ faculty: student.faculty }).sort({ createdAt: 1 }),
    Attendance.find({ studentId: student._id }).sort({ dateKey: 1 }),
    Evaluation.find({ studentId: student._id }).sort({ date: 1 }),
    FacultySetting.findOne({ faculty: student.faculty })
  ]);

  const totalLectures = months.reduce((sum, m) => sum + Number(m.lectures || 0), 0);
  const present = attendance.length;
  const absent = Math.max(0, totalLectures - present);
  const percentage = totalLectures ? Math.min(100, (present / totalLectures) * 100) : 0;
  const evaluationTotal = evaluations.reduce((sum, e) => sum + Number(e.score || 0), 0);
  const evaluationMax = evaluations.reduce((sum, e) => sum + Number(e.max || 0), 0);
  const lectureGrade = Number(setting?.lectureGrade || 0);
  const total = evaluationTotal + (totalLectures * lectureGrade);

  const monthly = months.map((m) => {
    const prefix = String(m.evaluationDate || '').slice(0, 7);
    const monthAttendance = attendance.filter((a) => String(a.dateKey).slice(0, 7) === prefix).length;
    const monthEvaluation = evaluations.find((e) => e.month === m.month);
    return {
      month: m.month,
      lectures: m.lectures,
      present: monthAttendance,
      absent: Math.max(0, m.lectures - monthAttendance),
      percentage: m.lectures ? Math.min(100, (monthAttendance / m.lectures) * 100) : 0,
      evaluationDate: m.evaluationDate || '',
      evaluationScore: monthEvaluation?.score ?? null,
      evaluationMax: monthEvaluation?.max ?? null
    };
  });

  return {
    attendance: { totalLectures, present, absent, percentage },
    evaluations,
    monthly,
    summary: { evaluationTotal, evaluationMax, lectureGrade, attendanceComponent: totalLectures * lectureGrade, total }
  };
}

module.exports = { buildStudentSummary };
