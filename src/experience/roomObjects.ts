import { exteriorVisibility } from './shutter';
const WIDTH=1672, HEIGHT=941, W=220;
export function radioPlacement(x:number,y:number){return {x:Math.round(Math.max(80,Math.min(1620-W,x))),y:Math.round(Math.max(795,Math.min(838,y)))}};
/** Native room coordinates. Radio's foot sits on the sill; narrow shelves cannot support its width. */
export async function mountRadio(host:HTMLElement,toggle:()=>void){
 const image=new Image();image.src=`${import.meta.env.BASE_URL}assets/objects/radio/sprite.png`;await image.decode();
 const h=Math.round(W*image.height/image.width), key='pixel-world-dinamic.radio-position.v1';
 let position=radioPlacement(1240,825);
 try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&Number.isFinite(v.x)&&Number.isFinite(v.y))position=radioPlacement(v.x,v.y)}catch{}
 const button=document.createElement('button');button.className='movable-radio';button.setAttribute('aria-label','Радио: нажать — включить, перетащить — переставить');button.title='Нажмите для включения · перетащите по подоконнику';
 button.append(image);const dial=document.createElement('span');dial.className='movable-radio-dial';button.append(dial);host.append(button);
 function place(){button.style.left=`${position.x/WIDTH*100}%`;button.style.top=`${(position.y-h)/HEIGHT*100}%`;button.style.width=`${W/WIDTH*100}%`}
 place();let start:{x:number;y:number;px:number;py:number;id:number}|undefined,moved=false;
 button.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();button.setPointerCapture(e.pointerId);start={x:e.clientX,y:e.clientY,px:position.x,py:position.y,id:e.pointerId};moved=false;button.classList.add('dragging')};
 button.onpointermove=e=>{if(!start||e.pointerId!==start.id)return;const r=host.getBoundingClientRect(),dx=(e.clientX-start.x)*WIDTH/r.width,dy=(e.clientY-start.y)*HEIGHT/r.height;if(Math.hypot(dx,dy)>5)moved=true;if(moved){position=radioPlacement(start.px+dx,start.py+dy);place()}};
 const end=(e:PointerEvent,cancel=false)=>{if(!start||e.pointerId!==start.id)return;const click=!moved&&!cancel;start=undefined;button.classList.remove('dragging');try{localStorage.setItem(key,JSON.stringify(position))}catch{}if(click)toggle()};
 button.onpointerup=e=>end(e);button.onpointercancel=e=>end(e,true);button.onlostpointercapture=e=>end(e as PointerEvent,true);
 button.onclick=e=>{if(e.detail===0)toggle()};
 return {update(on:boolean,ambient:number,closed:number,panel:number){button.setAttribute('aria-pressed',String(on));image.style.filter=`brightness(${Math.max(0.025,ambient*exteriorVisibility(closed)+panel*0.3)})`;dial.style.opacity=on?'1':'0'}};
}
