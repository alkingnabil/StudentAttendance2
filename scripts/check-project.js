const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const files = [
  'frontend/js/api.js',
  'frontend/js/app.js'
];
let failed = false;
for (const rel of files) {
  const file = path.join(__dirname, '..', rel);
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (r.status !== 0) { failed = true; console.error(`${rel}: FAIL\n${r.stderr || r.stdout}`); }
  else console.log(`${rel}: PASS`);
}
if (failed) process.exit(1);
