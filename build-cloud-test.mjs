import fs from 'node:fs';
import vm from 'node:vm';
for (const file of ['cloud-test.html','cloud-app.html']) {
  const html=fs.readFileSync(file,'utf8');
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if(scripts.length!==1)throw Error('Script cloud inatteso in '+file);
  new vm.Script(scripts[0][1]);
  fs.copyFileSync(file,'dist/'+file);
}
const gate=fs.readFileSync('cloud-gate.js','utf8');
new vm.Script(gate);
const p='dist/index.html';
let html=fs.readFileSync(p,'utf8');
html=html.replace('</body>',()=>'<script>'+gate+'</script></body>');
fs.writeFileSync(p,html);
