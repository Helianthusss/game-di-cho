// Positions share the saved coordinate system of existing players.
const MISSION_TYPES=[
 {title:'Bữa cơm nhà',description:'Má đợi nấu canh chua. Ghé đủ bốn sạp, chọn hàng rồi mang về nhà.',mask:15,destination:5,recipient:'Má',reward:160,xp:60},
 {title:'Quán bún cần rau',description:'Chị Út thiếu rau muống và cà chua cho bữa trưa. Mua đủ rồi giao ở quán ăn.',mask:6,destination:4,recipient:'Chị Út',reward:105,xp:60},
 {title:'Đơn khách quen',description:'Chú Năm nhận giúp một đơn cá lóc và me chua. Mang hàng tới sạp gia vị.',mask:9,destination:3,recipient:'Chú Năm',reward:133,xp:60}
];
const NPC_POSITIONS=[{x:320,y:330,w:240,h:155},{x:680,y:330,w:240,h:155},{x:1040,y:330,w:240,h:155},{x:350,y:750,w:240,h:155},{x:1040,y:750,w:240,h:155},{x:710,y:925,w:180,h:130},{x:1280,y:930,w:180,h:120},{x:3150,y:3180,w:300,h:100}];
function missionFor(p){const m={...MISSION_TYPES[p.task_type%3]};if(p.jobs===0){m.reward=40;m.xp=80;}return m;}
function isNear(p,i){const b=NPC_POSITIONS[i];return Math.hypot(Math.max(b.x-p.x,0,p.x-b.x-b.w),Math.max(b.y-p.y,0,p.y-b.y-b.h))<105;}
function bitCount(n){let count=0;while(n){count+=n&1;n>>>=1;}return count;}

function customerFor(slot){return [{name:'Cô hàng xóm',kind:'Bữa cơm gia đình',quantity:1,maxPrice:9},{name:'Chị chủ quán bún',kind:'Nguyên liệu bán trưa',quantity:3,maxPrice:12},{name:'Bếp cơm công nhân',kind:'Đơn nhiều, cần giá tốt',quantity:5,maxPrice:10},{name:'Khách nhà hàng',kind:'Đơn nhỏ, ngân sách rộng',quantity:2,maxPrice:15}][slot%4];}
