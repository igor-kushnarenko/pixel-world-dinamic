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
