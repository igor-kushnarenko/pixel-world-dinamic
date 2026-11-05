import {resolveParameters} from './parameters';
export type WeatherKind='clear'|'broken'|'overcast'|'rain'|'storm'|'mist';
export const WEATHER_NAMES:Record<WeatherKind,string>={clear:'Чистое небо',broken:'Переменная облачность',overcast:'Пасмурно',rain:'Дождь',storm:'Гроза',mist:'Туманная тишина'};
/** Seeded, coherent profiles. Not independent rolls for physically conflicting knobs. */
export function randomWeatherPreset(seed:number,layerIds:string[]=['far','midfar','midnear','near']){
 let state=seed>>>0;const rng=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const range=(a:number,b:number)=>a+(b-a)*rng();
 const roll=rng(),kind:WeatherKind=roll<.25?'clear':roll<.45?'broken':roll<.6?'overcast':roll<.78?'rain':roll<.87?'storm':'mist';
 const period=rng();let timeOfDay=period<.4?range(21,24):period<.55?range(0,4.5):period<.85?range(8,16):rng()<.5?range(5.5,7):range(18,19.3);
 if(kind==='mist')timeOfDay=rng()<.65?range(5.5,7.8):range(0,5);
 const wet=kind==='rain'||kind==='storm',dense=wet||kind==='overcast';
 const coverage=kind==='clear'?0:kind==='mist'?range(.15,.55):dense?range(.88,1):range(.3,.65);
 const density=dense?range(.84,1):kind==='clear'?0:range(.4,.7);
 const layers=Object.fromEntries(layerIds.map((id,i)=>{
  const distance=1-i/Math.max(1,layerIds.length)*.8;
  const fog=(kind==='mist'?range(.25,.55):wet?range(.06,.18):kind==='overcast'?range(.015,.06):range(0,.025))*distance;
  return [id,{hazeDensity:(kind==='mist'?range(.12,.25):wet?range(.07,.16):range(.015,.065))*distance,fogDensity:fog,fogAmount:kind==='mist'?range(.4,.7):range(.2,.45),billowing:kind==='mist'?range(.3,.65):range(.02,.2)}];
 }));
 const parameters=resolveParameters({seed:seed&65535,timeOfDay,
  sky:{starsEnabled:true,overcast:dense?(wet?.9:.72):kind==='mist'?.35:0,horizonGlow:kind==='clear'?.12:.08},
  clouds:{enabled:coverage>0,coverage,density,scale:range(.28,.38),windSpeed:kind==='mist'?range(.02,.12):wet?range(.25,.65):range(.08,.35),windDirectionDeg:range(-180,180),
   layers:{far:{coverage:1,height:dense?.45:.25,thickness:dense?.8:.28},low:{coverage:1,height:dense?.55:.4,thickness:dense?.85:.3}}},
  weather:{rain:kind==='storm'?range(.6,.95):kind==='rain'?range(.2,.65):0,stormEnabled:kind==='storm',fog:0,layers}});
 return {kind,name:WEATHER_NAMES[kind],parameters};
}
