import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
const assets={};for(const f of ['index.html','game.js','online.js','world3d.js','wholesale.js','style3d.css','three.module.min.js','three-LICENSE.txt'])assets['/'+f]=readFileSync('public/'+f,'utf8');assets['/']=assets['/index.html'];
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+readFileSync('worker/missions.js','utf8')+'\n'+readFileSync('worker/index.js','utf8'));
writeFileSync('dist/.openai/hosting.json',readFileSync('.openai/hosting.json'));
console.log('Built server and embedded game assets');
