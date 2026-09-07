const $=id=>document.getElementById(id);
function promptFinal(idea){
 return `Vertical ${$('ratio').value} social media video. ${idea}
Cute high-quality 3D animated style, expressive animal characters, coherent appearance,
smooth natural motion, cinematic lighting, family friendly, no text on screen.
Make the action easy to understand and entertaining for TikTok, Kwai and YouTube Shorts.`;
}
async function api(path,options={}) {
 const r=await fetch(path,options);
 const text=await r.text();
 let data; try{data=JSON.parse(text)}catch{throw new Error(text||`HTTP ${r.status}`)}
 if(!r.ok) throw new Error(data.error||data.message||`HTTP ${r.status}`);
 return data;
}
$('generate').onclick=async()=>{
 const idea=$('idea').value.trim(), key=$('key').value.trim();
 if(!idea){$('idea').focus();return}
 if(!key){$('key').focus();return}
 $('generate').disabled=true;$('result').hidden=true;setStatus('Enviando para a IA...');
 try{
   const start=await api('/api/generate',{method:'POST',headers:{'Content-Type':'application/json','x-pixazo-key':key},
     body:JSON.stringify({prompt:promptFinal(idea),duration:Number($('duration').value),aspect_ratio:$('ratio').value})});
   let data=start;
   for(let i=0;i<100;i++){
     await new Promise(r=>setTimeout(r,3000));
     data=await api('/api/status/'+encodeURIComponent(data.request_id),{headers:{'x-pixazo-key':key}});
     setStatus(`Gerando vídeo... ${data.status||''}`);
     if(String(data.status).toUpperCase()==='COMPLETED')break;
     if(String(data.status).toUpperCase()==='ERROR')throw new Error(data.error||'A geração falhou.');
   }
   const url=data.output?.media_url?.[0]||data.output_url;
   if(!url)throw new Error('A API não devolveu o MP4.');
   $('video').src=url;$('download').href=url;$('result').hidden=false;setStatus('✅ Vídeo pronto!');
 }catch(e){setStatus('❌ '+e.message,true)}finally{$('generate').disabled=false}
};
function setStatus(t,error=false){$('status').textContent=t;$('status').className='status'+(error?' error':'')}
