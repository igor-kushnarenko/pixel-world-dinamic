import {PanoramaExperience} from '@pixel-world/atmosphere-engine';
import {createDemoLocation} from './location';
const scene=createDemoLocation();
const app=await PanoramaExperience.create({container:document.querySelector('#scene')!,scene,soundscape:'city',storageKey:'my-panorama.v1',fillScreen:true,parameters:{sky:{starsEnabled:true}},views:[{name:'Общий вид',layers:{'city-far':{x:0,y:0,scale:1},'city-mid':{x:0,y:0,scale:1},'city-near':{x:0,y:0,scale:1}}},{name:'Ближе',layers:{'city-far':{x:-2,y:0,scale:1.01},'city-mid':{x:5,y:0,scale:1.05},'city-near':{x:15,y:5,scale:1.12}}}]});
window.addEventListener('pagehide',()=>app.dispose(),{once:true});
