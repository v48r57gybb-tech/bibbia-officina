import fs from 'node:fs';
import vm from 'node:vm';
const path='dist/index.html';
let html=fs.readFileSync(path,'utf8');
function replaceOnce(before,after){
 if(html.split(before).length!==2)throw new Error('Patch salvataggio bloccata: sorgente inattesa.');
 html=html.replace(before,()=>after);
}
replaceOnce('const next=id?previous.map(r=>r.id===id?obj:r):[...previous,obj];','obj.updatedAt=Date.now();obj.modificatoIl=new Date().toISOString();const next=id?previous.map(r=>r.id===id?obj:r):[...previous,obj];');
replaceOnce('localStorage.setItem(LS,JSON.stringify(updated));','window.BibbiaPersistence.save(updated);');
replaceOnce('DB=updated;closeModal();render();','DB=updated;save();closeModal();render();');
const marker="if(typeof saveEntity==='function'){const oldSave=saveEntity;";
const start=html.indexOf(marker);
const end=html.indexOf("\nif(typeof save==='function')",start);
if(start<0||end<0||html.indexOf(marker,start+1)!==-1)throw new Error('Wrapper salvataggio inatteso.');
html=html.slice(0,start)+"if(typeof saveEntity==='function'){const oldSave=saveEntity;saveEntity=async function(k,id){return await oldSave(k,id);};}"+html.slice(end);
for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
fs.writeFileSync(path,html);
