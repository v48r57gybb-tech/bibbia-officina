(()=>{
'use strict';
const old=document.getElementById('login');if(old)old.remove();
const overlay=document.createElement('div');overlay.id='login';overlay.style.cssText='position:fixed;inset:0;background:#0f172a;color:#e2e8f0;display:none;align-items:center;justify-content:center;padding:20px;z-index:4000';document.body.append(overlay);
let selectedId=null;
function admins(){return (DB.utenti||[]).filter(u=>String(u.ruolo||'').toLowerCase().includes('amministr'));}
function session(){try{return JSON.parse(sessionStorage.getItem('bibbiaSessione')||'null');}catch(e){return null;}}
function validUser(){const s=session();if(!s)return null;return (DB.utenti||[]).find(u=>u.id===s.userId)||null;}
function show(){overlay.style.display='flex';document.body.classList.add('locked');const lo=document.getElementById('logout');if(lo)lo.hidden=true;}
function hide(){overlay.style.display='none';document.body.classList.remove('locked');const lo=document.getElementById('logout');if(lo)lo.hidden=false;}
function err(m){const e=overlay.querySelector('.error');if(e)e.textContent=m;}
function enter(u){if(!u)return;sessionStorage.setItem('bibbiaSessione',JSON.stringify({userId:u.id,at:Date.now()}));localStorage.setItem('bibbiaUtente',JSON.stringify(u));hide();render();}
function setupAdmin(){overlay.innerHTML='<div class="box" style="width:min(440px,100%);background:#1e293b;border:2px solid #38bdf8;border-radius:16px;padding:22px"><h2>⚙️ Primo avvio</h2><p>Crea il tuo account Amministratore.</p><label>Il tuo nome<input id="fx-name"></label><label>PIN (4-8 cifre)<input id="fx-pin" type="password" inputmode="numeric" maxlength="8"></label><label>Conferma PIN<input id="fx-pin2" type="password" inputmode="numeric" maxlength="8"></label><p class="error" style="color:#fca5a5"></p><button id="fx-create">Crea Amministratore e entra</button></div>';overlay.querySelector('#fx-create').onclick=()=>{const name=overlay.querySelector('#fx-name').value.trim(),pin=overlay.querySelector('#fx-pin').value.trim(),pin2=overlay.querySelector('#fx-pin2').value.trim();if(!name)return err('Inserisci il tuo nome.');if(!/^\d{4,8}$/.test(pin))return err('Il PIN deve avere 4-8 cifre.');if(pin!==pin2)return err('I PIN non coincidono.');const u={id:uid(),nome:name,ruolo:'Amministratore',pin,email:'',note:'Amministratore principale'};DB.utenti.push(u);save();enter(u);};}
function loginScreen(){
 const users=DB.utenti||[];selectedId=null;
 overlay.innerHTML='<div class="box" style="width:min(440px,100%);background:#1e293b;border:2px solid #38bdf8;border-radius:16px;padding:22px"><h2>🔐 Accedi</h2><label for="fx-user-select">Utente</label><select id="fx-user-select" style="width:100%;min-height:44px;font-size:16px"><option value="">Seleziona utente</option></select><label>PIN<input id="fx-pin" type="password" inputmode="numeric" maxlength="8"></label><p class="error" style="color:#fca5a5" role="alert"></p><button id="fx-enter">Entra</button></div>';
 const select=overlay.querySelector('#fx-user-select');
 users.forEach((u,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=u.nome||'Utente';select.append(option);});
 select.onchange=()=>{selectedId=select.value===''?null:users[Number(select.value)]?.id;overlay.querySelector('#fx-pin').value='';err('');};
 const doEnter=()=>{const u=users.find(x=>x.id===selectedId);if(!u)return err('Prima seleziona il tuo utente.');const pin=overlay.querySelector('#fx-pin').value.trim();if(u.pin&&pin!==u.pin)return err('PIN non corretto.');enter(u);};
 overlay.querySelector('#fx-enter').onclick=doEnter;overlay.querySelector('#fx-pin').onkeydown=e=>{if(e.key==='Enter')doEnter();};
}
function start(){const u=validUser();if(u){localStorage.setItem('bibbiaUtente',JSON.stringify(u));hide();render();return;}show();if(!admins().length)setupAdmin();else loginScreen();}
const lo=document.getElementById('logout');if(lo)lo.onclick=()=>{sessionStorage.removeItem('bibbiaSessione');localStorage.removeItem('bibbiaUtente');start();};
start();
})();
