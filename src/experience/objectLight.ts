import {createSpriteMaterial,sampleSpriteLight,windowTransmission} from '../engine';
import type {SpriteLightingState} from '../engine';
export interface ObjectLightState {ambient:number;closed:number;panel:number;lamp:number}
function lighting(s:ObjectLightState):SpriteLightingState{return {ambient:s.ambient,transmission:windowTransmission(s.closed),lights:[{x:112,y:707,radius:620,intensity:s.lamp*1.4,color:[1,.78,.51]},{x:1634,y:347,radius:820,intensity:s.panel*1.4,color:[1,.84,.64]}]};}
export function sampleObjectLight(x:number,y:number,u:number,state:ObjectLightState){return sampleSpriteLight(x,y,u,lighting(state));}
export function createObjectMaterial(image:HTMLImageElement,width:number,height:number){const material=createSpriteMaterial(image,width,height);return {canvas:material.canvas,update(x:number,bottom:number,state:ObjectLightState){material.update(x,bottom,lighting(state));},dispose(){material.dispose();}};}
