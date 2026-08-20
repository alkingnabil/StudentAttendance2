const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..', 'backend', 'src');
let failed = false;
function walk(dir){for(const name of fs.readdirSync(dir)){const p=path.join(dir,name);const st=fs.statSync(p);if(st.isDirectory())walk(p);else if(name.endsWith('.js')){const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});if(r.status!==0){failed=true;console.error(r.stderr||r.stdout);}}}}
walk(root);
if(failed) process.exit(1);
console.log('Backend JavaScript syntax check: PASS');
