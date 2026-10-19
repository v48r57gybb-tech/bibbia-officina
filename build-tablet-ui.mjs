import fs from 'node:fs';
import vm from 'node:vm';
const runtime = `
(()=>{
'use strict';
const version='Bibbia Officina — V Prova 1';
document.title=version;
const heading=document.querySelector('#sidebar h1');
if(heading)heading.textContent=version;
const badge=document.createElement('div');
badge.id='bo-version';badge.textContent=version;
badge.style.cssText='padding:6px 0;color:#7dd3fc;font-weight:700';
const main=document.getElementById('main');
if(main)main.prepend(badge);
const style=document.createElement('style');
style.textContent='#bibbia-storage-status{top:auto!important;bottom:58px!important;max-width:90vw!important;pointer-events:none}#bo-change-user{position:fixed;right:10px;top:10px;z-index:9999;background:#38bdf8;color:#0f172a;font-size:13px;padding:8px 12px;border-radius:8px}#bo-clock{float:right;padding:8px 12px;border:1px solid #38bdf8;border-radius:10px;color:#7dd3fc;margin:0 0 8px 12px;font-variant-numeric:tabular-nums}@media(max-width:700px){#bo-version{padding-right:110px}#bo-clock{float:none;display:block;margin:8px 0}}';
document.head.append(style);
const button=document.createElement('button');
button.id='bo-change-user';button.type='button';
button.textContent='Esci / Cambia utente';
button.onclick=()=>{
 const modal=document.getElementById('modal');
 const formOpen=modal&&!modal.classList.contains('hidden');
 const reports=Array.isArray(DB.reportiGiornalieri)?DB.reportiGiornalieri:[];
 const active=reports.some(r=>Array.isArray(r.lavori)&&r.lavori.some(j=>j.stato==='aperto'));
 if((formOpen||active)&&!confirm('Ci sono un modulo o lavori aperti. Il cambio utente non li chiude e non salva il modulo. Continuare?'))return;
 const cloudExit=[...document.querySelectorAll('button.cloud-exit')].find(b=>b.textContent.trim()==='Esci');
 if(cloudExit){cloudExit.click();return;}
 const internal=document.getElementById('logout');
 if(internal){internal.click();return;}
 alert('Comando di uscita non disponibile: nessuna sessione modificata.');
};
document.body.append(button);
const groups=[
 ['🏠 Home',['dashboard']],
 ['⚙️ Area tecnica',['macchine','lavorazioni','materiali','utensili','calcolatori','parametri','programmi']],
 ['👥 Clienti',['clienti','commesse','reporti','reportiGiornalieri','preventivi']],
 ['🛡️ Qualità e manutenzione',['controlli','misure','manutenzioni','problemi']],
 ['📚 Conoscenza e formazione',['procedure','knowledge','documenti','lezioni','quiz','progressi']],
 ['📦 Magazzino e acquisti',['magazzino','acquisti','fornitori','ordini']],
 ['🔔 Organizzazione',['promemoria']],
 ['🔐 Amministrazione',['utenti','ruoli','backup','settings','archivi','reparti']]
];
const priorNav=renderNav;
renderNav=function(){
 priorNav();
 const nav=document.getElementById('nav');
 if(!nav)return;
 const nodes=[...nav.querySelectorAll('.nav-item[data-k]')];
 const used=new Set();
 const fragment=document.createDocumentFragment();
 function appendGroup(title,items){
  if(!items.length)return;
  const details=document.createElement('details');
  details.className='bo-nav-group';
  details.open=title==='🏠 Home'||items.some(n=>n.dataset.k===current);
  const summary=document.createElement('summary');summary.textContent=title;details.append(summary);
  for(const node of items){
   used.add(node);
   if(node.dataset.k==='lavorazioni')node.textContent='🛠️ Commesse';
   details.append(node);
  }
  fragment.append(details);
 }
 for(const [title,keys] of groups)appendGroup(title,nodes.filter(n=>keys.includes(n.dataset.k)&&!used.has(n)));
 appendGroup('📦 Altre funzioni',nodes.filter(n=>!used.has(n)));
 nav.replaceChildren(fragment);
};
const oldRender=render;
render=function(){
 const result=oldRender.apply(this,arguments);
 if(current==='lavorazioni'){
  const title=document.querySelector('#content h2');
  if(title&&title.textContent.includes('Lavorazioni'))title.textContent=title.textContent.replace('Lavorazioni','Commesse');
 }
 if(current==='dashboard'){
  const title=[...document.querySelectorAll('#content h2')].find(h=>h.textContent.includes('Oggi'));
  const card=title&&title.closest('.card');
  if(card&&!document.getElementById('bo-clock')){
   const clock=document.createElement('time');clock.id='bo-clock';clock.setAttribute('aria-label','Ora del dispositivo');card.prepend(clock);
  }
 }
 tick();
 return result;
};
function tick(){
 const clock=document.getElementById('bo-clock');
 if(clock){const now=new Date();clock.dateTime=now.toISOString();clock.textContent=now.toLocaleTimeString('it-IT');}
 const locked=document.body.classList.contains('locked')||!!document.getElementById('cloud-login')||!!document.getElementById('login');
 button.hidden=locked;
}
setInterval(tick,1000);
render();
})();
`;
new vm.Script(runtime);
const path='dist/index.html';
let html=fs.readFileSync(path,'utf8');
if(html.split('</body>').length!==2||html.includes("badge.id='bo-version'"))throw new Error('Build UI inattesa.');
html=html.replace('</body>',()=>'<script>'+runtime+'</script></body>');
for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
fs.writeFileSync(path,html);
