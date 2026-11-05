export interface SpriteLight {x:number;y:number;radius:number;intensity:number;color:readonly [number,number,number]}
export interface SpriteLightingState {ambient:number;transmission?:number;minimumAmbient?:number;lights:readonly SpriteLight[]}
export function windowTransmission(closed:number):number{if(!Number.isFinite(closed))throw new Error('Invalid shutter closure');return Math.pow(1-Math.max(0,Math.min(1,closed)),1.4);}
function validateLighting(s:SpriteLightingState){
 if(!Number.isFinite(s.ambient)||s.ambient<0||!Number.isFinite(s.transmission??1)||(s.transmission??1)<0||(s.transmission??1)>1||!Number.isFinite(s.minimumAmbient??.015)||(s.minimumAmbient??.015)<0)throw new Error('Invalid ambient lighting');
 for(const l of s.lights)if(![l.x,l.y,l.radius,l.intensity,...l.color].every(Number.isFinite)||l.radius<=0||l.intensity<0||l.color.length!==3||l.color.some(c=>c<0||c>1))throw new Error('Invalid sprite light');
}
/** Coordinates and radii use the same scene pixel space as the sprite. */
export function sampleSpriteLight(x:number,y:number,u:number,state:SpriteLightingState):[number,number,number]{
 validateLighting(state);if(![x,y,u].every(Number.isFinite))throw new Error('Invalid sample');
 const fill=Math.max(state.minimumAmbient??.015,state.ambient*(state.transmission??1));const result:[number,number,number]=[fill,fill,fill];
 for(const l of state.lights){const dx=l.x-x,d=Math.hypot(dx,l.y-y),facing=.85+.15*(Math.max(0,Math.min(1,u))-.5)*2*dx/Math.max(1,d),strength=l.intensity/(1+(d/l.radius)**2)*facing;for(let c=0;c<3;c++)result[c]+=strength*l.color[c];}
 return result;
}
/** A low-resolution light field is interpolated over native, nearest-sampled albedo.
 * Emissive screen/keyboard/dial remain separate siblings and are never multiplied. */
export function createSpriteMaterial(image:HTMLImageElement,width:number,height:number){
 if(!image.complete||!image.naturalWidth||![width,height].every(n=>Number.isInteger(n)&&n>0&&n<=4096))throw new Error('Decoded image and valid sprite dimensions required');
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.className='object-material';
 const ctx=canvas.getContext('2d')!,field=document.createElement('canvas');field.width=17;field.height=17;
 const fc=field.getContext('2d')!,data=fc.createImageData(17,17);let previous='',disposed=false;const visibility=image.style.visibility;
 image.style.visibility='hidden';
 return {canvas,update(x:number,bottom:number,state:SpriteLightingState){
  if(disposed)return;validateLighting(state);const key=JSON.stringify([x,bottom,state]);if(key===previous)return;previous=key;
  for(let j=0;j<17;j++)for(let i=0;i<17;i++){
   const u=i/16,v=j/16,c=sampleSpriteLight(x+u*width,bottom-height+v*height,u,state),offset=(j*17+i)*4;
   for(let k=0;k<3;k++)data.data[offset+k]=Math.min(255,Math.round(c[k]*255));data.data[offset+3]=255;
  }
  fc.putImageData(data,0,0);ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,width,height);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,width,height);
  ctx.globalCompositeOperation='multiply';ctx.imageSmoothingEnabled=true;ctx.drawImage(field,0,0,width,height);
  ctx.globalCompositeOperation='destination-in';ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,width,height);
  ctx.globalCompositeOperation='source-over';
 },dispose(){if(disposed)return;disposed=true;image.style.visibility=visibility;canvas.remove();canvas.width=canvas.height=field.width=field.height=0;}};
}
