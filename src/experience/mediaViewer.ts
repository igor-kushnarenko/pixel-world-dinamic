import type {FileEntry} from './fileBrowser';
export type MediaKind='image'|'audio'|'video';
const extensions:Record<MediaKind,string[]>={image:['png','jpg','jpeg','webp','gif','avif','bmp','svg'],audio:['mp3','wav','ogg','m4a','aac','flac','opus'],video:['mp4','webm','ogv','mov','m4v']};
export function mediaKind(name:string):MediaKind|undefined{const ext=name.split('.').pop()?.toLowerCase()??'';return (Object.keys(extensions) as MediaKind[]).find(kind=>extensions[kind].includes(ext))}
export function mediaPlaylist(file:FileEntry,siblings:FileEntry[]){const kind=mediaKind(file.name);if(!kind)return [];return siblings.filter(f=>f.type==='file'&&!!f.url&&mediaKind(f.name)===kind)}
export function mediaIndex(index:number,delta:number,length:number){return length?((index+delta)%length+length)%length:0}
let active=false;
export const isMediaOpen=()=>active;
const formatTime=(n:number)=>Number.isFinite(n)?`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`:'0:00';
export function containRect(w:number,h:number,areaW:number,areaH:number){const scale=Math.min(areaW/w,areaH/h);return {x:(areaW-w*scale)/2,y:(areaH-h*scale)/2,width:w*scale,height:h*scale}}
/** All pixels and controls stay inside the physical CRT aperture. No page overlays. */
export function createMediaViewer(host:HTMLElement,onClose:()=>void=()=>{}){
 const controls=document.createElement('div');controls.className='computer-media-controls';controls.hidden=true;controls.setAttribute('aria-label','Медиаплеер на дисплее компьютера');
 controls.innerHTML='<div class="crt-photo-controls"><button type="button" data-previous aria-label="Предыдущая фотография">←</button><button type="button" data-next aria-label="Следующая фотография">→</button></div><button type="button" class="crt-media-close" data-close aria-label="Закрыть медиа">×</button><div class="crt-player-controls"><div class="crt-player-buttons"><button type="button" data-previous-track aria-label="Предыдущий трек">⏮</button><button type="button" data-play aria-label="Воспроизведение или пауза">▶</button><button type="button" data-stop aria-label="Остановить">■</button><button type="button" data-next-track aria-label="Следующий трек">⏭</button></div><label class="crt-seek"><span>Позиция</span><input data-seek type="range" min="0" max="100" step=".1" value="0" aria-label="Позиция воспроизведения" disabled></label><label class="crt-volume"><span>VOL</span><input data-volume type="range" min="0" max="100" value="65" aria-label="Громкость плеера"><output data-volume-label>65%</output></label></div><div class="crt-media-source" hidden></div>';
 host.append(controls);
 const el=<T extends HTMLElement>(s:string)=>controls.querySelector<T>(s)!;
 let kind:MediaKind='image',playlist:FileEntry[]=[],index=0,revision=0,media:HTMLMediaElement|undefined,image:HTMLImageElement|undefined,status='',title='';
 let volume=.65;try{const v=localStorage.getItem('pixel-world.media-volume');if(v!==null&&Number.isFinite(Number(v)))volume=Math.max(0,Math.min(1,Number(v)))}catch{}
 function disposeMedia(){if(media){media.pause();media.removeAttribute('src');media.load();media=undefined}image=undefined;el('.crt-media-source').replaceChildren()}
 function close(){if(!active)return;active=false;revision++;disposeMedia();controls.hidden=true;controls.dataset.kind='';host.dataset.mediaKind='';host.dataset.mediaTitle='';onClose()}
 function move(delta:number){index=mediaIndex(index,delta,playlist.length);load()}
 async function playMedia(){if(!media)return;const element=media,mine=revision;try{await element.play();if(mine===revision)status=''}catch{if(mine===revision&&!element.error)status='Нажмите ▶ для воспроизведения'}}
 function updateControls(){
  const seek=el<HTMLInputElement>('[data-seek]'),valid=!!media&&Number.isFinite(media.duration)&&media.duration>0;
  seek.disabled=!valid;if(valid)seek.value=String(media!.currentTime/media!.duration*100);
  el('[data-play]').textContent=media?.paused?'▶':'❚❚';
  const v=el<HTMLInputElement>('[data-volume]');v.value=String(Math.round(volume*100));el('[data-volume-label]').textContent=v.value+'%';
 }
 function load(){
  const file=playlist[index];if(!file)return;const mine=++revision;disposeMedia();title=file.name;status='Загрузка…';host.dataset.mediaTitle=title;
  const url=new URL(import.meta.env.BASE_URL+file.url,location.href).href;
  if(kind==='image'){
   image=new Image();image.alt=title;image.className='crt-media-image';image.onload=()=>{if(revision===mine)status=''};image.onerror=()=>{if(revision===mine)status='Не удалось открыть изображение'};image.src=url;el('.crt-media-source').append(image);return;
  }
  const element=document.createElement(kind==='audio'?'audio':'video');media=element;element.preload='metadata';element.volume=volume;element.src=url;
  if(kind==='video'){(element as HTMLVideoElement).playsInline=true;element.className='crt-media-video'}else element.className='crt-media-audio';
  element.onloadedmetadata=()=>{if(revision===mine){status='';updateControls()}};
  element.onplay=element.onpause=element.ontimeupdate=element.ondurationchange=updateControls;
  element.onvolumechange=()=>{volume=element.volume;try{localStorage.setItem('pixel-world.media-volume',String(volume))}catch{}updateControls()};
  element.onerror=()=>{if(revision===mine)status='Формат или кодек недоступен'};
  element.onended=()=>{if(kind==='audio'&&index+1<playlist.length)move(1);else updateControls()};
  el('.crt-media-source').append(element);updateControls();void playMedia();
 }
 const toggle=()=>{if(media?.paused)void playMedia();else media?.pause()};
 const stop=()=>{if(media){media.pause();try{media.currentTime=0}catch{}updateControls()}};
 el('[data-close]').onclick=close;el('[data-previous]').onclick=()=>move(-1);el('[data-next]').onclick=()=>move(1);
 el('[data-previous-track]').onclick=()=>move(-1);el('[data-next-track]').onclick=()=>move(1);el('[data-play]').onclick=toggle;el('[data-stop]').onclick=stop;
 el<HTMLInputElement>('[data-seek]').oninput=e=>{if(media&&Number.isFinite(media.duration))media.currentTime=Number((e.target as HTMLInputElement).value)/100*media.duration};
 el<HTMLInputElement>('[data-volume]').oninput=e=>{if(media)media.volume=Number((e.target as HTMLInputElement).value)/100};
 function handleKey(key:string){if(!active)return false;if(key==='Escape'){close();return true}if(kind==='image'&&key.startsWith('Arrow')){move(key==='ArrowLeft'||key==='ArrowUp'?-1:1);return true}if(key==='Enter'||key===' '){toggle();return true}return key.startsWith('Arrow')}
 const onKey=(e:KeyboardEvent)=>{if(!active||e.isComposing||e.ctrlKey||e.altKey||e.metaKey)return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return}
  if(e.target instanceof Element&&e.target.closest('.computer-media-controls button,.computer-media-controls input')&&!(kind==='image'&&e.key.startsWith('Arrow')))return;
  if(handleKey(e.key)){e.preventDefault();e.stopImmediatePropagation()}
 };
 window.addEventListener('keydown',onKey,true);
 return {get active(){return active},handleKey,open(file:FileEntry,siblings:FileEntry[]){const detected=mediaKind(file.name);if(!detected||!file.url)return false;if(active)close();kind=detected;playlist=mediaPlaylist(file,siblings);index=playlist.findIndex(f=>f.path===file.path);if(index<0){playlist=[file];index=0}active=true;controls.hidden=false;controls.dataset.kind=kind;host.dataset.mediaKind=kind;el<HTMLElement>('.crt-photo-controls').hidden=kind!=='image';el<HTMLElement>('.crt-player-controls').hidden=kind==='image';load();return true},
 draw(ctx:CanvasRenderingContext2D){
  if(!active)return;ctx.textBaseline='alphabetic';ctx.fillStyle=kind==='audio'?'#071c30':'#000';ctx.fillRect(0,0,360,192);
  const source=kind==='image'?image:kind==='video'?media as HTMLVideoElement:undefined;
  const w=source instanceof HTMLImageElement?source.naturalWidth:source instanceof HTMLVideoElement&&source.readyState>=2?source.videoWidth:0;
  const h=source instanceof HTMLImageElement?source.naturalHeight:source instanceof HTMLVideoElement?source.videoHeight:0;
  if(source&&w&&h){const r=containRect(w,h,360,192);ctx.imageSmoothingEnabled=true;ctx.drawImage(source,r.x,r.y,r.width,r.height);ctx.imageSmoothingEnabled=false}
  const fit=(text:string,max:number)=>{let s=text;while(s.length&&ctx.measureText(s).width>max)s=s.slice(0,-1);return s===text?s:s.slice(0,-1)+'…'};
  if(kind==='audio'){
   ctx.fillStyle='#143c55';ctx.fillRect(0,0,360,25);ctx.fillStyle='#a6e6db';ctx.font='bold 17px monospace';ctx.fillText('MUSIC PLAYER',15,18);
   ctx.font='bold 15px monospace';ctx.fillStyle='#e0eee9';ctx.fillText(fit(title,330),15,48);
   ctx.font='14px monospace';ctx.fillStyle='#88b4c1';ctx.fillText(`${formatTime(media?.currentTime??0)} / ${formatTime(media?.duration??0)}   ${index+1}/${playlist.length}`,15,71);
  }
  if(status){ctx.fillStyle='#06121ded';ctx.fillRect(8,kind==='audio'?74:146,344,25);ctx.fillStyle='#e5c690';ctx.font='14px monospace';ctx.fillText(fit(status,330),14,kind==='audio'?91:163)}
 },close,dispose(){close();controls.remove();window.removeEventListener('keydown',onKey,true)}};
}
