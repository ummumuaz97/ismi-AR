const start=document.getElementById('start'), welcome=document.getElementById('welcome'), error=document.getElementById('error'), stage=document.getElementById('stage'), video=document.getElementById('videoAsset'), status=document.getElementById('status');
let scene,system,found=false,ready=false;
const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Fail AR tidak dapat dimuatkan. Semak internet dan cuba lagi.'));document.head.appendChild(s)});
const play=()=>video.play().catch(()=>{status.textContent='Gambar dikesan. Tekan Ulang video untuk main.'});
start.onclick=async()=>{
 start.disabled=true;start.textContent='Memuatkan AR…';error.textContent='';
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Kamera tidak tersedia. Buka link ini dalam Safari atau Chrome melalui HTTPS.');
  video.load(); // Prime inline playback in the user gesture; resume when a target is found.
  video.play().then(()=>{if(!found)video.pause()}).catch(()=>{});
  if(!window.AFRAME)await loadScript('https://aframe.io/releases/1.5.0/aframe.min.js');
  if(!window.AFRAME.systems['mindar-image-system'])await loadScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js');
  stage.innerHTML='<a-scene mindar-image="imageTargetSrc: assets/raqm.mind; autoStart: false; uiLoading: no; uiScanning: no; uiError: no" embedded renderer="colorManagement: true; physicallyCorrectLights: true" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"><a-camera position="0 0 0" look-controls="enabled: false"></a-camera><a-entity id="target" mindar-image-target="targetIndex: 0"><a-video src="#videoAsset" width="1" height="0.5421875" position="0 0 0"></a-video></a-entity></a-scene>';
  scene=stage.querySelector('a-scene');
  const fail=()=>{error.textContent='Kamera AR tidak dapat dimulakan. Benarkan kamera dalam tetapan browser, kemudian cuba lagi. Jika masih gagal, pilih Tonton video biasa.';welcome.style.display='grid';start.disabled=false;start.textContent='Cuba semula';stage.style.visibility='hidden';document.getElementById('hud').style.display='none';document.getElementById('controls').style.display='none';try{system?.stop()}catch{} };
  scene.addEventListener('arError',fail);
  scene.addEventListener('arReady',()=>{ready=true;status.textContent='Halakan kamera pada gambar penuh Mimi dan Areej.'});
  scene.querySelector('#target').addEventListener('targetFound',()=>{found=true;status.textContent='Gambar dikesan • Video dimainkan';play()});
  scene.querySelector('#target').addEventListener('targetLost',()=>{found=false;video.pause();status.textContent='Gambar terlepas. Halakan semula untuk sambung video.'});
  if(!scene.hasLoaded)await new Promise(r=>scene.addEventListener('loaded',r,{once:true}));
  welcome.style.display='none';stage.style.visibility='visible';document.getElementById('hud').style.display='flex';document.getElementById('controls').style.display='flex';
  system=scene.systems['mindar-image-system'];system.start();
 }catch(e){error.textContent=e.message;start.disabled=false;start.textContent='Cuba semula';}
};
document.getElementById('sound').onclick=()=>{video.muted=!video.muted;document.getElementById('sound').textContent=video.muted?'Hidupkan suara':'Senyapkan suara';if(found)play()};
document.getElementById('replay').onclick=()=>{video.currentTime=0;if(found)play();else status.textContent='Halakan kamera pada gambar untuk memainkan video.'};
document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();if(ready)system.pause(true)}else if(ready){system.unpause();if(found)play()}});
window.addEventListener('pagehide',()=>{video.pause();try{system?.stop()}catch{}});
