import {spots,npcPositions,W,H} from '../public/city-layout.js';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
const assets={};for(const f of ['index.html','game.js','online.js','world3d.js','market-life.js','market-audio.js','navigation.js','wholesale.js','city.js','city-layout.js','style3d.css','three.module.min.js','three-LICENSE.txt'])assets['/'+f]=readFileSync('public/'+f,'utf8');assets['/']=assets['/index.html'];
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
// The server uses the same layout as the browser: mission positions, restaurant entrance and world bounds.
writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\nconst CITY_RESTAURANT='+JSON.stringify(spots.restaurant)+';\nconst LAYOUT='+JSON.stringify({W,H,npcPositions})+';\n'+readFileSync('worker/missions.js','utf8')+'\n'+readFileSync('worker/index.js','utf8'));
writeFileSync('dist/.openai/hosting.json',readFileSync('.openai/hosting.json'));
console.log('Built server and embedded game assets');
