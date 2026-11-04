export interface Body {x:number;y:number;vy:number;width:number;height:number}
export interface Surface {id:string;left:number;right:number;y:number; rightY?:number}
export const ROOM_SURFACES:Surface[]=[
 {id:'shelf-top',left:74,right:204,y:222,rightY:266},
 {id:'shelf-middle',left:74,right:204,y:430,rightY:442},
 {id:'shelf-lower',left:74,right:204,y:614,rightY:594},
 {id:'shelf-bottom',left:74,right:204,y:820,rightY:766},
 {id:'sill',left:70,right:1625,y:835}
];
export function dragPosition(x:number,y:number,width:number,height:number){return {x:Math.max(70,Math.min(1625-width,x)),y:Math.max(height+32,Math.min(835,y))}}
export function supported(body:Body,s:Surface){return body.x+body.width*.13>=s.left && body.x+body.width*.87<=s.right}
/** Seat the two feet above the front lip. A flat sprite must not intersect a sloping fascia. */
export function supportY(body:Body,s:Surface){
 const slope=((s.rightY??s.y)-s.y)/(s.right-s.left);
 const at=(x:number)=>s.y+slope*(x-s.left);
 return s.rightY===undefined?s.y:Math.floor(Math.min(at(body.x+body.width*.13),at(body.x+body.width*.87))+1);
}
function supportsBelow(body:Body){return ROOM_SURFACES.filter(s=>supported(body,s)).map(s=>supportY(body,s)).filter(y=>y>=body.y-.01).sort((a,b)=>a-b)}
/** Sweep the feet through every crossed support; never tunnel through a shelf. */
export function fallStep(body:Body,dt:number,surfaces=ROOM_SURFACES):Body{
 const t=Math.max(0,Math.min(.05,dt)),vy=Math.min(1100,body.vy+1500*t),next=body.y+vy*t;
 const hit=surfaces.filter(s=>supported(body,s)).map(s=>supportY(body,s)).filter(y=>y>=body.y-.01&&y<=next).sort((a,b)=>a-b)[0];
 return {...body,y:hit??Math.min(835,next),vy:hit!==undefined||next>=835?0:vy};
}
export function restingPosition(body:Body){return {...body,y:supportsBelow(body)[0]??835,vy:0}}
/** Re-seat a saved item after correcting authored support coordinates. */
export function migratePlacement(body:Body){const levels=ROOM_SURFACES.filter(s=>supported(body,s)).map(s=>supportY(body,s));return {...body,y:levels.sort((a,b)=>Math.abs(a-body.y)-Math.abs(b-body.y))[0]??835,vy:0}}
