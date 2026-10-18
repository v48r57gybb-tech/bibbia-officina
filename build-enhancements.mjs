import fs from 'node:fs';
import vm from 'node:vm';
let quotes=fs.readFileSync('smart-quotes.js','utf8');
const old="q[k]=Number(v);";
if(quotes.split(old).length!==2)throw Error('Modulo preventivi inatteso');
quotes=quotes.replace(old,"q[k]=Number(v.trim().replace(',', '.'));");
quotes=quotes.replace("type=\"'+t+'\" ","type=\"'+(t==='number'?'text':t)+'\" ");
quotes=quotes.replace("min=\"0\" step=\"any\" ","inputmode=\"decimal\" ");
new vm.Script(quotes);
const navigation=`(()=>{
'use strict';
const groups=[['🏠 Home',['dashboard']],['⚙️ Area tecnica',['macchine','lavorazioni','materiali','utensili','calcolatori','parametri']],['📚 Conoscenza e formazione',['procedure','knowledge','documenti','lezioni','quiz','progressi']],['🏭 Produzione',['commesse','reporti','promemoria','manutenzioni','problemi','controlli','preventivi']],['🏢 Anagrafiche',['clienti','fornitori','ordini','magazzino']],['🔐 Amministrazione',['utenti','ruoli','backup','settings','archivi','reparti']]];
const labels={calcolatori:'Calcolatrici',macchine:'Macchine utensili',knowledge:'Conoscenze',reporti:'Report tempi'};
for(const s of SECTIONS)if(labels[s.k])s.l=labels[s.k];
const previous=renderNav;
renderNav=function(){
 previous();
 const nav=document.getElementById('nav');
 const nodes=[...nav.querySelectorAll('.nav-item[data-k]')];
 const used=new Set();
 const fragment=document.createDocumentFragment();
 function group(title,items){
  if(!items.length)return;
  const d=document.createElement('details');
  d.className='bo-nav-group';
  d.open=items.some(n=>n.dataset.k===current)||title==='🏠 Home';
  const s=document.createElement('summary');s.textContent=title;d.append(s);
  for(const n of items){used.add(n);if(labels[n.dataset.k])n.textContent=(SECTIONS.find(x=>x.k===n.dataset.k)?.i||'•')+' '+labels[n.dataset.k];d.append(n);}
  fragment.append(d);
 }
 for(const [title,keys] of groups)group(title,nodes.filter(n=>keys.includes(n.dataset.k)));
 group('📦 Altre funzioni',nodes.filter(n=>!used.has(n)));
 nav.replaceChildren(fragment);
};
const oldCalc=calcolatori;calcolatori=function(){return oldCalc().replace(/Calcolatrice/g,'Calcolatrice');};
const style=document.createElement('style');
style.textContent='#nav{display:block!important}.bo-nav-group{margin:6px 0}.bo-nav-group summary{cursor:pointer;padding:12px 6px;min-height:44px;font-weight:700;color:#7dd3fc}.bo-nav-group .nav-item{margin-left:8px}';
document.head.append(style);
render();
})();`;
new vm.Script(navigation);
const path='dist/index.html';
let html=fs.readFileSync(path,'utf8');
if(html.split('</body>').length!==2)throw Error('Documento di build inatteso');
html=html.replace('</body>',()=>'<script>'+quotes+'\n'+navigation+'</script></body>');
fs.writeFileSync(path,html);
