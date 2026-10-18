import fs from 'node:fs';
const p='dist/index.html';
const js=fs.readFileSync('workshop-update.js','utf8');
const html=fs.readFileSync(p,'utf8');
if(!html.includes('bibbiaOfficinaDB'))throw new Error('Sorgente inattesa');
fs.writeFileSync(p,html.replace('</body>','<script>'+js+'</script></body>'));
