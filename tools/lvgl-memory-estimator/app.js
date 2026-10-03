(() => {
 'use strict';
 const $=id=>document.getElementById(id), form=$('calculator');
 const assets=[]; let latest=null, serial=0, loading=false;
 const fmt=b=>b<1048576?(b/1024).toFixed(1)+' KiB':(b/1048576).toFixed(2)+' MiB';
 const fields=['width','height','rows','buffers','scanout','assetWidth','assetHeight','assetCount','resident','assetStored','runtime','systemStorage','appStorage','margin','videoWidth','videoHeight','videoFrames','videoOverhead','videoStored','bpp'];
 function params(){ const p={}; fields.forEach(k=>p[k]=$(k).value.trim()===''?NaN:Number($(k).value)); ['mode','rotation','videoFormat','system'].forEach(k=>p[k]=$(k).value); p.video=$('video').value==='yes'; return p; }
 function update() {
  $('rows').disabled=$('mode').value!=='partial'; $('video-fields').hidden=$('video').value!=='yes';
  try {
   const p=params(), r=MemoryEstimate.estimate(p,assets); latest={p,r};
   $('error').hidden=true; $('results').hidden=false; $('download').disabled=loading;
   $('ram-total').textContent=fmt(r.budget); $('storage-total').textContent=fmt(r.storageBudget);
   $('breakdown').replaceChildren();
   for(const [label,key] of [['LVGL draw buffers','draw'],['Separate display framebuffers','scanout'],['Rotation scratch','rotation'],['Resident decoded images','images'],['Video surfaces + decoder','video'],['OS + LVGL + application','runtime'],['Subtotal before headroom','ram']]) {
    const tr=document.createElement('tr'), th=document.createElement('th'),td=document.createElement('td'); th.scope='row';th.textContent=label;td.textContent=fmt(r[key]);tr.append(th,td);$('breakdown').append(tr);
   }
   const cap=n=>n===null?'above 16 GiB':n>=1024?(n/1024)+' GiB':n+' MiB';
   $('capacity').textContent='Capacity to consider: '+cap(r.ramCapacity)+' RAM / '+cap(r.storageCapacity)+' storage. Rounded up from this budget; not a qualified part recommendation.';
   $('assumptions').textContent=`${p.width} × ${p.height}, ${p.bpp*8}-bit, ${p.mode} rendering, ${p.buffers} draw buffer(s). ${r.resident} of ${r.totalImages} images resident. ${p.margin}% headroom. Storage before headroom: ${fmt(r.storage)}.`;
   const notes=[];
   if(r.totalImages>0&&p.resident>r.totalImages) notes.push('Resident image count is capped at the available images.');
   if(p.assetCount>0&&p.assetStored===0) notes.push('Manual images have no stored size entered yet. Add their combined file size to complete the storage budget.');
   if(p.assetStored>0&&r.totalImages===0) notes.push('File size alone does not determine decoded RAM. Add image dimensions and a count, or import images.');
   if(p.rotation==='software'&&p.mode!=='partial') notes.push('Software rotation uses a full-frame scratch budget in this mode; confirm the driver supports this path.');
   if(p.mode==='partial'&&p.rows<p.height/10) notes.push('Partial buffers are smaller than the LVGL documentation’s 1/10-screen guidance; verify throughput.');
   if(p.video) notes.push('Video playback performance, codec support and decoder memory must be verified on the target.');
   if(!p.video&&assets.some(a=>a.type==='video')) notes.push('Imported videos are excluded until video playback is enabled.');
   $('warnings').textContent=notes.join(' ');
  } catch(e) { latest=null; $('error').textContent=e.message; $('error').hidden=false; $('results').hidden=true; $('download').disabled=true; }
 }
 form.addEventListener('submit',e=>e.preventDefault()); form.addEventListener('input',update);
 $('preset').addEventListener('change',()=>{if($('preset').value!=='custom'){const [w,h]=$('preset').value.split('x');$('width').value=w;$('height').value=h;$('rows').value=Math.ceil(h/10);}update();});
 ['width','height'].forEach(k=>$(k).addEventListener('input',()=>{$('preset').value='custom';}));
 const presets={bare:[.25,0,.5],rtos:[.5,2,1],linux:[64,128,8],android:[256,1024,32]};
 $('system').addEventListener('change',()=>{const a=presets[$('system').value];if(a) ['runtime','systemStorage','appStorage'].forEach((k,i)=>$(k).value=a[i]);update();});
 ['runtime','systemStorage','appStorage'].forEach(k=>$(k).addEventListener('input',()=>{$('system').value='custom';}));
 function list(){ $('asset-list').replaceChildren(); for(const a of assets){const li=document.createElement('li'),s=document.createElement('span'),b=document.createElement('button');s.textContent=`${a.name} · ${a.width} × ${a.height} · ${fmt(a.bytes)} stored${a.type==='video'?' · video':''}`;b.type='button';b.textContent='Remove';b.setAttribute('aria-label','Remove '+a.name);b.onclick=()=>{assets.splice(assets.findIndex(x=>x.id===a.id),1);list();update();};li.append(s,b);$('asset-list').append(li);} }
 function metadata(file){return new Promise((resolve,reject)=>{const video=file.type.startsWith('video/'),el=document.createElement(video?'video':'img'),url=URL.createObjectURL(file);const done=(error)=>{clearTimeout(timer);URL.revokeObjectURL(url);el.removeAttribute('src');if(error)reject(error);};const timer=setTimeout(()=>done(Error('Metadata could not be read.')),10000);el[video?'onloadedmetadata':'onload']=()=>{const width=video?el.videoWidth:el.naturalWidth,height=video?el.videoHeight:el.naturalHeight;resolve({width,height,type:video?'video':'image'});done();};el.onerror=()=>done(Error('Unsupported or damaged file.'));if(video)el.preload='metadata';el.src=url;});}
 $('files').addEventListener('change',async()=>{
  const files=Array.from($('files').files);$('files').disabled=true;loading=true;update();let added=0;const failures=[];
  for(const file of files){
   if(assets.length>=100){failures.push('Maximum 100 files.');break;}
   if(file.size>50*1048576){failures.push(file.name+': over 50 MiB; enter size manually.');continue;}
   if(!['image/png','image/jpeg','image/webp','image/bmp','video/mp4','video/webm'].includes(file.type)){failures.push(file.name+': unsupported type; use manual inputs.');continue;}
   try {const m=await metadata(file);if(!m.width||!m.height||m.width>16384||m.height>16384)throw Error('Image dimensions exceed the supported range.');assets.push({...m,id:++serial,name:file.name,bytes:file.size});added++;if(m.type==='video'){ $('video').value='yes';$('videoWidth').value=m.width;$('videoHeight').value=m.height; }}catch(e){failures.push(file.name+': '+e.message);}
  }
  $('file-status').textContent=`${added} file(s) added. ${failures.join(' ')}`; loading=false;$('files').disabled=false;$('files').value='';list();update();
 });
 $('download').addEventListener('click',()=>{if(!latest)return;const {p,r}=latest;const summary={tool:'OpenHMI LVGL Memory Estimator',version:1,created:new Date().toISOString(),inputs:p,assets:assets.map(({id,...a})=>a),bytes:r,assumptions:['4-byte row alignment','32-bit decoded images; largest resident assets','Editable system and decoder planning allowances','Additional scanout buffers counted separately','Actual platform memory and performance require validation']};const blob=new Blob([JSON.stringify(summary,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='openhmi-lvgl-memory-estimate.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 update();
})();
