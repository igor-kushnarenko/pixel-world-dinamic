export type ComputerView='weather'|'files';
export function computerView(current:ComputerView,key:string,on:boolean):ComputerView{
 if(!on)return 'weather';
 return key==='Enter'?'files':key==='Escape'?'weather':current;
}
/** A single-column visual placeholder, not a real filesystem. */
export function drawCommander(ctx:CanvasRenderingContext2D){
 ctx.fillStyle='#0000a8';ctx.fillRect(0,0,360,192);ctx.font='bold 18px monospace';ctx.textBaseline='top';
 ctx.fillStyle='#00aaaa';ctx.fillRect(0,0,360,24);ctx.fillStyle='#000080';ctx.fillText('PIXEL COMMANDER',14,3);
 ctx.strokeStyle='#66dddd';ctx.strokeRect(8.5,29.5,343,138);ctx.fillStyle='#ffff66';ctx.fillText('C:\\PIXEL\\',18,30);
 const rows=['..','PHOTO','VIDEO','MUSIC','TEXT'];
 rows.forEach((name,i)=>{const y=52+i*22;if(i===0){ctx.fillStyle='#00aaaa';ctx.fillRect(14,y-1,332,21)}ctx.fillStyle=i===0?'#000080':'#ffffff';ctx.fillText(name,22,y);ctx.fillText('<DIR>',280,y)});
 ctx.fillStyle='#00aaaa';ctx.fillRect(0,174,360,18);ctx.fillStyle='#000080';ctx.font='bold 15px monospace';ctx.fillText('ESC  CLOCK / WEATHER',12,176);
}
