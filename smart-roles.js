(()=>{
'use strict';
function user(){try{return JSON.parse(localStorage.getItem('bibbiaUtente')||'null');}catch(e){return null;}}
function role(){const u=user();const r=String(u?.ruolo||'Ospite').toLowerCase();if(r.includes('amministr'))return 'admin';if(r.includes('operat'))return 'operatore';return 'ospite';}
const OPERATOR_NAV=['dashboard','lavorazioni','clienti','controlli','problemi','promemoria','manutenzioni','macchine','utensili','materiali','magazzino','documenti','knowledge','lezioni','procedure','quiz','progressi','calcolatori','reporti'];
const GUEST_NAV=['dashboard','lavorazioni','clienti','manutenzioni','macchine','utensili','materiali','magazzino','documenti','knowledge','lezioni','procedure','quiz','progressi','calcolatori'];
const OPERATOR_WRITE=['lavorazioni','clienti','controlli','problemi','promemoria','progressi','lezioni','procedure','reporti'];
const EXEC=['complete-lesson','run-procedure','finish-procedure','take-quiz','submit-quiz','bluetooth','notify','ask','calc-taglio','calc-maschio','calc-trapano','mill-smart','tap-v2','drill-v2','sheet','pdf','close','start-activity','pause-activity','resume-activity','close-activity'];
function canNav(k){const r=role();if(r==='admin')return true;if(r==='operatore')return OPERATOR_NAV.includes(k);return GUEST_NAV.includes(k);}
function canWrite(k,act){const r=role();if(r==='admin')return true;if(r==='ospite')return false;if(act==='del')return false;if(act==='archive-month')return false;if(EXEC.includes(act))return true;if(act==='duplicate')return k==='lavorazioni';return OPERATOR_WRITE.includes(k);}
const oldNav=renderNav;
renderNav=function(){oldNav();document.querySelectorAll('#nav [data-k]').forEach(e=>{if(!canNav(e.dataset.k))e.remove();});};
const oldRender=render;
render=function(){oldRender();const r=role();if(r==='admin')return;document.querySelectorAll('#content [data-act]').forEach(b=>{const act=b.dataset.act,k=b.dataset.k;if(['add','edit','del','save','duplicate'].includes(act)&&!canWrite(k,act))b.hidden=true;if(r==='ospite'&&['complete-lesson','run-procedure','finish-procedure','take-quiz','submit-quiz','make-backup','download-backup','reset','bluetooth'].includes(act))b.hidden=true;});};
document.getElementById('content').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const act=b.dataset.act,k=b.dataset.k;if(!canWrite(k,act)){e.stopImmediatePropagation();e.preventDefault();const r=role();alert(r==='ospite'?'L’ospite può solo consultare. Per registrare o eseguire, serve un account Operatore o Amministratore.':'Questa azione non è consentita al ruolo Operatore. Serve un Amministratore.');return;}if(role()==='ospite'&&act==='sheet'){e.stopImmediatePropagation();e.preventDefault();const r=DB.lavorazioni.find(x=>x.id===b.dataset.id);if(!r)return;const fields=['nome','cliente','macchina','utensile','materiale','tempo','stato','priorita','note','prescrizioni','checklist'];const rows=SCHEMA.lavorazioni.fields.filter(f=>fields.includes(f.k)).map(f=>{let v=f.r?nameOf(f.r,r[f.k]):r[f.k];if(f.k==='checklist')v=String(v||'').split('\n').filter(Boolean).map((x,i)=>(r.checklistDone?.includes(i)?'☑ ':'☐ ')+esc(x)).join('<br>');return '<tr><th>'+esc(f.l)+'</th><td>'+(f.k==='checklist'?v:esc(v||''))+'</td></tr>';}).join('');document.getElementById('modal-body').innerHTML='<h3>📋 Scheda lavoro — '+esc(r.nome||'')+'</h3><table>'+rows+'</table><button data-act="close">Chiudi</button>';document.getElementById('modal').classList.remove('hidden');}},true);
const oldDash=dashboard;
dashboard=function(){let out=oldDash();const r=role();if(r!=='admin')out=out.replace(/<div class='card'><h2>📊 Cruscotto aziendale[\s\S]*?<\/div>\s*<\/div>/,'');return out;};
render();
})();
