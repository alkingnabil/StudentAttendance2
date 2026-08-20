// Simple smoke test for backend APIs
// Usage: node test-smoke.js
// Requires Node 18+ (fetch available) and server running at BASE_URL

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'master@tadreebi.local';
const ADMIN_PASS = 'master123';

async function run(){
  console.log('Smoke test starting against', BASE_URL);
  try{
    // Admin login
    let res = await fetch(BASE_URL + '/api/auth/admin/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }) });
    console.log('/api/auth/admin/login ->', res.status);
    const login = await res.json().catch(()=>null);
    if (res.ok) console.log('  token length:', (login.token||'').length);
    else console.log('  message:', login && login.message);

    const token = login?.token;

    // fetch masterlists
    res = await fetch(BASE_URL + '/api/masterlists', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
    console.log('/api/masterlists ->', res.status);
    const m = await res.json().catch(()=>null);
    if (res.ok) console.log('  locations count:', (m.locations || []).length);
    else console.log('  message:', m && m.message);

    // fetch students for faculty 3
    res = await fetch(BASE_URL + '/api/students?faculty=3');
    console.log('/api/students?faculty=3 ->', res.status);
    const students = await res.json().catch(()=>null);
    if (res.ok) console.log('  students count:', (students||[]).length);
    else console.log('  message:', students && students.message);

    console.log('\nSmoke test finished. If admin login failed, ensure server is running and .env JWT_SECRET matches seed expectations.');
  }catch(e){
    console.error('Smoke test error', e);
  }
}

run();
