(()=>{
'use strict';
const ROLE_KEY='cloudRole';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function enter(role,user){
 sessionStorage.setItem(ROLE_KEY,role);
 sessionStorage.setItem('bibbiaSessione',JSON.stringify({userId:user.id,at:Date.now()}));
 localStorage.setItem('bibbiaUtente',JSON.stringify(user));
 document.body.classList.remove('locked');
 const ov=document.getElementById('cloud-login');if(ov)ov.remove();
 addLogout();
 try{render();}catch(e){}
}
function ensureUser(role){
 const users=DB.utenti||[];
 const name=role==='admin'?'Cloud Amministratore':'Cloud Operatore';
 const ruolo=role==='admin'?'Amministratore':'Operatore';
 let u=users.find(x=>x.nome===name&&x.ruolo===ruolo);
 if(!u){u={id:uid(),nome:name,ruolo:ruolo,pin:'',email:'',note:'Account cloud'};users.push(u);DB.utenti=users;save();}
 return u;
}
function addLogout(){
 if(document.getElementById('cloud-logout'))return;
 const b=document.createElement('button');
 b.id='cloud-logout';b.textContent='Esci';
 b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:9999;background:#ef4444;color:#fff;border:none;padding:10px 16px;border-radius:10px;font-weight:700;cursor:pointer';
 b.onclick=()=>{sessionStorage.removeItem(ROLE_KEY);sessionStorage.removeItem('bibbiaSessione');localStorage.removeItem('bibbiaUtente');location.reload();};
 document.body.appendChild(b);
}
function showLogin(){
 if(document.getElementById('cloud-login'))return;
 const ov=document.createElement('div');
 ov.id='cloud-login';
 ov.style.cssText='position:fixed;inset:0;background:#0f172a;display:flex;align-items:center;justify-content:center;z-index:10000';
 ov.innerHTML=`<div style="background:#1e293b;padding:28px;border-radius:16px;width:360px;max-width:92vw">
 <h2 style="color:#38bdf8;margin-bottom:6px">⚙️ Bibbia Officina</h2>
 <p style="color:#94a3b8;font-size:13px;margin-bottom:16px">Accedi per usare l’app</p>
 <div style="display:flex;gap:8px;margin-bottom:16px">
 <button id="tab-admin" style="flex:1">Amministratore</button>
 <button id="tab-op" class="secondary" style="flex:1">Operatore</button>
 </div>
 <div id="form-admin">
 <label>Email</label><input id="admin-email" type="email" autocomplete="username">
 <label>Password</label><input id="admin-pass" type="password" autocomplete="current-password">
 <button id="admin-go" style="width:100%;margin-top:8px">Accedi</button>
 </div>
 <div id="form-op" style="display:none">
 <label>Nome operatore</label><input id="op-name" list="op-list">
 <datalist id="op-list"></datalist>
 <label>PIN</label><input id="op-pin" type="password" inputmode="numeric">
 <button id="op-go" style="width:100%;margin-top:8px">Accedi</button>
 </div>
 <p id="cloud-msg" style="color:#f87171;font-size:13px;margin-top:12px;min-height:18px"></p>
 </div>`;
 document.body.appendChild(ov);
 const msg=ov.querySelector('#cloud-msg');
 const tabs={admin:ov.querySelector('#form-admin'),op:ov.querySelector('#form-op')};
 function setTab(t){
 tabs.admin.style.display=t==='admin'?'block':'none';
 tabs.op.style.display=t==='op'?'block':'none';
 ov.querySelector('#tab-admin').className=t==='admin'?'':'secondary';
 ov.querySelector('#tab-op').className=t==='op'?'':'secondary';
 msg.textContent='';
 }
 ov.querySelector('#tab-admin').onclick=()=>setTab('admin');
 ov.querySelector('#tab-op').onclick=()=>setTab('op');
 const dl=ov.querySelector('#op-list');
 (DB.utenti||[]).filter(u=>u.ruolo==='Operatore').forEach(u=>{const o=document.createElement('option');o.value=u.nome;dl.appendChild(o);});
 ov.querySelector('#op-go').onclick=()=>{
 const nome=ov.querySelector('#op-name').value.trim();
 const pin=ov.querySelector('#op-pin').value.trim();
 const u=(DB.utenti||[]).find(x=>x.ruolo==='Operatore'&&x.nome===nome);
 if(!u){msg.textContent='Operatore non trovato.';return;}
 if(String(u.pin||'')!==pin){msg.textContent='PIN non corretto.';return;}
 enter('operator',u);
 };
 ov.querySelector('#admin-go').onclick=async()=>{
 const email=ov.querySelector('#admin-email').value.trim();
 const password=ov.querySelector('#admin-pass').value;
 if(!email||!password){msg.textContent='Inserisci email e password.';return;}
 msg.textContent='Verifica in corso...';
 try{
 const r=await fetch('/api/auth-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 const j=await r.json().catch(()=>({}));
 if(!r.ok||!j.ok){msg.textContent=j.error||'Accesso non riuscito.';return;}
 enter('admin',ensureUser('admin'));
 }catch(e){msg.textContent='Servizio di accesso non disponibile.';}
 };
 [ov.querySelector('#admin-pass'),ov.querySelector('#op-pin')].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter')el.parentElement.querySelector('button').click();}));
}
const role=sessionStorage.getItem(ROLE_KEY);
if(role==='admin'||role==='operator'){
 const u=ensureUser(role);
 sessionStorage.setItem('bibbiaSessione',JSON.stringify({userId:u.id,at:Date.now()}));
 localStorage.setItem('bibbiaUtente',JSON.stringify(u));
 document.body.classList.remove('locked');
 const overlay=document.getElementById('login');if(overlay)overlay.remove();
 const internalLogout=document.getElementById('logout');if(internalLogout)internalLogout.hidden=true;
 addLogout();
 try{render();}catch(e){}
}else{
 document.body.classList.add('locked');
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showLogin);else showLogin();
}
})();