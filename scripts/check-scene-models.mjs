import assert from 'node:assert/strict';
import * as THREE from '../public/three.module.min.js';
import {buildWholesaleDistrict} from '../public/wholesale.js';
// Instantiate all district props with real Three.js objects, without a GPU.
// Syntax checks alone cannot catch a helper closing over an undefined name.
const scene=new THREE.Scene(),materials=new Map();
const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshBasicMaterial({color:c}));return materials.get(c);};
const add=(g,geo,c,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat(c));m.position.set(x,y,z);g.add(m);return m;};
const box=(g,w,h,d,c,x,y,z)=>add(g,new THREE.BoxGeometry(w,h,d),c,x,y,z);
const cyl=(g,r,h,c,x,y,z)=>add(g,new THREE.CylinderGeometry(r,r,h,6),c,x,y,z);
const sphere=(g,r,c,x,y,z)=>add(g,new THREE.SphereGeometry(r,6,4),c,x,y,z);
const world={x:800,y:650};
const district=buildWholesaleDistrict({scene,box,cyl,sphere,mat,label:()=>{},person:()=>new THREE.Group(),toX:x=>(x-800)/40,toZ:y=>(y-600)/40,world});
assert.equal(district.halls.length,4);assert(district.vehicles.length>0);assert(district.obstacles.length>0);
district.update(1,.016);world.x=2500;world.y=500;district.update(2,.016);
let meshes=0;scene.traverse(o=>{if(o.isMesh){meshes++;assert(o.position.toArray().every(Number.isFinite));}});assert(meshes>100);
console.log('PASS: wholesale district, pallet jacks, forklifts, gas station and traffic initialize');
