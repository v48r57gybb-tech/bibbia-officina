import fs from 'node:fs';
const p='dist/index.html';
const js=['workshop-update.js','production-calcs.js','smart-ui.js','smart-features.js','smart-training.js','smart-pro.js','smart-extra.js','smart-final.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const html=fs.readFileSync(p,'utf8');
if(!html.includes('bibbiaOfficinaDB'))throw new Error('Sorgente inattesa');
fs.writeFileSync(p,html.replace('</body>',()=>'<script>'+js+'</script></body>'));
