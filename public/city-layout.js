// One world-unit grid drives buildings, collision, map footprints and visits.
// Coordinates use the existing game scale of 40 units per metre.
export const cityLayout = {
  lake: {x:4950,y:4430,w:1540,h:480},
  roads: [
    {x:1880,y:3970,w:5360,h:280},
    {x:1880,y:5000,w:5360,h:280},
    {x:1880,y:5990,w:5360,h:240},
    {x:4320,y:3390,w:240,h:2840},
    {x:7240,y:3390,w:240,h:2840},
    {x:1640,y:3370,w:240,h:2860}
  ],
  plots: [
    ...['CÀ PHÊ BÌNH AN','PHỞ GIA TRUYỀN','TIỆM BÁNH','TẠP HÓA PHỐ','NHÀ SÁCH'].map((name,i)=>({
      id:'shop-n-'+i,type:'shop',name,x:2070+i*420,y:3510,w:360,h:400,facing:0,
      entrance:{x:2250+i*420,y:3940},color:['#e3c6a2','#cbd2b4','#d3afa0'][i%3]
    })),
    ...['TIỆM MAY','CỬA HÀNG HOA','BƯU CỤC','NHÀ THUỐC','QUÁN CƠM'].map((name,i)=>({
      id:'shop-s-'+i,type:'shop',name,x:2070+i*420,y:4340,w:360,h:400,facing:Math.PI,
      entrance:{x:2250+i*420,y:4300},color:['#cbd2b4','#e4cfb0','#d9b3a0'][i%3]
    })),
    ...[0,1,2].map(i=>({
      id:'villa-'+i,type:'villa',name:'Biệt thự V0'+(i+1),x:4770+i*800,y:5410,w:650,h:510,facing:Math.PI,
      entrance:{x:5095+i*800,y:5350},color:['#eee3cc','#e6d7bd','#e8e3d5'][i]
    })),
    ...[0,1].map(i=>({
      id:'apartment-'+i,type:'apartment',name:'Chung cư '+String.fromCharCode(65+i),x:2160+i*1050,y:5460,w:800,h:420,facing:Math.PI,
      entrance:{x:2560+i*1050,y:5350},color:['#ded6c2','#cbd5cc'][i]
    }))
  ],
  points:[
    {name:'Cà phê Bình An',x:2250,y:3940},
    {name:'Phố thương mại · Quán phở',x:2670,y:3940},
    {name:'Công viên Hồ Bình An',x:4700,y:4540},
    {name:'Bến ngắm hồ',x:5720,y:4950},
    {name:'Biệt thự ven hồ',x:5895,y:5350},
    {name:'Quảng trường chung cư',x:3100,y:5350}
  ],
  views:[
    {name:'Cổng chợ',x:800,y:900,zoom:25,pitch:.38,yaw:.05},
    {name:'Phố thương mại',x:2750,y:4060,zoom:28,pitch:.36,yaw:2.65},
    {name:'Biệt thự ven hồ',x:5700,y:5290,zoom:34,pitch:.43,yaw:2.9}
  ]
};

