import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const runtime = `
window.BibbiaPersistence = (() => {
  const key = 'bibbiaOfficinaDB';
  const previousKey = key + '.previous';
  function validate(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Archivio locale non valido: nessun reset eseguito.');
    }
    return data;
  }
  function report(state, message) {
    window.dispatchEvent(new CustomEvent('bibbia:storage', {detail:{state,message}}));
    const draw = () => {
      let box = document.getElementById('bibbia-storage-status');
      if (!box) {
        box = document.createElement('div');
        box.id = 'bibbia-storage-status';
        box.setAttribute('role','status');
        box.setAttribute('aria-live','polite');
        box.style.cssText = 'position:fixed;top:6px;left:50%;transform:translateX(-50%);max-width:70vw;padding:6px 10px;border-radius:8px;background:#0f172a;color:#7dd3fc;font-size:12px;z-index:10002';
        document.body.appendChild(box);
      }
      box.textContent = message;
      box.style.color = state === 'error' ? '#f87171' : '#7dd3fc';
    };
    if (document.body) draw();
    else document.addEventListener('DOMContentLoaded',draw,{once:true});
  }
  function load() {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : validate(JSON.parse(raw));
    } catch (error) {
      report('error','Archivio non leggibile. Non cancellare i dati del browser.');
      throw error;
    }
  }
  function save(data) {
    try {
      validate(data);
      const next = JSON.stringify(data);
      const old = localStorage.getItem(key);
      if (old !== next) {
        if (old !== null) {
          validate(JSON.parse(old));
          localStorage.setItem(previousKey,old);
        }
        localStorage.setItem(key,next);
      }
      report('local','Salvato sul tablet; sincronizzazione cloud non verificata.');
      return true;
    } catch (error) {
      report('error','Salvataggio locale fallito. Non chiudere o ricaricare la pagina.');
      throw error;
    }
  }
  function readPrevious() {
    const raw = localStorage.getItem(previousKey);
    return raw === null ? null : validate(JSON.parse(raw));
  }
  return Object.freeze({load,save,readPrevious});
})();
`;
new vm.Script(runtime);

const values = new Map();
let failWrites = false;
const context = vm.createContext({
  window: {dispatchEvent() {}},
  CustomEvent: function(type,options) {this.type=type;this.detail=options.detail;},
  document: {body:null,addEventListener() {}},
  localStorage: {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key,value) => {
      if (failWrites) throw new Error('Quota test');
      values.set(key,String(value));
    }
  }
});
vm.runInContext(runtime,context);
const storage = context.window.BibbiaPersistence;
assert.equal(storage.load(),null);
storage.save({utenti:[{id:'test-1',nome:'Test'}]});
assert.equal(storage.load().utenti[0].id,'test-1');
storage.save({utenti:[{id:'test-1',nome:'Test aggiornato'}]});
assert.equal(storage.readPrevious().utenti[0].nome,'Test');
assert.equal(storage.load().utenti.length,1);
const saved = values.get('bibbiaOfficinaDB');
failWrites = true;
assert.throws(() => storage.save({utenti:[]}));
assert.equal(values.get('bibbiaOfficinaDB'),saved);
failWrites = false;
values.set('bibbiaOfficinaDB','JSON DANNEGGIATO');
assert.throws(() => storage.load());
assert.equal(values.get('bibbiaOfficinaDB'),'JSON DANNEGGIATO');
assert.throws(() => storage.save([]));

const path = 'dist/index.html';
let html = fs.readFileSync(path,'utf8');
const oldLoad = "let DB=JSON.parse(localStorage.getItem(LS)||'null')||seed();";
const oldSave = "function save(){localStorage.setItem(LS,JSON.stringify(DB));}";
for (const text of [oldLoad,oldSave]) {
  if (html.split(text).length !== 2) {
    throw new Error('Integrazione persistenza bloccata: sorgente build inattesa.');
  }
}
if (html.includes('window.BibbiaPersistence')) throw new Error('Persistenza gia incorporata.');
html = html.replace(oldLoad,"const storedDB=window.BibbiaPersistence.load(); let DB=storedDB===null?seed():storedDB;");
html = html.replace(oldSave,"function save(){return window.BibbiaPersistence.save(DB);}");
if (!html.includes('<script>')) throw new Error('Script iniziale non trovato.');
html = html.replace('<script>',() => '<script>'+runtime+'</script><script>');
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
fs.writeFileSync(path,html);
