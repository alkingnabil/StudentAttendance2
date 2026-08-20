const XLSX = require('xlsx');

function normalizeCellName(k){
  return String(k || '').trim().toLowerCase();
}

function parseBufferToStudents(buffer, faculty = '3'){
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  // try to map common headers
  const aliases = {
    name: ['name','اسم','الاسم','student name'],
    seat: ['seat','رقم الجلوس','رقم'],
    nationalId: ['nationalid','الرقم القومي','national id'],
    phone: ['phone','تليفون','هاتف']
  };
  const mapped = rows.map(r => {
    const obj = { faculty: String(faculty) };
    for (const k of Object.keys(r)){
      const nk = normalizeCellName(k);
      if (aliases.name.includes(nk)) obj.name = String(r[k]||'').trim();
      else if (aliases.seat.includes(nk)) obj.seat = String(r[k]||'').trim();
      else if (aliases.nationalId.includes(nk)) obj.nationalId = String(r[k]||'').trim();
      else if (aliases.phone.includes(nk)) obj.phone = String(r[k]||'').trim();
    }
    return obj;
  }).filter(x => x.name || x.seat);
  return mapped;
}

module.exports = { parseBufferToStudents };
