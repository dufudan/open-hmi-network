(function(root) {
 'use strict';
 const MiB=1048576;
 const align=n=>Math.ceil(n/4)*4;
 function estimate(p,assets=[]) {
  const numeric=['width','height','rows','buffers','scanout','assetWidth','assetHeight','assetCount','resident','assetStored','runtime','systemStorage','appStorage','margin','videoWidth','videoHeight','videoFrames','videoOverhead','videoStored'];
  for (const k of numeric) if (!Number.isFinite(p[k]) || p[k]<0) throw Error('Enter a valid, non-negative value for '+k+'.');
  for (const k of ['width','height','rows','buffers','assetWidth','assetHeight','videoWidth','videoHeight']) if(p[k]<1||!Number.isInteger(p[k])) throw Error('Dimensions and buffer counts must be positive whole numbers.');
  for (const k of ['scanout','assetCount','resident','videoFrames']) if(!Number.isInteger(p[k])) throw Error('Counts must be whole numbers.');
  if(p.width>8192||p.height>8192||p.assetWidth>16384||p.assetHeight>16384||p.videoWidth>8192||p.videoHeight>8192) throw Error('Dimensions exceed the supported planning range.');
  if(p.buffers>2||p.scanout>3||p.assetCount>10000||p.resident>10000||p.videoFrames>32||p.margin>200) throw Error('A count or margin exceeds the supported planning range.');
  if(![2,3,4].includes(p.bpp)) throw Error('Choose a valid pixel format.');
  const full=align(p.width*p.bpp)*p.height;
  const rows=p.mode==='partial'?Math.min(p.rows,p.height):p.height;
  const oneDraw=align(p.width*p.bpp)*rows;
  const draw=oneDraw*p.buffers;
  const scanout=full*p.scanout;
  const rotation=p.rotation==='software'?Math.max(oneDraw,align(rows*p.bpp)*p.width):0;
  const decoded=assets.filter(a=>a.type==='image').map(a=>align(a.width*4)*a.height);
  const manualDecoded=align(p.assetWidth*4)*p.assetHeight;
  const totalImages=decoded.length+p.assetCount;
  // Resident budget uses the largest selected images, not every compressed file.
  const candidates=decoded.concat(Array(p.assetCount).fill(manualDecoded)).sort((a,b)=>b-a);
  const images=candidates.slice(0,Math.min(p.resident,totalImages)).reduce((a,b)=>a+b,0);
  const imageStorage=assets.filter(a=>a.type==='image').reduce((n,a)=>n+a.bytes,0)+p.assetStored*MiB;
  const videoFrame=p.videoFormat==='rgba'?align(p.videoWidth*4)*p.videoHeight:align(p.videoWidth)*p.videoHeight+2*align(Math.ceil(p.videoWidth/2))*Math.ceil(p.videoHeight/2);
  const video=p.video?videoFrame*p.videoFrames+p.videoOverhead*MiB:0;
  const runtime=p.runtime*MiB;
  const ram=draw+scanout+rotation+images+video+runtime;
  const storage=imageStorage+p.appStorage*MiB+p.systemStorage*MiB+(p.video?(p.videoStored*MiB+assets.filter(a=>a.type==='video').reduce((n,a)=>n+a.bytes,0)):0);
  const budget=ram*(1+p.margin/100), storageBudget=storage*(1+p.margin/100);
  const sizes=[.25,.5,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384];
  const capacity=bytes=>sizes.find(n=>n*MiB>=bytes) ?? null;
  return {draw,scanout,rotation,images,video,runtime,ram,storage,budget,storageBudget,ramCapacity:capacity(budget),storageCapacity:capacity(storageBudget),full,oneDraw,totalImages,resident:Math.min(p.resident,totalImages)};
 }
 const api={estimate,MiB}; if(typeof module!=='undefined'&&module.exports) module.exports=api; else root.MemoryEstimate=api;
})(typeof globalThis!=='undefined'?globalThis:this);
