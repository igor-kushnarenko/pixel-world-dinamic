export type ComputerView='weather'|'files';
export function computerView(current:ComputerView,key:string,on:boolean):ComputerView{
 if(!on)return 'weather';
 return key==='Enter'?'files':key==='Escape'?'weather':current;
}
/** A single-column visual placeholder, not a real filesystem. */
export function drawCommander(ctx:CanvasRenderingContext2D){
 ctx.fillStyle='#0000a8';ctx.fillRect(0,0,320,228);ctx.font='14px monospace';ctx.textBaseline='top';
 ctx.fillStyle='#00aaaa';ctx.fillRect(0,0,320,22);ctx.fillStyle='#000080';ctx.fillText('PIXEL COMMANDER',12,4);
 ctx.strokeStyle='#66dddd';ctx.strokeRect(8.5,28.5,303,163);ctx.fillStyle='#ffff66';ctx.fillText('C:\\PIXEL\\',18,32);
 const rows=['..','PHOTO','VIDEO','MUSIC','TEXT'];
 rows.forEach((name,i)=>{const y=58+i*24;if(i===0){ctx.fillStyle='#00aaaa';ctx.fillRect(14,y-2,292,22)}ctx.fillStyle=i===0?'#000080':'#ffffff';ctx.fillText(name,22,y);ctx.fillText('<DIR>',240,y)});
 ctx.fillStyle='#aaffff';ctx.font='12px monospace';ctx.fillText('FILESYSTEM PREVIEW',12,198);ctx.fillStyle='#00aaaa';ctx.fillRect(0,214,320,14);ctx.fillStyle='#000080';ctx.fillText('ESC  CLOCK / WEATHER',10,215);
}
