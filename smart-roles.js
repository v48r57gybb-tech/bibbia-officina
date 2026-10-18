(()=>{
'use strict';
function user(){try{return JSON.parse(localStorage.getItem('bibbiaUtente')||'null');}catch(e){return null;}}
function role(){const u=user();const r=String(u?.ruolo||'Ospite').toLowerCase();if(r.includes('amministr'))return 'admin';if(r.includes('operat'))return 'operatore';return 'ospite';}
const NAV={operatore:['dashboard','lavorazioni','clienti','controlli','problemi','promemoria','manutenzioni','macchine','utensili','materiali','magazzino','documenti','knowledge','lezioni','procedure','quiz','progressi','calcolatori'],ospite:['dashboard','lavorazioni','clienti','controlli','problemi','promemoria','manutenzioni','macchine','utensili','materiali','magazzino','documenti','knowledge','lezioni','procedure','quiz','progressi','calcolatori']};
const WRITE={operatore:['lavorazioni','clienti','controlli','problemi','promemoria','progressi']};
const EXEC=['complete-lesson','run-procedure','finish-procedure','take-quiz','submit-quiz','bluetooth','notify','ask','calc-taglio','calc-maschio','calc-trapano','mill-smart','tap-v2','drill-v2','sheet','pdf','close'];
function canNav(k){const r=role();if(r==='admin')return true;return NAV[r]?.includes(k);}
function canWrite(k,act){const r=role();if(r==='admin')return true;if(r==='ospite')return false;if(EXEC.includes(act))return true;if(act==='duplicate')return k==='lavorazioni';return WRITE.operatore.includes(k);}
const oldNav=renderNav;
renderNav=function(){oldNav();document.querySelectorAll('#nav [data-k]').forEach(e=>{if(!canNav(e.dataset.k))e.remove();});};
const oldRender=render;
render=function(){oldRender();const r=role();if(r==='admin')return;document.querySelectorAll('#content [data-act]').forEach(b=>{const act=b.dataset.act,k=b.dataset.k;if(['add','edit','del','save','duplicate'].includes(act)&&!canWrite(k,act))b.hidden=true;if(r==='ospite'&&['complete-lesson','run-procedure','finish-procedure','take-quiz','submit-quiz','make-backup','download-backup','reset'].includes(act))b.hidden=true;});};
document.getElementById('content').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const act=b.dataset.act,k=b.dataset.k;if(!canWrite(k,act)){e.stopImmediatePropagation();e.preventDefault();const r=role();alert(r==='ospite'?'L’ospite può solo consultare. Per registrare o eseguire, seleziona un utente Operatore o Amministratore in Impostazioni.':'Questa azione non è consentita al ruolo Operatore. Serve un utente Amministratore.');}},true);
const oldDash=dashboard;
dashboard=function(){let out=oldDash();const r=role();if(r!=='admin')out=out.replace(/<div class='card'><h2>📊 Cruscotto aziendale[\s\S]*?<\/div>\s*<\/div>/,'');return out;};
render();
})();
