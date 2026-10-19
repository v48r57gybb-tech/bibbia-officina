(()=>{
'use strict';
const ROLE_KEY='cloudRole';
function currentMap(){const m={};Object.keys(DB).forEach(k=>{if(!Array.isArray(DB[k]))return;m[k]={};DB[k].forEach(r=>{if(r&&r.id)m[k][r.id]=r;});});return m;}
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
 idleTimer=setTimeout(showIdleWarning,10*60*1000-30*1000);
}
function showIdleWarning(){
 if(document.getElementById('idle-warning'))return;
 const d=document.createElement('div');
 d.id='idle-warning';
 d.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:24px;z-index:9998;background:#f59e0b;color:#0f172a;padding:12px 18px;border-radius:12px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.35)';
 d.textContent='Sessione inattiva: tocca lo schermo per continuare';
 document.body.appendChild(d);
 warnTimer=setTimeout(logout,30*1000);
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
 const ov=document.createElement('div');
 ov.id='cloud-login';
 ov.style.cssText='position:fixed;inset:0;background:#0f172a;display:flex;align-items:center;justify-content:center;z-index:10000';
 ov.innerHTML=`<div style="background:#1e293b;padding:28px;border-radius:16px;width:360px;max-width:92vw">
 <h2 style="color:#38bdf8;margin-bottom:6px">⚙️ Bibbia Officina</h2>
 <p style="color:#94a3b8;font-size:13px;margin-bottom:16px">Accedi per usare l’app</p>
 <div style="display:flex;gap:8px;margin-bottom:16px">
 <button id="tab-admin">Amministratore</button>
 <button id="tab-op" class="secondary">Operatore</button>
 </div>
 <div id="form-admin">
 <label>Amministratore</label><select id="admin-name"></select>
 <label>PIN</label><input id="admin-pin" type="password" inputmode="numeric">
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
 const admins=(DB.utenti||[]).filter(u=>u.ruolo==='Amministratore');
 const adminSel=ov.querySelector('#admin-name');
 adminSel.innerHTML=admins.length?admins.map(u=>'<option value="'+u.id+'">'+u.nome+'</option>').join(''):'<option value="">Nessun amministratore</option>';
 const ops=(DB.utenti||[]).filter(u=>u.ruolo==='Operatore');
 const sel=ov.querySelector('#op-name');
 sel.innerHTML=ops.length?ops.map(u=>'<option value="'+u.id+'">'+u.nome+'</option>').join(''):'<option value="">Nessun operatore creato</option>';
 ov.querySelector('#admin-go').onclick=()=>{
 const u=(DB.utenti||[]).find(x=>x.id===adminSel.value);
 if(!u){msg.textContent='Seleziona un amministratore.';return;}
 const pin=ov.querySelector('#admin-pin').value.trim();
 if(!u.pin){
 if(!pin||pin.length<4){msg.textContent='Crea un PIN di almeno 4 cifre.';return;}
 u.pin=pin;save();enter('admin',u);return;
 }
 if(String(u.pin||'')!==pin){msg.textContent='PIN non corretto.';return;}
 enter('admin',u);
 };
 ov.querySelector('#op-go').onclick=()=>{
 const u=(DB.utenti||[]).find(x=>x.id===sel.value);
 if(!u){msg.textContent='Seleziona un operatore.';return;}
 const pin=ov.querySelector('#op-pin').value.trim();
 if(String(u.pin||'')!==pin){msg.textContent='PIN non corretto.';return;}
 enter('operator',u);
 };
 [ov.querySelector('#admin-pin'),ov.querySelector('#op-pin')].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter')el.parentElement.querySelector('button').click();}));
}
const role=sessionStorage.getItem(ROLE_KEY);
if(role==='admin'||role==='operator'){
 const users=DB.utenti||[];
 const u=users.find(x=>x.id===JSON.parse(sessionStorage.getItem('bibbiaSessione')||'{}').userId)||users[0];
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
})();