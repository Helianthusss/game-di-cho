import {readFileSync,mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import assert from 'node:assert/strict';import {localDB} from './local-db.mjs';
const DB=localDB(join(mkdtempSync(join(tmpdir(),'market-check-')),'db.sqlite'));DB.migrate(readFileSync('db/schema.sql','utf8'));DB.migrate(readFileSync('drizzle/0001_progression.sql','utf8'));
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
 for(let item=0;item<4;item++){assert.equal((await call('a','quest',{action:'buy',item})).status,200);assert.equal((await call('a','quest',{action:'buy',item})).status,409);}
 assert.equal((await call('a','complete',{})).status,200);assert.equal((await call('a','complete',{})).status,409);
 if(round<2)assert.equal((await call('a','rent',{name:'Early'})).status,409);
}
let ready=(await call('a','me')).player;assert.equal(ready.xp,200);assert.equal(ready.level,3);assert.equal(ready.jobs,3);assert.equal(ready.coins,264);assert(ready.unlock.eligible);
// Enough XP alone is insufficient when savings are below the threshold.
DB.prepare('UPDATE players SET coins=249 WHERE id=?').bind('a').run();assert.equal((await call('a','rent',{name:'Poor'})).status,409);
DB.prepare('UPDATE players SET coins=264 WHERE id=?').bind('a').run();
assert.equal((await call('a','rent',{name:'Sạp An'})).player.coins,64);assert.equal((await call('a','stock',{})).player.coins,44);
const requestId=crypto.randomUUID();let trade=await call('b','trade',{seller:a.publicId,price:8,requestId});assert.equal(trade.player.coins,142);assert.equal(trade.player.goods,1);
assert.equal((await call('a','me')).player.coins,52);assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId})).player.coins,142);
assert.equal((await call('a','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,409);
assert.equal((await call('b','trade',{seller:a.publicId,price:5,requestId:crypto.randomUUID()})).status,409);
for(let i=0;i<4;i++)assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,200);
const before=(await call('b','me')).player.coins;assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,409);assert.equal((await call('b','me')).player.coins,before);
await call('a','presence',{x:800,y:650});const seen=await call('b','presence',{x:810,y:650});assert.equal(seen.peers[0].name,'Cô An');assert(!('id' in seen.peers[0]));
await call('a','stock',{});for(let i=0;i<4;i++)await call('d','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()});const races=await Promise.all(['e','f'].map(id=>call(id,'trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})));assert.deepEqual(races.map(r=>r.status).sort(),[200,409]);
console.log('PASS: level/jobs/savings gates, database enforcement, task repeat/reward once, attainable progression, purchase reserve, identity, origin, stock, trade atomicity, idempotency, last item, presence');
