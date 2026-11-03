const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={}; const ctx=new Proxy({}, {get:()=>()=>{},set:()=>true});
const element=id=>elements[id]??=( {style:{},open:false,append(){},insertAdjacentHTML(){},addEventListener(){},getContext:()=>ctx} );
const sandbox={console,Math,Number,Set,window:{addEventListener(){}},document:{body:{append(){}},querySelectorAll:()=>[],addEventListener(){}},$:element,state:{ended:false},stalls:Array.from({length:5},(_,i)=>({name:'s'+i,goods:'',item:'',color:''})),requestAnimationFrame(){},toast(){},visit(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/world.js','utf8'),sandbox);
vm.runInContext(`
function advance(n){for(let i=0;i<n;i++)tick((last||1)+16);}
world.keys.add('arrowup');advance(160);if(world.y<248||world.y>255)throw Error('stall collision');if(world.near!==1)throw Error('near shop');
window.resetWorld();world.keys.add('d');advance(50);let walk=world.x-480;
window.resetWorld();world.keys.add('d');world.keys.add('shift');advance(50);if(world.x-480<walk*1.5)throw Error('run speed');
window.resetWorld();world.keys.add('a');advance(800);if(world.x<20)throw Error('boundary');
window.resetWorld();world.keys.add('w');$('shop').open=true;advance(30);if(world.y!==360||world.keys.size)throw Error('modal pause');$('shop').open=false;
world.keys.add('s');advance(100);if(world.near!==5||world.y>572)throw Error('home approach');
window.resetWorld();if(world.x!==480||world.keys.size)throw Error('reset');
`,sandbox);
console.log('PASS: collision, proximity, sprint speed, world boundary, dialog pause, home, reset');
