import fs from 'node:fs';
const p='dist/index.html';
function patchTime(code){
 const replace=(a,b)=>{if(code.split(a).length!==2)throw new Error('Patch tempi non applicabile: sorgente diversa');code=code.replace(a,b);};
 replace("r.lavori.some(j=>j.stato==='aperto'))||getReport()","r.lavori.some(j=>j.stato==='aperto'))||reports().find(r=>r.operatore===u?.nome&&r.stato==='aperto')||getReport()");
 replace('function reports(){return DB.reportiGiornalieri.filter(r=>Array.isArray(r.lavori));}',`function reports(){
 const real=DB.reportiGiornalieri.filter(r=>r&&Array.isArray(r.lavori));
 const phases=real.flatMap(r=>r.lavori.flatMap(j=>j.fasi||[]));
 const legacy=new Map();
 for(const a of DB.attivita){
  if(!a||a.stato!=='chiusa')continue;
  const linked=phases.some(f=>(a.id&&f.attivitaId===a.id)||(f.fase===a.fase&&f.inizio===a.inizio&&f.fine===a.fine));
  if(linked)continue;
  const date=new Date(a.inizio);
  const valid=Number.isFinite(date.getTime());
  const dk=valid?dayKey(date):'data-non-disponibile';
  const operator=a.operatore||'Operatore non disponibile';
  const key=JSON.stringify([dk,operator]);
  let r=legacy.get(key);
  if(!r){r={id:'storico:'+key,dataKey:dk,data:valid?date.toLocaleDateString('it-IT'):'Data non disponibile',operatore:operator,stato:'storico (sola lettura)',lavori:[]};legacy.set(key,r);}
  const c=DB.clienti.find(c=>c.id===a.cliente);
  const w=DB.lavorazioni.find(w=>w.id===a.lavorazione);
  const duration=a.fine&&Number.isFinite(Date.parse(a.fine))&&valid?+(elapsed(a)/60000).toFixed(2):null;
  r.lavori.push({id:'storico-attivita:'+r.lavori.length,clienteNome:c?.nome||'Cliente non disponibile',clienteCodice:c?.codice||'Non disponibile',lavorazioneNome:w?.nome||w?.codice||'Lavorazione non disponibile',stato:'storico (sola lettura)',fasi:[{fase:a.fase||'Fase non disponibile',inizio:a.inizio,fine:a.fine,minuti:duration,pezzi:a.pezzi,scarti:a.scarti,operatore:a.operatore,salvatoIl:a.salvatoIl}]});
 }
 return real.concat([...legacy.values()]);
}`);
 replace("esc(new Date(f.inizio).toLocaleString('it-IT'))","esc(Number.isFinite(Date.parse(f.inizio))?new Date(f.inizio).toLocaleString('it-IT'):'Non disponibile')");
 replace("esc(new Date(f.fine).toLocaleString('it-IT'))","esc(Number.isFinite(Date.parse(f.fine))?new Date(f.fine).toLocaleString('it-IT'):'Non disponibile')");
 replace("esc(f.minuti)","esc(f.minuti==null?'Non disponibile':f.minuti)");
 replace("esc(new Date(f.salvatoIl||f.fine).toLocaleString('it-IT'))","esc(Number.isFinite(Date.parse(f.salvatoIl))?new Date(f.salvatoIl).toLocaleString('it-IT'):'Non disponibile')");
 return code;
}
const files=['workshop-update.js','production-calcs.js','smart-ui.js','smart-features.js','smart-training.js','smart-pro.js','smart-extra.js','smart-final.js','smart-roles.js','smart-login.js','smart-login-fix.js','smart-demo.js','smart-time.js','smart-search.js'];
const js=files.map(f=>{const code=fs.readFileSync(f,'utf8');return f==='smart-time.js'?patchTime(code):code;}).join('\n');
const html=fs.readFileSync(p,'utf8');
if(!html.includes('bibbiaOfficinaDB'))throw new Error('Sorgente inattesa');
fs.writeFileSync(p,html.replace('</body>',()=>'<script>'+js+'</script></body>'));
