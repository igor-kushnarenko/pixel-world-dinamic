import {CitySound} from './CitySound';
export type SoundscapeProfile='city'|'forest'|'coast'|'quiet';
export interface LandscapeSound {url:string;volume?:number;loop?:boolean}
/** Create/resume only from an explicit user gesture. URL tracks belong to the host. */
export class LandscapeAudio {
 private ctx:AudioContext;private gain:GainNode;private filter:BiquadFilterNode;private bed:GainNode;private rain:GainNode;private noise:AudioBufferSourceNode;private city?:CitySound;private tracks:HTMLAudioElement[]=[];private trackSources:MediaElementAudioSourceNode[]=[];private disposed=false;
 constructor(readonly profile:SoundscapeProfile='quiet',sounds:readonly LandscapeSound[]=[]){this.ctx=new AudioContext();this.gain=this.ctx.createGain();this.gain.gain.value=0;this.filter=this.ctx.createBiquadFilter();this.filter.type='lowpass';this.filter.connect(this.gain).connect(this.ctx.destination);this.bed=this.ctx.createGain();this.rain=this.ctx.createGain();this.bed.connect(this.filter);this.rain.connect(this.filter);
 const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*4,this.ctx.sampleRate),data=buffer.getChannelData(0);let previous=0;for(let i=0;i<data.length;i++){previous=(previous+(Math.random()*2-1)*.025)/1.025;data[i]=previous*3;}
 this.noise=this.ctx.createBufferSource();this.noise.buffer=buffer;this.noise.loop=true;const wind=this.ctx.createBiquadFilter();wind.type='lowpass';wind.frequency.value=profile==='coast'?650:350;this.noise.connect(wind).connect(this.bed);const rainfall=this.ctx.createBiquadFilter();rainfall.type='highpass';rainfall.frequency.value=700;this.noise.connect(rainfall).connect(this.rain);this.noise.start();if(profile==='city')this.city=new CitySound(this.ctx,this.gain);
 for(const sound of sounds){const track=new Audio(sound.url);track.crossOrigin='anonymous';track.loop=sound.loop!==false;track.volume=Math.max(0,Math.min(1,sound.volume??1));const source=this.ctx.createMediaElementSource(track);source.connect(this.filter);this.tracks.push(track);this.trackSources.push(source);}
 this.set(false,.5,0,0);}
 async resume(){if(this.disposed)return;await this.ctx.resume();await Promise.allSettled(this.tracks.map(t=>t.play()));}
 set(enabled:boolean,volume:number,rain:number,closed:number){if(this.disposed)return;const t=this.ctx.currentTime,v=Math.max(0,Math.min(1,volume)),c=Math.max(0,Math.min(1,closed));this.gain.gain.setTargetAtTime(enabled?v*(1-c*.85):0,t,.2);this.filter.frequency.setTargetAtTime(450+(1-c)**2*9550,t,.2);this.bed.gain.setTargetAtTime(this.profile==='coast'?.12:this.profile==='forest'?.045:0,t,.5);this.rain.gain.setTargetAtTime(Math.max(0,rain)*.23,t,.4);this.city?.set(enabled,v,c);}
 dispose(){if(this.disposed)return;this.disposed=true;this.city?.dispose();this.noise.stop();this.noise.disconnect();this.tracks.forEach(t=>{t.pause();t.removeAttribute('src');t.load()});this.trackSources.forEach(t=>t.disconnect());void this.ctx.close();}
}
