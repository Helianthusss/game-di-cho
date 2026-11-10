import * as THREE from './three.module.min.js';
import {cityLayout} from './city-layout.js';

export function buildCity({scene,box,cyl,sphere,label,mat,toX,toZ,obstacles}){
  const buildings=[], decorations=[];
  const surface=(r,color,height=.04)=>box(scene,r.w/40,height,r.h/40,color,toX(r.x+r.w/2),height/2,toZ(r.y+r.h/2));
  function block(r){obstacles.push({...r});}
  function tree(x,y,flower=false){
    const g=new THREE.Group();g.position.set(toX(x),0,toZ(y));scene.add(g);
    cyl(g,.13,2.6,'#827055',0,1.3,0);
    for(let i=0;i<3;i++){
      const leaf=sphere(g,1.05,flower?'#b98c9f':['#6f8c5c','#8a9f6c','#78915e'][i],(i-1)*.6,2.9+i*.27,0);
      leaf.scale.set(1,.8,.85);
    }
    block({x:x-10,y:y-10,w:20,h:20});
    decorations.push(g);
  }
  function lamp(x,y){
    const g=new THREE.Group();g.position.set(toX(x),0,toZ(y));scene.add(g);
    cyl(g,.055,3.8,'#41574e',0,1.9,0);
    box(g,.5,.08,.1,'#41574e',.2,3.78,0);
    box(g,.38,.12,.3,'#f0d9a3',.36,3.7,0);
    decorations.push(g);
  }
  function bench(x,y,rotation=0){
    const g=new THREE.Group();g.position.set(toX(x),0,toZ(y));g.rotation.y=rotation;scene.add(g);
    for(let i=0;i<4;i++)box(g,1.9,.06,.12,'#a78259',0,.5,-.2+i*.14);
    for(let i=0;i<3;i++)box(g,1.9,.1,.07,'#a78259',0,.77+i*.14,-.3);
    for(const x of [-.7,.7])box(g,.08,.5,.6,'#40554c',x,.25,0);
    block({x:x-40,y:y-18,w:80,h:36});
  }
  function roof(g,w,d,y){
    // Hip roof with actual slopes and overhanging eaves.
    const geo=new THREE.ConeGeometry(1,1.5,4);
    geo.rotateY(Math.PI/4);
    const m=new THREE.Mesh(geo,mat('#aa6d51'));
    m.scale.set((w+.7)/Math.SQRT2,1,(d+.7)/Math.SQRT2);
    m.position.y=y+.75;m.castShadow=true;g.add(m);
    box(g,w+.7,.15,d+.7,'#c18b65',0,y,0);
    return m;
  }
  function windowFrame(g,x,y,z,w=1.2,h=1.6){
    box(g,w+.18,h+.18,.11,'#f2e7cf',x,y,z);
    box(g,w,h,.13,'#557a7c',x,y,z+.03);
    box(g,.05,h,.17,'#bfc7b4',x,y,z+.07);
    box(g,w,.05,.17,'#bfc7b4',x,y,z+.07);
  }
  function balcony(g,w,y,z){
    box(g,w,.17,1.1,'#f0e5cf',0,y,z+.38);
    box(g,w,.07,.07,'#4e5f50',0,y+.9,z+.87);
    for(let x=-w/2;x<=w/2;x+=.35)box(g,.035,.85,.035,'#4e5f50',x,y+.45,z+.87);
  }
  function planter(g,x,z,w=1.5){
    box(g,w,.35,.55,'#ac7c57',x,.18,z);
    box(g,w-.1,.35,.5,'#6f8d56',x,.5,z);
    for(let i=0;i<3;i++)sphere(g,.11,'#c77f88',x-w*.3+i*w*.3,.72,z);
  }

  surface({x:1900,y:3400,w:5270,h:2830},'#bdc5a3');
  for(const r of cityLayout.roads){
    surface({x:r.x-35,y:r.y-35,w:r.w+70,h:r.h+70},'#cfc8b5',.07);
    surface(r,'#707b76',.08);
    if(r.w>r.h){
      for(let x=r.x+40;x<r.x+r.w-60;x+=120)surface({x,y:r.y+r.h/2-2,w:55,h:4},'#e6d6a8',.09);
    }else{
      for(let y=r.y+40;y<r.y+r.h-60;y+=120)surface({x:r.x+r.w/2-2,y,w:4,h:55},'#e6d6a8',.09);
    }
  }
  // A clear pavement links all shop doors, with trees in the furnishing strip.
  surface({x:1980,y:3830,w:2290,h:140},'#d9d0bb',.08);
  surface({x:1980,y:4250,w:2290,h:90},'#d9d0bb',.08);
  for(let i=0;i<5;i++){
    tree(2025+i*420,3890,i%3===0);
    lamp(2025+i*420,4290);
  }
  for(const x of [1980,4160,4620]){
    for(let i=0;i<7;i++)surface({x,y:3980+i*36,w:55,h:19},'#e9e1cb',.1);
  }

  for(const plot of cityLayout.plots){
    surface(plot,plot.type==='villa'?'#a4b88c':'#d5c9b1',.08);
    const g=new THREE.Group();
    const cx=plot.x+plot.w/2,cy=plot.y+plot.h/2;
    g.position.set(toX(cx),0,toZ(cy));g.rotation.y=plot.facing;scene.add(g);
    const isVilla=plot.type==='villa',isApartment=plot.type==='apartment';
    const w=isApartment?15:isVilla?9:6.9;
    const d=isApartment?6.7:isVilla?7:6;
    const h=isApartment?17:isVilla?6.6:8.6;
    box(g,w,h,d,plot.color,0,h/2,0);
    box(g,w+.1,.4,d+.1,'#b5a38c',0,.2,0);
    for(let floor=1;floor<(isApartment?6:3);floor++){
      box(g,w+.15,.16,d+.15,'#f0e5ce',0,floor*(isApartment?2.8:2.85),0);
      for(let x=-w/2+1.2;x<w/2;x+=isApartment?2.5:2.25){
        windowFrame(g,x,floor*(isApartment?2.8:2.85)+1.25,d/2+.03,isApartment?1.45:1.2,1.65);
      }
    }
    roof(g,w,d,h);
    box(g,1.5,2.3,.13,'#566e60',0,1.15,d/2+.05);
    for(const x of [-w/2+.3,w/2-.3]){
      box(g,.28,h,.24,'#eee3cc',x,h/2,d/2+.1);
    }
    if(isVilla){
      balcony(g,4.9,3.05,d/2+.15);
      for(const x of [-3.5,3.5]){
        cyl(g,.13,2.9,'#eadfc9',x,1.45,d/2+.85);
      }
      box(g,w+.1,.2,1.6,'#ddd0b9',0,3,d/2+.7);
      windowFrame(g,-2.9,1.45,d/2+.05,1.5,1.8);
      windowFrame(g,2.9,1.45,d/2+.05,1.5,1.8);
      planter(g,-5.9,2,1.1);planter(g,5.9,2,1.1);
      // Low boundary walls leave a generous opening on the entrance side.
      const fenceZ=plot.h/80-.2;
      for(const side of [-1,1]){
        box(g,4.8,.55,.18,'#d6c6ad',side*5.4,.27,fenceZ);
        for(let j=0;j<12;j++)box(g,.04,1.2,.04,'#4d5c4b',side*5.4-2.2+j*.4,.95,fenceZ);
        box(g,.35,1.8,.35,'#e6d8be',side*2.8,.9,fenceZ);
      }
      label(g,plot.name.toUpperCase(),0,1.3,fenceZ-.05,3.3,'#e7dfca','#4d6455');
      // Fence collider gaps match the rendered gates, including reversed facades.
      const fenceY=plot.facing===0?plot.y+plot.h-16:plot.y+8;
      block({x:plot.x+8,y:fenceY,w:plot.w/2-118,h:8});
      block({x:cx+118,y:fenceY,w:plot.w/2-126,h:8});
    }else if(!isApartment){
      balcony(g,w-.8,3.05,d/2+.1);
      box(g,w-.7,1.85,.12,'#668b86',0,1.12,d/2+.03);
      for(const x of [-2.2,0,2.2])box(g,.06,1.85,.2,'#dcd6bf',x,1.12,d/2+.12);
      box(g,w+.25,.14,1.4,'#7b8b6c',0,2.6,d/2+.5);
      for(let i=0;i<10;i++)box(g,(w+.25)/10,.03,1.4,i%2?'#e8ddc3':'#738668',-w/2+i*w/10,2.69,d/2+.5);
      label(g,plot.name,0,3.3,d/2+.35,w-.4,'#416552','#f4e4bd');
      planter(g,-w/2+.5,d/2+1,.9);
      if(plot.id==='shop-n-0'||plot.id==='shop-s-4'){
        for(const x of [-1.3,1.3]){
          cyl(g,.38,.08,'#ab8761',x,.78,d/2+1.4);
          cyl(g,.055,.75,'#455d51',x,.39,d/2+1.4);
          for(const offset of [-.6,.6])box(g,.45,.45,.45,'#758872',x+offset,.22,d/2+1.4);
        }
      }
    }else{
      label(g,plot.name.toUpperCase(),0,2.75,d/2+.15,7,'#64796c','#fff0cf');
      for(const x of [-5.5,5.5])planter(g,x,d/2+.65,2);
    }
    const footprint={x:cx-w*20,y:cy-d*20,w:w*40,h:d*40};
    block(footprint);
    buildings.push({plot,footprint,group:g});
  }
  // Lake edge, promenade, open park and pier are all outside building lots.
  const lake=cityLayout.lake;
  surface({x:lake.x-100,y:lake.y-100,w:lake.w+200,h:lake.h+200},'#a4b88d',.035);
  surface({x:lake.x-45,y:lake.y-45,w:lake.w+90,h:lake.h+90},'#d8c9a9',.06);
  const water=surface(lake,'#71a9ad',.075);
  water.material=new THREE.MeshStandardMaterial({color:'#75a9ad',roughness:.28,metalness:.08});
  block(lake);
  for(let i=0;i<7;i++){
    tree(lake.x-120+i*280,lake.y-110,i%3===0);
    tree(lake.x-120+i*280,lake.y+lake.h+90);
    lamp(lake.x-85+i*280,lake.y+lake.h+60);
  }
  for(let i=0;i<3;i++){bench(4780,4490+i*155,Math.PI/2);tree(4670,4490+i*155);}
  surface({x:5500,y:4910,w:400,h:75},'#b99d74',.1);
  label(scene,'HỒ BÌNH AN',toX(5720),2.8,toZ(4960),7,'#e9dfc6','#4c6e60','CÔNG VIÊN VEN HỒ',true);
  // Residential entry frames the road without blocking the carriageway.
  for(const y of [3910,4305]){
    box(scene,.65,5.5,.65,'#e5d5b7',toX(4650),2.75,toZ(y));
    box(scene,1.2,.25,1.2,'#aa7956',toX(4650),5.6,toZ(y));
    block({x:4637,y:y-13,w:26,h:26});
  }
  label(scene,'BÌNH AN RIVERSIDE',toX(4645),5.1,toZ(4110),8,'#506a57','#f3e3be','KHU ĐÔ THỊ VEN HỒ',true,Math.PI/2);
  // Trees and seats in the apartment forecourt, leaving the approach free.
  for(const x of [2080,3070,4120]){tree(x,5330);lamp(x+65,5340);}
  bench(3100,5430);
  // Batch repeated static facade pieces so detail does not require one draw per bar.
  scene.updateMatrixWorld(true);
  const batches=new Map();
  for(const {group} of buildings){
    group.traverse(mesh=>{
      if(!mesh.isMesh||mesh.material.map)return;
      const key=mesh.geometry.type+JSON.stringify(mesh.geometry.parameters)+mesh.material.uuid;
      if(!batches.has(key))batches.set(key,[]);
      batches.get(key).push(mesh);
    });
  }
  const sceneInverse=new THREE.Matrix4().copy(scene.matrixWorld).invert();
  for(const meshes of batches.values()){
    if(meshes.length<3)continue;
    const batch=new THREE.InstancedMesh(meshes[0].geometry,meshes[0].material,meshes.length);
    batch.castShadow=true;batch.receiveShadow=true;
    meshes.forEach((mesh,i)=>{
      batch.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(sceneInverse,mesh.matrixWorld));
      mesh.removeFromParent();
    });
    batch.instanceMatrix.needsUpdate=true;
    scene.add(batch);
  }
  return {
    ...cityLayout,buildings,
    update(world,survey){
      // Hide distant detail groups; buildings stay visible for the skyline.
      for(const g of decorations){
        g.visible=survey||Math.hypot(g.position.x-toX(world.x),g.position.z-toZ(world.y))<95;
      }
    }
  };
}
