export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Método não permitido.'});
  const key=process.env.MAGIC_HOUR_API_KEY;
  if(!key) return res.status(500).json({error:'MAGIC_HOUR_API_KEY não configurada no servidor.'});
  try{
    const r=await fetch(`https://api.magichour.ai/v1/video-projects/${encodeURIComponent(req.query.id)}`,{
      headers:{'Accept':'application/json','Authorization':`Bearer ${key}`}
    });
    const text=await r.text();
    res.status(r.status).send(text);
  }catch(e){res.status(500).json({error:e.message})}
}