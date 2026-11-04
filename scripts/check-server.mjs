import {readFileSync,mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import assert from 'node:assert/strict';import {localDB} from './local-db.mjs';
const DB=localDB(join(mkdtempSync(join(tmpdir(),'market-check-')),'db.sqlite'));DB.migrate(readFileSync('db/schema.sql','utf8'));
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(readFileSync('dist/server/index.js')).toString('base64'));
const base='http://localhost';async function call(id,path,data,origin=base){const res=await worker.fetch(new Request(base+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{...(id?{'oai-authenticated-user-id':id}:{}),origin,'content-type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)}),{DB});return {status:res.status,...await res.json()};}
assert.equal((await call(null,'me')).status,401);assert.equal((await call('a','profile',{name:'Bad'},'https://other.test')).status,403);
let a=(await call('a','me')).player,b=(await call('b','me')).player;assert.notEqual(a.publicId,b.publicId);
assert.equal((await call('a','profile',{name:'Cô An'})).player.name,'Cô An');
assert.equal((await call('a','rent',{name:'Sạp An'})).player.coins,100);assert.equal((await call('a','stock',{})).player.coins,80);
const requestId=crypto.randomUUID();let trade=await call('b','trade',{seller:a.publicId,price:8,requestId});assert.equal(trade.player.coins,142);assert.equal(trade.player.goods,1);
assert.equal((await call('a','me')).player.coins,88);assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId})).player.coins,142);
assert.equal((await call('a','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,409);
assert.equal((await call('b','trade',{seller:a.publicId,price:5,requestId:crypto.randomUUID()})).status,409);
for(let i=0;i<4;i++)assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,200);
const before=(await call('b','me')).player.coins;assert.equal((await call('b','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})).status,409);assert.equal((await call('b','me')).player.coins,before);assert.equal((await call('a','shops')).shops[0].stock,0);
for(let i=0;i<4;i++){assert.equal((await call('c','quest',{action:'buy',item:i})).status,200);assert.equal((await call('c','quest',{action:'buy',item:i})).status,409);}assert.equal((await call('c','complete',{})).player.coins,108);assert.equal((await call('c','complete',{})).status,409);
await call('a','presence',{x:800,y:650});const seen=await call('b','presence',{x:810,y:650});assert.equal(seen.peers[0].name,'Cô An');assert(!('id' in seen.peers[0]));
// Concurrent contenders for the last unit: exactly one purchase succeeds.
await call('a','stock',{});for(let i=0;i<4;i++)await call('d','trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()});const races=await Promise.all(['e','f'].map(id=>call(id,'trade',{seller:a.publicId,price:8,requestId:crypto.randomUUID()})));assert.deepEqual(races.map(r=>r.status).sort(),[200,409]);
console.log('PASS: identity, origin, persistence, rental, stock, atomic trades, retry, self-buy, stale price, sold-out, quest reward, presence, concurrent last item');
