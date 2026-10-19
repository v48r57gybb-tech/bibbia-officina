(()=>{
'use strict';
const ROLE_KEY='cloudRole';
const SUPABASE_URL='https://nfrjhatqquefzjwykdqf.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mcmpoYXRxcXVlZnpqd3lrZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNzE3NDMsImV4cCI6MjEwNzk0Nzc0M30.7ypkTFbc87hctaoZZ3ZdacCr8p1a2SrFMMEbvnYkKRQ';
const IDLE_MINUTES=10,WARN_SECONDS=30;
function cleanupCloudAccounts(){
 let changed=false;
 (DB.utenti||[]).forEach(u=>{if(u.note==='Account cloud'||u.nome==='Cloud Amministratore'||u.nome==='Cloud Operatore'){u._delete=true;changed=true;}});
 if(changed){DB.utenti=(DB.utenti||[]).filter(u=>!u._delete);save();}
}
function enter(role,user){
 sessionStorage.setItem(ROLE_KEY,role);
 sessionStorage.setItem('bibbiaSessione',JSON.stringify({userId:user.id,at:Date.now()}));
 localStorage.setItem('bibbiaUtente',JSON.stringify(user));
 document.body.classList.remove('locked');
 const ov=document.getElementById('cloud-login');if(ov)ov.remove();
 addExitButtons(role);startIdleTimer();applyRoleLimits(role);
 try{render();}catch(e){}
}
function addExitButtons(role){
 document.querySelectorAll('.cloud-exit').forEach(b=>b.remove());
 const wrap=document.createElement('div');
 wrap.style.cssText='position:fixed;left:12px;bottom:12px;z-index:9999;display:flex;gap:8px';
 if(role==='operator'){
 const c=document.createElement('button');
 c.className='cloud-exit';c.textContent='Cambia operatore';
 c.style.cssText='background:#38bdf8;color:#0f172a;border:none;padding:8px 14px;border-radius:10px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.35)';
 c.onclick=()=>{sessionStorage.removeItem(ROLE_KEY);sessionStorage.removeItem('bibbiaSessione');localStorage.removeItem('bibbiaUtente');location.reload();};
 wrap.appendChild(c);
 }
 const b=document.createElement('button');
 b.className='cloud-exit';b.textContent='Esci';
 b.style.cssText='background:#ef4444;color:#fff;border:none;padding:8px 14px;border-radius:10px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.35)';
 b.onclick=logout;
 wrap.appendChild(b);
 document.body.appendChild(wrap);
 hideOtherLogoutButtons();
 const obs=new MutationObserver(hideOtherLogoutButtons);
 obs.observe(document.body,{childList:true,subtree:true});
}
function hideOtherLogoutButtons(){
 document.querySelectorAll('button').forEach(b=>{
 if(!b.classList.contains('cloud-exit')&&b.textContent.trim().toLowerCase()==='esci')b.style.display='none';
 });
}
function logout(){
 sessionStorage.removeItem(ROLE_KEY);sessionStorage.removeItem('bibbiaSessione');localStorage.removeItem('bibbiaUtente');location.reload();
}
let warnTimer=null,idleTimer=null;
function resetIdle(){
 if(!sessionStorage.getItem(ROLE_KEY))return;
 clearTimeout(warnTimer);clearTimeout(idleTimer);
 hideIdleWarning();
 idleTimer=setTimeout(showIdleWarning,IDLE_MINUTES*60*1000-WARN_SECONDS*1000);
}
function showIdleWarning(){
 if(document.getElementById('idle-warning'))return;
 const d=document.createElement('div');
 d.id='idle-warning';
 d.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:24px;z-index:9998;background:#f59e0b;color:#0f172a;padding:12px 18px;border-radius:12px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.35)';
 d.textContent='Sessione inattiva: tocca lo schermo per continuare';
 document.body.appendChild(d);
 warnTimer=setTimeout(logout,WARN_SECONDS*1000);
}
function hideIdleWarning(){const d=document.getElementById('idle-warning');if(d)d.remove();}
function startIdleTimer(){
 ['pointerdown','keydown','wheel','touchstart','input','change'].forEach(ev=>document.addEventListener(ev,resetIdle,{passive:true}));
 resetIdle();
}
function applyRoleLimits(role){
 if(role!=='operator')return;
 const nav=document.getElementById('nav');
 if(nav){nav.querySelectorAll('.nav-item').forEach(el=>{if(el.dataset.k==='settings')el.style.display='none';});}
 document.getElementById('content').addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');
 if(b&&(b.dataset.act==='del'||b.dataset.act==='reset'||b.dataset.act==='import')){e.stopImmediatePropagation();e.preventDefault();alert('Azione non consentita per gli operatori.');}
 },true);
}
function showLogin(){
 if(document.getElementById('cloud-login'))return;
 cleanupCloudAccounts();
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
 <label>Operatore</label><select id="op-name"></select>
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
 const sel=ov.querySelector('#op-name');
 const ops=(DB.utenti||[]).filter(u=>u.ruolo==='Operatore');
 sel.innerHTML=ops.length?ops.map(u=>'<option value="'+u.id+'">'+u.nome+'</option>').join(''):'<option value="">Nessun operatore creato</option>';
 ov.querySelector('#op-go').onclick=()=>{
 const u=(DB.utenti||[]).find(x=>x.id===sel.value);
 if(!u){msg.textContent='Seleziona un operatore.';return;}
 const pin=ov.querySelector('#op-pin').value.trim();
 if(String(u.pin||'')!==pin){msg.textContent='PIN non corretto.';return;}
 enter('operator',u);
 };
 ov.querySelector('#admin-go').onclick=async()=>{
 const email=ov.querySelector('#admin-email').value.trim();
 const password=ov.querySelector('#admin-pass').value;
 if(!email||!password){msg.textContent='Inserisci email e password.';return;}
 msg.textContent='Verifica in corso...';
 try{
 const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{
 method:'POST',
 headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY},
 body:JSON.stringify({email,password})
 });
 const j=await r.json().catch(()=>({}));
 if(!r.ok||!j.access_token){msg.textContent='Email o password non validi.';return;}
 const users=DB.utenti||[];
 let admin=users.find(x=>x.ruolo==='Amministratore'&&x.note!=='Account cloud');
 if(!admin){admin={id:uid(),nome:'Amministratore',ruolo:'Amministratore',pin:'',email:email,note:''};users.push(admin);DB.utenti=users;save();}
 enter('admin',admin);
 }catch(e){msg.textContent='Servizio di accesso non disponibile.';}
 };
 [ov.querySelector('#admin-pass'),ov.querySelector('#op-pin')].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter')el.parentElement.querySelector('button').click();}));
}
function setupAutosave(){
 const modal=document.getElementById('modal');
 if(!modal||modal.dataset.autosave)return;
 modal.dataset.autosave='1';
 modal.addEventListener('input',e=>{
 const f=e.target.closest('[data-f]');if(!f)return;
 const body=document.getElementById('modal-body');
 const draft={};body.querySelectorAll('[data-f]').forEach(el=>{draft[el.dataset.f]=el.value;});
 localStorage.setItem('bibbiaDraft',JSON.stringify({draft,at:Date.now()}));
 });
}
const role=sessionStorage.getItem(ROLE_KEY);
if(role==='admin'||role==='operator'){
 cleanupCloudAccounts();
 const users=DB.utenti||[];
 const u=users.find(x=>x.ruolo===(role==='admin'?'Amministratore':'Operatore')&&x.note!=='Account cloud')||users[0];
 if(u){
 sessionStorage.setItem('bibbiaSessione',JSON.stringify({userId:u.id,at:Date.now()}));
 localStorage.setItem('bibbiaUtente',JSON.stringify(u));
 document.body.classList.remove('locked');
 const overlay=document.getElementById('login');if(overlay)overlay.remove();
 const internalLogout=document.getElementById('logout');if(internalLogout)internalLogout.hidden=true;
 addExitButtons(role);startIdleTimer();applyRoleLimits(role);
 try{render();}catch(e){}
 }else{sessionStorage.removeItem(ROLE_KEY);document.body.classList.add('locked');showLogin();}
}else{
 document.body.classList.add('locked');
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showLogin);else showLogin();
}
if(typeof openForm==='function'){const oldOpen=openForm;openForm=function(k,id){oldOpen(k,id);setupAutosave();try{const d=JSON.parse(localStorage.getItem('bibbiaDraft')||'null');if(d&&d.draft){Object.entries(d.draft).forEach(([f,v])=>{const el=document.querySelector('#modal-body [data-f="'+f+'"]');if(el&&v)el.value=v;});}}catch(e){}};}
if(typeof saveEntity==='function'){const oldSave=saveEntity;saveEntity=function(k,id){const r=oldSave(k,id);try{const rec=(DB[k]||[]).find(x=>id?x.id===id:true);if(rec){rec.modificatoDa=sessionStorage.getItem(ROLE_KEY)==='admin'?'Amministratore':'Operatore';rec.modificatoIl=new Date().toISOString();save();}}catch(e){}localStorage.removeItem('bibbiaDraft');return r;};}
})();