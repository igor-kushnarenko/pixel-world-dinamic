import { exteriorVisibility } from './shutter';
import { dragPosition, fallStep, restingPosition, type Body } from './objectPhysics';
const WIDTH=1672, HEIGHT=941, W=200;
export async function mountComputer(host:HTMLElement,toggle:()=>void,screen:HTMLCanvasElement){
 const image=new Image();image.src=`${import.meta.env.BASE_URL}assets/objects/computer/sprite.png`;await image.decode();
 const h=Math.round(W*image.height/image.width), key='pixel-world-dinamic.computer-position.v1';
 let position:Body={x:500,y:835,vy:0,width:W,height:h};
 try{const stored=localStorage.getItem(key),v=JSON.parse(stored||'null');if(v&&Number.isFinite(v.x)&&Number.isFinite(v.y))position=restingPosition({...position,...dragPosition(v.x,v.y,W,h)})}catch{}
 const button=document.createElement('button');button.className='movable-radio movable-computer';button.setAttribute('aria-label','Компьютер: кнопка питания — включить, корпус — перетащить');button.title='Нажмите для включения · перетащите и отпустите — компьютер опустится на подоконник';
 button.append(image);
 const keyboard=new Image();keyboard.src=image.src;keyboard.className='computer-keyboard';button.append(keyboard);
 const display=document.createElement('canvas');display.width=320;display.height=228;display.className='computer-display';button.append(display);const ctx=display.getContext('2d')!;ctx.imageSmoothingEnabled=false;
 const glass=document.createElement('span');glass.className='computer-glass';button.append(glass);
 const power=document.createElement('span');power.className='computer-power';power.title='Включить / выключить компьютер';button.append(power);
 const objectPlane=document.createElement('div');objectPlane.className='room-object-plane';host.append(objectPlane);objectPlane.append(button);
 const mask=`url("${import.meta.env.BASE_URL}assets/room-v3/prepared/object-visibility.png")`;objectPlane.style.maskImage=mask;objectPlane.style.webkitMaskImage=mask;
 let powerPressed=false,lastDraw=-Infinity,wasOn=false;
 function place(){button.style.left=`${position.x/WIDTH*100}%`;button.style.top=`${(position.y-h)/HEIGHT*100}%`;button.style.width=`${W/WIDTH*100}%`}
 place();let start:{x:number;y:number;px:number;py:number;id:number}|undefined,moved=false;
 button.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();button.setPointerCapture(e.pointerId);powerPressed=e.target===power;position.vy=0;start={x:e.clientX,y:e.clientY,px:position.x,py:position.y,id:e.pointerId};moved=false;button.classList.add('dragging')};
 button.onpointermove=e=>{if(!start||e.pointerId!==start.id)return;const r=host.getBoundingClientRect(),dx=(e.clientX-start.x)*WIDTH/r.width,dy=(e.clientY-start.y)*HEIGHT/r.height;if(Math.hypot(dx,dy)>5)moved=true;if(moved){position={...position,...dragPosition(start.px+dx,start.py+dy,W,h),vy:0};place()}};
 const end=(e:PointerEvent,cancel=false)=>{if(!start||e.pointerId!==start.id)return;const click=!moved&&!cancel;start=undefined;button.classList.remove('dragging');if(click&&powerPressed)toggle()};
 button.onpointerup=e=>end(e);button.onpointercancel=e=>end(e,true);button.onlostpointercapture=e=>end(e as PointerEvent,true);
 button.onclick=e=>{if(e.detail===0)toggle()};
 let saved='',previous=performance.now();
 return {update(on:boolean,ambient:number,closed:number,panel:number,lamp:number=0){const now=performance.now();if(!start){position=fallStep(position,(now-previous)/1000);place();if(position.vy===0){const data=JSON.stringify({x:Math.round(position.x),y:Math.round(position.y)});if(data!==saved){try{localStorage.setItem(key,data)}catch{}saved=data}}}previous=now;button.setAttribute('aria-pressed',String(on));image.style.filter=`brightness(${Math.max(0.025,ambient*exteriorVisibility(closed)+panel*0.9+lamp*(0.25+Math.max(0,1-Math.hypot((position.x+W/2-112)/1000,(position.y-707)/700))*.7))})`;display.style.opacity=on?'1':'0';keyboard.style.opacity=on?'0.5':'0';power.classList.toggle('on',on);if(on&&(!wasOn||now-lastDraw>1000)){ctx.clearRect(0,0,320,228);ctx.drawImage(screen,0,0,320,228);lastDraw=now}wasOn=on;objectPlane.style.zIndex=String(Math.round(position.y))}};
}
