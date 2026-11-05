import type {ShutterDefinition,ShutterLight} from './types';
/** Light order: shelf, wall, radio, computer. Defaults scale to scene dimensions. */
export function resolveShutter(s:ShutterDefinition,width:number,height:number,nativePeriod=9){
 const left=s.left??0,right=s.right??width,texturePeriod=s.texturePeriod??nativePeriod;
 const interiorLights:readonly ShutterLight[]=s.interiorLights??[{x:.067*width,y:.75*height,radiusX:.54*width,radiusY:.69*height},{x:.94*width,y:.37*height,radiusX:.6*width,radiusY:.74*height},{x:.8*width,y:.79*height,radiusX:.18*width,radiusY:.21*height},{x:.28*width,y:.79*height,radiusX:.21*width,radiusY:.27*height}];
 if(![width,height,s.top,s.bottom,s.depth,left,right,texturePeriod].every(Number.isFinite)||width<=0||height<=0||s.top<0||s.bottom>height||s.bottom<=s.top||s.depth<=0||s.depth>=1000||left<0||right>width||right<=left||texturePeriod<=0||interiorLights.length!==4||interiorLights.some(l=>![l.x,l.y,l.radiusX,l.radiusY].every(Number.isFinite)||l.radiusX<=0||l.radiusY<=0))throw new Error('Invalid shutter definition');
 return {...s,left,right,texturePeriod,interiorLights:interiorLights.map(l=>({...l}))};
}
