import {resolveParameters} from './parameters';
import type {AtmosphereParameters,ParameterPatch} from './types';
function mix(a:any,b:any,t:number,key=''):any {
 if(typeof b==='number'){if(key==='seed'||key==='depth'||key==='presetVersion')return a;return a+(b-a)*t;}
 if(typeof b==='boolean')return t===1?b:key==='enabled'?a||b:b;
 if(b&&typeof b==='object')return Object.fromEntries(Object.keys(b).map(k=>[k,mix(a?.[k]??b[k],b[k],t,k)]));return b;
}
/** Seed and pass depths stay fixed to avoid resetting moving clouds and wet glass. */
export class WeatherTransition {
 private from:AtmosphereParameters;private to:AtmosphereParameters;private elapsed=0;
 constructor(from:AtmosphereParameters,target:ParameterPatch,readonly seconds=5){if(!Number.isFinite(seconds)||seconds<=0)throw Error('Invalid transition duration');this.from=structuredClone(from);this.to=resolveParameters(target,from);this.to.seed=from.seed;
 if(!this.from.clouds.enabled)this.from.clouds.density=0;if(!this.to.clouds.enabled)this.to.clouds.density=0;
 }
 get done(){return this.elapsed>=this.seconds;}
 update(dt:number):AtmosphereParameters{if(!Number.isFinite(dt)||dt<0)throw Error('Invalid transition delta');this.elapsed=Math.min(this.seconds,this.elapsed+dt);const t=this.elapsed/this.seconds;return mix(this.from,this.to,t*t*(3-2*t));}
}
