import * as THREE from './three.module.min.js';
import {cityLayout} from './city-layout.js';

// Builds the town outside the two markets from city-layout.js: roads, lots, lake, gate and route.
export function buildCity({scene,box,cyl,sphere,label,mat,toX,toZ,obstacles}){
  const buildings=[], decorations=[];
  const surface=(r,color,height=.04)=>box(scene,r.w/40,height,r.h/40,color,toX(r.x+r.w/2),height/2,toZ(r.y+r.h/2));
  function block(r){obstacles.push({...r});}
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  // Street furniture keeps clear of road surfaces and of every lot entrance.
  const onRoad=(x,y,pad=0)=>cityLayout.roads.some(r=>overlaps({x:x-pad,y:y-pad,w:pad*2,h:pad*2},r))||cityLayout.plots.some(p=>Math.hypot(p.entrance.x-x,p.entrance.y-y)<90);
  function tree(x,y,kind=0,collide=true){
    const g=new THREE.Group();g.position.set(toX(x),0,toZ(y));scene.add(g);
    cyl(g,.13,2.6,'#827055',0,1.3,0);
    if(kind===2){
      // Willow by the lake: a soft drooping crown.
      const crown=sphere(g,1.5,'#93ad6c',0,3.1,0);crown.scale.set(1,1.15,1);
      for(let i=0;i<6;i++){const a=i*Math.PI/3;const s=sphere(g,.55,'#a3b979',Math.cos(a)*1.2,2.1,Math.sin(a)*1.2);s.scale.set(.6,1.6,.6);}
    }else{
      for(let i=0;i<3;i++){
        const leaf=sphere(g,1.05,kind===1?['#b98c9f','#c99aac','#a77d90'][i]:['#6f8c5c','#8a9f6c','#78915e'][i],(i-1)*.6,2.9+i*.27,0);
        leaf.scale.set(1,.8,.85);
      }
    }
    if(collide)block({x:x-10,y:y-10,w:20,h:20});
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
    decorations.push(g);
  }
  function roof(g,w,d,y,color='#aa6d51'){
    // Hip roof with real slopes and overhanging eaves.
    const geo=new THREE.ConeGeometry(1,1.5,4);
    geo.rotateY(Math.PI/4);
    const m=new THREE.Mesh(geo,mat(color));
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
  function scooter(x,y,color,rot=0){
    const g=new THREE.Group();g.position.set(toX(x),0,toZ(y));g.rotation.y=rot;scene.add(g);
    for(const z of [-.6,.6]){const w=cyl(g,.28,.08,'#33403c',0,.28,z);w.rotation.z=Math.PI/2;}
    box(g,.42,.55,.85,color,0,.62,0);box(g,.45,.13,.7,'#4f4b40',0,.95,-.1);box(g,.38,.65,.12,color,0,.85,.58);
    decorations.push(g);
  }

  // Ground zones: each district gets its own surface so the plan reads at a glance.
  const z=cityLayout.zones;
  surface({x:z.wholesale.x-1820,y:480,w:6020,h:1220},'#cdc6b0',.03);
  surface({x:3900,y:1940,w:3300,h:2160},'#d8cfb8',.03);
  surface({x:1180,y:4380,w:6020,h:1940},'#cfc3a4',.03);
  surface({x:7440,y:480,w:3480,h:5840},'#b3c49a',.03);
  // Planted buffer outside the ring road.
  for(const r of [{x:440,y:-400,w:11000,h:600},{x:440,y:6600,w:11000,h:600},{x:11200,y:-400,w:500,h:7600}])surface(r,'#a9b98d',.02);

  // Roads: sidewalk band, carriageway, lane markings. Service lanes are paler.
  for(const r of cityLayout.roads){
    surface({x:r.x-80,y:r.y-80,w:r.w+160,h:r.h+160},'#d9d0bb',.06);
  }
  for(const r of cityLayout.roads){
    surface(r,r.service?'#8f9890':'#6d7a75',.075);
    if(r.service)continue;
    if(r.w>r.h){
      for(let x=r.x+40;x<r.x+r.w-60;x+=140)if(!cityLayout.roads.some(o=>o!==r&&o.h>o.w&&x+30>o.x&&x<o.x+o.w))surface({x,y:r.y+r.h/2-2,w:60,h:4},'#e6d6a8',.085);
    }else{
      for(let y=r.y+40;y<r.y+r.h-60;y+=140)if(!cityLayout.roads.some(o=>o!==r&&o.w>o.h&&y+30>o.y&&y<o.y+o.h))surface({x:r.x+r.w/2-2,y,w:4,h:60},'#e6d6a8',.085);
    }
  }
  // Zebra crossings where the delivery route and main walks cross roads.
  function zebra(x,y,horizontalRoad,len){
    for(let i=0;i<7;i++){
      if(horizontalRoad)surface({x:x-90+i*28,y:y,w:14,h:len},'#f1e8c8',.09);
      else surface({x,y:y-90+i*28,w:len,h:14},'#f1e8c8',.09);
    }
  }
  zebra(2450,4100,true,280);zebra(2450,5200,true,240);zebra(2450,1700,true,240);zebra(7320,4240,false,240);zebra(4020,4100,true,280);

  // Street trees on the outer edge of sidewalks, lamps opposite.
  for(let x=1320;x<10900;x+=380){
    if(!onRoad(x,4030,40)&&Math.abs(x-2450)>120)tree(x,4030,x%3===0?1:0);
    if(!onRoad(x,4450,40))lamp(x,4450);
    if(!onRoad(x,1660,40)&&x>2900)lamp(x,1660);
    if(!onRoad(x,1980,40)&&x>7440)tree(x,1985,0);
  }
  for(let y=600;y<6300;y+=420){if(!onRoad(7160,y,40))lamp(7160,y);if(!onRoad(7480,y,40))tree(7485,y,y%840===0?1:0);}
  // Planted buffer: tree belt just outside the ring road.
  for(let x=1000;x<11200;x+=480){tree(x,90,0,false);tree(x,6710,x%960===0?1:0,false);}
  for(let y=300;y<6600;y+=480)tree(11310,y,0,false);

  // Lots and buildings.
  for(const plot of cityLayout.plots){
    const type=plot.type;
    const lotColor=type==='villa'?'#a4b88c':type==='house'?'#d3c3a1':type==='boarding'?'#d6c8a8':'#d5c9b1';
    surface(plot,lotColor,.065);
    const g=new THREE.Group();
    const cx=plot.bx??plot.x+plot.w/2,cy=plot.y+plot.h/2;
    g.position.set(toX(cx),0,toZ(cy));g.rotation.y=plot.facing;scene.add(g);
    const spec={shop:[6.9,6,8.6],villa:[9,7,6.6],apartment:[15,6.7,17],house:[5,6.6,6],boarding:[22,6,6.2],restaurant:[12,9,7.4]}[type];
    const [w,d,h]=spec;
    box(g,w,h,d,plot.color,0,h/2,0);
    box(g,w+.1,.4,d+.1,'#b5a38c',0,.2,0);
    if(type==='apartment'){
      for(let floor=1;floor<6;floor++){
        box(g,w+.15,.16,d+.15,'#f0e5ce',0,floor*2.8,0);
        for(let x=-w/2+1.2;x<w/2;x+=2.5)windowFrame(g,x,floor*2.8+1.25,d/2+.03,1.45,1.65);
      }
      roof(g,w,d,h,'#9e6a52');
      box(g,1.5,2.3,.13,'#566e60',0,1.15,d/2+.05);
      label(g,plot.name.toUpperCase(),0,2.75,d/2+.15,7,'#64796c','#fff0cf');
      for(const x of [-5.5,5.5])planter(g,x,d/2+.65,2);
    }else if(type==='villa'){
      box(g,w+.15,.16,d+.15,'#f0e5ce',0,2.85,0);
      for(let x=-w/2+1.2;x<w/2;x+=2.25)windowFrame(g,x,4.1,d/2+.03,1.2,1.65);
      roof(g,w,d,h);
      box(g,1.5,2.3,.13,'#566e60',0,1.15,d/2+.05);
      balcony(g,4.9,3.05,d/2+.15);
      for(const x of [-3.5,3.5])cyl(g,.13,2.9,'#eadfc9',x,1.45,d/2+.85);
      box(g,w+.1,.2,1.6,'#ddd0b9',0,3,d/2+.7);
      windowFrame(g,-2.9,1.45,d/2+.05,1.5,1.8);
      windowFrame(g,2.9,1.45,d/2+.05,1.5,1.8);
      planter(g,-5.9,2,1.1);planter(g,5.9,2,1.1);
      // Low walls with a generous gate opening on the street side.
      const fenceZ=plot.h/80-.2;
      for(const side of [-1,1]){
        box(g,4.8,.55,.18,'#d6c6ad',side*5.4,.27,fenceZ);
        for(let j=0;j<12;j++)box(g,.04,1.2,.04,'#4d5c4b',side*5.4-2.2+j*.4,.95,fenceZ);
        box(g,.35,1.8,.35,'#e6d8be',side*2.8,.9,fenceZ);
      }
      for(const side of [-1,1])sphere(g,.7,'#7d9a62',side*6.5,.6,fenceZ-.8);
      label(g,plot.name.toUpperCase(),0,1.3,fenceZ-.05,3.3,'#e7dfca','#4d6455');
      const fenceY=plot.facing===0?plot.y+plot.h-16:plot.y+8;
      block({x:plot.x+8,y:fenceY,w:plot.w/2-118,h:8});
      block({x:cx+118,y:fenceY,w:plot.w/2-126,h:8});
    }else if(type==='shop'){
      for(let floor=1;floor<3;floor++){
        box(g,w+.15,.16,d+.15,'#f0e5ce',0,floor*2.85,0);
        for(let x=-w/2+1.2;x<w/2;x+=2.25)windowFrame(g,x,floor*2.85+1.25,d/2+.03,1.2,1.65);
      }
      roof(g,w,d,h);
      for(const x of [-w/2+.3,w/2-.3])box(g,.28,h,.24,'#eee3cc',x,h/2,d/2+.1);
      balcony(g,w-.8,3.05,d/2+.1);
      box(g,w-.7,1.85,.12,'#668b86',0,1.12,d/2+.03);
      for(const x of [-2.2,0,2.2])box(g,.06,1.85,.2,'#dcd6bf',x,1.12,d/2+.12);
      box(g,w+.25,.14,1.4,'#7b8b6c',0,2.6,d/2+.5);
      for(let i=0;i<10;i++)box(g,(w+.25)/10,.03,1.4,i%2?'#e8ddc3':'#738668',-w/2+i*w/10,2.69,d/2+.5);
      label(g,plot.name,0,3.3,d/2+.35,w-.4,'#416552','#f4e4bd');
      planter(g,-w/2+.5,d/2+1,.9);
      if(plot.name==='CÀ PHÊ BÌNH AN'||plot.name==='QUÁN CƠM'){
        for(const x of [-1.3,1.3]){
          cyl(g,.38,.08,'#ab8761',x,.78,d/2+1.4);
          cyl(g,.055,.75,'#455d51',x,.39,d/2+1.4);
          for(const offset of [-.6,.6])box(g,.45,.45,.45,'#758872',x+offset,.22,d/2+1.4);
        }
      }
    }else if(type==='house'){
      // Narrow two-storey tube house with tiled hip roof.
      box(g,w+.15,.14,d+.15,'#efe2c8',0,3,0);
      roof(g,w,d,h,['#a9654a','#b4704f','#9c5f48'][Math.abs(Math.round(cx/260))%3]);
      box(g,2.2,2.3,.12,['#6f8a7d','#8a6f58','#5f7d86'][Math.abs(Math.round(cx/260))%3],-.7,1.15,d/2+.03);
      windowFrame(g,1.5,1.5,d/2+.03,1,1.2);
      windowFrame(g,0,4.4,d/2+.03,1.6,1.4);
      box(g,w-.6,.12,.8,'#e8dcc2',0,3.4,d/2+.4);
      for(let x=-w/2+.5;x<w/2-.3;x+=.32)box(g,.03,.7,.03,'#4e5f50',x,3.8,d/2+.78);
      sphere(g,.32,'#6f9a5c',w/2-.6,3.9,d/2+.55);
      box(g,w,.12,1,'#9aa38c',0,2.5,d/2+.5);
    }else if(type==='boarding'){
      // Two floors of rooms: ground doors, upper corridor with railing, end staircase.
      box(g,w+.15,.16,d+.15,'#efe2c8',0,3.05,0);
      roof(g,w,d,h,'#a25f48');
      for(let i=0;i<7;i++){
        const x=-w/2+1.8+i*3.05;
        box(g,.95,2.1,.1,['#5f7d86','#6f8a7d','#8a6f58'][i%3],x,1.05,d/2+.04);
        windowFrame(g,x+1.1,1.5,d/2+.03,.8,.9);
        box(g,.95,2.1,.1,'#6f8a7d',x,4.2,d/2+.04);
        windowFrame(g,x+1.1,4.5,d/2+.03,.8,.9);
      }
      box(g,w,.18,1.4,'#e3d6bb',0,3.1,d/2+.7);
      box(g,w,.07,.07,'#4e5f50',0,4.1,d/2+1.38);
      for(let x=-w/2;x<=w/2;x+=.5)box(g,.035,1,.035,'#4e5f50',x,3.65,d/2+1.38);
      for(let s=0;s<8;s++)box(g,1.1,.18,.35,'#c9bfa6',w/2+.7,.2+s*.38,d/2-.2-s*.35);
      label(g,plot.name,0,5.4,d/2+.1,6,'#7d4f3c','#fbe9c6','PHÒNG CHO THUÊ');
      // Clothes line and parked scooters in the front yard.
      for(const x of [-6,6]){cyl(g,.04,2,'#6b6b5f',x,1,d/2+3.2);}
      box(g,12,.02,.02,'#d0cfc4',0,1.9,d/2+3.2);
      for(let i=0;i<6;i++)box(g,.5,.7,.03,['#d77d6b','#6c9cb3','#e5c36b','#f1efe6'][i%4],-5+i*2,1.5,d/2+3.2);
      for(let i=0;i<5;i++){const s=new THREE.Group();s.position.set(-8+i*1.2,0,d/2+2);g.add(s);box(s,.42,.55,.85,['#7a9c9a','#c27e64','#e1c59a'][i%3],0,.62,0);for(const zz of [-.6,.6]){const wh=cyl(s,.28,.08,'#33403c',0,.28,zz);wh.rotation.z=Math.PI/2;}}
    }else if(type==='restaurant'){
      box(g,w+.15,.16,d+.15,'#f0e5ce',0,3.6,0);
      for(let x=-w/2+1.4;x<w/2;x+=2.4)windowFrame(g,x,5.1,d/2+.03,1.5,1.5);
      roof(g,w,d,h,'#9f5a44');
      box(g,w-1.2,2.4,.12,'#7a5a3f',0,1.3,d/2+.03);
      for(let x=-w/2+1;x<w/2;x+=1.6)box(g,.08,2.4,.18,'#d9c7a4',x,1.3,d/2+.1);
      box(g,w+.4,.16,2,'#8b3f2f',0,3.1,d/2+1);
      for(let i=0;i<14;i++)box(g,(w+.4)/14,.04,2,i%2?'#f1e1c0':'#a8463a',-w/2+i*w/14,3.2,d/2+1);
      label(g,plot.name,0,4.35,d/2+.15,7.2,'#8b3f2f','#fbe7c4',plot.sub);
      for(const [tx,tz] of [[-4,2.8],[-1.2,2.8],[1.6,2.8],[4.2,2.8]]){
        cyl(g,.45,.06,'#c99e6a',tx,.78,d/2+tz-.6);cyl(g,.05,.75,'#5a4a3a',tx,.39,d/2+tz-.6);
        for(const o of [-.65,.65])box(g,.4,.45,.4,'#b57a52',tx+o,.22,d/2+tz-.6);
      }
      // Delivery court: painted bay, pallet and parked van inside the lot.
      const c=plot.court;
      surface(c,'#b9b39f',.09);
      surface({x:c.x+20,y:c.y+20,w:c.w-40,h:6},'#f2d36b',.1);
      surface({x:c.x+20,y:c.y+c.h-26,w:c.w-40,h:6},'#f2d36b',.1);
      label(scene,'SÂN GIAO HÀNG',toX(c.x+c.w/2),2.4,toZ(c.y+40),3.6,'#4d6a5b','#fbefcf','',true);
      const van=new THREE.Group();van.position.set(toX(c.x+c.w/2),0,toZ(c.y+220));scene.add(van);
      box(van,1.8,1.9,4,'#e9e6dc',0,1.2,-.3);box(van,1.75,1.3,1.3,'#d5d2c6',0,.95,2.2);box(van,1.5,.55,.05,'#9fc4c6',0,1.4,2.86);
      for(const x of [-.92,.92])for(const zz of [-1.6,1.9]){const wh=cyl(van,.36,.2,'#33403c',x,.36,zz);wh.rotation.z=Math.PI/2;}
      block({x:c.x+c.w/2-40,y:c.y+120,w:80,h:200});
      for(let i=0;i<3;i++)box(scene,.9,.6,.9,'#b79a69',toX(c.x+c.w/2)+.6,.3+i*.6,toZ(c.y+400));
      block({x:c.x+c.w/2-2,y:c.y+380,w:44,h:40});
    }
    const footprint={x:cx-w*20,y:cy-d*20,w:w*40,h:d*40};
    block(footprint);
    buildings.push({plot,footprint,group:g});
  }

  // (10) Lake: organic water body, promenade ring, lawn, willows, benches, pavilion and pier.
  const shapeMesh=(pts,color,height,material)=>{
    const s=new THREE.Shape(pts.map(p=>new THREE.Vector2(toX(p.x),-toZ(p.y))));
    const geo=new THREE.ShapeGeometry(s);geo.rotateX(-Math.PI/2);
    const m=new THREE.Mesh(geo,material||mat(color));m.position.y=height;m.receiveShadow=true;scene.add(m);return m;
  };
  shapeMesh(cityLayout.lakeOutline(1.32),'#a4b88d',.05);
  shapeMesh(cityLayout.lakeOutline(1.13),'#d8c9a9',.06);
  shapeMesh(cityLayout.lakeOutline(1.05),'#b4a37f',.065);
  shapeMesh(cityLayout.lakeOutline(1),null,.075,new THREE.MeshStandardMaterial({color:'#6fa6ab',roughness:.25,metalness:.1}));
  for(const r of cityLayout.lakeStrips())block(r);
  const ring=cityLayout.lakeOutline(1.23,28);
  ring.forEach((p,i)=>{
    if(p.y>3990)return;
    if(i%2===0)tree(p.x,p.y,i%6===0?1:2);
    else if(i%4===1)lamp(p.x,p.y);
  });
  const benchRing=cityLayout.lakeOutline(1.17,16);
  benchRing.forEach((p,i)=>{if(i%3===0&&p.y<3950){const a=Math.atan2(p.x-9100,p.y-3250);bench(p.x,p.y,a);}});
  // Pavilion (chòi nghỉ) on the east shore, inside the park.
  {
    const p=cityLayout.lakeOutline(1.2,16)[0];
    const g=new THREE.Group();g.position.set(toX(p.x+40),0,toZ(p.y));scene.add(g);
    box(g,4,.25,4,'#cdbb98',0,.12,0);
    for(const x of [-1.6,1.6])for(const zz of [-1.6,1.6])cyl(g,.12,2.8,'#8a5d3f',x,1.5,zz);
    const r=mesh4(g);r.position.y=3.5;
    block({x:p.x+40-80,y:p.y-80,w:20,h:20});block({x:p.x+40+60,y:p.y-80,w:20,h:20});
    block({x:p.x+40-80,y:p.y+60,w:20,h:20});block({x:p.x+40+60,y:p.y+60,w:20,h:20});
    decorations.push(g);
  }
  function mesh4(g){const geo=new THREE.ConeGeometry(3.6,1.6,4);geo.rotateY(Math.PI/4);const m=new THREE.Mesh(geo,mat('#a5604a'));m.castShadow=true;g.add(m);return m;}
  // Wooden viewing pier on the south shore (visual only, the shore stays walkable).
  {
    const south=cityLayout.lakeOutline(1,16)[4];
    surface({x:south.x-60,y:south.y-260,w:120,h:300},'#9c7a55',.11);
    label(scene,'HỒ BÌNH AN',toX(south.x),2.6,toZ(south.y+140),6.5,'#e9dfc6','#4c6e60','CÔNG VIÊN VEN HỒ',true);
  }

  // (7) Lakeside residential gate across the boulevard; pillars stay outside the carriageway.
  {
    const gx=cityLayout.points[4].x;
    for(const y of [3990,4490]){
      box(scene,1,6.2,1,'#e5d5b7',toX(gx),3.1,toZ(y));
      box(scene,1.5,.3,1.5,'#aa7956',toX(gx),6.3,toZ(y));
      block({x:gx-20,y:y-20,w:40,h:40});
    }
    box(scene,.9,.8,13.4,'#e9dcc0',toX(gx),6.1,toZ(4240));
    const tiles=box(scene,1.8,.18,13.8,'#a76a4e',toX(gx),6.65,toZ(4240));tiles.castShadow=true;
    label(scene,'KHU DÂN CƯ VEN HỒ',toX(gx),5.2,toZ(4240),7.5,'#506a57','#f3e3be','CỔNG KHU · BÌNH AN',true,-Math.PI/2);
    for(const y of [3930,4550])sphere(scene,.8,'#7f9d63',toX(gx),.6,toZ(y));
  }

  // Apartment forecourt trees and benches, leaving each approach free.
  for(const p of cityLayout.plots.filter(p=>p.type==='apartment')){
    for(const dx of [-300,300])tree(p.x+p.w/2+dx,p.y+p.h-40,0);
    bench(p.x+p.w/2+180,p.y+p.h-120);
  }
  // Old quarter: potted plants and scooters along lanes give scale.
  for(let i=0;i<10;i++)scooter(2620+i*420,5490,['#7a9c9a','#c27e64','#e1c59a'][i%3],Math.PI/2);

  // Orange delivery route markings (boarding house -> market -> restaurant -> lake gate).
  const route=cityLayout.deliveryRoute;
  for(let i=0;i<route.length-1;i++){
    if(i===3)continue; // return leg from the market gate repeats the previous segment
    const a=route[i],b=route[i+1],len=Math.hypot(b.x-a.x,b.y-a.y);
    for(let t=40;t<len-20;t+=150){
      const x=a.x+(b.x-a.x)*t/len,y=a.y+(b.y-a.y)*t/len;
      const dash=box(scene,(b.x!==a.x?60:14)/40,.02,(b.y!==a.y?60:14)/40,'#e8893a',toX(x),.11,toZ(y));
      dash.castShadow=false;
    }
  }

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
