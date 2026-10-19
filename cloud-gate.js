(()=>{
'use strict';
const role=sessionStorage.getItem('cloudRole');
if(role!=='admin'&&role!=='operator')return;
function ensureUser(){
 const users=DB.utenti||[];
 const name=role==='admin'?'Cloud Amministratore':'Cloud Operatore';
 const ruolo=role==='admin'?'Amministratore':'Operatore';
 let u=users.find(x=>x.nome===name&&x.ruolo===ruolo);
 if(!u){u={id:uid(),nome:name,ruolo:ruolo,pin:'',email:'',note:'Account cloud'};users.push(u);DB.utenti=users;save();}
 return u;
}
const u=ensureUser();
sessionStorage.setItem('bibbiaSessione',JSON.stringify({userId:u.id,at:Date.now()}));
localStorage.setItem('bibbiaUtente',JSON.stringify(u));
document.body.classList.remove('locked');
const overlay=document.getElementById('login');
if(overlay)overlay.remove();
const internalLogout=document.getElementById('logout');
if(internalLogout)internalLogout.hidden=true;
try{render();}catch(e){}
})();