import * as THREE from './three.module.min.js';
import {buildCity} from './city.js';
// A fictional wholesale-market district, inspired by Vietnamese market logistics.
// The original playable neighborhood remains in the northwest corner.


// ==================== BẾN SÔNG CHỢ NỔI & KÊNH NƯỚC MIỀN TÂY ====================
export const westMarket={
  tower:{x:1550,y:1700},
  pavilion:{x:850,y:1950},
  food:{x:650,y:2750},
  oldTown:{x:850,y:4770},
  truckYard:{x:120,y:3330,w:1320,h:1110}
};

function buildRiverCanal(scene, box, cyl, sphere, label, mat, toX, toZ, obstacles) {
  // River water body positioned openly on the west
  const waterGeo = new THREE.PlaneGeometry(50, 140);
  const waterMat = new THREE.MeshStandardMaterial({
    color: '#1a5276',
    roughness: 0.1,
    metalness: 0.7,
    transparent: true,
    opacity: 0.95
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(-34, 0.05, 25);
  scene.add(water);

  // Stone promenade along the river (x = -13 in Three.js = x = 280 in world)
  box(scene, 1.2, 0.4, 110, '#7f8c8d', -13, 0.2, 25);
  
  // Railing with generous OPEN GAPS for access to piers
  for(let z = -25; z <= 75; z += 3.5){
    // Leave 8-meter open gaps at z = 0, 25, 50 for direct walking onto piers
    if (Math.abs(z - 0) < 4.5 || Math.abs(z - 26) < 4.5 || Math.abs(z - 52) < 4.5) continue;
    cyl(scene, 0.04, 1.0, '#2c3e50', -12.8, 0.7, z);
    box(scene, 0.05, 0.06, 3.6, '#34495e', -12.8, 1.1, z + 1.75);
    box(scene, 0.05, 0.06, 3.6, '#34495e', -12.8, 0.6, z + 1.75);
  }

  // 3 Wide Open Wooden Piers extending into water (no blocking walls!)
  for(const pz of [0, 26, 52]){
    const pier = new THREE.Group();
    pier.position.set(-20, 0.28, pz);
    box(pier, 14, 0.2, 4.5, '#795548', 0, 0, 0); // Wide 4.5m pier deck!
    // Pier pilings
    for(const px of [-5.5, 0, 5.5]){
      cyl(pier, 0.16, 2.2, '#4e342e', px, -1, -1.9);
      cyl(pier, 0.16, 2.2, '#4e342e', px, -1, 1.9);
    }
    label(pier, 'BẾN TÀU CHỢ NỔI', 0, 1.4, 0, 4.5, '#5d4037', '#fff');
    scene.add(pier);
  }

  // Wooden Boats
  function woodenBoat(x, z, rot, cargoType){
    const b = new THREE.Group();
    b.position.set(x, 0.25, z);
    b.rotation.y = rot;
    box(b, 2.4, 0.8, 8.5, '#6d4c41', 0, 0, 0);
    box(b, 2.1, 0.7, 8.1, '#4e342e', 0, 0.1, 0);
    box(b, 0.35, 0.8, 1.8, '#3e2723', 0, 0.45, 4.3);
    box(b, 0.35, 0.8, 1.8, '#3e2723', 0, 0.45, -4.3);
    if(cargoType === 'watermelon'){
      for(let r = -2.5; r <= 2.5; r += 0.8){
        for(let c = -0.6; c <= 0.6; c += 0.6){
          const m = sphere(b, 0.28, '#196f3d', c, 0.45, r);
          m.scale.set(1, 1.25, 1);
        }
      }
    } else if(cargoType === 'coconut'){
      for(let r = -2.5; r <= 2.5; r += 0.9){
        sphere(b, 0.34, '#d4ac0d', -0.35, 0.5, r);
        sphere(b, 0.34, '#b7950b', 0.35, 0.5, r);
      }
    } else if(cargoType === 'flowers'){
      for(let r = -2.5; r <= 2.5; r += 1.0){
        cyl(b, 0.38, 0.4, '#c0392b', -0.4, 0.4, r);
        sphere(b, 0.38, '#f1c40f', -0.4, 0.75, r);
        cyl(b, 0.38, 0.4, '#c0392b', 0.4, 0.4, r);
        sphere(b, 0.38, '#e67e22', 0.4, 0.75, r);
      }
    }
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 3.5, 8, 1, true, 0, Math.PI), mat('#8d6e63'));
    canopy.position.set(0, 0.95, -0.6);
    b.add(canopy);
    canopy.rotation.z = Math.PI / 2;
    scene.add(b);
  }

  woodenBoat(-29, 0, 0.08, 'watermelon');
  woodenBoat(-30, 26, -0.05, 'coconut');
  woodenBoat(-29, 52, 0.1, 'flowers');

  // Coconut palms spaced comfortably apart
  for(let z = -20; z <= 70; z += 18){
    const palm = new THREE.Group();
    palm.position.set(-11.5, 0, z);
    cyl(palm, 0.22, 5.0, '#795548', 0, 2.5, 0);
    palm.rotation.z = 0.18;
    for(let i = 0; i < 6; i++){
      const frond = box(palm, 2.8, 0.08, 0.5, '#2e7d32', 1.4 * Math.cos(i * Math.PI / 3), 5.0, 1.4 * Math.sin(i * Math.PI / 3));
      frond.rotation.y = i * Math.PI / 3;
      frond.rotation.z = -0.35;
    }
    scene.add(palm);
  }
  // Only stop player at deep water edge (x = 40 in world coordinates)
  obstacles.push({ x: 20, y: 100, w: 30, h: 3400 });
}
function buildClockTower(scene, box, cyl, sphere, label, mat, toX, toZ, obstacles) {
  const g = new THREE.Group();
  g.position.set(toX(westMarket.tower.x), 0, toZ(westMarket.tower.y));
  // Roundabout island base
  cyl(g, 7.5, 0.4, '#abb2b9', 0, 0.2, 0);
  cyl(g, 6.8, 0.3, '#58d68d', 0, 0.4, 0); // grass lawn
  // Square brick tower body
  box(g, 3.4, 8.5, 3.4, '#d4ac0d', 0, 4.5, 0);
  box(g, 3.8, 0.4, 3.8, '#935116', 0, 8.8, 0); // cornice
  // Upper clock level
  box(g, 3.1, 2.5, 3.1, '#f9e79f', 0, 10.2, 0);
  // 4 clock faces
  for(const rot of [0, Math.PI/2, Math.PI, -Math.PI/2]){
    const face = cyl(g, 1.05, 0.08, '#ffffff', 0, 10.2, 1.58);
    face.rotation.x = Math.PI / 2;
    face.rotation.y = rot;
    // Clock hands
    box(g, 0.08, 0.7, 0.05, '#17202a', 0, 10.45, 1.63);
    box(g, 0.5, 0.08, 0.05, '#17202a', 0.2, 10.2, 1.63);
  }
  // 3-tiered pagoda roof (Mái tam cấp ngói đỏ)
  box(g, 3.8, 0.4, 3.8, '#c0392b', 0, 11.6, 0);
  box(g, 2.6, 0.4, 2.6, '#a93226', 0, 12.2, 0);
  box(g, 1.5, 0.4, 1.5, '#922b21', 0, 12.8, 0);
  cyl(g, 0.06, 2.4, '#f1c40f', 0, 14.1, 0); // spire
  // Decorative Vietnamese flag on tower
  box(g, 1.2, 0.8, 0.03, '#e74c3c', 0.6, 14.4, 0);
  sphere(g, 0.18, '#f1c40f', 0.6, 14.4, 0.02); // star
  label(g, 'THÁP ĐỒNG HỒ BÌNH AN', 0, 7.8, 1.75, 3.2, '#935116', '#fff');
  scene.add(g);
  obstacles.push({ x: westMarket.tower.x-30, y: westMarket.tower.y-30, w: 60, h: 60 }); // Small core only, wide roundabout lane around!
}

// ==================== KHU CHỢ NHÀ LỒNG SỐ 2 (COVERED MARKET PAVILION 2) ====================
function buildSecondMarketPavilion(scene, box, cyl, sphere, label, person, mat, toX, toZ, obstacles) {
  const g = new THREE.Group();
  g.position.set(toX(westMarket.pavilion.x), 0, toZ(westMarket.pavilion.y));
  const w = 26, d = 16;
  // Floor slab
  box(g, w, 0.18, d, '#d5dbdb', 0, 0.09, 0);
  // Pillars
  for(let x = -w/2 + 1; x <= w/2 - 1; x += 6){
    for(let z = -d/2 + 1; z <= d/2 - 1; z += 7){
      cyl(g, 0.18, 4.8, '#7f8c8d', x, 2.4, z);
    }
  }
  // Curved corrugated metal roof
  const roof = box(g, w + 1.2, 0.15, d + 1.2, '#2980b9', 0, 5.0, 0);
  roof.rotation.x = -0.04;
  label(g, 'NHÀ LỒNG 2 · KHU THỊT & TRÁI CÂY TƯƠI', 0, 5.6, d/2 + 0.1, 14, '#1b4f72', '#f9e79f', 'HỌP CHỢ CẢ NGÀY · GIÁ BÌNH DÂN');
  label(g, 'NHÀ LỒNG 2 · KHU THỊT & TRÁI CÂY TƯƠI', 0, 5.6, -d/2 - 0.1, 14, '#1b4f72', '#f9e79f', '', false, Math.PI);

  // 8 Market Stalls inside Pavilion 2
  const stallSpecs = [
    { name: 'THỊT HEO NÓNG · BÁC TƯ', color: '#e74c3c', type: 'meat', sign: '35K', x: -8, z: -3.5 },
    { name: 'GÀ VỊT THẢ VƯỜN · CÔ LIÊN', color: '#f39c12', type: 'poultry', sign: '40K', x: -2.5, z: -3.5 },
    { name: 'CUA BIỂN CÀ MAU · CHÚ TÁM', color: '#27ae60', type: 'crab', sign: '55K', x: 3, z: -3.5 },
    { name: 'VỰA SẦU RIÊNG RI6 · DÌ ÚT', color: '#d4ac0d', type: 'durian', sign: '60K', x: 8.5, z: -3.5 },
    { name: 'DƯA HẤU & BƯỞI · BÁC BẢY', color: '#2ecc71', type: 'melon', sign: '20K', x: -8, z: 3.5 },
    { name: 'TIỆM HOA TƯƠI · CÔ MAI', color: '#e91e63', type: 'flower', sign: '15K', x: -2.5, z: 3.5 },
    { name: 'SẠP QUẦN ÁO · CHỊ BA', color: '#9b59b6', type: 'clothes', sign: '30K', x: 3, z: 3.5 },
    { name: 'ĐỒ GỐM SỨ · CHÚ ĐỒNG', color: '#e67e22', type: 'pottery', sign: '25K', x: 8.5, z: 3.5 }
  ];

  stallSpecs.forEach((s, idx) => {
    const sg = new THREE.Group();
    sg.position.set(s.x, 0, s.z);
    if(s.z > 0) sg.rotation.y = Math.PI;
    // Stall counter
    box(sg, 4.2, 0.95, 1.8, '#a0855b', 0, 0.48, 0);
    box(sg, 4.4, 0.12, 2.0, '#d2b48c', 0, 1.0, 0);
    // Overhead sign
    label(sg, s.name, 0, 2.65, 0, 4.0, '#fff5db', '#2c3e50', s.sign);
    // Awning
    const awn = box(sg, 4.3, 0.08, 1.2, s.color, 0, 2.2, 0.6);
    awn.rotation.x = -0.22;
    // Vendor
    const v = person(['#d35400', '#2980b9', '#16a085', '#8e44ad'][idx % 4]);
    v.position.set(0, 0, -0.6);
    sg.add(v);

    // Products on counter
    if(s.type === 'meat'){
      box(sg, 0.8, 0.25, 0.5, '#c0392b', -1.2, 1.15, 0);
      box(sg, 0.9, 0.3, 0.6, '#922b21', 0.2, 1.18, 0);
      cyl(sg, 0.28, 0.25, '#784212', 1.2, 1.15, 0); // chopping block
    } else if(s.type === 'poultry'){
      cyl(sg, 0.38, 0.45, '#f4d03f', -1, 1.25, 0);
      cyl(sg, 0.36, 0.42, '#f39c12', 0.8, 1.23, 0);
      box(sg, 0.8, 0.5, 0.6, '#b7950b', 0, 1.28, 0); // cage
    } else if(s.type === 'crab'){
      cyl(sg, 0.65, 0.22, '#3498db', -0.8, 1.12, 0); // water tub
      for(let k = 0; k < 3; k++) sphere(sg, 0.14, '#c0392b', -0.8 + (k-1)*0.22, 1.26, 0);
    } else if(s.type === 'durian'){
      for(let k = 0; k < 4; k++){
        const dur = sphere(sg, 0.26, '#7d6608', -1.1 + k*0.7, 1.28, 0);
        dur.scale.set(1, 1.25, 1);
      }
    } else if(s.type === 'melon'){
      for(let k = 0; k < 3; k++){
        sphere(sg, 0.28, '#1e8449', -1 + k*0.7, 1.28, 0.2);
        sphere(sg, 0.25, '#27ae60', -0.7 + k*0.7, 1.25, -0.2);
      }
    } else if(s.type === 'flower'){
      for(let k = 0; k < 3; k++){
        cyl(sg, 0.25, 0.35, '#a04000', -1 + k*0.8, 1.2, 0);
        sphere(sg, 0.32, ['#f1c40f', '#e67e22', '#e91e63'][k], -1 + k*0.8, 1.5, 0);
      }
    } else if(s.type === 'clothes'){
      box(sg, 1.2, 0.7, 0.4, '#8e44ad', -0.8, 1.35, 0);
      box(sg, 1.1, 0.65, 0.4, '#1abc9c', 0.8, 1.33, 0);
    } else {
      for(let k = 0; k < 3; k++){
        cyl(sg, 0.28, 0.35, '#ba4a00', -1 + k*0.8, 1.2, 0); // pots
      }
    }

    g.add(sg);
    obstacles.push({ x: westMarket.pavilion.x + (s.x - 1.2)*40, y: westMarket.pavilion.y + (s.z - 0.5)*40, w: 100, h: 45 });
  });

  scene.add(g);
}

// ==================== PHỐ ẨM THỰC ĐÊM SẦM UẤT (GRAND FOOD PLAZA) ====================
function buildFoodPlaza(scene, box, cyl, sphere, label, person, mat, toX, toZ, obstacles) {
  const g = new THREE.Group();
  g.position.set(toX(westMarket.food.x), 0, toZ(westMarket.food.y));
  label(g, 'PHỐ ẨM THỰC ĐÊM BÌNH AN', 0, 4.8, 0, 16, '#c0392b', '#f9e79f', 'ĐẶC SẢN 3 MIỀN · BÁN XUYÊN ĐÊM');

  const foodStalls = [
    { name: 'BÚN BÒ HUẾ CÔ NHUNG', dish: 'Bún bò tái nạm', x: -11, color: '#c0392b' },
    { name: 'BÁNH XÈO MIỀN TÂY', dish: 'Bánh xèo giòn rụm', x: -5.5, color: '#f39c12' },
    { name: 'CHÈ BA MÀU & SƯƠNG SA', dish: 'Chè hạt lựu cốt dừa', x: 0, color: '#16a085' },
    { name: 'CƠM TẤM ĐÊM SÀI GÒN', dish: 'Sườn bì chả nướng than', x: 5.5, color: '#d35400' },
    { name: 'TRÀ TẮC & NƯỚC SÂM', dish: 'Nước mía sâm dứa', x: 11, color: '#27ae60' }
  ];

  foodStalls.forEach((s, i) => {
    const cart = new THREE.Group();
    cart.position.set(s.x, 0, -2);
    // Cart body
    box(cart, 3.4, 1.1, 1.6, '#f4f6f7', 0, 0.55, 0);
    box(cart, 3.6, 0.1, 1.8, '#bdc3c7', 0, 1.15, 0);
    // Glass display case
    box(cart, 3.2, 0.9, 1.3, '#d4efdf', 0, 1.65, 0);
    // Overhead light box
    label(cart, s.name, 0, 2.65, 0, 3.4, '#fff', s.color);
    const cook = person(['#e74c3c', '#e67e22', '#2ecc71', '#9b59b6', '#1abc9c'][i]);
    cook.position.set(0, 0, -0.7);
    cart.add(cook);

    // Outdoor dining tables & red plastic stools
    for(const tz of [2.5, 5]){
      box(cart, 1.4, 0.08, 1.1, '#3498db', (i%2?0.6:-0.6), 0.75, tz);
      cyl(cart, 0.05, 0.75, '#7f8c8d', (i%2?0.6:-0.6), 0.38, tz);
      // Plastic stools
      for(const sx of [-0.65, 0.65]){
        cyl(cart, 0.22, 0.38, '#e74c3c', (i%2?0.6:-0.6) + sx, 0.19, tz);
      }
    }
    g.add(cart);
    obstacles.push({ x: westMarket.food.x + (s.x - 1.8)*40, y: westMarket.food.y-116, w: 144, h: 72 });
  });

  // Hanging glowing lanterns overhead across food plaza
  for(let x = -14; x <= 14; x += 2.8){
    for(let z = -1; z <= 6; z += 3.5){
      const lan = sphere(g, 0.18, '#e74c3c', x, 3.8, z);
      lan.material.emissive = new THREE.Color('#e74c3c');
      lan.material.emissiveIntensity = 0.7;
    }
  }

  scene.add(g);
}

// ==================== KHU NHÀ PHỐ CỔ SÀI GÒN / CHỢ LỚN THẬP NIÊN 90 ====================
function buildHistoricTownhouses(scene, box, cyl, sphere, label, mat, toX, toZ, obstacles) {
  const g = new THREE.Group();
  g.position.set(toX(westMarket.oldTown.x), 0, toZ(westMarket.oldTown.y));
  // 6 3-story classic townhouses
  const shops = [
    { name: 'TIỆM VÀNG KIM BÌNH', color: '#f1c40f' },
    { name: 'HIỆU THUỐC BẮC ĐỒNG NHÂN', color: '#27ae60' },
    { name: 'ĐẠI LÝ BIA & NƯỚC NGỌT', color: '#e67e22' },
    { name: 'TIỆM MAY ÂU PHỤC', color: '#8e44ad' },
    { name: 'QUÁN CÀ PHÊ VỢT', color: '#795548' },
    { name: 'TIỆM HỚT TÓC THANH NIÊN', color: '#2980b9' }
  ];

  shops.forEach((s, idx) => {
    const hg = new THREE.Group();
    hg.position.set(idx * 5.6 - 14, 0, 0);
    // 3 stories
    box(hg, 5.2, 8.5, 4.5, '#f5eef8', 0, 4.25, 0);
    box(hg, 5.4, 0.3, 4.8, '#935116', 0, 8.6, 0); // eaves
    box(hg, 4.2, 2.6, 0.1, s.color, 0, 1.3, 2.3); // ground storefront
    // Balconies
    box(hg, 4.4, 0.18, 0.9, '#bdc3c7', 0, 3.4, 2.7);
    box(hg, 4.4, 0.18, 0.9, '#bdc3c7', 0, 6.2, 2.7);
    // Green wooden shutters
    box(hg, 1.4, 1.6, 0.1, '#1e8449', -1.2, 4.5, 2.3);
    box(hg, 1.4, 1.6, 0.1, '#1e8449', 1.2, 4.5, 2.3);
    box(hg, 1.4, 1.6, 0.1, '#1e8449', -1.2, 7.2, 2.3);
    box(hg, 1.4, 1.6, 0.1, '#1e8449', 1.2, 7.2, 2.3);
    label(hg, s.name, 0, 3.0, 2.4, 4.5, '#fff', s.color);
    g.add(hg);
    obstacles.push({ x: westMarket.oldTown.x + (idx * 5.6 - 16.7)*40, y: westMarket.oldTown.y-96, w: 216, h: 222 });
  });

  scene.add(g);
}

export function buildWholesaleDistrict({scene,box,cyl,sphere,label,person,mat,toX,toZ,world}){
function palletJack(g,x,z,angle=0){
  const pj=new THREE.Group();pj.position.set(x,0,z);pj.rotation.y=angle;
  box(pj,.18,.8,.12,'#e5a93b',0,.45,.8); // handle column
  box(pj,.4,.06,.06,'#222629',0,.85,.8); // t-bar
  box(pj,.5,.15,.22,'#e5a93b',0,.2,.65); // pump body
  for(const fx of [-.18,.18]){
    box(pj,.12,.08,1.2,'#e5a93b',fx,.1,0); // fork prongs
    cyl(pj,.05,.08,'#2a2e30',fx,.05,-.55).rotation.z=Math.PI/2;
  }
  cyl(pj,.09,.12,'#2a2e30',0,.09,.65).rotation.z=Math.PI/2; // steer wheel
  g.add(pj);return pj;
}
function forklift(scene,x,z,angle=0,color='#e58e26'){
  const fl=new THREE.Group();fl.position.set(x,0,z);fl.rotation.y=angle;
  // Body & counterweight
  box(fl,1.4,.8,1.8,color,0,.6,-.2);
  box(fl,1.35,.6,.6,'#33373a',0,.6,-1.0); // rear counterweight
  // Overhead cage
  for(const cx of [-.6,.6])for(const cz of [-.6,.4])box(fl,.06,1.4,.06,'#222527',cx,1.4,cz);
  box(fl,1.3,.05,1.1,'#222527',0,2.1,-.1);
  box(fl,.45,.1,.45,'#1c1d1f',0,.95,-.2); // seat
  cyl(fl,.03,.6,'#71787c',0,1.25,.3); // steering column
  // Front mast & forks
  for(const mx of [-.45,.45])box(fl,.08,2.2,.08,'#2a2d30',mx,1.15,.8);
  box(fl,1.1,.08,.06,'#2a2d30',0,1.8,.8);
  box(fl,1.1,.08,.06,'#2a2d30',0,.6,.8);
  for(const fx of [-.28,.28]){
    box(fl,.08,.6,.05,'#2a2d30',fx,.55,.86);
    box(fl,.08,.05,1.1,'#2a2d30',fx,.25,1.38); // lifting prongs
  }
  // Pallet loaded on forks
  box(fl,1.2,.12,1.0,'#9e8156',0,.35,1.4);
  box(fl,1.0,.45,.85,'#d69145',0,.63,1.4); // produce box on pallet
  // 4 wheels
  for(const wx of [-.7,.7]){
    const fw=cyl(fl,.32,.18,'#1c1e20',wx,.32,.5);fw.rotation.z=Math.PI/2;
    const rw=cyl(fl,.25,.14,'#1c1e20',wx,.25,-.8);rw.rotation.z=Math.PI/2;
  }
  scene.add(fl);return fl;
}
function gasStation(scene,x,z){
  const gs=new THREE.Group();gs.position.set(x,0,z);
  // Concrete island
  box(gs,6,.2,2.4,'#c8c8c0',0,.1,0);
  // Canopy columns and roof
  for(const cx of [-2.2,2.2]){
    cyl(gs,.14,4.2,'#73857d',cx,2.1,0);
  }
  box(gs,7.2,.35,3.6,'#2e6b52',0,4.3,0); // green canopy
  box(gs,7.3,.12,3.7,'#e67e22',0,4.2,0); // orange trim
  // Two fuel dispensers
  for(const px of [-1,1]){
    box(gs,.65,1.4,.55,'#eef1f2',px,.8,0);
    box(gs,.55,.3,.05,'#27ae60',px,1.2,.28); // screen/logo
    cyl(gs,.03,1.2,'#2c3e50',px+.38,.7,.1); // hose
  }
  scene.add(gs);return gs;
}

const obstacles=[],halls=[],vehicles=[];const W=7600,H=6400;
function slab(x,y,w,h,color,height=.025){return box(scene,w/40,height,h/40,color,toX(x+w/2),height/2,toZ(y+h/2));}
const roads=[{x:1640,y:120,w:240,h:3270},{x:90,y:1260,w:7420,h:240},{x:1640,y:2500,w:5870,h:240},{x:4320,y:120,w:240,h:3270},{x:1640,y:3190,w:5870,h:200},{x:7240,y:120,w:240,h:3270},{x:1440,y:3710,w:440,h:210}];
for(const r of roads){slab(r.x-22,r.y-22,r.w+44,r.h+44,'#c1c6b2',.04);slab(r.x,r.y,r.w,r.h,'#687b78',.055);if(r.h>r.w){for(let yy=r.y+40;yy<r.y+r.h;yy+=160)slab(r.x+r.w/2-3,yy,6,70,'#e6dcaf',.065);}else for(let xx=r.x+40;xx<r.x+r.w;xx+=160)slab(xx,r.y+r.h/2-3,70,6,'#e6dcaf',.065);}
// Give the west-side buildings separate plazas with pedestrian links.
slab(210,1590,1220,740,'#d7caab',.025);
slab(100,2490,1150,470,'#dfc9a4',.025);
slab(1220,2330,160,1000,'#d7caab',.025);
slab(180,4500,1330,490,'#d7caab',.025);
// Crossings connect pedestrian zones to the larger halls.
for(let i=0;i<8;i++){slab(1650+i*27,1110,14,92,'#f4e7bf',.07);slab(1940,1270+i*27,92,14,'#f4e7bf',.07);}
const hallSpecs=[{x:2100,y:250,w:880,h:850,name:'NHÀ LỒNG A',sub:'RAU CỦ · HÀNG SỈ',color:'#6e9687',produce:'#82a36a'},{x:3260,y:250,w:880,h:850,name:'NHÀ LỒNG B',sub:'TRÁI CÂY · VỰA LỚN',color:'#b39368',produce:'#d6ab58'},{x:2100,y:1680,w:880,h:640,name:'NHÀ LỒNG C',sub:'CỦ QUẢ · NÔNG SẢN',color:'#7891a0',produce:'#c0a16a'},{x:3260,y:1680,w:880,h:640,name:'NHÀ LỒNG D',sub:'KHU ĐÓNG GÓI',color:'#a98675',produce:'#91aa71'},{x:4800,y:250,w:950,h:850,name:'NHÀ LỒNG E',sub:'HOA TƯƠI · CÂY KIỂNG',color:'#aa8296',produce:'#cc88a4'},{x:6050,y:250,w:950,h:850,name:'NHÀ LỒNG F',sub:'GẠO · ĐẬU · GIA VỊ',color:'#ac935f',produce:'#cfb076'},{x:4800,y:1680,w:2200,h:640,name:'NHÀ LỒNG G',sub:'BAO BÌ · VẬT TƯ CHỢ',color:'#75968f',produce:'#bca084'}];
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

// Hall specific commercial themed props
if(h.name==='NHÀ LỒNG A'){
  // Highland Veg: pallets, hydraulic pallet jacks, giant platform scale
  palletJack(g,-w/2+4,0,Math.PI/2);
  palletJack(g,w/2-4,-d/4,-Math.PI/2);
  // Big platform scale
  box(g,1.4,.15,1.4,'#778a82',0,.08,d/4);
  cyl(g,.04,1.1,'#566760',.6,.6,d/4);
  box(g,.3,.2,.08,'#2f3e37',.6,1.15,d/4);
} else if(h.name==='NHÀ LỒNG B'){
  // Mekong Fruits: watermelon pyramids, durian baskets
  for(const pos of [[-w/2+4,d/4],[w/2-4,-d/4],[0,-d/4]]){
    // Watermelon pyramid
    for(let r=0;r<3;r++)for(let c=0;c<3-r;c++){
      const wm=sphere(g,.24,'#2d6930',pos[0]+(c-(3-r)/2)*.48+.24,.24+r*.38,pos[1]);
      wm.scale.set(1,1.18,1);
    }
  }
  palletJack(g,0,d/4,0);
} else if(h.name==='NHÀ LỒNG C'){
  // Rice & Dried goods: burlap rice sacks stacked high
  for(const pos of [[-w/2+4,0],[w/2-4,d/4]]){
    for(let s=0;s<6;s++){
      const sack=box(g,.8,.32,1.1,['#c5a059','#bca36f','#d0af6b'][s%3],pos[0]+(s%2===0?-.25:.25),.16+Math.floor(s/2)*.3,pos[1]);
      sack.rotation.y=(s%2)*.2;
    }
  }
  palletJack(g,-w/2+4,d/4,Math.PI/3);
} else if(h.name==='NHÀ LỒNG D'){
  // Seafood & Foam box packaging hub
  for(const pos of [[-w/2+4,-d/4],[w/2-4,d/4],[0,d/4]]){
    for(let s=0;s<8;s++){
      box(g,.75,.35,.9,'#f4f6f7',pos[0]+(s%2===0?-.3:.3),.18+Math.floor(s/2)*.35,pos[1]);
      box(g,.76,.04,.91,'#f39c12',pos[0]+(s%2===0?-.3:.3),.18+Math.floor(s/2)*.35,pos[1]); // orange tape
    }
  }
}

for(const x of [-1.1,1.1]){box(g,.13,.13,d,'#e4e3bb',x,4.9,0);}halls.push({...h,roofMat});}
// A long parking area with bay markings, gate and a check-in booth.
slab(westMarket.truckYard.x,westMarket.truckYard.y,westMarket.truckYard.w,westMarket.truckYard.h,'#9ba99b',.025);for(let row=0;row<3;row++)for(let i=0;i<5;i++){const x=190+i*240,y=3360+row*340;slab(x,y,5,310,'#e8e3bb',.05);slab(x,y+310,190,5,'#e8e3bb',.05);}label(scene,'BÃI XE TẢI',toX(750),4.5,toZ(3350),12,'#628373','#fff1cd','BỐC DỠ · GIAO NHẬN',true);
box(scene,2.7,2.5,2.5,'#d6c296',toX(1450),1.25,toZ(3970));label(scene,'BẢO VỆ',toX(1450),2.7,toZ(4025),2.8);box(scene,6,.12,.12,'#cb8662',toX(1510),1.6,toZ(3750));
function truck(color,loaded=false){const g=new THREE.Group();box(g,1.7,1.5,1.65,color,0,1.15,1.6);box(g,1.5,.55,.06,'#a8ccc6',0,1.5,2.45);box(g,1.85,.2,4.2,'#7c8c82',0,.58,.2);box(g,1.8,1.9,3.2,'#d6d9c5',0,1.6,-.9);for(const x of [-.94,.94])for(const z of [-1.8,1.8]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.18,12),mat('#394b47'));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.37,z);g.add(wheel);}for(const x of [-.6,.6])box(g,.3,.18,.06,'#f3dfaa',x,.85,2.46);if(loaded){box(g,1.6,.8,2.5,'#b79560',0,2.9,-.9);box(g,1.3,.1,2.1,'#789165',0,3.35,-.9);}return g;}
for(let row=0;row<3;row++)for(let i=0;i<4;i++){const g=truck(['#8ca89b','#bb8b6e','#88a3ad'][i%3],row%2===0);g.position.set(toX(275+i*240),0,toZ(3475+row*340));g.rotation.y=Math.PI;scene.add(g);obstacles.push({x:230+i*240,y:3385+row*340,w:90,h:180});}
// Clockwise traffic uses the internal roads, never the retail shopping aisle.
const route=[{x:1760,y:1380},{x:7360,y:1380},{x:7360,y:2620},{x:1760,y:2620}];let length=0;const segments=route.map((p,i)=>{const q=route[(i+1)%route.length],len=Math.hypot(q.x-p.x,q.y-p.y);const s={p,q,len,start:length};length+=len;return s;});
for(let i=0;i<9;i++){const g=truck(['#b97f66','#719b98','#a3ac8d'][i%3],i%2===0);scene.add(g);vehicles.push({g,progress:i/9*length,speed:55+i*4,x:0,y:0});}
// Warehouse destination and loading pallets.
box(scene,13,5,7,'#b2bca6',toX(3300),2.5,toZ(3000));box(scene,13.6,.2,7.6,'#6c8a7a',toX(3300),5.2,toZ(3000));for(let i=0;i<3;i++){box(scene,3.1,3,.1,'#779185',toX(3120+i*180),1.5,toZ(3142));for(let j=0;j<2;j++)box(scene,1.2,.6,1.2,'#b79a69',toX(3050+i*180),.3+j*.6,toZ(3190));}label(scene,'KHO GIAO NHẬN',toX(3300),4.5,toZ(3145),10,'#fff1cd','#537460','NHẬN HÀNG · GIAO QUÁN',true);
obstacles.push({x:3040,y:2860,w:520,h:280});
// Eastern transfer yard and marked truck bays.
slab(4800,2800,2200,390,'#9ba99b',.04);
for(let i=0;i<8;i++){
  const x=4890+i*260;
  slab(x,2850,5,250,'#e8e3bb',.06);
  slab(x,3100,210,5,'#e8e3bb',.06);
  if(i%2===0){
    const parked=truck('#8ca89b',true);
    parked.position.set(toX(x+105),0,toZ(2960));
    scene.add(parked);
    obstacles.push({x:x+65,y:2870,w:80,h:180});
  }
}
label(scene,'BÃI TRUNG CHUYỂN PHÍA ĐÔNG',toX(5900),4.2,toZ(2830),15,'#628373','#fff1cd','XE TẢI · GIAO NHẬN',true);
// Signs orient the player before crossing into the wholesale part.
for(const [x,y,text,small] of [[1510,1110,'CHỢ ĐẦU MỐI →','NHÀ LỒNG A · B · C · D'],[2020,1560,'↑ RAU CỦ · TRÁI CÂY','↓ KHO HÀNG · GIAO NHẬN'],[1500,3350,'↓ BÃI XE TẢI','↑ NHÀ LỒNG · PHỐ ẨM THỰC']]){cyl(scene,.065,3.5,'#7d8e7f',toX(x),1.75,toZ(y));label(scene,text,toX(x),3.8,toZ(y),6,'#5d806e','#fff1cc',small,true,Math.PI/4);}

// Commercial logistics: Industrial forklifts moving and parked
forklift(scene,toX(1920),toZ(1420),Math.PI/2,'#e67e22');
forklift(scene,toX(3180),toZ(1420),-Math.PI/2,'#f39c12');
forklift(scene,toX(3080),toZ(3250),0,'#d35400');
// Mini gas station for trucks & trikes
gasStation(scene,toX(1380),toZ(1420));
// Grand Archway connecting residential market to wholesale district
box(scene,.7,7,.7,'#34495e',toX(1640),3.5,toZ(1050));
box(scene,.7,7,.7,'#34495e',toX(1640),3.5,toZ(1470));
box(scene,1.2,1.4,11,'#2c3e50',toX(1640),7.1,toZ(1260));
label(scene,'CHỢ ĐẦU MỐI NÔNG SẢN BÌNH AN',toX(1640),7.1,toZ(1260),9.5,'#2c3e50','#f1c40f','TRUNG TÂM PHÂN PHỐI SỈ TẬP TRUNG',true,Math.PI/2);

// Tree-lined boundary and lamp posts provide scale without filling the roads.
for(let i=0;i<14;i++){const x=2100+i*190;box(scene,.12,5,.12,'#778c81',toX(x),2.5,toZ(1550));box(scene,.9,.12,.4,'#e1e2bf',toX(x)+.3,5,toZ(1550));}
for(let i=0;i<12;i++){const x=300+i*380;cyl(scene,.13,2.2,'#917f5e',toX(x),1.1,toZ(3500));const leaf=sphere(scene,1.25,'#8eaa7d',toX(x),3,toZ(3500));leaf.scale.y=.85;}

  buildRiverCanal(scene, box, cyl, sphere, label, mat, toX, toZ, obstacles);
  buildClockTower(scene, box, cyl, sphere, label, mat, toX, toZ, obstacles);
  buildSecondMarketPavilion(scene, box, cyl, sphere, label, person, mat, toX, toZ, obstacles);
  buildFoodPlaza(scene, box, cyl, sphere, label, person, mat, toX, toZ, obstacles);
  buildHistoricTownhouses(scene, box, cyl, sphere, label, mat, toX, toZ, obstacles);

  const city=buildCity({scene,box,cyl,sphere,label,mat,toX,toZ,obstacles});
  roads.push(...city.roads);

  const points=[
  {name:'Bến tàu Chợ nổi Miền Tây',x:320,y:1250},
  {name:'Tháp đồng hồ Chợ trung tâm',x:westMarket.tower.x,y:westMarket.tower.y-100},
  {name:'Nhà lồng 2 · Thịt cá & Nông sản',x:westMarket.pavilion.x,y:westMarket.pavilion.y},
  {name:'Phố Ẩm thực Đêm Bình An',x:westMarket.food.x,y:westMarket.food.y+150},
  {name:'Phố cổ Nhà may & Tiệm Vàng',x:westMarket.oldTown.x,y:westMarket.oldTown.y+170},
  {name:'Chợ dân sinh',x:800,y:650},
  {name:'Phố Ẩm thực & Bánh mì',x:820,y:1150},
  {name:'Nhà lồng A · Vựa Rau củ',x:2540,y:1130},
  {name:'Nhà lồng B · Vựa Trái cây',x:3700,y:1130},
  {name:'Nhà lồng C · Nông sản khô',x:2540,y:2360},
  {name:'Nhà lồng D · Hải sản & Thùng xốp',x:3700,y:2360},
  {name:'Bãi xe tải · Bốc dỡ',x:1480,y:3815},
  {name:'Trạm xăng chợ đầu mối',x:1380,y:1420},
  {name:'Kho giao nhận',x:3300,y:3220},
  {name:'Nhà lồng E · Hoa tươi',x:5275,y:1170},
  {name:'Nhà lồng F · Gạo và gia vị',x:6525,y:1170},
  {name:'Nhà lồng G · Bao bì và vật tư',x:5900,y:1610},
  {name:'Bãi trung chuyển phía đông',x:6000,y:3150},
  ...city.points
];
function update(time,dt,viewWorld=world){city.update(viewWorld,!!globalThis.window?.surveyView);for(const h of halls){const inside=world.x>h.x-60&&world.x<h.x+h.w+60&&world.y>h.y-80&&world.y<h.y+h.h+80;h.roofMat.opacity=THREE.MathUtils.damp(h.roofMat.opacity,inside?.12:1,7,dt);h.roofMat.depthWrite=!inside;}
for(const v of vehicles){if(Math.hypot(world.x-v.x,world.y-v.y)>120)v.progress=(v.progress+v.speed*dt)%length;const s=segments.find(s=>v.progress<s.start+s.len)||segments[0],t=(v.progress-s.start)/s.len;v.x=s.p.x+(s.q.x-s.p.x)*t;v.y=s.p.y+(s.q.y-s.p.y)*t;v.g.position.set(toX(v.x),0,toZ(v.y));v.g.rotation.y=Math.atan2(s.q.x-s.p.x,s.q.y-s.p.y);}}
function zone(x,y){if(y>5300&&x>4500)return 'BIỆT THỰ VEN HỒ';if(y>5300&&x>1900)return 'KHU DÂN CƯ BÌNH AN';if(y>3400&&x>4550)return 'CÔNG VIÊN · HỒ BÌNH AN';if(y>3400&&x>1900)return 'PHỐ THƯƠNG MẠI BÌNH AN';if(x<1550&&y<1600)return 'KHU CHỢ DÂN SINH';if(x<1550&&y>4500)return 'PHỐ CỔ BÌNH AN';if(x<1550&&y>3300)return 'BÃI XE · KHU BỐC DỠ';if(x<1550&&y>2500)return 'PHỐ ẨM THỰC';if(x<1550&&y>1600)return 'CHỢ THỊT VÀ TRÁI CÂY';for(const h of halls)if(x>h.x-100&&x<h.x+h.w+100&&y>h.y-100&&y<h.y+h.h+100)return h.name+' · '+h.sub;if(x>=4800&&y>2750)return 'BÃI TRUNG CHUYỂN PHÍA ĐÔNG';if(y>2800)return 'KHO GIAO NHẬN';return 'ĐƯỜNG NỘI BỘ · CHỢ ĐẦU MỐI';}
return {W,H,roads,halls,points,obstacles,vehicles,update,zone,city};
}
