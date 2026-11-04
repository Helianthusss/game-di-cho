import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
const sql=readFileSync('db/schema.sql','utf8');const file='drizzle/0000_market.sql';
if(existsSync(file)&&readFileSync(file,'utf8')!==sql)throw Error('Migration immutable: add a new migration for changes');
mkdirSync('drizzle/meta',{recursive:true});writeFileSync(file,sql);
if(!existsSync('drizzle/meta/_journal.json'))writeFileSync('drizzle/meta/_journal.json',JSON.stringify({version:'7',dialect:'sqlite',entries:[{idx:0,version:'6',when:1793754000000,tag:'0000_market',breakpoints:true}]},null,2));
console.log('Schema migration ready');
