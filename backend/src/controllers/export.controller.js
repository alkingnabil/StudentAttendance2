const XLSX = require('xlsx');
const { Student, FacultySetting } = require('../models');
const { buildStudentSummary } = require('../services/summary');

async function exportXlsx(req, res) {
  const faculty = Number(req.params.faculty);
  const setting = await FacultySetting.findOne({ faculty });
  if (!setting?.approved) return res.status(400).json({ message: 'يجب اعتماد النتائج أولًا' });
  const students = await Student.find({ faculty }).sort({ code: 1 });
  const rows = [];
  for (const s of students) {
    const x = await buildStudentSummary(s);
    rows.push({ 'الفرقة': faculty, 'الاسم': s.name, 'رقم الجلوس': s.seatNumber, 'المجموعة': s.group || '', 'الكود': s.code, 'إجمالي المحاضرات': x.attendance.totalLectures, 'الحضور': x.attendance.present, 'نسبة الحضور': Number(x.attendance.percentage.toFixed(1)), 'درجة المحاضرة': x.summary.lectureGrade, 'مجموع التقييمات': x.summary.evaluationTotal, 'المجموع الكلي': x.summary.total, 'الحالة': 'معتمد' });
  }
  const wb = XLSX.utils.book_new(); const ws = XLSX.utils.json_to_sheet(rows); XLSX.utils.book_append_sheet(wb, ws, 'طلاب');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="tadreebi-faculty-${faculty}.xlsx"`);
  res.send(buffer);
}
module.exports = { exportXlsx };
