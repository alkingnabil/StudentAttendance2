const { AdminPermission } = require('../models');

async function canAdminAccessStudent(user, student) {
  if (!user || user.role !== 'admin') return false;
  if (user.isMaster) return true;
  const permission = await AdminPermission.findOne({ adminId: user._id, faculty: student.faculty });
  if (!permission) return false;
  if (permission.allowAll) return true;
  return permission.groups.includes(Number(student.group));
}

async function getVisibleGroups(user, faculty) {
  if (user.isMaster) return null;
  const permission = await AdminPermission.findOne({ adminId: user._id, faculty: Number(faculty) });
  return permission ? permission.groups : [];
}

module.exports = { canAdminAccessStudent, getVisibleGroups };
