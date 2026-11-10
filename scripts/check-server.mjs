import {readFileSync,mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import assert from 'node:assert/strict';import {persistentDB} from './persistent-db.mjs';
const DB=persistentDB(join(mkdtempSync(join(tmpdir(),'market-check-')),'db.sqlite'));await DB.migrate(readFileSync('db/schema.sql','utf8'));await DB.migrate(readFileSync('drizzle/0001_progression.sql','utf8'));await DB.migrate(readFileSync('drizzle/0002_gameplay.sql','utf8'));await DB.migrate(readFileSync('drizzle/0003_wholesale_jobs.sql','utf8'));await DB.migrate(readFileSync('drizzle/0004_customer_demand.sql','utf8'));await DB.migrate(readFileSync('drizzle/0005_wholesale_shipments.sql','utf8'));
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(readFileSync('dist/server/index.js')).toString('base64'));
const base='http://localhost';async function call(id,path,data,origin=base){const res=await worker.fetch(new Request(base+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{...(id?{'oai-authenticated-user-id':id}:{}),origin,'content-type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)}),{DB});return {status:res.status,...await res.json()};}
assert.equal((await call(null,'me')).status,401);assert.equal((await call('a','profile',{name:'Bad'},'https://other.test')).status,403);
let a=(await call('a','me')).player,b=(await call('b','me')).player;assert.notEqual(a.publicId,b.publicId);
assert.equal((await call('a','profile',{name:'Cô An'})).player.name,'Cô An');
// Gates reject both the API and a direct database insert, without charging coins.
assert.equal((await call('a','rent',{name:'Early'})).status,409);assert.equal((await call('a','me')).player.coins,150);
await assert.rejects(()=>DB.prepare('INSERT INTO shops(owner,name) VALUES (?,?)').bind(a.publicId,'Early').run());
// Three full task rounds produce level 3, 200 XP and 264K.
for(let round=0;round<3;round++){
 if(round)assert.equal((await call('a','next-quest',{})).status,200);
 assert.equal((await call('a','next-quest',{})).status,409);
 const mission=(await call('a','me')).player.mission;
 for(let item=0;item<4;item++){if(!(mission.mask&(1<<item)))continue;assert.equal((await call('a','quest',{action:'buy',item})).status,200);assert.equal((await call('a','quest',{action:'buy',item})).status,409);}
 assert.equal((await call('a','complete',{})).status,409);
 const destinations={5:{x:800,y:890},4:{x:1160,y:945},3:{x:470,y:945}};await call('a','presence',destinations[mission.destination]);
 assert.equal((await call('a','complete',{})).status,200);assert.equal((await call('a','complete',{})).status,409);
 if(round<2)assert.equal((await call('a','rent',{name:'Early'})).status,409);
}
let ready=(await call('a','me')).player;assert.equal(ready.xp,200);assert.equal(ready.level,3);assert.equal(ready.jobs,3);assert.equal(ready.coins,264);assert(ready.unlock.eligible);
// Enough XP alone is insufficient when savings are below the threshold.
await DB.prepare('UPDATE players SET coins=249 WHERE id=?').bind('a').run();assert.equal((await call('a','rent',{name:'Poor'})).status,409);
await DB.prepare('UPDATE players SET coins=264 WHERE id=?').bind('a').run();
assert.equal((await call('a','rent',{name:'Sạp An'})).player.coins,64);assert.equal((await call('a','stock',{})).player.coins,44);
const requestId=crypto.randomUUID();let trade=await call('b','trade',{seller:a.publicId,price:8,requestId});assert.equal(trade.player.coins,142);assert.equal(trade.player.goods,1);
assert.equal((await call('a','me')).player.coins,52);assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId})).player.coins,142);
assert.equal((await call('a','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,409);
assert.equal((await call('b','trade',{seller:a.publicId,price:5,requestId:crypto.randomUUID()})).status,409);
for(let i=0;i<4;i++)assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,200);
const before=(await call('b','me')).player.coins;assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,409);assert.equal((await call('b','me')).player.coins,before);
await call('a','presence',{x:800,y:650});const seen=await call('b','presence',{x:810,y:650});assert.equal(seen.peers[0].name,'Cô An');assert(!('id' in seen.peers[0]));
await call('a','stock',{});for(let i=0;i<4;i++)await call('d','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()});const races=await Promise.all(['e','f'].map(id=>call(id,'trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})));assert.deepEqual(races.map(r=>r.status).sort(),[200,409]);
// Quality changes both the server-side price and the XP reward.
const bad=await call('q','quest',{action:'buy',item:0,quality:'fake'});assert.equal(bad.status,400);
assert.equal((await call('q','quest',{action:'bargain',item:0,offer:30})).accepted,false);
assert.equal((await call('q','quest',{action:'bargain',item:0,offer:10})).accepted,true);
assert.equal((await call('q','quest',{action:'bargain',item:0,offer:5})).status,409);
for(let item=0;item<4;item++)assert.equal((await call('q','quest',{action:'buy',item,quality:'fresh'})).status,200);
await call('q','presence',{x:800,y:890});const fresh=await call('q','complete',{});assert.equal(fresh.player.coins,100);assert.equal(fresh.xp,96);
// Serving NPCs must happen at the physical stall; one paid order per slot.
assert.equal((await call('a','serve',{})).status,409);await call('a','stock',{});await call('a','presence',{x:1370,y:1090});
const offer=await call('a','customer');const pre=(await call('a','me')).player.coins;const served=await call('a','serve',{});assert.equal(served.status,200);assert.equal(served.player.coins,pre+offer.quantity*8);assert.equal((await call('a','serve',{})).status,409);
// The expanded map preserves large positions and supports an actual warehouse route.
assert.equal((await call('h','haul',{action:'pickup'})).status,409);
await call('h','presence',{x:3300,y:3320});assert.equal((await call('h','haul',{action:'pickup'})).status,200);assert.equal((await call('h','haul',{action:'pickup'})).status,409);
assert.equal((await call('h','haul',{action:'deliver'})).status,409);await call('h','presence',{x:1160,y:945});const haul=await call('h','haul',{action:'deliver'});assert.equal(haul.status,200);assert.equal(haul.player.coins,185);assert.equal(haul.player.xp,25);assert.equal(haul.player.jobs,0);assert.equal((await call('h','haul',{action:'deliver'})).status,409);
await call('h','presence',{x:3300,y:3320});assert.equal((await call('h','haul',{action:'pickup'})).status,409);
// Each customer group enforces its own budget, not the old fixed 12K cap.
await DB.prepare('UPDATE players SET coins=1000 WHERE id=?').bind('a').run();await DB.prepare('UPDATE shops SET stock=stock+50 WHERE owner=?').bind(a.publicId).run();
for(const [slot,budget] of [9,12,10,15].entries()){
 await call('a','price',{price:budget+1});await assert.rejects(()=>DB.prepare('INSERT INTO customer_sales(ticket,owner,quantity,total,created) VALUES (?,?,?,?,?)').bind('demand-bad-'+slot,a.publicId,1,budget+1,slot*90000).run());
 await call('a','price',{price:budget});await DB.prepare('INSERT INTO customer_sales(ticket,owner,quantity,total,created) VALUES (?,?,?,?,?)').bind('demand-ok-'+slot,a.publicId,1,budget,slot*90000).run();
}
console.log('PASS: mission destinations and varied orders, quality pricing and XP, limited negotiation, NPC serving and cooldown,  level/jobs/savings gates, database enforcement, task repeat/reward once, attainable progression, purchase reserve, identity, origin, stock, trade atomicity, idempotency, last item, presence');

{
const requestId=crypto.randomUUID();
await DB.prepare('UPDATE players SET coins=1000 WHERE id=?').bind('a').run();
const original=(await call('a','me')).player;
assert.equal((await call('a','wholesale',{action:'buy',requestId})).status,409);
await call('a','presence',{x:2610,y:735});
const purchased=await call('a','wholesale',{action:'buy',requestId});
assert.equal(purchased.status,200);
assert.equal(purchased.player.coins,970);
assert.equal(purchased.player.shop.stock,original.shop.stock);
assert.equal((await call('a','wholesale',{action:'buy',requestId})).player.coins,970);
assert.equal((await call('a','wholesale',{action:'buy',requestId:crypto.randomUUID()})).status,409);
const shipmentId=purchased.player.cargo.id;
assert.equal((await call('a','wholesale',{action:'unload',shipmentId})).status,409);
await call('a','presence',{x:1370,y:1090});
const unloaded=await call('a','wholesale',{action:'unload',shipmentId});
assert.equal(unloaded.status,200);
assert.equal(unloaded.player.shop.stock,original.shop.stock+15);
assert.equal(unloaded.player.coins,970);
assert.equal(unloaded.player.cargo,null);
assert.equal((await call('a','wholesale',{action:'unload',shipmentId})).status,409);
console.log('PASS: wholesale purchase, transport, unload and replay protection');

}

// A city shipment survives reloading, requires the city restaurant, and pays once.
await call('city-driver','presence',{x:3300,y:3320});
const cityStart=(await call('city-driver','me')).player;
const cityPickup=await call('city-driver','haul',{action:'pickup',destination:'city'});
assert.equal(cityPickup.status,200);
assert.equal((await call('city-driver','me')).player.haul.destination,'city');
await call('city-driver','presence',{x:1160,y:945});
assert.equal((await call('city-driver','haul',{action:'deliver'})).status,409);
await call('city-driver','presence',{x:2670,y:3940});
const cityResults=await Promise.all([call('city-driver','haul',{action:'deliver'}),call('city-driver','haul',{action:'deliver'})]);
assert.equal(cityResults.filter(r=>r.status===200).length,1);
const cityEnd=(await call('city-driver','me')).player;
assert.equal(cityEnd.coins,cityStart.coins+55);
assert.equal(cityEnd.xp,cityStart.xp+25);
assert.equal(cityEnd.haul.active,false);
assert.equal((await call('city-driver','haul',{action:'deliver'})).status,409);
console.log('PASS: city shipment destination, persistence and concurrent payout protection');
DB.close();
