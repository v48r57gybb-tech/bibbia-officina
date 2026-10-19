export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Metodo non consentito'});
 const {email,password}=req.body||{};
 if(!email||!password)return res.status(400).json({error:'Email e password obbligatorie'});
 const url=process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_ANON_KEY;
 if(!url||!key)return res.status(500).json({error:'Supabase non configurato su Vercel'});
 try{
 const r=await fetch(url+'/auth/v1/token?grant_type=password',{
 method:'POST',
 headers:{'Content-Type':'application/json','apikey':key,'Authorization':'Bearer '+key},
 body:JSON.stringify({email,password})
 });
 const j=await r.json().catch(()=>({}));
 if(!r.ok||!j.access_token)return res.status(401).json({error:'Email o password non validi'});
 return res.status(200).json({ok:true});
 }catch(e){
 return res.status(500).json({error:'Errore di connessione a Supabase'});
 }
}