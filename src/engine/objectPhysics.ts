export interface Body {x:number;y:number;vy:number;width:number;height:number}
export const SILL_BACK=775,SILL_FRONT=835;
/** The sill widens towards the viewer; its rear edge follows the window opening. */
export function sillBounds(y:number,width:number){const t=Math.max(0,Math.min(1,(y-SILL_BACK)/(SILL_FRONT-SILL_BACK)));return {left:235-165*t,right:1590+50*t-width}}
export function dragPosition(x:number,y:number,width:number,height:number){const py=Math.max(height+115,Math.min(SILL_FRONT,y)),b=sillBounds(py,width);return {x:Math.max(b.left,Math.min(b.right,x)),y:py}}
export function restingPosition(body:Body){const y=Math.max(SILL_BACK,Math.min(SILL_FRONT,body.y));return {...body,...dragPosition(body.x,y,body.width,body.height),vy:0}}
/** Release over the window drops to the back; release on the tabletop preserves depth. */
export function fallStep(body:Body,dt:number):Body{
 const floor=Math.max(SILL_BACK,Math.min(SILL_FRONT,body.y));
 const t=Math.max(0,Math.min(.05,dt)),vy=Math.min(1100,body.vy+1500*t),next=body.y+vy*t;
 return {...body,y:Math.min(floor,next),vy:next>=floor?0:vy};
}

interface PhysicalObject {body:Body;vx:number;mass:number;held:boolean;floor:number;sampleTime:number;sampleX:number;}
/** Upright 2.5D bodies: depth lanes, horizontal impulses and fixed substeps. */
export interface SillGeometry {back:number;front:number;backLeft:number;backRight:number;frontLeft:number;frontRight:number}
export class SillPhysics {
 constructor(private geometry:SillGeometry={back:SILL_BACK,front:SILL_FRONT,backLeft:235,backRight:1590,frontLeft:70,frontRight:1640}){if(!Object.values(geometry).every(Number.isFinite)||geometry.front<=geometry.back||geometry.backRight<=geometry.backLeft||geometry.frontRight<=geometry.frontLeft)throw Error('Invalid sill geometry');}
 private bounds(y:number,width:number){const g=this.geometry,t=Math.max(0,Math.min(1,(y-g.back)/(g.front-g.back)));return {left:g.backLeft+(g.frontLeft-g.backLeft)*t,right:g.backRight+(g.frontRight-g.backRight)*t-width};}
 private drag(x:number,y:number,width:number,height:number){const py=Math.max(height+10,Math.min(this.geometry.front,y)),b=this.bounds(py,width);return {x:Math.max(b.left,Math.min(b.right,x)),y:py};}

 private objects:PhysicalObject[]=[];
 add(body:Body,mass:number){const o:PhysicalObject={body:{...body},vx:0,mass,held:false,floor:Math.max(this.geometry.back,body.y),sampleTime:0,sampleX:body.x};this.objects.push(o);
 return {get body(){return o.body},begin:(now:number)=>{o.held=true;o.vx=0;o.body.vy=0;o.sampleTime=now;o.sampleX=o.body.x;},drag:(x:number,y:number,now:number)=>{const dt=(now-o.sampleTime)/1000;o.vx=dt>0?Math.max(-650,Math.min(650,(x-o.sampleX)/dt)):0;o.sampleTime=now;o.sampleX=x;o.body={...o.body,...this.drag(x,y,o.body.width,o.body.height),vy:0};o.floor=Math.max(this.geometry.back,o.body.y);this.collide();},release:(now:number,cancel=false)=>{o.held=false;if(cancel||now-o.sampleTime>100)o.vx=0;o.floor=Math.max(this.geometry.back,Math.min(this.geometry.front,o.body.y));},step:(dt:number)=>{if(!o.held&&(o.vx!==0||o.body.vy!==0||o.body.y<o.floor)){let left=Math.max(0,Math.min(.05,dt));while(left>0){const t=Math.min(left,1/120);left-=t;const b=o.body;b.vy=Math.min(1100,b.vy+1500*t);b.y=Math.min(o.floor,b.y+b.vy*t);if(b.y>=o.floor)b.vy=0;b.x+=o.vx*t;const bounds=this.bounds(b.y,b.width);if(b.x<bounds.left||b.x>bounds.right){b.x=Math.max(bounds.left,Math.min(bounds.right,b.x));o.vx*=-.08;}o.vx*=Math.exp(-(b.vy===0?8:1.5)*t);if(Math.abs(o.vx)<2)o.vx=0;this.collide();}}return o.body;},get sleeping(){return !o.held&&o.vx===0&&o.body.vy===0}};
 }
 private collide(){for(let iteration=0;iteration<4;iteration++)for(let i=0;i<this.objects.length;i++)for(let j=i+1;j<this.objects.length;j++){
 const a=this.objects[i],b=this.objects[j],p=a.body,q=b.body;
 if(Math.abs(a.floor-b.floor)>18||p.y<=q.y-q.height||q.y<=p.y-p.height)continue;
 const overlap=Math.min(p.x+p.width,q.x+q.width)-Math.max(p.x,q.x);if(overlap<=0)continue;
 const direction=p.x+p.width/2<q.x+q.width/2?1:-1,ia=a.held?0:1/a.mass,ib=b.held?0:1/b.mass,total=ia+ib;if(!total)continue;
 p.x-=direction*(overlap+.1)*ia/total;q.x+=direction*(overlap+.1)*ib/total;
 const closing=(a.vx-b.vx)*direction;if(closing>0){const impulse=closing*1.08/total;if(!a.held)a.vx-=impulse*ia*direction;if(!b.held)b.vx+=impulse*ib*direction;}
 for(const o of [a,b]){const bounds=this.bounds(o.body.y,o.body.width);o.body.x=Math.max(bounds.left,Math.min(bounds.right,o.body.x));}
 }}
}
export const roomPhysics=new SillPhysics();
