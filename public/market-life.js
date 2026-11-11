import * as THREE from './three.module.min.js';
import {MARKET_OFFSET as MO,spots,cityLayout} from './city-layout.js';
const mp=(x,y)=>({x:x+MO.x,y:y+MO.y});
const BUYER_CALLS=['Cô Ba lựa giùm con con cá lóc tươi nha!','Rau muống ruộng xào tỏi là đúng bài luôn!','Cà chua bi chín đỏ, tươi mọng ghê!','Cho con gói me chua với ớt cay nha chú Năm!','Chị Út ơi cho tô bún riêu nhiều riêu!','Cân đúng ký giùm em nha cô!','Chợ sáng nay đông đúc, vui ghê!','Thêm cho con cọng hành ngò nha dì!','Đồ tươi vầy mua về má khen liền!','Lựa con ít cà chua nấu canh chua nha cô Sáu!'];
const FOOD_STREET_CALLS=[
  'Cho một ly nước mía siêu sạch ít đá nha anh!',
  'Bánh mì giòn rụm nhiều pa-tê ớt cay nha chị!',
  'Một ly cà phê phin đậm đà ngắm phố sáng sớm!',
  'Dưa hấu Long An ngọt lịm bao ăn nè bà con!',
  'Sầu riêng Ri6 cơm vàng hạt lép thơm nức mũi!',
  'Xe nâng bốc hàng, bà con nhường đường xíu nha!'
];

const WORKER_CALLS=['Tránh đường giùm xe đá chút cô chú ơi!','Kiện rau củ Đà Lạt nhập kho bãi xe đây!','Xe giao hàng tới, nhường lối giùm chút nha!','Chuyển hàng gấp qua quán ăn kịp giờ trưa!'];

// Local NPC activity is intentionally separate from real online players.
export function buildMarketLife({scene,box,cyl,person,floatingLabel,animatePerson,navigator,toX,toZ,world,district}){
 const actors=[],vendors=[],routeCache=new Map();let density='busy';try{density=localStorage.getItem('market-density')==='light'?'light':'busy';}catch{}
 const core=[mp(440,555),mp(800,555),mp(1160,555),mp(470,980),mp(1160,980),mp(1470,1150),mp(240,650)];
 const hallRoutes=district.halls.map(h=>[{x:h.x+h.w/2,y:h.y+100},{x:h.x+h.w/2,y:h.y+h.h-90},{x:h.x+h.w/2+55,y:h.y+h.h+70}]);
 const loading=[{x:6240,y:1560},{x:6880,y:1560},{x:6880,y:1000},{x:6240,y:1000}];
  const foodStreetRoute=[mp(480,1220),mp(780,1220),mp(1080,1220),mp(1380,1220),mp(800,980)];
  // Delivery-route walkers: boarding house -> market gate -> restaurant -> lake gate.
  const boulevardRoute=[spots.boarding,{x:2450,y:4070},spots.marketGate,{x:4600,y:4070},spots.restaurant,spots.lakeGate];

 function cart(g){box(g,.9,.12,1.1,'#a88b5d',0,.5,.65);for(const x of [-.38,.38])for(const z of [.2,1.1]){const wheel=cyl(g,.12,.09,'#526258',x,.25,z);wheel.rotation.z=Math.PI/2;}box(g,.06,.85,.06,'#718574',-.4,.8,.05);box(g,.06,.85,.06,'#718574',.4,.8,.05);box(g,.85,.06,.06,'#718574',0,1.2,.05);box(g,.75,.5,.75,'#bb9b65',0,.8,.66);box(g,.63,.13,.62,'#8fa771',0,1.12,.66);}
 function add(i,route,role='buyer'){const g=person(role==='worker'?'#779299':['#a3819b','#a6a06e','#c28a6c','#79a198'][i%4],i%3!==0);const start=route[i%route.length];g.position.set(toX(start.x),0,toZ(start.y));scene.add(g);const bubbleText=role==='worker'?WORKER_CALLS[i%WORKER_CALLS.length]:(i%2===0?FOOD_STREET_CALLS[i%FOOD_STREET_CALLS.length]:BUYER_CALLS[i%BUYER_CALLS.length]);const bubble=floatingLabel(g,bubbleText,2.55);bubble.visible=false;
 if(role==='cart')cart(g);if(role==='worker')box(g,.63,.5,.57,'#b59765',0,1.03,.5);
 g.traverse(m=>{if(m.isMesh)m.castShadow=false;});actors.push({g,bubble,route,role,x:start.x,y:start.y,index:i%route.length,path:[],wait:1+i%6,speed:role==='buyer'?22+i%9:31,phase:i});}
 for(let i=0;i<14;i++)add(i,core,i%6===0?'cart':'buyer');
 hallRoutes.forEach((r,j)=>{for(let i=0;i<3;i++)add(j*3+i,r,i===0?'cart':'buyer');});
 for(let i=0;i<4;i++)add(30+i,loading,'worker');
  for(let i=0;i<6;i++)add(40+i,foodStreetRoute,i%3===0?'cart':'buyer');
  for(let i=0;i<6;i++)add(50+i,boulevardRoute,i%2===0?'worker':'buyer');

 const promenade=cityLayout.lakeOutline(1.1,8).filter(p=>p.y<3950);
 const shoppingStreet=[{x:4360,y:4070},{x:5040,y:4070},{x:5720,y:4070},{x:4800,y:4950},{x:4300,y:2700}];
 for(let i=0;i<4;i++)add(60+i,shoppingStreet);
 for(let i=0;i<4;i++)add(64+i,promenade);
 for(const [hi,h] of district.halls.entries()){const rows=h.h>700?5:4;for(let row=0;row<rows;row+=2)for(const side of [-1,1]){const g=person(['#ba8670','#849d85','#a89b6f','#7f969f'][hi%4],true);g.position.set(toX(h.x+h.w/2+side*(h.w/2-75)),0,toZ(h.y+90+row*(h.h-176)/(rows-1)));g.rotation.y=side<0?Math.PI/2:-Math.PI/2;g.traverse(m=>{if(m.isMesh)m.castShadow=false;});scene.add(g);vendors.push(g);}}
 function choosePath(a){a.index=(a.index+1)%a.route.length;const end=a.route[a.index];const key=[Math.round(a.x),Math.round(a.y),end.x,end.y].join(':');let path=routeCache.get(key);if(!path){path=navigator.route({x:a.x,y:a.y},end);if(routeCache.size>180)routeCache.clear();routeCache.set(key,path);}a.path=path.map(p=>({...p}));if(!a.path.length)a.wait=4;}
 function update(time,dt){const max=density==='busy'?actors.length:18;let waiting=0;for(let i=0;i<actors.length;i++){const a=actors[i];const enabled=density==='busy'||i%2===0||a.role==='worker';a.g.visible=enabled&&Math.hypot(world.x-a.x,world.y-a.y)<1900;if(!enabled)continue;if(a.wait>0){a.wait-=dt;a.bubble.visible=a.wait>1&&a.g.visible&&Math.hypot(world.x-a.x,world.y-a.y)<450;waiting++;animatePerson(a.g,time,false);if(a.wait<=0)choosePath(a);continue;}
 a.bubble.visible=false;const next=a.path[0];if(!next){a.wait=3+(i%5);continue;}const dx=next.x-a.x,dy=next.y-a.y,d=Math.hypot(dx,dy);const pause=Math.hypot(world.x-a.x,world.y-a.y)<32;if(!pause){const step=Math.min(d,a.speed*dt);if(d){a.x+=dx/d*step;a.y+=dy/d*step;a.g.rotation.y=Math.atan2(dx,dy);}if(d<2)a.path.shift();}a.g.position.set(toX(a.x),0,toZ(a.y));animatePerson(a.g,time,!pause);}
 return {active:density==='busy'?actors.length:actors.filter((a,i)=>i%2===0||a.role==='worker').length,waiting,workers:4};}
 function setDensity(value){density=value==='light'?'light':'busy';try{localStorage.setItem('market-density',density);}catch{}}
 return {update,setDensity,get density(){return density;},count:actors.length};
}
