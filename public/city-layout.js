// Bình An · Phương án thiết kế 02.
// One layout drives buildings, collision, minimap, waypoints and server mission positions.
// World units: 40 per metre. In 3D: x = (wx-800)/40, z = (wy-600)/40.
// Town: 280 × 170 m inside a ring road.
//   West: river, traditional market (1) with four gates.
//   North: wholesale halls (2) with rear truck lane and yard.
//   Centre: shophouse street (5), central restaurant (6), clock-tower square.
//   South-west: old residential lanes (3) and the boarding house (4).
//   East, past the residential gate (7): lake and park (10), villas (8), apartments (9).
export const W=11200,H=6800;

// The traditional market was built in its own local frame; this offset places it on the west side.
export const MARKET_OFFSET={x:1650,y:2600};
const mp=(x,y)=>({x:x+MARKET_OFFSET.x,y:y+MARKET_OFFSET.y});
const mr=r=>({...r,...mp(r.x,r.y)});

// Stalls 0-4, home 5, own stall 6 (market-local rectangles, unchanged from the original market).
const marketLocal=[{x:320,y:330,w:240,h:155},{x:680,y:330,w:240,h:155},{x:1040,y:330,w:240,h:155},{x:350,y:750,w:240,h:155},{x:1040,y:750,w:240,h:155},{x:710,y:925,w:180,h:130},{x:1280,y:930,w:180,h:120}];

export const zones={
  market:{x:1180,y:1940,w:2720,h:2160,name:'CHỢ TRUYỀN THỐNG',no:1},
  wholesale:{x:3000,y:480,w:4200,h:1220,name:'CHỢ ĐẦU MỐI & KHO HÀNG',no:2},
  oldQuarter:{x:1180,y:4380,w:6020,h:1940,name:'KHU DÂN CƯ CŨ',no:3},
  boarding:{x:1260,y:5540,w:1080,h:700,name:'KHU NHÀ TRỌ',no:4},
  shophouse:{x:3900,y:1940,w:3300,h:2160,name:'PHỐ THƯƠNG MẠI',no:5},
  lakeside:{x:7440,y:480,w:3480,h:5840,name:'KHU DÂN CƯ VEN HỒ',no:8},
  truckPark:{x:1180,y:480,w:1580,h:1220,name:'BÃI XE TẢI'}
};

export const roads=[
  // Ring road (vành đai)
  {x:900,y:200,w:10300,h:280,ring:true},
  {x:900,y:6320,w:10300,h:280,ring:true},
  {x:900,y:200,w:280,h:6400,ring:true},
  {x:10920,y:200,w:280,h:6400,ring:true},
  // Internal roads
  {x:1180,y:1700,w:9740,h:240},   // north avenue: wholesale / market
  {x:1180,y:4100,w:9740,h:280},   // boulevard: shophouses, restaurant, lake gate
  {x:1180,y:5200,w:9740,h:240},   // old quarter street
  {x:2760,y:480,w:240,h:1220},    // wholesale west access
  {x:3900,y:1940,w:240,h:2160},   // market east road
  {x:7200,y:480,w:240,h:5840},    // east inner road
  {x:3000,y:560,w:2960,h:280,service:true} // rear truck lane behind the halls
];

export const halls=[
  {x:3040,y:960,w:880,h:640,name:'NHÀ LỒNG A',sub:'RAU CỦ · HÀNG SỈ',color:'#6e9687',produce:'#82a36a'},
  {x:4000,y:960,w:880,h:640,name:'NHÀ LỒNG B',sub:'TRÁI CÂY · VỰA LỚN',color:'#b39368',produce:'#d6ab58'},
  {x:4960,y:960,w:880,h:640,name:'NHÀ LỒNG C',sub:'NÔNG SẢN · ĐÓNG GÓI',color:'#7891a0',produce:'#c0a16a'}
];
export const truckYard={x:5960,y:560,w:1200,h:1080};
export const warehouse={x:6300,y:1100,w:520,h:280};
export const truckPark={x:1300,y:600,w:1360,h:820};

// Organic lake: polygon in world units, plus its bounding box.
const lakeC={x:9100,y:3250,rx:1050,ry:520};
export function lakeOutline(scale=1,n=48){
  const pts=[];
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2,r=(1+.12*Math.sin(3*a)+.07*Math.cos(5*a+1))*scale;
    pts.push({x:lakeC.x+lakeC.rx*r*Math.cos(a),y:lakeC.y+lakeC.ry*r*Math.sin(a)});
  }
  return pts;
}
const lakePts=lakeOutline();
const lakeBox=(()=>{const xs=lakePts.map(p=>p.x),ys=lakePts.map(p=>p.y);const x=Math.min(...xs),y=Math.min(...ys);return {x:Math.round(x),y:Math.round(y),w:Math.round(Math.max(...xs)-x),h:Math.round(Math.max(...ys)-y)};})();
// Horizontal strips approximate the lake for rectangle-based collision.
export function lakeStrips(step=60){
  const out=[];
  for(let y=lakeBox.y;y<lakeBox.y+lakeBox.h;y+=step){
    const yy=y+step/2,xs=[];
    for(let i=0;i<lakePts.length;i++){
      const a=lakePts[i],b=lakePts[(i+1)%lakePts.length];
      if((a.y<=yy)!==(b.y<=yy))xs.push(a.x+(yy-a.y)/(b.y-a.y)*(b.x-a.x));
    }
    if(xs.length<2)continue;
    const x0=Math.min(...xs)+20,x1=Math.max(...xs)-20;
    if(x1>x0)out.push({x:Math.round(x0),y,w:Math.round(x1-x0),h:step});
  }
  return out;
}

const entranceOf=p=>{
  const cx=p.bx??p.x+p.w/2;
  return p.facing===0?{x:cx,y:p.y+p.h+40}:{x:cx,y:p.y-40};
};
const plot=p=>({...p,entrance:p.entrance||entranceOf(p)});
const palette=['#e3c6a2','#cbd2b4','#d3afa0','#e4cfb0','#d9b3a0','#c9c3a6'];
const housePalette=['#e7d4b0','#d8c09a','#cfd3b8','#e2c3a7','#d6c7a9','#e9dcc0'];
const plots=[];
// (5) Shophouses face the boulevard with a 3 m forecourt.
['CÀ PHÊ BÌNH AN','TIỆM BÁNH','TẠP HÓA PHỐ','NHÀ SÁCH','TIỆM MAY','NHÀ THUỐC'].forEach((name,i)=>plots.push(plot({id:'shop-n-'+i,type:'shop',name,x:4200+i*340,y:3540,w:320,h:480,facing:0,color:palette[i%6]})));
['CỬA HÀNG HOA','BƯU CỤC','QUÁN CƠM','TIỆM VÀNG'].forEach((name,i)=>plots.push(plot({id:'shop-s-'+i,type:'shop',name,x:5520+i*340,y:4460,w:320,h:480,facing:Math.PI,color:palette[(i+3)%6]})));
// (6) Central restaurant with its own delivery court opening onto the boulevard.
plots.push(plot({id:'restaurant',type:'restaurant',name:'PHỞ GIA TRUYỀN',sub:'NHÀ HÀNG TRUNG TÂM',x:6300,y:3300,w:820,h:720,bx:6860,facing:0,color:'#e6cfa8',court:{x:6320,y:3500,w:280,h:520}}));
// (3) Old residential lanes: narrow two-storey houses back to back.
for(let i=0;i<4;i++){
  plots.push(plot({id:'house-a-n'+i,type:'house',name:'Nhà '+(12+i*2),x:1260+i*260,y:4470,w:240,h:310,facing:Math.PI,color:housePalette[i%6]}));
  plots.push(plot({id:'house-a-s'+i,type:'house',name:'Nhà '+(13+i*2),x:1260+i*260,y:4800,w:240,h:310,facing:0,color:housePalette[(i+2)%6]}));
}
for(let i=0;i<5;i++)plots.push(plot({id:'house-b-s'+i,type:'house',name:'Nhà '+(30+i*2),x:2560+i*260,y:4800,w:240,h:310,facing:0,color:housePalette[(i+4)%6]}));
for(let i=0;i<17;i++){
  plots.push(plot({id:'house-c-n'+i,type:'house',name:'Nhà '+(50+i*2),x:2560+i*260,y:5540,w:240,h:310,facing:Math.PI,color:housePalette[(i+1)%6]}));
  plots.push(plot({id:'house-c-s'+i,type:'house',name:'Nhà '+(51+i*2),x:2560+i*260,y:5880,w:240,h:320,facing:0,color:housePalette[(i+3)%6]}));
}
// (4) Boarding house: a two-storey row of rooms facing the old quarter street.
plots.push(plot({id:'boarding',type:'boarding',name:'NHÀ TRỌ BÌNH AN',x:1260,y:5540,w:1080,h:700,facing:Math.PI,color:'#e4d6b8'}));
// (9) Apartments in the north-east.
['A','B','C'].forEach((n,i)=>plots.push(plot({id:'apartment-'+i,type:'apartment',name:'Chung cư '+n,x:7700+i*1100,y:1160,w:800,h:420,facing:0,color:['#ded6c2','#cbd5cc','#e2d4c4'][i]})));
// (8) Villas around the lake: north row, and two rows south of the boulevard.
for(let i=0;i<4;i++){
  plots.push(plot({id:'villa-n'+i,type:'villa',name:'Biệt thự A'+(i+1),x:7700+i*800,y:2040,w:650,h:510,facing:Math.PI,color:['#eee3cc','#e6d7bd','#e8e3d5','#efe0c6'][i]}));
  plots.push(plot({id:'villa-s'+i,type:'villa',name:'Biệt thự B'+(i+1),x:7700+i*800,y:4480,w:650,h:510,facing:Math.PI,color:['#e8e3d5','#eee3cc','#efe0c6','#e6d7bd'][i]}));
  plots.push(plot({id:'villa-c'+i,type:'villa',name:'Biệt thự C'+(i+1),x:7700+i*800,y:5540,w:650,h:510,facing:Math.PI,color:['#e6d7bd','#efe0c6','#eee3cc','#e8e3d5'][i]}));
}

const restaurant=plots.find(p=>p.id==='restaurant');
const boarding=plots.find(p=>p.id==='boarding');
const marketGateSouth=mp(800,1150);
const lakeGate={x:7600,y:4240};

export const spots={
  stalls:marketLocal.map(mr),
  warehouse:{x:6410,y:1420,w:300,h:90},
  hallA:{x:3410,y:1220,w:140,h:120},
  spawn:mp(800,650),
  stall4Front:mp(1160,945),
  warehouseFront:{x:6560,y:1560},
  hallAFront:{x:3480,y:1400},
  restaurant:restaurant.entrance,
  boarding:boarding.entrance,
  marketGate:marketGateSouth,
  lakeGate
};
// Indices match the server mission checks: stalls 0-6, warehouse 7, hall A counter 8.
export const npcPositions=[...spots.stalls,spots.warehouse,spots.hallA];

// Orange delivery route: boarding house -> market -> restaurant -> lakeside gate.
export const deliveryRoute=[
  {...boarding.entrance},
  {x:2450,y:boarding.entrance.y},
  {x:2450,y:4060},
  {...marketGateSouth},
  {x:2450,y:4060},
  {x:restaurant.entrance.x,y:4060},
  {x:lakeGate.x,y:4060}
];

// Numbered map labels, matching the design board legend.
export const markers=[
  {no:1,name:'Chợ truyền thống',x:2450,y:3000},
  {no:2,name:'Chợ đầu mối & kho hàng',x:4440,y:760},
  {no:3,name:'Khu dân cư cũ',x:4200,y:5880},
  {no:4,name:'Khu nhà trọ',x:1800,y:5890},
  {no:5,name:'Phố thương mại',x:5200,y:3780},
  {no:6,name:'Nhà hàng (trung tâm)',x:6860,y:3660},
  {no:7,name:'Cổng khu dân cư ven hồ',x:7600,y:4240},
  {no:8,name:'Khu biệt thự ven hồ',x:9325,y:4735},
  {no:9,name:'Chung cư',x:8800,y:1370},
  {no:10,name:'Hồ & công viên ven hồ',x:9100,y:3250}
];

export const cityLayout={
  W,H,roads,zones,halls,lake:lakeBox,lakeOutline,lakeStrips,plots,deliveryRoute,markers,
  points:[
    {name:'Chợ truyền thống · Cổng Nam',...marketGateSouth},
    {name:'Nhà trọ',...boarding.entrance},
    {name:'Phố thương mại',x:4900,y:4060},
    {name:'Phở Gia Truyền · Nhà hàng',...restaurant.entrance},
    {name:'Cổng khu dân cư ven hồ',...lakeGate},
    {name:'Hồ & công viên',x:7700,y:3300},
    {name:'Biệt thự ven hồ',x:8025,y:4440},
    {name:'Chung cư',x:8800,y:1640}
  ],
  views:[
    {name:'Cổng chợ',x:marketGateSouth.x,y:marketGateSouth.y-60,zoom:15,pitch:.28,yaw:.12},
    {name:'Phố thương mại',x:4900,y:3900,zoom:19,pitch:.3,yaw:.55},
    {name:'Biệt thự ven hồ',x:8025,y:4560,zoom:17,pitch:.3,yaw:Math.PI+.35},
    {name:'Hồ Bình An',x:9100,y:3250,zoom:48,pitch:.62,yaw:.5},
    {name:'Toàn thị trấn',x:W/2,y:H/2,zoom:230,pitch:1.0,yaw:0}
  ]
};
