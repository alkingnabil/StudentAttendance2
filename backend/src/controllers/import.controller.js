const XLSX = require('xlsx');
const crypto = require('crypto');
const { Student, User, Group, Attendance, Evaluation, FacultySetting } = require('../models');

function norm(v) { return String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase(); }
const aliases = {
  name: ['الاسم', 'اسم الطالب', 'اسم', 'name', 'student name'],
  seatNumber: ['رقم الجلوس', 'رقم الجلوس الطالب', 'seat', 'seat number', 'num', 'رقم'],
  nationalId: ['الرقم القومي', 'الرقم القومى', 'nationalid', 'national id', 'national_id'],
  phone: ['رقم الهاتف', 'الهاتف', 'التليفون', 'phone', 'mobile'],
  group: ['رقم المجموعة', 'رقم المجموعه', 'المجموعة', 'المجموعه', 'group', 'group number'],
  code: ['رقم الكود', 'الكود', 'code']
};
function value(row, keys) {
  const key = Object.keys(row).find((k) => keys.map(norm).includes(norm(k)));
  return key == null ? '' : String(row[key] ?? '').trim();
}

async function importStudents(req, res) {
  if (!req.user.isMaster) return res.status(403).json({ message: 'الاستيراد لحساب Master فقط' });
  const faculty = Number(req.body.faculty);
  if (![3, 4].includes(faculty)) return res.status(400).json({ message: 'الفرقة غير صحيحة' });
  if (!req.file) return res.status(400).json({ message: 'أرفق ملف Excel' });
  const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  if (!rows.length) return res.status(400).json({ message: 'الملف فارغ' });

  const usedCodes = new Set((await Student.find({ faculty }).select('code -_id').lean()).map((s) => String(s.code).padStart(3, '0')));
  let next = 1;
  const fresh = [];
  for (const row of rows) {
    const name = value(row, aliases.name);
    if (!name) continue;
    let code = value(row, aliases.code).replace(/\.0$/, '');
    if (!/^\d{1,3}$/.test(code) || usedCodes.has(code.padStart(3, '0'))) {
      while (usedCodes.has(String(next).padStart(3, '0'))) next += 1;
      code = String(next++);
    }
    code = code.padStart(3, '0'); usedCodes.add(code);
    const group = Number(value(row, aliases.group)) || null;
    const groupDoc = group ? await Group.findOne({ faculty, group }) : null;
    fresh.push({
      faculty, name,
      nationalId: value(row, aliases.nationalId) || undefined,
      phone: value(row, aliases.phone),
      seatNumber: value(row, aliases.seatNumber) || String(fresh.length + 1),
      group, code,
      qrToken: `TDR-${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
      training: groupDoc?.location || '', facultyMember: groupDoc?.facultyMember || '', assistant: groupDoc?.assistant || '', external: groupDoc?.external || '', registered: false
    });
  }
  if (!fresh.length) return res.status(400).json({ message: 'لم يتم العثور على أسماء طلاب' });
  const oldStudents = await Student.find({ faculty }).select('_id').lean();
  const oldIds = oldStudents.map((x) => x._id);
  if (oldIds.length) {
    await Promise.all([
      User.deleteMany({ studentId: { $in: oldIds } }),
      Attendance.deleteMany({ studentId: { $in: oldIds } }),
      Evaluation.deleteMany({ studentId: { $in: oldIds } })
    ]);
  }
  await Student.deleteMany({ faculty });
  await Student.insertMany(fresh, { ordered: true });
  await FacultySetting.updateOne({ faculty }, { $set: { approved: false } }, { upsert: true });
  res.json({ message: `تم استيراد ${fresh.length} طالب`, imported: fresh.length });
}

module.exports = { importStudents };
