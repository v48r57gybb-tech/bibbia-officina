(()=>{
'use strict';
function role(){const u=JSON.parse(localStorage.getItem('bibbiaUtente')||'null');const r=String(u?.ruolo||'Ospite').toLowerCase();return r.includes('amministr')?'admin':r.includes('operat')?'operatore':'ospite';}
const realSave=save;
save=function(){if(role()==='ospite')return;realSave();};
function loadDemo(){if(window.__bibbiaDemoActive)return;window.__bibbiaDemoActive=true;const demo=seed();demo.utenti=[{id:uid(),nome:'Demo',ruolo:'Ospite',pin:'',email:'',note:'Account dimostrativo'}];demo.lavorazioni=[];demo.clienti=[];demo.manutenzioni=[];demo.promemoria=[];demo.misure=[];demo.problemi=[];demo.acquisti=[];demo.programmi=[];demo.controlli=[];demo.progressi=[];DB=demo;}
const oldRender=render;
render=function(){if(role()==='ospite')loadDemo();oldRender();};
document.addEventListener('click',e=>{if(e.target.id==='logout'&&role()==='ospite'){setTimeout(()=>location.reload(),0);}},true);
if(role()==='ospite')loadDemo();
render();
})();
