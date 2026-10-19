import fs from 'node:fs';
const p='dist/index.html';
const js=['workshop-update.js','production-calcs.js','smart-ui.js','smart-features.js','smart-training.js','smart-pro.js','smart-extra.js','smart-final.js','smart-roles.js','smart-login.js','smart-login-fix.js','smart-demo.js','smart-time.js','smart-search.js','smart-nav.js','smart-ui-polish.js','v3-knowledge-base.js','v3-layout-fix.js','v3-omp60-programs.js','v3-reminders.js','v3-training-fix.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const html=fs.readFileSync(p,'utf8');
if(!html.includes('bibbiaOfficinaDB'))throw new Error('Sorgente inattesa');
fs.writeFileSync(p,html.replace('</body>',()=>'<script>'+js+'</script></body>'));
