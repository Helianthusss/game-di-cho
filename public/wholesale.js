import * as THREE from './three.module.min.js';
// A fictional wholesale-market district, inspired by Vietnamese market logistics.
// The original playable neighborhood remains in the northwest corner.
export function buildWholesaleDistrict({scene,box,cyl,sphere,label,person,mat,toX,toZ,world}){
const obstacles=[],halls=[],vehicles=[];const W=4800,H=3600;
function slab(x,y,w,h,color,height=.025){return box(scene,w/40,height,h/40,color,toX(x+w/2),height/2,toZ(y+h/2));}
const roads=[{x:1640,y:120,w:240,h:3250},{x:90,y:1260,w:4600,h:240},{x:1640,y:2500,w:2850,h:240},{x:4320,y:120,w:240,h:3250},{x:1640,y:3190,w:2920,h:200}];
for(const r of roads){slab(r.x-22,r.y-22,r.w+44,r.h+44,'#c1c6b2',.04);slab(r.x,r.y,r.w,r.h,'#687b78',.055);if(r.h>r.w){for(let yy=r.y+40;yy<r.y+r.h;yy+=160)slab(r.x+r.w/2-3,yy,6,70,'#e6dcaf',.065);}else for(let xx=r.x+40;xx<r.x+r.w;xx+=160)slab(xx,r.y+r.h/2-3,70,6,'#e6dcaf',.065);}
// Crossings connect pedestrian zones to the larger halls.
for(let i=0;i<8;i++){slab(1650+i*27,1110,14,92,'#f4e7bf',.07);slab(1940,1270+i*27,92,14,'#f4e7bf',.07);}
const hallSpecs=[{x:2100,y:250,w:880,h:850,name:'NHÀ LỒNG A',sub:'RAU CỦ · HÀNG SỈ',color:'#6e9687',produce:'#82a36a'},{x:3260,y:250,w:880,h:850,name:'NHÀ LỒNG B',sub:'TRÁI CÂY · VỰA LỚN',color:'#b39368',produce:'#d6ab58'},{x:2100,y:1680,w:880,h:640,name:'NHÀ LỒNG C',sub:'CỦ QUẢ · NÔNG SẢN',color:'#7891a0',produce:'#c0a16a'},{x:3260,y:1680,w:880,h:640,name:'NHÀ LỒNG D',sub:'KHU ĐÓNG GÓI',color:'#a98675',produce:'#91aa71'}];
for(const h of hallSpecs){const g=new THREE.Group();g.position.set(toX(h.x+h.w/2),0,toZ(h.y+h.h/2));scene.add(g);const w=h.w/40,d=h.h/40;slab(h.x-30,h.y-30,h.w+60,h.h+60,'#d1c5a5',.035);
for(const x of [-w/2,w/2])for(let z=-d/2;z<=d/2;z+=d/4){box(g,.15,5.9,.15,'#7d9188',x,2.95,z);box(g,.28,.15,d+.8,'#8a9b8b',x,5.7,0);}
box(g,w,.18,.18,'#7d9188',0,5.7,-d/2);box(g,w,.18,.18,'#7d9188',0,5.7,d/2);
const roofMat=new THREE.MeshStandardMaterial({color:h.color,roughness:.9,transparent:true,opacity:1,depthWrite:true,side:THREE.DoubleSide});const roof=new THREE.Mesh(new THREE.BoxGeometry(w+1,.12,d+1),roofMat);roof.position.y=6;g.add(roof);roof.castShadow=true;
for(let x=-w/2;x<w/2;x+=1.6){const ridge=box(g,.04,.08,d+1,'#d1dac0',x,6.09,0);ridge.castShadow=false;}
const facingRoad=h.y>1260?-d/2-.17:d/2+.17;const rotY=h.y>1260?Math.PI:0;label(g,h.name,0,5.65,facingRoad,w*.72,'#fff1cd','#4a6b5c',h.sub,false,rotY);
// Open central aisle with individual collidable produce counters on both sides.
const rows=h.h>700?5:4;for(let row=0;row<rows;row++)for(const side of [-1,1]){const xx=side*(w/2-3.3),zz=-d/2+2.2+row*(d-4.4)/(rows-1);box(g,4.7,1,2.2,'#ac8c60',xx,.5,zz);box(g,4.9,.12,2.4,'#d2b17c',xx,1.05,zz);
for(let k=0;k<3;k++){const crate=box(g,1.2,.48,1.35,['#889b67','#bd9b5a','#8da38b'][k],xx-1.5+k*1.5,1.35,zz);crate.castShadow=false;const goods=box(g,1,.2,1.1,h.produce,xx-1.5+k*1.5,1.68,zz);goods.castShadow=false;}
obstacles.push({x:h.x+h.w/2+(xx-2.45)*40,y:h.y+h.h/2+(zz-1.2)*40,w:196,h:96});}
for(const x of [-1.1,1.1]){box(g,.13,.13,d,'#e4e3bb',x,4.9,0);}halls.push({...h,roofMat});}
// A long parking area with bay markings, gate and a check-in booth.
slab(120,1810,1320,1450,'#9ba99b',.025);for(let row=0;row<3;row++)for(let i=0;i<5;i++){const x=190+i*240,y=1870+row*420;slab(x,y,5,310,'#e8e3bb',.05);slab(x,y+310,190,5,'#e8e3bb',.05);}label(scene,'BÃI XE TẢI',toX(750),4.5,toZ(1830),12,'#628373','#fff1cd','BỐC DỠ · GIAO NHẬN',true);
box(scene,2.7,2.5,2.5,'#d6c296',toX(1450),1.25,toZ(1960));label(scene,'BẢO VỆ',toX(1450),2.7,toZ(2015),2.8);box(scene,6,.12,.12,'#cb8662',toX(1510),1.6,toZ(1820));
function truck(color,loaded=false){const g=new THREE.Group();box(g,1.7,1.5,1.65,color,0,1.15,1.6);box(g,1.5,.55,.06,'#a8ccc6',0,1.5,2.45);box(g,1.85,.2,4.2,'#7c8c82',0,.58,.2);box(g,1.8,1.9,3.2,'#d6d9c5',0,1.6,-.9);for(const x of [-.94,.94])for(const z of [-1.8,1.8]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.18,12),mat('#394b47'));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.37,z);g.add(wheel);}for(const x of [-.6,.6])box(g,.3,.18,.06,'#f3dfaa',x,.85,2.46);if(loaded){box(g,1.6,.8,2.5,'#b79560',0,2.9,-.9);box(g,1.3,.1,2.1,'#789165',0,3.35,-.9);}return g;}
for(let row=0;row<3;row++)for(let i=0;i<4;i++){const g=truck(['#8ca89b','#bb8b6e','#88a3ad'][i%3],row%2===0);g.position.set(toX(275+i*240),0,toZ(1985+row*420));g.rotation.y=Math.PI;scene.add(g);obstacles.push({x:230+i*240,y:1895+row*420,w:90,h:180});}
// Clockwise traffic uses the internal roads, never the retail shopping aisle.
const route=[{x:1760,y:1380},{x:4440,y:1380},{x:4440,y:2620},{x:1760,y:2620}];let length=0;const segments=route.map((p,i)=>{const q=route[(i+1)%route.length],len=Math.hypot(q.x-p.x,q.y-p.y);const s={p,q,len,start:length};length+=len;return s;});
for(let i=0;i<6;i++){const g=truck(['#b97f66','#719b98','#a3ac8d'][i%3],i%2===0);scene.add(g);vehicles.push({g,progress:i/6*length,speed:55+i*4,x:0,y:0});}
// Warehouse destination and loading pallets.
box(scene,13,5,7,'#b2bca6',toX(3300),2.5,toZ(3000));box(scene,13.6,.2,7.6,'#6c8a7a',toX(3300),5.2,toZ(3000));for(let i=0;i<3;i++){box(scene,3.1,3,.1,'#779185',toX(3120+i*180),1.5,toZ(3142));for(let j=0;j<2;j++)box(scene,1.2,.6,1.2,'#b79a69',toX(3050+i*180),.3+j*.6,toZ(3190));}label(scene,'KHO GIAO NHẬN',toX(3300),4.5,toZ(3145),10,'#fff1cd','#537460','NHẬN HÀNG · GIAO QUÁN',true);
obstacles.push({x:3040,y:2860,w:520,h:280});
// Signs orient the player before crossing into the wholesale part.
for(const [x,y,text,small] of [[1510,1110,'CHỢ ĐẦU MỐI →','NHÀ LỒNG A · B · C · D'],[2020,1560,'↑ RAU CỦ · TRÁI CÂY','↓ KHO HÀNG · GIAO NHẬN'],[1200,1690,'← BÃI XE TẢI','→ NHÀ LỒNG · KHO HÀNG']]){cyl(scene,.065,3.5,'#7d8e7f',toX(x),1.75,toZ(y));label(scene,text,toX(x),3.8,toZ(y),6,'#5d806e','#fff1cc',small,true,Math.PI/4);}
// Tree-lined boundary and lamp posts provide scale without filling the roads.
for(let i=0;i<14;i++){const x=2100+i*190;box(scene,.12,5,.12,'#778c81',toX(x),2.5,toZ(1550));box(scene,.9,.12,.4,'#e1e2bf',toX(x)+.3,5,toZ(1550));}
for(let i=0;i<12;i++){const x=300+i*380;cyl(scene,.13,2.2,'#917f5e',toX(x),1.1,toZ(3500));const leaf=sphere(scene,1.25,'#8eaa7d',toX(x),3,toZ(3500));leaf.scale.y=.85;}
const points=[{name:'Chợ dân sinh',x:800,y:650},{name:'Nhà lồng A · Rau củ',x:2540,y:1130},{name:'Nhà lồng B · Trái cây',x:3700,y:1130},{name:'Nhà lồng C · Nông sản',x:2540,y:2360},{name:'Nhà lồng D · Đóng gói',x:3700,y:2360},{name:'Bãi xe tải',x:780,y:1770},{name:'Kho giao nhận',x:3300,y:3220}];
function update(time,dt){for(const h of halls){const inside=world.x>h.x-60&&world.x<h.x+h.w+60&&world.y>h.y-80&&world.y<h.y+h.h+80;h.roofMat.opacity=THREE.MathUtils.damp(h.roofMat.opacity,inside?.12:1,7,dt);h.roofMat.depthWrite=!inside;}
for(const v of vehicles){if(Math.hypot(world.x-v.x,world.y-v.y)>120)v.progress=(v.progress+v.speed*dt)%length;const s=segments.find(s=>v.progress<s.start+s.len)||segments[0],t=(v.progress-s.start)/s.len;v.x=s.p.x+(s.q.x-s.p.x)*t;v.y=s.p.y+(s.q.y-s.p.y)*t;v.g.position.set(toX(v.x),0,toZ(v.y));v.g.rotation.y=Math.atan2(s.q.x-s.p.x,s.q.y-s.p.y);}}
function zone(x,y){if(x<1550&&y<1600)return 'KHU CHỢ DÂN SINH';if(x<1550&&y>1600)return 'BÃI XE · KHU BỐC DỠ';for(const h of halls)if(x>h.x-100&&x<h.x+h.w+100&&y>h.y-100&&y<h.y+h.h+100)return h.name+' · '+h.sub;if(y>2800)return 'KHO GIAO NHẬN';return 'ĐƯỜNG NỘI BỘ · CHỢ ĐẦU MỐI';}
return {W,H,roads,halls,points,obstacles,vehicles,update,zone};
}
