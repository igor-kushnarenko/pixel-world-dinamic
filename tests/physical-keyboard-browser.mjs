import {chromium} from 'playwright';
import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const port=4189,site=`http://127.0.0.1:${port}/`;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{windowsHide:true,stdio:'ignore'});let browser;
try{for(let i=0;i<60;i++){try{if((await fetch(site)).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1500,height:1050}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(site+'?fresh&paused');await page.locator('#enter-quiet').click();const pc=page.locator('.movable-computer');await pc.waitFor();await page.locator('.computer-power').click();await page.waitForFunction(()=>document.querySelector('.movable-computer')?.getAttribute('aria-pressed')==='true');
await page.locator('.computer-enter').click();assert.equal(await pc.getAttribute('data-screen-mode'),'files');const selection=await pc.getAttribute('data-file-selection');
const view=await page.locator('#view-name').textContent();await page.keyboard.press('ArrowRight');assert.notEqual(await page.locator('#view-name').textContent(),view);assert.equal(await pc.getAttribute('data-file-selection'),selection);
const seed=await page.evaluate(()=>window.atmosphere.getParameters().seed);await page.keyboard.press('p');await page.waitForFunction(old=>window.atmosphere.getParameters().seed!==old,seed);assert.equal(await pc.getAttribute('data-screen-mode'),'files');
await page.keyboard.press('Escape');assert.equal(await pc.getAttribute('data-screen-mode'),'files');await page.locator('.computer-esc').click();assert.equal(await pc.getAttribute('data-screen-mode'),'weather');
await page.locator('.computer-enter').click();await page.locator('.computer-arrow[title="ArrowDown"]').click();assert.notEqual(await pc.getAttribute('data-file-selection'),selection);
assert.deepEqual(errors,[]);console.log(JSON.stringify({physicalPanorama:true,physicalWeather:true,virtualMouseKeys:true,errors}));
}finally{await browser?.close();server.kill()}
