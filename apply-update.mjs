import fs from 'node:fs';

const p = 'index.html';
const html = fs.readFileSync(p, 'utf8');

if (!html.includes('v4-data.js')) {
  throw new Error('Sorgente V4 inattesa');
}

fs.writeFileSync(p, html);
