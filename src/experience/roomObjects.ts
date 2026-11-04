import { exteriorVisibility } from './shutter';
import { dragPosition, fallStep, restingPosition, type Body } from './objectPhysics';
const WIDTH=1672, HEIGHT=941, W=140;
export async function mountRadio(host:HTMLElement,toggle:()=>void,tune:(direction:number)=>void){
 const image=new Image();image.src=`${import.meta.env.BASE_URL}assets/objects/radio/sprite.png`;await image.decode();
 const h=Math.round(W*image.height/image.width), key='pixel-world-dinamic.radio-position.v3';
 let position:Body={x:1240,y:835,vy:0,width:W,height:h};
 try{const stored=localStorage.getItem(key),v=JSON.parse(stored||localStorage.getItem('pixel-world-dinamic.radio-position.v2')||'null');if(v&&Number.isFinite(v.x)&&Number.isFinite(v.y))position=restingPosition({...position,...dragPosition(v.x,v.y,W,h)})}catch{}
 const button=document.createElement('button');button.className='movable-radio';button.setAttribute('aria-label','Радио: нажать — включить, перетащить — переставить');button.title='Нажмите для включения · перетащите и отпустите — радио опустится на подоконник';
 button.append(image);const dial=document.createElement('span');dial.className='movable-radio-dial';button.append(dial);const knob=document.createElement('span');knob.className='radio-tuning-knob';knob.title='Колесико мыши — сменить станцию';button.append(knob);
 // Shared foreground occlusion: objects sit behind the shelf lips and side post.
 const objectPlane=document.createElement('div');objectPlane.className='room-object-plane';host.append(objectPlane);objectPlane.append(button);
 const mask=`url("${import.meta.env.BASE_URL}assets/room-v3/prepared/object-visibility.png")`;objectPlane.style.maskImage=mask;objectPlane.style.webkitMaskImage=mask;
 let wheelTime=-Infinity;knob.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();if(!e.deltaY)return;const now=performance.now();if(now-wheelTime<180)return;wheelTime=now;tune(Math.sign(e.deltaY));},{passive:false});
 function place(){button.style.left=`${position.x/WIDTH*100}%`;button.style.top=`${(position.y-h)/HEIGHT*100}%`;button.style.width=`${W/WIDTH*100}%`}
 place();let start:{x:number;y:number;px:number;py:number;id:number}|undefined,moved=false;
 button.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();button.setPointerCapture(e.pointerId);position.vy=0;start={x:e.clientX,y:e.clientY,px:position.x,py:position.y,id:e.pointerId};moved=false;button.classList.add('dragging')};
 button.onpointermove=e=>{if(!start||e.pointerId!==start.id)return;const r=host.getBoundingClientRect(),dx=(e.clientX-start.x)*WIDTH/r.width,dy=(e.clientY-start.y)*HEIGHT/r.height;if(Math.hypot(dx,dy)>5)moved=true;if(moved){position={...position,...dragPosition(start.px+dx,start.py+dy,W,h),vy:0};place()}};
 const end=(e:PointerEvent,cancel=false)=>{if(!start||e.pointerId!==start.id)return;const click=!moved&&!cancel;start=undefined;button.classList.remove('dragging');if(click)toggle()};
 button.onpointerup=e=>end(e);button.onpointercancel=e=>end(e,true);button.onlostpointercapture=e=>end(e as PointerEvent,true);
 button.onclick=e=>{if(e.detail===0)toggle()};
 let saved='',previous=performance.now();
 return {update(on:boolean,ambient:number,closed:number,panel:number){const now=performance.now();if(!start){position=fallStep(position,(now-previous)/1000);place();if(position.vy===0){const data=JSON.stringify({x:Math.round(position.x),y:Math.round(position.y)});if(data!==saved){try{localStorage.setItem(key,data)}catch{}saved=data}}}previous=now;button.setAttribute('aria-pressed',String(on));image.style.filter=`brightness(${Math.max(0.025,ambient*exteriorVisibility(closed)+panel*0.3)})`;dial.style.opacity=on?'1':'0'}};
}
