import assert from 'node:assert/strict';
import * as THREE from '../public/three.module.min.js';
import {buildWholesaleDistrict} from '../public/wholesale.js';
// Instantiate all district props with real Three.js objects, without a GPU.
// Syntax checks alone cannot catch a helper closing over an undefined name.
import {createNavigator} from '../public/navigation.js';
import {spots,deliveryRoute} from '../public/city-layout.js';

const scene=new THREE.Scene(),materials=new Map();
const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshBasicMaterial({color:c}));return materials.get(c);};
const add=(g,geo,c,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat(c));m.position.set(x,y,z);g.add(m);return m;};
const box=(g,w,h,d,c,x,y,z)=>add(g,new THREE.BoxGeometry(w,h,d),c,x,y,z);
const cyl=(g,r,h,c,x,y,z)=>add(g,new THREE.CylinderGeometry(r,r,h,6),c,x,y,z);
const sphere=(g,r,c,x,y,z)=>add(g,new THREE.SphereGeometry(r,6,4),c,x,y,z);
const world={x:2450,y:3250};
const district=buildWholesaleDistrict({scene,box,cyl,sphere,mat,label:()=>{},person:()=>new THREE.Group(),toX:x=>(x-800)/40,toZ:y=>(y-600)/40,world});
assert.equal(district.halls.length,3);assert(district.vehicles.length>0);assert(district.obstacles.length>0);
district.update(1,.016);world.x=4400;world.y=1300;district.update(2,.016);
const navigator=createNavigator(district.obstacles,{right:district.W-60,bottom:district.H-60});
const start={x:2450,y:4240};
for(const destination of district.points){
  assert(navigator.free(destination.x,destination.y),destination.name+' blocked');
  const path=navigator.route(start,destination);
  assert.deepEqual(path.at(-1),{x:destination.x,y:destination.y},destination.name);
}
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
for(const building of district.city.buildings){
  const {plot,footprint}=building;
  assert(footprint.x>=plot.x&&footprint.y>=plot.y);
  assert(footprint.x+footprint.w<=plot.x+plot.w&&footprint.y+footprint.h<=plot.y+plot.h);
  for(const road of district.roads)assert(!overlap(footprint,road),plot.name+' overlaps a road');
  for(const hall of district.halls)assert(!overlap(plot,hall),plot.name+' overlaps a hall');
  assert(!overlap(footprint,district.city.lake),plot.name+' overlaps lake');
  for(const other of district.city.buildings){
    if(other!==building)assert(!overlap(plot,other.plot),plot.name+' overlaps another plot');
  }
  const entrance=plot.entrance;
  assert(navigator.free(entrance.x,entrance.y),plot.name+' entrance blocked');
  assert.deepEqual(navigator.route(start,entrance).at(-1),entrance,plot.name+' unreachable');
}
for(const [name,p] of Object.entries({spawn:spots.spawn,warehouse:spots.warehouseFront,hallA:spots.hallAFront,restaurant:spots.restaurant,boarding:spots.boarding,lakeGate:spots.lakeGate})){
  assert(navigator.free(p.x,p.y),name+' blocked');
  assert.deepEqual(navigator.route(start,p).at(-1),p,name+' unreachable');
}
for(const p of deliveryRoute)assert(navigator.free(p.x,p.y),'delivery route point blocked '+JSON.stringify(p));
console.log('PASS: city lots, road clearance, lake clearance, building entrances, mission spots and delivery route');
let meshes=0;scene.traverse(o=>{if(o.isMesh){meshes++;assert(o.position.toArray().every(Number.isFinite));}});assert(meshes>100);
console.log('PASS: wholesale district, pallet jacks, forklifts, gas station and traffic initialize');
