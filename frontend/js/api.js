const API_BASE = 'https://studentattendance2-2u4a.onrender.com/api';

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = window.localStorage.getItem('tadreebi_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const type = response.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await response.json() : await response.blob();
  if (!response.ok) {
    const message = data?.message || 'فشل الطلب';
    const error = new Error(message); error.status = response.status; throw error;
  }
  return data;
}

function setAuth(token, user) { localStorage.setItem('tadreebi_token', token); localStorage.setItem('tadreebi_user', JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem('tadreebi_token'); localStorage.removeItem('tadreebi_user'); }
function getUser() { try { return JSON.parse(localStorage.getItem('tadreebi_user') || 'null'); } catch { return null; } }
