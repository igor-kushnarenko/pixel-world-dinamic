import type { FileBrowser } from './fileBrowser';
export type ComputerView='weather'|'files';
export function computerView(current:ComputerView,key:string,on:boolean):ComputerView{
 if(!on)return 'weather';
 return key==='Enter'?'files':key==='Escape'?'weather':current;
}
/** Single-column browser over the project's published file_system tree. */
export function drawCommander(ctx:CanvasRenderingContext2D,browser:FileBrowser){
 const fit=(text:string,max:number)=>{if(ctx.measureText(text).width<=max)return text;let s=text;while(s.length&&ctx.measureText(s+'…').width>max)s=s.slice(0,-1);return s+'…'};
 ctx.fillStyle='#0000a8';ctx.fillRect(0,0,360,192);ctx.font='bold 18px monospace';ctx.textBaseline='top';
 ctx.fillStyle='#00aaaa';ctx.fillRect(0,0,360,24);ctx.fillStyle='#000080';ctx.fillText('PIXEL COMMANDER',14,3);
 ctx.strokeStyle='#66dddd';ctx.strokeRect(8.5,29.5,343,138);ctx.fillStyle='#ffff66';
 ctx.fillText(fit('C:/'+browser.path,325),18,30);
 const entries=browser.entries;
 entries.slice(browser.offset,browser.offset+5).forEach((item,i)=>{const y=52+i*22,selected=browser.offset+i===browser.frame.index;if(selected){ctx.fillStyle='#00aaaa';ctx.fillRect(14,y-1,332,21)}ctx.fillStyle=selected?'#000080':'#ffffff';ctx.fillText(fit(item.name,248),22,y);ctx.font='bold 13px monospace';ctx.fillText(item.type==='directory'?'<DIR>':item.size===undefined?'':String(item.size)+'B',278,y+3,65);ctx.font='bold 18px monospace'});
 if(!entries.length){ctx.fillStyle='#ffffff';ctx.fillText(browser.ready?'Папка пуста':browser.status,22,74,310)}
 ctx.fillStyle='#00aaaa';ctx.fillRect(0,174,360,18);ctx.fillStyle='#000080';ctx.font='bold 14px monospace';
 ctx.fillText(fit(browser.status||'↑↓ выбор  Enter вход  Esc назад',338),10,176);
}
