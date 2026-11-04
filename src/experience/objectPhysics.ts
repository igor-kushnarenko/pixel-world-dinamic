export interface Body {x:number;y:number;vy:number;width:number;height:number}
export interface Surface {id:string;left:number;right:number;y:number}
export const ROOM_SURFACES:Surface[]=[
 {id:'shelf-top',left:74,right:204,y:260},
 {id:'shelf-middle',left:74,right:204,y:444},
 {id:'shelf-lower',left:74,right:204,y:608},
 {id:'shelf-bottom',left:74,right:204,y:790},
 {id:'sill',left:70,right:1625,y:835}
];
export function dragPosition(x:number,y:number,width:number,height:number){return {x:Math.max(70,Math.min(1625-width,x)),y:Math.max(height+32,Math.min(835,y))}}
export function supported(body:Body,s:Surface){return body.x+body.width*.13>=s.left && body.x+body.width*.87<=s.right}
/** Sweep the feet through every crossed support; never tunnel through a shelf. */
export function fallStep(body:Body,dt:number,surfaces=ROOM_SURFACES):Body{
 const t=Math.max(0,Math.min(.05,dt)),vy=Math.min(1100,body.vy+1500*t),next=body.y+vy*t;
 const hit=surfaces.filter(s=>supported(body,s)&&s.y>=body.y-.01&&s.y<=next).sort((a,b)=>a.y-b.y)[0];
 return {...body,y:hit?hit.y:Math.min(835,next),vy:hit||next>=835?0:vy};
}
export function restingPosition(body:Body){const hit=ROOM_SURFACES.filter(s=>supported(body,s)&&s.y>=body.y-.01).sort((a,b)=>a.y-b.y)[0];return {...body,y:hit?.y??835,vy:0}}
