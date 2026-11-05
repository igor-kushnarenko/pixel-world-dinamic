import {chromium} from 'playwright';
import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const port=4187,site=`http://127.0.0.1:${port}/`;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{windowsHide:true,stdio:'ignore'});let browser;
try{
 for(let i=0;i<60;i++){try{if((await fetch(site)).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await browser.newPage({viewport:{width:1500,height:1050}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(site+'?fresh&paused');await p.locator('#enter-quiet').click();await p.waitForFunction(()=>!!window.atmosphere);
 const gpu=await p.evaluate(async()=>{
  const {AtmosphereEngine}=await import('/src/engine/index.ts');const c=document.createElement('div');document.body.append(c);
  const e=await AtmosphereEngine.create({container:c,autoRender:false,scene:{width:480,height:270},parameters:{timeOfDay:22,sky:{starsEnabled:false}}});
  const base=e.readPixels();e.setParameters({sky:{starsEnabled:true}});e.seek(0);const first=e.readPixels();e.seek(1.7);const second=e.readPixels();let stars=0,twinkled=0,moved=0;
  for(let i=0;i<base.length;i+=4){const a=first[i]>base[i]+3,b=second[i]>base[i]+3;if(a)stars++;if(a&&first[i]!==second[i])twinkled++;if(a!==b)moved++}
  e.setParameters({timeOfDay:12,sky:{starsEnabled:false}});const day=e.readPixels();e.setParameters({sky:{starsEnabled:true}});const dayStars=e.readPixels();let daytimeChanges=0;for(let i=0;i<day.length;i++)if(day[i]!==dayStars[i])daytimeChanges++;
  const top=Array.from(day.slice(((269-10)*480+240)*4,((269-10)*480+240)*4+3)),bottom=Array.from(day.slice((10*480+240)*4,(10*480+240)*4+3));
  e.dispose();c.remove();return {stars,twinkled,moved,daytimeChanges,top,bottom};
 });
 assert(gpu.stars>3);assert(gpu.twinkled>0);assert.equal(gpu.moved,0);assert.equal(gpu.daytimeChanges,0);assert(gpu.top[2]>gpu.top[0]*2);assert(gpu.bottom.reduce((a,b)=>a+b)>gpu.top.reduce((a,b)=>a+b));
 const before=await p.evaluate(()=>window.atmosphere.getParameters().seed);await p.keyboard.press('p');await p.waitForFunction(seed=>window.atmosphere.getParameters().seed!==seed,before);
 await p.locator('#menu-toggle').click();await p.locator('#random-weather').click();
 const params=await p.evaluate(()=>window.atmosphere.getParameters());assert.equal(Object.keys(params.weather.layers).length,4);assert(params.clouds.density>=0&&params.clouds.density<=1);assert.equal(errors.length,0);
 console.log(JSON.stringify({gpu,hotkey:true,menu:true,errors}));
}finally{await browser?.close();server.kill()}
