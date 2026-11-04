const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={}; const ctx=new Proxy({}, {get:()=>()=>{},set:()=>true});
const element=id=>elements[id]??=( {width:960,height:720,style:{},open:false,append(){},insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx} );
const sandbox={console,Math,Number,Set,window:{addEventListener(){}},document:{body:{append(){}},querySelectorAll:()=>[],addEventListener(){}},$:element,state:{ended:false},stalls:Array.from({length:5},(_,i)=>({name:'s'+i,goods:'',item:'',color:''})),requestAnimationFrame(){},toast(){},visit(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('public/world.js','utf8'),sandbox);
vm.runInContext(`
function advance(n){for(let i=0;i<n;i++)tick((last||1)+16);}
world.keys.add('arrowup');advance(220);if(world.y<498||world.y>505)throw Error('stall collision');if(world.near!==1)throw Error('near shop');
window.resetWorld();world.keys.add('d');advance(50);let walk=world.x-800;
window.resetWorld();world.keys.add('d');world.keys.add('shift');advance(50);if(world.x-800<walk*1.5)throw Error('run speed');
if(world.cameraX<=320)throw Error('camera follow');
window.resetWorld();world.keys.add('w');$('shop').open=true;advance(30);if(world.y!==650||world.keys.size)throw Error('modal pause');$('shop').open=false;
world.keys.add('s');advance(130);if(world.near!==5||world.y>912)throw Error('home approach');
window.resetWorld();if(world.x!==800||world.keys.size)throw Error('reset');
`,sandbox);
console.log('PASS: collision, proximity, sprint speed, camera follow, dialog pause, home, reset');
