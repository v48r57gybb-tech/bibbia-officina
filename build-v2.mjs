import fs from 'node:fs';
import vm from 'node:vm';
const path='dist/index.html';
let html=fs.readFileSync(path,'utf8');
function patch(a,b,expected=1){const count=html.split(a).length-1;if(count!==expected)throw new Error('V2: attese '+expected+' occorrenze, trovate '+count+' per '+a);html=html.split(a).join(b);}
patch("const lo=document.getElementById('logout');if(lo)lo.onclick=()=>{sessionStorage.removeItem('bibbiaSessione');localStorage.removeItem('bibbiaUtente');start();};","window.boSelectAccount=function(){if(!overlay.isConnected)document.body.append(overlay);sessionStorage.removeItem('bibbiaSessione');localStorage.removeItem('bibbiaUtente');show();loginScreen();};const lo=document.getElementById('logout');if(lo)lo.onclick=window.boSelectAccount;");
patch("const version='Bibbia Officina — V Prova 1';","const version='Bibbia Officina';");
patch("badge.id='bo-version';badge.textContent=version;","badge.id='bo-version';badge.textContent='V2';");
patch("button.textContent='Esci / Cambia utente';","button.textContent='Cambia account';");
const begin=html.indexOf(" const cloudExit=[...document.querySelectorAll('button.cloud-exit')]");
const end=html.indexOf('\n};\ndocument.body.append(button);',begin);
if(begin<0||end<0)throw new Error('V2: comando blu non trovato');
html=html.slice(0,begin)+" if(typeof window.boSelectAccount==='function'){window.boSelectAccount();return;}\n alert('Selezione account non disponibile. Nessun dato cancellato.');"+html.slice(end);
patch("!!document.getElementById('login');","!!(document.getElementById('login')&&getComputedStyle(document.getElementById('login')).display!=='none');");
patch("['🏠 Home',['dashboard']],","['🏠 Cruscotto aziendale',['dashboard']],",2);
patch("title==='🏠 Home'||items.some","title==='🏠 Cruscotto aziendale'||items.some");
patch("['👥 Clienti',['clienti','commesse','reporti','reportiGiornalieri','preventivi']],","['👥 Clienti',['clienti','commesse','preventivi']],\n ['⏱️ Tempi e report',['reporti','reportiGiornalieri','produzione']],");
const runtime=`(()=>{
 let timer;
 function connect(){
  const box=document.getElementById('bibbia-storage-status');
  if(!box)return;
  function update(){
   clearTimeout(timer);box.hidden=false;
   if(box.textContent==='Salvato sul tablet; sincronizzazione cloud non verificata.')timer=setTimeout(()=>{box.hidden=true;},5000);
  }
  new MutationObserver(update).observe(box,{childList:true,characterData:true,subtree:true});
  update();
 }
 if(document.getElementById('bibbia-storage-status'))connect();
 else{const watch=new MutationObserver(()=>{if(document.getElementById('bibbia-storage-status')){watch.disconnect();connect();}});watch.observe(document.body,{childList:true,subtree:true});}
})();`;
new vm.Script(runtime);
if(html.split('</body>').length!==2)throw new Error('V2: documento inatteso');
html=html.replace('</body>',()=>'<script>'+runtime+'</script></body>');
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
fs.writeFileSync(path,html);
