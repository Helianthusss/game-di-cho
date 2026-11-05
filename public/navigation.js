export function createNavigator(obstacles,{left=60,right=4740,top=270,bottom=3540,step=32,radius=20}={}){
 const free=(x,y)=>x>left&&x<right&&y>top&&y<bottom&&obstacles.every(b=>Math.hypot(Math.max(b.x-x,0,x-b.x-b.w),Math.max(b.y-y,0,y-b.y-b.h))>radius);
 const cols=Math.ceil((right-left)/step),rows=Math.ceil((bottom-top)/step),point=id=>({x:left+(id%cols)*step,y:top+Math.floor(id/cols)*step});
 const usable=new Uint8Array(cols*rows);for(let i=0;i<usable.length;i++){const p=point(i);usable[i]=free(p.x,p.y)?1:0;}
 function nearest(p){let best=-1,d=Infinity;const gx=Math.round((p.x-left)/step),gy=Math.round((p.y-top)/step);for(let y=Math.max(0,gy-10);y<=Math.min(rows-1,gy+10);y++)for(let x=Math.max(0,gx-10);x<=Math.min(cols-1,gx+10);x++){const id=y*cols+x;if(!usable[id])continue;const q=point(id),dd=Math.hypot(q.x-p.x,q.y-p.y);if(dd<d){d=dd;best=id;}}return best;}
 function line(a,b){const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8);for(let i=0;i<=n;i++){const t=n?i/n:0;if(!free(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}return true;}
 function route(start,end){end={x:Math.max(left+step,Math.min(right-step,end.x)),y:Math.max(top+step,Math.min(bottom-step,end.y))};const s=nearest(start),goal=nearest(end);if(s<0||goal<0)return [];const goalPoint=point(goal);if(line(start,free(end.x,end.y)?end:goalPoint))return [free(end.x,end.y)?end:goalPoint];
 const scores=new Float64Array(usable.length).fill(Infinity),parents=new Int32Array(usable.length).fill(-1),closed=new Uint8Array(usable.length),heap=[];scores[s]=0;
 const push=(id,f)=>{let i=heap.length;heap.push({id,f});while(i){const p=(i-1)>>1;if(heap[p].f<=f)break;heap[i]=heap[p];i=p;}heap[i]={id,f};};
 const pop=()=>{const root=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return root.id;};
 push(s,0);while(heap.length){const id=pop();if(closed[id])continue;closed[id]=1;if(id===goal){const raw=[];for(let n=goal;n!==-1;n=parents[n])raw.push(point(n));raw.reverse();const path=[];let anchor=start,i=0;while(i<raw.length){let far=i;while(far+1<raw.length&&line(anchor,raw[far+1]))far++;if(!line(anchor,raw[far]))return [];path.push(raw[far]);anchor=raw[far];i=far+1;}if(free(end.x,end.y)&&line(anchor,end))path.push(end);return path;}
 const x=id%cols,y=Math.floor(id/cols);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=cols||yy<0||yy>=rows)continue;const n=yy*cols+xx;if(!usable[n]||closed[n])continue;if(dx&&dy&&(!usable[y*cols+xx]||!usable[yy*cols+x]))continue;if(!line(point(id),point(n)))continue;const g=scores[id]+Math.hypot(dx,dy)*step;if(g<scores[n]){scores[n]=g;parents[n]=id;const p=point(n);push(n,g+Math.hypot(p.x-goalPoint.x,p.y-goalPoint.y));}}}
 return [];}
 return {route,free,line};
}
