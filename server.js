// Servidor opcional para desenvolvimento/local.
// Em produção, mantenha a API Key apenas no servidor e use autenticação por usuário.
import express from 'express';
const app=express(); app.use(express.json()); app.use(express.static('.'));
const BASE='https://gateway.pixazo.ai';
app.post('/api/generate',async(req,res)=>{
  try{
    const key=req.headers['x-pixazo-key'];
    if(!key)return res.status(401).json({error:'API Key ausente.'});
    const r=await fetch(`${BASE}/ltx/text-to-video`,{method:'POST',
      headers:{'Content-Type':'application/json','Ocp-Apim-Subscription-Key':key},
      body:JSON.stringify({prompt:req.body.prompt,duration:req.body.duration,aspect_ratio:req.body.aspect_ratio})});
    res.status(r.status).send(await r.text());
  }catch(e){res.status(500).json({error:e.message})}
});
app.get('/api/status/:id',async(req,res)=>{
  try{
    const key=req.headers['x-pixazo-key'];
    const r=await fetch(`${BASE}/v2/requests/status/${encodeURIComponent(req.params.id)}`,
      {headers:{'Ocp-Apim-Subscription-Key':key}});
    res.status(r.status).send(await r.text());
  }catch(e){res.status(500).json({error:e.message})}
});
app.listen(process.env.PORT||3000,()=>console.log('Animal IA em http://localhost:3000'));