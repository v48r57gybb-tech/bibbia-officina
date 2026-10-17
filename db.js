const DB_NAME='bibbia-officina';const DB_VERSION=1;let db;
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('cases')){const s=d.createObjectStore('cases',{keyPath:'id'});s.createIndex('updatedAt','updatedAt');}};r.onsuccess=()=>{db=r.result;resolve(db)};r.onerror=()=>reject(r.error);});}
function tx(store,mode){return db.transaction(store,mode).objectStore(store);}
function putCase(c){return new Promise((res,rej)=>{const r=tx('cases','readwrite').put(c);r.onsuccess=()=>res(c);r.onerror=()=>rej(r.error);});}
function getAllCases(){return new Promise((res,rej)=>{const r=tx('cases','readonly').getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
function deleteCase(id){return new Promise((res,rej)=>{const r=tx('cases','readwrite').delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);});}