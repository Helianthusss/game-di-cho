// High-fidelity synthesized street ambience for Vietnamese market atmosphere.
export function createMarketAudio(){
 let context,master,timer,chopTimer,bellTimer,on=false;
 const nodes=[];
 async function start(){
  if(!context){
   const Audio=window.AudioContext||window.webkitAudioContext;
   if(!Audio)throw Error('Trình duyệt chưa hỗ trợ âm thanh nền.');
   context=new Audio();
   master=context.createGain();
   master.gain.value=.04;
   master.connect(context.destination);

   // Ambient crowd chatter rumble bandpass noise
   const buffer=context.createBuffer(1,context.sampleRate*3,context.sampleRate);
   const data=buffer.getChannelData(0);
   let last=0;
   for(let i=0;i<data.length;i++){
    last=(last+(0.035*(Math.random()*2-1)))/1.035;
    data[i]=last*4.5;
   }
   const noise=context.createBufferSource();
   noise.buffer=buffer;noise.loop=true;
   const filter=context.createBiquadFilter();
   filter.type='bandpass';filter.frequency.value=520;filter.Q.value=0.55;
   noise.connect(filter);filter.connect(master);
   noise.start();nodes.push(noise);
  }
  await context.resume();
  on=true;
  master.gain.setTargetAtTime(.04,context.currentTime,.3);

  // Cleaver chopping board "cộc cộc"
  clearInterval(chopTimer);
  chopTimer=setInterval(()=>{
   if(!on||document.hidden)return;
   const osc=context.createOscillator(),g=context.createGain();
   osc.type='triangle';osc.frequency.setValueAtTime(220,context.currentTime);
   osc.frequency.exponentialRampToValueAtTime(45,context.currentTime+.08);
   g.gain.setValueAtTime(.06,context.currentTime);
   g.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.09);
   osc.connect(g);g.connect(master);
   osc.start();osc.stop(context.currentTime+.1);
   setTimeout(()=>{
    if(!on||document.hidden)return;
    const osc2=context.createOscillator(),g2=context.createGain();
    osc2.type='triangle';osc2.frequency.setValueAtTime(190,context.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(40,context.currentTime+.07);
    g2.gain.setValueAtTime(.045,context.currentTime);
    g2.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.08);
    osc2.connect(g2);g2.connect(master);
    osc2.start();osc2.stop(context.currentTime+.09);
   },160);
  },12000);

  // Bicycle / scooter bell ding
  clearInterval(bellTimer);
  bellTimer=setInterval(()=>{
   if(!on||document.hidden)return;
   [880,1050].forEach((freq,i)=>{
    setTimeout(()=>{
     if(!on||document.hidden)return;
     const osc=context.createOscillator(),g=context.createGain();
     osc.type='sine';osc.frequency.value=freq;
     g.gain.setValueAtTime(0,context.currentTime);
     g.gain.linearRampToValueAtTime(.035,context.currentTime+.01);
     g.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.6);
     osc.connect(g);g.connect(master);
     osc.start();osc.stop(context.currentTime+.65);
    },i*140);
   });
  },24000);
 }
 function stop(){
  on=false;clearInterval(chopTimer);clearInterval(bellTimer);
  if(context)master.gain.setTargetAtTime(0,context.currentTime,.2);
 }
 document.addEventListener('visibilitychange',()=>{
  if(context)master.gain.setTargetAtTime(document.hidden||!on?0:.04,context.currentTime,.2);
 });
 return {start,stop,get on(){return on;}};
}
