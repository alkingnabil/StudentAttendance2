const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, Student, Group, StudyMonth, FacultySetting, MasterList, AdminPermission } = require('../models');

const DEMO_ADMINS = [
  { email: 'mai@tadreebi.local', name: 'م.م/ مي عبداللطيف', password: '123456', groups: [1, 6, 11, 21] },
  { email: 'mostafa@tadreebi.local', name: 'م.م/ مصطفي الزناتي', password: '123456', groups: [] },
  { email: 'abohassan@tadreebi.local', name: 'م.م/ أبو الحسن ربيع', password: '123456', groups: [] },
  { email: 'bodour@tadreebi.local', name: 'م.م / بدور سلطان', password: '123456', groups: [] },
  { email: 'hani@tadreebi.local', name: 'م.م / هاني يسن', password: '123456', groups: [] },
  { email: 'master@tadreebi.local', name: 'Master', password: 'master123', groups: [], isMaster: true }
];

const LISTS = {
  locations: ['مديرية الشباب والرياضة', 'كلية الطب البشري', 'كلية طب الفم والأسنان', 'كلية الصيدلة', 'كلية العلاج الطبيعي', 'كلية التمريض', 'المعهد الفني للتمريض', 'المعهد الفني الصحي', 'كلية الهندسة', 'كلية الحاسبات والمعلومات', 'كلية العلوم', 'كلية الزراعة', 'كلية الآداب', 'كلية الحقوق', 'كلية التجارة', 'كلية التربية بقنا', 'كلية التربية النوعية', 'كلية الإعلام وتكنولوجيا الاتصال', 'كلية الآثار', 'كلية علوم الرياضة', 'كلية الطب البيطري'],
  facultyMembers: ['أ.د/ عبد الحق سيد', 'أ.م.د/ عبد الرحمن خلاوي', 'أ.م.د/ عبدالله حسين', 'د/ محمد غانم', 'د/ محمود المصطفي', 'د/ احمد عبدالفتاح', 'د/ علي عبدالرحيم', 'د/محمد خيري', 'د /احمد علي'],
  assistants: ['م.م/ مي عبداللطيف', 'م.م/ مصطفي الزناتي', 'م.م/ أبو الحسن ربيع', 'م.م / بدور سلطان', 'م.م / هاني يسن'],
  externals: ['أحمد محمود سيد', 'محمود حسن مصطفى', 'محمد عبد الرحمن حسن', 'كريم طارق السيد', 'يوسف هاني محمود', 'مصطفى خالد عبد الله', 'عمرو شريف صلاح', 'أسامة مجدي عبد العزيز', 'إبراهيم وليد فاروق', 'زياد هاني رمضان', 'أحمد حسام الدين', 'سامح عادل فوزي', 'عمر ياسر ممدوح', 'حازم تامر فتحي', 'وائل سعيد جابر', 'أشرف مدحت نبيل', 'أيمن رأفت جلال', 'خليل إبراهيم عوض', 'هيثم علاء مبروك', 'ماجد عصام شاكر', 'بلال هاني زكي', 'رائد منير توفيق', 'شادي مروان سعيد', 'أنس فادي كمال', 'نادر نشأت عزمي']
};

async function seed() {
  for (const [key, items] of Object.entries(LISTS)) {
    await MasterList.updateOne({ key }, { $setOnInsert: { key, items } }, { upsert: true });
  }

  for (const admin of DEMO_ADMINS) {
    const hash = await bcrypt.hash(admin.password, 10);
    const user = await User.findOneAndUpdate(
      { email: admin.email },
      { $setOnInsert: { email: admin.email, name: admin.name, passwordHash: hash, role: 'admin', isMaster: !!admin.isMaster } },
      { upsert: true, new: true }
    );
    if (!user.isMaster) {
      for (const faculty of [3, 4]) {
        await AdminPermission.findOneAndUpdate(
          { adminId: user._id, faculty },
          { $setOnInsert: { adminId: user._id, faculty, groups: admin.groups } },
          { upsert: true }
        );
      }
    }
  }

  for (const faculty of [3, 4]) {
    await FacultySetting.findOneAndUpdate({ faculty }, { $setOnInsert: { faculty, lectureGrade: 2, approved: false } }, { upsert: true });
    const months = faculty === 3
      ? [['يناير', 8, '2027-01-25'], ['فبراير', 10, '2027-02-24'], ['مارس', 9, '2027-03-25']]
      : [['يناير', 8, '2027-01-25'], ['فبراير', 10, '2027-02-24'], ['مارس', 9, '2027-03-25']];
    for (const [month, lectures, evaluationDate] of months) {
      await StudyMonth.updateOne({ faculty, month }, { $setOnInsert: { faculty, month, lectures, evaluationDate } }, { upsert: true });
    }
  }

  const existing = await Student.countDocuments({ demo: true });
  if (!existing) {
    const students = [
      { faculty: 4, nationalId: '29901010101010', name: 'أحمد محمد علي حسن', phone: '01000000000', seatNumber: '4001', group: 1, code: '001', demo: true, registered: true },
      { faculty: 4, nationalId: '29901010101011', name: 'محمد أحمد حسن علي', phone: '01000000001', seatNumber: '4002', group: 2, code: '002', demo: true },
      { faculty: 3, nationalId: '29901010101012', name: 'محمود سامي عبد الله', phone: '01000000002', seatNumber: '3001', group: 3, code: '003', demo: true }
    ];
    for (const s of students) {
      const group = await Group.findOne({ faculty: s.faculty, group: s.group });
      const qrToken = `TDR-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
      const student = await Student.create({ ...s, qrToken, training: group?.location || '', facultyMember: group?.facultyMember || '', assistant: group?.assistant || '', external: group?.external || '' });
      if (s.registered) {
        await User.create({ email: undefined, name: student.name, passwordHash: await bcrypt.hash('123456', 10), role: 'student', studentId: student._id });
      }
    }
  }
}

module.exports = { seed, DEMO_ADMINS };
