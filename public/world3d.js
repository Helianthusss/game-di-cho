import * as THREE from './three.module.min.js';
import {buildWholesaleDistrict} from './wholesale.js';
import {createNavigator} from './navigation.js';
import {buildMarketLife} from './market-life.js';
import {createMarketAudio} from './market-audio.js';
const $=id=>document.getElementById(id),host=$('scene');
const locations=[{x:320,y:330,w:240,h:155},{x:680,y:330,w:240,h:155},{x:1040,y:330,w:240,h:155},{x:350,y:750,w:240,h:155},{x:1040,y:750,w:240,h:155},{x:710,y:925,w:180,h:130},{x:1280,y:930,w:180,h:120},{x:3150,y:3180,w:300,h:100}];
const world=window.world;const home=$('home');home.hidden=true;document.body.append(home);
host.innerHTML='<div id="loading3d"><strong>CHỢ BÌNH AN</strong><span>Đang mở cửa chợ…</span></div><canvas id="world" tabindex="0" aria-label="Chợ Việt Nam 3D. WASD để đi, kéo chuột để xoay, cuộn để phóng, E tương tác."></canvas><div class="world-hint" id="worldHint">Đi đến sạp để nói chuyện</div><div id="placeLabel">CHỢ BÌNH AN <small>07:15 · Một buổi sáng quen</small></div><div id="compass"><b>✦</b> <span id="destinationHint">Khám phá khu chợ</span></div>';
host.insertAdjacentHTML('afterend','<div class="game-controls"><div class="dpad"><button data-key="arrowup" aria-label="Đi lên">▲</button><button data-key="arrowleft" aria-label="Đi trái">◀</button><button data-key="arrowdown" aria-label="Đi xuống">▼</button><button data-key="arrowright" aria-label="Đi phải">▶</button></div><div class="control-help"><kbd>Bấm để đi <span>·</span> <kbd>W A S D</kbd> <span>·</span> Kéo để xoay <span>·</span> Cuộn để phóng</div><button data-key="shift" class="run-button">Chạy</button><button id="interact" disabled><kbd>E</kbd> Đến gần sạp</button><button id="cameraReset" aria-label="Đặt lại góc nhìn">↻ Góc nhìn</button></div>');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});}catch{ $('loading3d').innerHTML='<strong>Chưa mở được cảnh 3D</strong><span>Trình duyệt cần WebGL. Thử bật tăng tốc đồ họa hoặc dùng trình duyệt khác.</span>';throw Error('WebGL unavailable');}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
const scene=new THREE.Scene();scene.background=new THREE.Color('#d9e7df');scene.fog=new THREE.Fog('#d9e7df',75,185);
const camera=new THREE.PerspectiveCamera(48,1,.1,240);let yaw=.15,pitch=.62,zoom=20;
scene.add(new THREE.HemisphereLight('#ffefd1','#7f9b83',2.4));const sun=new THREE.DirectionalLight('#fff0ce',3.4);sun.position.set(-15,26,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-25,right:25,top:22,bottom:-22,near:.1,far:65});sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;scene.add(sun);scene.add(sun.target);
const mats=new Map(),geos=new Map();function mat(color,roughness=.8){if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness}));return mats.get(color);}
function geometry(type,args){const key=type+args.join(',');if(!geos.has(key))geos.set(key,new THREE[type](...args));return geos.get(key);}
function mesh(g,type,args,color,x=0,y=0,z=0){const m=new THREE.Mesh(geometry(type,args),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
const box=(g,w,h,d,c,x=0,y=0,z=0)=>mesh(g,'BoxGeometry',[w,h,d],c,x,y,z);
const sphere=(g,r,c,x=0,y=0,z=0)=>mesh(g,'SphereGeometry',[r,10,7],c,x,y,z);
const cyl=(g,r,h,c,x=0,y=0,z=0)=>mesh(g,'CylinderGeometry',[r,r,h,12],c,x,y,z);
function label(g,text,x,y,z,w=5,bg='#fff1cf',fg='#3c6155',small='',doubleSided=false,rotY=0){
  const signGroup=new THREE.Group();
  signGroup.position.set(x,y,z);
  signGroup.rotation.y=rotY;
  const c=document.createElement('canvas');c.width=768;c.height=192;
  const cx=c.getContext('2d');
  cx.fillStyle=bg;cx.fillRect(0,0,768,192);
  cx.strokeStyle='#c6a779';cx.lineWidth=10;cx.strokeRect(6,6,756,180);
  cx.strokeStyle='#b89461';cx.lineWidth=3;cx.strokeRect(14,14,740,164);
  cx.textAlign='center';cx.fillStyle=fg;cx.font='bold 47px sans-serif';
  cx.fillText(text,384,small?86:112);
  if(small){cx.font='bold 25px sans-serif';cx.fillStyle=fg==='#fff0c9'?'#fff0c9':'#527060';cx.fillText(small,384,147);}
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  box(signGroup,w+.08,w/4+.06,.07,'#4d3725',0,0,0);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:tex}));
  m.position.set(0,0,.04);
  signGroup.add(m);
  if(doubleSided){
    const back=new THREE.Mesh(m.geometry,m.material);
    back.position.set(0,0,-.04);
    back.rotation.y=Math.PI;
    signGroup.add(back);
  }
  g.add(signGroup);
  return signGroup;
}
function nhonHoaScale(g,x,y,z){
  const sc=new THREE.Group();sc.position.set(x,y,z);
  box(sc,.32,.25,.28,'#2d6945',0,.125,0);
  const dial=cyl(sc,.12,.03,'#fdfbf7',0,.15,.14);dial.rotation.x=Math.PI/2;
  box(sc,.015,.08,.01,'#c93526',0,.15,.16);
  cyl(sc,.035,.1,'#95a39b',0,.29,0);
  cyl(sc,.24,.03,'#cbd4ce',0,.35,0);
  g.add(sc);return sc;
}
function stripedAwning(g,w,d,color1='#2d6a8a',color2='#f4ebd0'){
  const awn=new THREE.Group();
  const n=Math.max(4,Math.floor(w/.35));const sw=w/n;
  for(let i=0;i<n;i++){
    box(awn,sw-.01,.03,d,i%2===0?color1:color2,-w/2+sw/2+i*sw,0,0);
    box(awn,sw-.01,.22,.03,i%2===0?color1:color2,-w/2+sw/2+i*sw,-.11,d/2);
  }
  g.add(awn);return awn;
}
function baGac(scene,x,z,angle=0,color='#3c7099'){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;
  const fw=cyl(g,.32,.1,'#2c3236',0,.32,1.55);fw.rotation.z=Math.PI/2;
  cyl(g,.04,.85,'#727d82',0,.8,1.55);box(g,.7,.05,.05,'#3f464a',0,1.15,1.5);
  sphere(g,.1,'#fff1ab',0,.9,1.7);
  box(g,.45,.45,.6,'#43484c',0,.45,.95);
  box(g,.38,.1,.45,'#1f2124',0,.75,.9);
  box(g,1.65,.12,2.2,'#857255',0,.5,-.35);
  box(g,1.7,.55,.06,color,0,.8,-1.45);
  box(g,.06,.55,2.2,color,-.82,.8,-.35);
  box(g,.06,.55,2.2,color,.82,.8,-.35);
  for(const wx of [-.88,.88]){const rw=cyl(g,.34,.14,'#2c3236',wx,.34,-.4);rw.rotation.z=Math.PI/2;}
  for(let k=0;k<4;k++){
    box(g,.62,.35,.72,['#c99a57','#5f8a65','#d97d52','#8ba876'][k],(k%2===0?-.36:.36),.75,-.85+Math.floor(k/2)*.8);
  }
  scene.add(g);return g;
}
function deliveryCub(scene,x,z,angle=0,color='#4a7567'){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;
  for(const wz of [-.65,.65]){const w=cyl(g,.28,.07,'#2c3136',0,.28,wz);w.rotation.z=Math.PI/2;}
  box(g,.2,.38,.8,color,0,.5,0);box(g,.22,.1,.45,'#1e2022',0,.68,-.15);
  box(g,.38,.45,.06,'#f2f1e8',0,.55,.32);
  box(g,.6,.04,.04,'#78848a',0,.98,.42);sphere(g,.08,'#fff6bd',0,.86,.5);
  box(g,.45,.45,.55,'#a8895b',-.36,.62,-.55);
  box(g,.45,.45,.55,'#a8895b',.36,.62,-.55);
  box(g,.58,.32,.52,'#5a8c56',0,.88,-.55);
  cyl(g,.02,.65,'#264a2a',0,.95,-.55);
  scene.add(g);return g;
}
const steamPuffs=[];
function initSteam(g,x,y,z){
  for(let i=0;i<7;i++){
    const sp=mesh(g,'SphereGeometry',[.12+i*.02,7,6],'#fdfbf7',x,y+i*.18,z);
    sp.material.transparent=true;sp.material.opacity=.35-.04*i;
    steamPuffs.push({mesh:sp,baseX:x,baseY:y,baseZ:z,offset:i*.32});
  }
}
function updateSteam(t){
  for(const s of steamPuffs){
    const progress=(t*1.2+s.offset)%2.2;
    s.mesh.position.y=s.baseY+progress*.75;
    s.mesh.position.x=s.baseX+Math.sin(t*3+s.offset)*.07;
    s.mesh.position.z=s.baseZ+Math.cos(t*2.5+s.offset)*.07;
    const sc=.1+(progress/2.2)*.22;
    s.mesh.scale.set(sc,sc*1.2,sc);
    s.mesh.material.opacity=Math.max(0,(1-progress/2.2)*.4);
  }
}
function seatedPerson(color,hat=false){
  const group=new THREE.Group();
  mesh(group,'CapsuleGeometry',[.26,.44,3,7],color,0,.82,0);
  sphere(group,.31,'#dca982',0,1.48,0);
  const hair=sphere(group,.32,'#473d31',0,1.56,-.03);hair.scale.y=.55;
  for(const x of [-.1,.1])sphere(group,.032,'#3b3c33',x,1.5,.28);
  for(const x of [-.14,.14]){
    cyl(group,.095,.42,'#3c5961',x,.52,.22).rotation.x=Math.PI/2;
    cyl(group,.095,.42,'#3c5961',x,.25,.42);
    box(group,.18,.1,.28,'#4b463a',x,.05,.48);
  }
  for(const x of [-.32,.32]){
    const arm=new THREE.Group();arm.position.set(x,1.05,0);
    arm.rotation.x=-Math.PI/4;
    cyl(arm,.08,.4,color,0,-.15,0);
    sphere(arm,.08,'#dca982',0,-.35,0);
    group.add(arm);
  }
  if(hat){mesh(group,'ConeGeometry',[.48,.25,16],'#dcc18a',0,1.82,0);cyl(group,.49,.03,'#c4a66e',0,1.72,0);}
  return group;
}
function floatingLabel(g,text,y,color='#365f52'){const c=document.createElement('canvas');c.width=384;c.height=80;const cx=c.getContext('2d');cx.fillStyle='#fff5df';cx.beginPath();cx.roundRect(0,0,384,80,24);cx.fill();cx.font='bold 30px sans-serif';cx.fillStyle=color;cx.textAlign='center';cx.fillText(text.slice(0,20),192,51);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false}));sp.scale.set(2.7,.56,1);sp.position.y=y;g.add(sp);return sp;}
function person(color,hat=true){const group=new THREE.Group();const torso=mesh(group,'CapsuleGeometry',[.28,.48,3,7],color,0,1.03,0);sphere(group,.33,'#dca982',0,1.72,0);const hair=sphere(group,.34,'#473d31',0,1.81,-.035);hair.scale.y=.55;
for(const x of [-.11,.11])sphere(group,.034,'#3b3c33',x,1.74,.302);box(group,.09,.025,.02,'#a16b50',0,1.6,.313);
const legs=[],arms=[];for(const x of [-.15,.15]){const l=new THREE.Group();l.position.set(x,.8,0);cyl(l,.105,.57,'#3c5961',0,-.26,0);box(l,.22,.12,.34,'#4b463a',0,-.59,.07);group.add(l);legs.push(l);const arm=new THREE.Group();arm.position.set(Math.sign(x)*.36,1.28,0);cyl(arm,.085,.45,color,0,-.16,0);sphere(arm,.09,'#dca982',0,-.4,0);group.add(arm);arms.push(arm);}
if(hat){const h=mesh(group,'ConeGeometry',[.51,.27,16],'#dcc18a',0,2.1,0);cyl(group,.52,.035,'#c4a66e',0,1.98,0);}group.userData={legs,arms};return group;}
function animatePerson(p,time,moving){const n=moving?Math.sin(time*9):0;p.userData.legs.forEach((l,i)=>l.rotation.x=n*.5*(i?1:-1));p.userData.arms.forEach((a,i)=>a.rotation.x=n*.38*(i?-1:1));}
function basket(g,x,y,z,type=0){cyl(g,.47,.22,'#b98c52',x,y,z);const rim=mesh(g,'TorusGeometry',[.44,.04,5,16],'#e0bb7b',x,y+.14,z);rim.rotation.x=Math.PI/2;
for(let i=0;i<7;i++){const a=i*2.4,r=i? .27:0;const xx=x+Math.sin(a)*r,zz=z+Math.cos(a)*r;if(type===0){const leaf=sphere(g,.16,['#629b57','#84ad63','#4d8053'][i%3],xx,y+.28,zz);leaf.scale.set(.7,1.4,.7);}else if(type===1){sphere(g,.14,'#d65c40',xx,y+.22,zz);box(g,.06,.08,.06,'#589059',xx,y+.35,zz);}else{const root=sphere(g,.15,'#ccaa56',xx,y+.24,zz);root.scale.x=1.2;}}}
function fish(g,x,y,z){cyl(g,.51,.19,'#4b8994',x,y,z);cyl(g,.46,.03,'#9bc7c4',x,y+.115,z);for(let i=0;i<3;i++){const f=sphere(g,.13,'#d1d5c5',x-.2+i*.2,y+.16,z);f.scale.set(.55,.4,1.8);const tail=mesh(g,'ConeGeometry',[.1,.18,3],'#789a9b',x-.2+i*.2,y+.16,z+.24);tail.rotation.x=Math.PI/2;}}
function stool(g,x,z,color='#bd6551'){cyl(g,.31,.11,color,x,.55,z);for(const dx of [-.18,.18])for(const dz of [-.18,.18])box(g,.07,.5,.07,color,x+dx,.26,z+dz);}
function umbrella(g,x,z,color){cyl(g,.045,3.3,'#96744e',x,1.65,z);mesh(g,'ConeGeometry',[1.75,.7,8],color,x,3.7,z);}
function scooter(x,z,color){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);for(const zz of [-.6,.6]){const tire=mesh(g,'TorusGeometry',[.28,.08,5,12],'#3d4946',0,.35,zz);tire.rotation.y=Math.PI/2;}box(g,.45,.6,.85,color,0,.65,0);box(g,.47,.14,.7,'#4f4b40',0,1,-.1);box(g,.4,.7,.13,color,0,.88,.6);box(g,.7,.06,.06,'#65766d',0,1.28,.65);sphere(g,.12,'#fbebbc',0,1,.71);g.rotation.y=-.35;}
// Ground texture is drawn locally, so no external asset requests are needed.
const groundCanvas=document.createElement('canvas');groundCanvas.width=groundCanvas.height=256;const gc=groundCanvas.getContext('2d');gc.fillStyle='#c7b99c';gc.fillRect(0,0,256,256);for(let y=0;y<256;y+=64)for(let x=0;x<256;x+=64){gc.fillStyle=(x+y)%128?'#c6b69a':'#cebea2';gc.fillRect(x+1,y+1,62,62);gc.fillStyle='#b8a88e';gc.fillRect(x+6,y+7,3,2);}const groundTex=new THREE.CanvasTexture(groundCanvas);groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping;groundTex.repeat.set(36,27);groundTex.colorSpace=THREE.SRGBColorSpace;const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,90),new THREE.MeshStandardMaterial({map:groundTex,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(40,0,30);ground.receiveShadow=true;scene.add(ground);
const toX=x=>(x-800)/40,toZ=y=>(y-600)/40;
// Townhouses, shutters, balconies and hanging signs around the market.
for(let i=0;i<9;i++){const g=new THREE.Group();g.position.set(-20+i*5,0,-11);scene.add(g);const c=['#d9c396','#c0c6a1','#dcad90','#c2c7b1'][i%4];box(g,4.8,5,3.7,c,0,2.5,0);box(g,5,1,4,'#a96952',0,5.1,0);for(let z=-1.8;z<2;z+=.4)box(g,5,.07,.08,'#c48a69',0,5.63,z);box(g,3.7,2.4,.1,'#648b82',0,1.2,1.9);for(let x=-1.7;x<1.8;x+=.24)box(g,.035,2.3,.04,'#96aa93',x,1.2,1.98);box(g,1.3,1.2,.1,'#577e79',0,3.8,1.9);box(g,1.7,.12,.5,'#e9d5b1',0,3.15,2.05);label(g,['TẠP HÓA','BÚN RIÊU','CÀ PHÊ','TIỆM MAY'][i%4],0,2.8,2,3.8);}
// Front gate leaves the lane open and gives the market a recognizable entrance.
for(const x of [-7,7]){box(scene,.5,5,.5,'#d8b17d',x,2.5,12.7);box(scene,.7,.25,.7,'#af7152',x,5,12.7);}box(scene,14.7,1.3,.55,'#527e6a',0,5.3,12.7);
label(scene,'CHỢ BÌNH AN',0,5.3,12.7,10,'#547d67','#fff0c9','HỌP CHỢ TỪ 1986',true);
const boothGroups=[];const signs=['CÁ TƯƠI · CÔ BA','RAU VƯỜN · DÌ TƯ','CÀ CHUA · CÔ SÁU','GIA VỊ · CHÚ NĂM','QUÁN BÚN · CHỊ ÚT'];
for(let i=0;i<5;i++){const b=locations[i],g=new THREE.Group();g.position.set(toX(b.x+b.w/2),0,toZ(b.y+b.h/2));if(i>=3)g.rotation.y=Math.PI;scene.add(g);g.userData.index=i;boothGroups.push(g);const w=b.w/40,d=b.h/40,c=['#578a93','#69966a','#bc785c','#b59b69','#c68b53'][i];
for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])cyl(g,.065,3.9,'#a78a5c',x,1.95,z);
const roof=box(g,w+.5,.1,d+.5,c,0,3.8,0);roof.rotation.x=-.08;
const awn=stripedAwning(g,w+.4,d*.6,['#357392','#f0ecdd','#ce5642'][i%3],'#f6f3e6');awn.position.set(0,3.4,d/2+.2);awn.rotation.x=-.18;
label(g,signs[i],0,4.35,0,w-.1,'#fff1cf','#3c6155','',false);
box(g,w-.2,.3,1.15,'#bb915c',0,1.15,1.25);for(let x=-w/2+.4;x<w/2;x+=.65)box(g,.05,.95,1.05,'#90744f',x,.54,1.25);
nhonHoaScale(g,w/2-.75,1.3,1.25);
for(let j=0;j<3;j++){const x=-2+j*1.3;if(i===0)fish(g,x,1.37,1.3);else basket(g,x,1.4,1.3,i===2?1:i===3?2:0);}
const vendor=person(['#a485a3','#b87b61','#6d9590','#94905a','#c38371'][i],i!==3);vendor.position.set(0,0,-.1);g.add(vendor);
if(i===0){fish(g,-2.2,.15,2.4);fish(g,-.8,.15,2.5);cyl(g,.38,.35,'#7d5c38',2.1,.17,1.3);box(g,.04,.14,.22,'#c0c8cc',2.1,.38,1.3);}
else if(i<3){basket(g,-2,.15,2.35,i===2?1:0);basket(g,-.7,.15,2.35,i===2?1:0);box(g,1.1,.38,.8,'#b89762',.7,.19,2.4);box(g,.95,.18,.7,i===1?'#629b57':'#d65c40',.7,.38,2.4);}
else if(i===3){for(let k=0;k<3;k++){cyl(g,.03,.7,'#a58e67',-2+k*1.8,2.6,1.4);for(let r=0;r<4;r++)sphere(g,.08,'#ede7d8',-2+k*1.8,2.3+r*.14,1.4);}}
else if(i===4){cyl(g,.32,.45,'#cfd7dc',-2.1,1.52,1.25);cyl(g,.3,.05,'#ca6732',-2.1,1.72,1.25);initSteam(g,-2.1,1.8,1.25);box(g,.45,.06,.3,'#8a7050',-.8,1.33,1.25);cyl(g,.06,.14,'#bf3b2f',-.9,1.42,1.25);cyl(g,.05,.12,'#59a164',-.72,1.41,1.25);
for(const tx of [-1.8,1.8]){box(g,1.3,.06,.9,'#d4ded8',tx,.85,2.7);for(const dx of [-.5,.5])for(const dz of [-.3,.3])cyl(g,.03,.85,'#a1aba5',tx+dx,.42,2.7+dz);cyl(g,.15,.09,'#ffffff',tx,.92,2.7);cyl(g,.14,.02,'#c96030',tx,.95,2.7);stool(g,tx-.65,2.7,'#d83f31');stool(g,tx+.65,2.7,'#2c75b8');}
const diner1=seatedPerson('#4d8276',true);diner1.position.set(-1.8-.65,0,2.7);diner1.rotation.y=Math.PI/2;g.add(diner1);
const diner2=seatedPerson('#b06f58',false);diner2.position.set(1.8+.65,0,2.7);diner2.rotation.y=-Math.PI/2;g.add(diner2);}
label(g,(i===0?'45':i===1?'12':i===2?'15':i===3?'10':'25')+'K',2.1,1.65,1.86,1,'#fff2cb','#9e593d');g.traverse(m=>{if(m.isMesh)m.userData.index=i;});}
// Home and the player's business counter are both places in the scene.
const house=new THREE.Group();house.position.set(toX(800),0,toZ(990));house.rotation.y=Math.PI;scene.add(house);box(house,4.5,3.4,3,'#dcc398',0,1.7,0);const roof=mesh(house,'ConeGeometry',[3.5,1.5,4],'#b66f53',0,4.05,0);roof.rotation.y=Math.PI/4;box(house,1.1,2,.08,'#738c77',0,1,1.55);box(house,.8,.9,.1,'#749a95',-1.4,1.8,1.55);
for(const px of [-1.8,1.8]){cyl(house,.22,.4,'#b56c4b',px,.2,1.6);sphere(house,.38,'#598a58',px,.6,1.6);sphere(house,.28,'#d6537a',px,.75,1.6);}
label(house,'NHÀ CỦA MÁ',0,2.9,1.6,3.5);
const playerBooth=new THREE.Group();playerBooth.position.set(toX(1370),0,toZ(990));playerBooth.rotation.y=Math.PI;scene.add(playerBooth);box(playerBooth,4.3,1.3,2.5,'#b99564',0,.65,0);for(const x of [-2.1,2.1])cyl(playerBooth,.07,3.5,'#a88556',x,1.75,-.9);box(playerBooth,4.6,.15,3.1,'#6c8b78',0,3.5,0);
stripedAwning(playerBooth,4.5,1.6,'#326d8f','#f5f3e9').position.set(0,3.3,1.5);nhonHoaScale(playerBooth,1.4,1.45,.4);
label(playerBooth,'KHU SẠP CỦA CON',0,4,0,4.6);const stockLabel=floatingLabel(playerBooth,'Mở sạp từ cấp 3',2.4);const customer=person('#b5a371');customer.position.set(toX(1370)-1.5,0,toZ(990)-2.5);customer.rotation.y=0;scene.add(customer);floatingLabel(customer,'Chờ mua rau',2.5);let businessLabel='';
// Street props: plastic stools, umbrellas, baskets and parked motorbikes.
baGac(scene,toX(1450),toZ(700),-Math.PI/3,'#326f94');deliveryCub(scene,toX(350),toZ(520),Math.PI/4,'#4a7567');
for(const [x,z,c] of [[-16,5,'#b96b53'],[16,-1,'#75998b']]){umbrella(scene,x,z,c);stool(scene,x-.9,z+1);stool(scene,x+.9,z+1.3,'#538d86');cyl(scene,.7,.12,'#a8b6a5',x,1.1,z+1.4);cyl(scene,.12,1,'#a8b6a5',x,.55,z+1.4);basket(scene,x,1.3,z+1.4,2);}
for(let i=0;i<4;i++)scooter(-17+i*1.8,11,['#6c9492','#bf7861','#e1c59a'][i%3]);
for(const [x,z] of [[-19,-7],[19,-7],[-18,10],[18,11],[-5,7],[5,7]]){cyl(scene,.17,2.8,'#8e7955',x,1.4,z);for(let j=0;j<3;j++){const leaf=sphere(scene,1.05,['#7fa472','#8eac76','#6c966c'][j],x+(j-1)*.5,3+j*.4,z);leaf.scale.y=.8;}cyl(scene,.6,.55,'#b28057',x,.25,z);}
const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-18,5.5,0),new THREE.Vector3(0,4.5,0),new THREE.Vector3(18,5.5,0)]);scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,24,.025,4,false),mat('#655c47')));for(let i=0;i<9;i++){const p=curve.getPoint(i/8);const flag=mesh(scene,'ConeGeometry',[.23,.5,3],['#cf9a68','#709b91','#d0b77c'][i%3],p.x,p.y-.3,p.z);flag.rotation.z=Math.PI;}
const district=buildWholesaleDistrict({scene,box,cyl,sphere,label,person,mat,toX,toZ,world});
const avatar=person('#c57c5d');scene.add(avatar);const myBasket=new THREE.Group();basket(myBasket,0,.1,0,0);myBasket.scale.set(.65,.65,.65);myBasket.position.set(.55,.55,.05);avatar.add(myBasket);
const peers=new Map();let lastPeersCheck=0;
const marker=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(.62,.07,6,28),new THREE.MeshBasicMaterial({color:'#ecc977'}));ring.rotation.x=Math.PI/2;marker.add(ring);const pin=mesh(marker,'ConeGeometry',[.18,.42,5],'#e7bd69',0,1.1,0);pin.rotation.z=Math.PI;scene.add(marker);
const navigator=createNavigator([...locations,...district.obstacles]);const marketLife=buildMarketLife({scene,box,cyl,person,floatingLabel,animatePerson,navigator,toX,toZ,world,district});const marketAudio=createMarketAudio();host.insertAdjacentHTML('beforeend','<div id="lifeHud"><span id="marketPulse">Nhịp chợ</span><button id="crowdMode">Khách: '+(marketLife.density==='busy'?'Nhộn nhịp':'Nhẹ máy')+'</button><button id="soundMode">Âm thanh: Tắt</button></div>');$('crowdMode').onclick=()=>{marketLife.setDensity(marketLife.density==='busy'?'light':'busy');$('crowdMode').textContent='Khách: '+(marketLife.density==='busy'?'Nhộn nhịp':'Nhẹ máy');};$('soundMode').onclick=async()=>{try{if(marketAudio.on)marketAudio.stop();else await marketAudio.start();$('soundMode').textContent='Âm thanh: '+(marketAudio.on?'Bật':'Tắt');}catch(e){window.dispatchEvent(new CustomEvent('market-toast',{detail:e.message}));}};let walkPath=[];const clickRing=new THREE.Mesh(new THREE.RingGeometry(.32,.43,32),new THREE.MeshBasicMaterial({color:'#f0cd78',side:THREE.DoubleSide,transparent:true,opacity:.9}));clickRing.rotation.x=-Math.PI/2;clickRing.visible=false;scene.add(clickRing);
const keys=new Set();let near=-1;let last=0,time=0,drag=null;
function clear(){keys.clear();}window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
window.resetWorld=()=>{world.x=800;world.y=650;walkPath=[];clickRing.visible=false;clear();};window.nearShop=i=>distance(locations[i],world.x,world.y)<105;
function distance(b,x,y){return Math.hypot(Math.max(b.x-x,0,x-b.x-b.w),Math.max(b.y-y,0,y-b.y-b.h));}
function interact(){if($('shop').open)return;walkPath=[];clickRing.visible=false;clear();if(near===7){window.openHaul?.();return;}if(near===6){window.openBusinessAtStall?.();return;}if(near===5){home.click();return;}if(near>=0){if(window.tryDeliverAt?.(near))return;window.visit3d?.(near);}}
$('interact').onclick=interact;
const allowed=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift','q','r'];window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey||$('shop').open)return;const k=e.key.toLowerCase();if(allowed.includes(k)){e.preventDefault();keys.add(k);}if(k==='m'&&!e.repeat){e.preventDefault();openMap();}if(k==='e'&&!e.repeat){e.preventDefault();interact();}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));});
const canvas=$('world');const raycaster=new THREE.Raycaster(),floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
function clickToWalk(e){if($('shop').open)return;const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);if(!raycaster.ray.intersectPlane(floorPlane,hit))return;const path=navigator.route({x:world.x,y:world.y},{x:hit.x*40+800,y:hit.z*40+600});if(!path.length){window.dispatchEvent(new CustomEvent('market-toast',{detail:'Không tìm được lối tới đó. Chọn một điểm trên lối đi nhé.'}));return;}walkPath=path;window.surveyView=false;const p=path[path.length-1];clickRing.position.set(toX(p.x),.055,toZ(p.y));clickRing.visible=true;}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>7)drag.moved=true;if(drag.moved){yaw-=dx*.007;pitch=Math.max(.28,Math.min(1.05,pitch+dy*.004));}drag.x=e.clientX;drag.y=e.clientY;});
canvas.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId){const tap=!drag.moved;drag=null;if(tap)clickToWalk(e);}});for(const ev of ['pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>drag=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(11,Math.min(65,zoom+e.deltaY*.018));},{passive:false});$('cameraReset').onclick=()=>{window.surveyView=false;yaw=.15;pitch=.62;zoom=20;};
function resize(){renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000||0,.04);last=now;time+=dt;let dx=0,dy=0;
if(!$('shop').open){const sx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));const sy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));dx=sx*Math.cos(yaw)+sy*Math.sin(yaw);dy=-sx*Math.sin(yaw)+sy*Math.cos(yaw);if(keys.has('q'))yaw+=dt;if(keys.has('r'))yaw-=dt;}else clear();
if(Math.hypot(dx,dy)>.1){walkPath=[];clickRing.visible=false;}else if(!$('shop').open&&walkPath.length){const p=walkPath[0],d=Math.hypot(p.x-world.x,p.y-world.y),reach=Math.max(4,(keys.has('shift')?240:140)*dt);if(d<=reach){world.x=p.x;world.y=p.y;walkPath.shift();if(!walkPath.length)clickRing.visible=false;}else{dx=(p.x-world.x)/d;dy=(p.y-world.y)/d;}}
const moving=Math.hypot(dx,dy)>.1;if(moving){window.surveyView=false;const speed=(keys.has('shift')?240:140)*dt/Math.hypot(dx,dy);const free=(x,y)=>x>60&&x<4740&&y>270&&y<3540&&locations.every(b=>distance(b,x,y)>20)&&district.obstacles.every(b=>distance(b,x,y)>20);if(free(world.x+dx*speed,world.y))world.x+=dx*speed;if(free(world.x,world.y+dy*speed))world.y+=dy*speed;avatar.rotation.y=Math.atan2(dx,dy);}
avatar.position.set(toX(world.x),0,toZ(world.y));animatePerson(avatar,time,moving);
let closest=-1,dist=105;locations.forEach((b,i)=>{const d=distance(b,world.x,world.y);if(d<dist){dist=d;closest=i;}});near=closest;
updateSteam(time);district.update(time,dt);const pulse=marketLife.update(time,dt);if(Math.floor(time)%2===0)$('marketPulse').textContent='Nhịp chợ · '+pulse.active+' NPC hoạt động';updateMiniMap(time);const surveyText=window.surveyView?'Quay về nhân vật':'Toàn cảnh khu chợ';if($('viewAll').textContent!==surveyText)$('viewAll').textContent=surveyText;$('viewAll').setAttribute('aria-pressed',String(!!window.surveyView));$('placeLabel').innerHTML=(window.surveyView?'TOÀN CẢNH CHỢ ĐẦU MỐI':district.zone(world.x,world.y))+'<small>07:15 · Chợ đầu mối Bình An</small>';const names=[...signs,'Nhà của má','Sạp của con','Kho giao nhận'];$('interact').disabled=near<0;$('interact').innerHTML=near<0?'<kbd>E</kbd> Đến gần sạp':'<kbd>E</kbd> '+(near===5?'Về nhà':near===6?'Mở sạp':near===7?'Nhận hàng':'Nói chuyện');$('worldHint').textContent=near<0?'Bấm để đi · Kéo để xoay camera':names[near];
const target=window.getNavigationTarget?.()??0;const waypoint=window.customWaypoint;if(waypoint&&Math.hypot(world.x-waypoint.x,world.y-waypoint.y)<85)window.customWaypoint=null;const dest=waypoint?{x:waypoint.x,y:waypoint.y,w:0,h:0}:locations[target]||locations[0];marker.position.set(toX(dest.x+dest.w/2),.12,toZ(waypoint?dest.y:target===5?dest.y-40:dest.y+dest.h+45));pin.position.y=1+Math.sin(time*3)*.12;ring.rotation.z=time*.25;$('destinationHint').textContent=(waypoint?.name||names[target]||'Sạp hàng')+' · '+Math.round(distance(dest,world.x,world.y)/40)+'m';
const business=window.getMyBusiness?.();const nextLabel=business?business.stock+' bó rau · '+business.price+'K/bó':'Mở sạp từ cấp 3';customer.visible=!!business;if(nextLabel!==businessLabel){businessLabel=nextLabel;const img=stockLabel.material.map.image,cx=img.getContext('2d');cx.clearRect(0,0,img.width,img.height);cx.fillStyle='#fff5df';cx.beginPath();cx.roundRect(0,0,384,80,24);cx.fill();cx.font='bold 29px sans-serif';cx.fillStyle='#365f52';cx.textAlign='center';cx.fillText(nextLabel,192,51);stockLabel.material.map.needsUpdate=true;}const online=window.getOnlinePeers?.()||[];if(time-lastPeersCheck>.8){lastPeersCheck=time;for(const p of online)if(!peers.has(p.publicId)){const m=person('#6c9fa3');floatingLabel(m,p.name,2.55);scene.add(m);peers.set(p.publicId,m);}for(const [id,m] of peers)if(!online.some(p=>p.publicId===id)){scene.remove(m);peers.delete(id);}}
for(const p of online){const m=peers.get(p.publicId);if(!m)continue;const tx=toX(p.x),tz=toZ(p.y);const dd=Math.hypot(tx-m.position.x,tz-m.position.z);if(dd>30)m.position.set(tx,0,tz);else{m.rotation.y=Math.atan2(tx-m.position.x,tz-m.position.z);m.position.x=THREE.MathUtils.damp(m.position.x,tx,6,dt);m.position.z=THREE.MathUtils.damp(m.position.z,tz,6,dt);}animatePerson(m,time,dd>.15);}
const look=window.surveyView?new THREE.Vector3(40,1,30):new THREE.Vector3(avatar.position.x,1.1,avatar.position.z);const viewZoom=window.surveyView?105:zoom,viewPitch=window.surveyView?1.03:pitch;const desired=new THREE.Vector3(look.x+Math.sin(yaw)*viewZoom*Math.cos(viewPitch),look.y+Math.sin(viewPitch)*viewZoom,look.z+Math.cos(yaw)*viewZoom*Math.cos(viewPitch));camera.position.lerp(desired,1-Math.exp(-8*dt));camera.lookAt(look);sun.target.position.copy(avatar.position);renderer.render(scene,camera);
}
camera.position.set(toX(world.x)+3,14,toZ(world.y)+17);$('loading3d').remove();requestAnimationFrame(frame);
window.visit3d=i=>{window.dispatchEvent(new CustomEvent('visit-stall',{detail:i}));};

function mapDraw(c){const cx=c.getContext('2d'),w=c.width,h=c.height,sx=w/4800,sy=h/3600;cx.fillStyle='#e6e5cd';cx.fillRect(0,0,w,h);cx.fillStyle='#b7c6b0';cx.fillRect(120*sx,150*sy,1400*sx,1100*sy);for(const r of district.roads){cx.fillStyle='#9baea1';cx.fillRect(r.x*sx,r.y*sy,r.w*sx,r.h*sy);}for(const [i,b] of district.halls.entries()){cx.fillStyle=b.color;cx.fillRect(b.x*sx,b.y*sy,b.w*sx,b.h*sy);cx.fillStyle='#fff5d8';cx.font=`bold ${w>300?22:10}px sans-serif`;cx.textAlign='center';cx.fillText('ABCD'[i],(b.x+b.w/2)*sx,(b.y+b.h/2)*sy+4);}cx.fillStyle='#a7b4a3';cx.fillRect(120*sx,1810*sy,1320*sx,1450*sy);cx.fillStyle='#879f8e';cx.fillRect(3040*sx,2860*sy,520*sx,280*sy);cx.fillStyle='#6c8c73';for(const b of locations.slice(0,7))cx.fillRect(b.x*sx,b.y*sy,b.w*sx,b.h*sy);for(const v of district.vehicles){cx.fillStyle='#c69765';cx.fillRect(v.x*sx-2,v.y*sy-2,4,4);}if(window.customWaypoint){cx.strokeStyle='#ba9553';cx.lineWidth=2;cx.beginPath();cx.arc(window.customWaypoint.x*sx,window.customWaypoint.y*sy,6,0,Math.PI*2);cx.stroke();}cx.fillStyle='#c9794d';cx.beginPath();cx.arc(world.x*sx,world.y*sy,w>300?6:4,0,Math.PI*2);cx.fill();cx.strokeStyle='#fff5dc';cx.lineWidth=2;cx.stroke();}
host.insertAdjacentHTML('beforeend','<div id="districtMap"><canvas id="miniMap" width="180" height="135" aria-label="Bản đồ nhỏ: khu dân sinh, bốn nhà lồng và bãi xe"></canvas><button id="openMap"><kbd>M</kbd> Bản đồ khu chợ ↗</button><button id="viewAll">Toàn cảnh khu chợ</button></div>');$('openMap').onclick=openMap;$('viewAll').onclick=()=>{window.surveyView=!window.surveyView;$('viewAll').textContent=window.surveyView?'Quay về nhân vật':'Toàn cảnh khu chợ';};let mapLast=-1;
function updateMiniMap(t){if(t-mapLast<.15)return;mapLast=t;mapDraw($('miniMap'));if($('largeMap'))mapDraw($('largeMap'));}
function openMap(){const content=$('dialogContent');content.innerHTML='<p class="eyebrow">CHỢ ĐẦU MỐI BÌNH AN</p><h2>Một khu chợ, nhiều ngả đường</h2><p>Khu dân sinh ở góc trên trái. Các nhà lồng và bãi xe nằm bên kia đường nội bộ. Chọn địa điểm để đặt dấu dẫn đường.</p><canvas id="largeMap" width="600" height="430" aria-label="Bản đồ khu chợ, nhấp để đặt điểm đến"></canvas><div class="map-places">'+district.points.map((p,i)=>'<button data-place="'+i+'">'+p.name+'</button>').join('')+'</div><p class="fine-print">Chấm cam: bạn · A–D: nhà lồng · Chấm vàng: xe tải · Không dịch chuyển tức thời.</p>';
if(!$('shop').open)$('shop').showModal();mapDraw($('largeMap'));function setPoint(p){window.surveyView=false;window.customWaypoint=p;$('shop').close();window.dispatchEvent(new CustomEvent('market-toast',{detail:'Đã đánh dấu '+p.name}));}document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>setPoint(district.points[Number(b.dataset.place)]));$('largeMap').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();setPoint({x:Math.max(60,Math.min(4740,(e.clientX-r.left)/r.width*4800)),y:Math.max(270,Math.min(3540,(e.clientY-r.top)/r.height*3600)),name:'Điểm đã chọn'});};}
