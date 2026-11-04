export interface Body {x:number;y:number;vy:number;width:number;height:number}
export interface Surface {id:string;left:number;right:number;y:number}
/** Movable objects belong to the window and sill; shelves are decorative. */
export const ROOM_SURFACES:Surface[]=[{id:'sill',left:235,right:1625,y:835}];
export function dragPosition(x:number,y:number,width:number,height:number){return {x:Math.max(235,Math.min(1625-width,x)),y:Math.max(height+115,Math.min(835,y))}}
export function supported(body:Body,s:Surface){return body.x+body.width*.13>=s.left&&body.x+body.width*.87<=s.right}
export function fallStep(body:Body,dt:number):Body{
 const t=Math.max(0,Math.min(.05,dt)),vy=Math.min(1100,body.vy+1500*t),next=body.y+vy*t;
 return {...body,y:Math.min(835,next),vy:next>=835?0:vy};
}
/** Restore old shelf positions on the sill and outside the decorative shelving. */
export function restingPosition(body:Body){return {...body,...dragPosition(body.x,835,body.width,body.height),vy:0}}
