import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('cloud-test.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if(scripts.length!==1)throw Error('Script cloud inatteso');
new vm.Script(scripts[0][1]);
fs.copyFileSync('cloud-test.html','dist/cloud-test.html');
