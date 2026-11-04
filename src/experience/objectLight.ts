import { exteriorVisibility } from './shutter';
export interface ObjectLightState {ambient:number;closed:number;panel:number;lamp:number}
/** Soft inverse-square falloff in scene pixels, with a shallow curved-surface facing term. */
export function sampleObjectLight(x:number,y:number,u:number,state:ObjectLightState):[number,number,number]{
 const fill=Math.max(.015,state.ambient*exteriorVisibility(state.closed));
 const result:[number,number,number]=[fill,fill,fill];
 for(const light of [{x:112,y:707,radius:620,power:state.lamp,color:[1,.78,.51]}, {x:1634,y:347,radius:820,power:state.panel,color:[1,.84,.64]}]){
  const dx=light.x-x,dy=light.y-y,d=Math.hypot(dx,dy);
  const attenuation=1/(1+Math.pow(d/light.radius,2));
  const facing=.85+.15*((u-.5)*2)*dx/Math.max(1,d);
  const strength=light.power*1.4*attenuation*facing;
  for(let c=0;c<3;c++)result[c]+=strength*light.color[c];
 }
 return result;
}
/** A low-resolution light field is interpolated over native, nearest-sampled albedo.
 * Emissive screen/keyboard/dial remain separate siblings and are never multiplied. */
export function createObjectMaterial(image:HTMLImageElement,width:number,height:number){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.className='object-material';
 const ctx=canvas.getContext('2d')!,field=document.createElement('canvas');field.width=17;field.height=17;
 const fc=field.getContext('2d')!,data=fc.createImageData(17,17);let previous='';
 image.style.visibility='hidden';
 return {canvas,update(x:number,bottom:number,state:ObjectLightState){
  const key=[x,bottom,state.ambient,state.closed,state.panel,state.lamp].map(v=>v.toFixed(3)).join(',');if(key===previous)return;previous=key;
  for(let j=0;j<17;j++)for(let i=0;i<17;i++){
   const u=i/16,v=j/16,c=sampleObjectLight(x+u*width,bottom-height+v*height,u,state),offset=(j*17+i)*4;
   for(let k=0;k<3;k++)data.data[offset+k]=Math.min(255,Math.round(c[k]*255));data.data[offset+3]=255;
  }
  fc.putImageData(data,0,0);ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,width,height);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,width,height);
  ctx.globalCompositeOperation='multiply';ctx.imageSmoothingEnabled=true;ctx.drawImage(field,0,0,width,height);
  ctx.globalCompositeOperation='destination-in';ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,width,height);
  ctx.globalCompositeOperation='source-over';
 }};
}
