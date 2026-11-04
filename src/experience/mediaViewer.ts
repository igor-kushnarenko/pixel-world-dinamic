import type {FileEntry} from './fileBrowser';
export type MediaKind='image'|'audio'|'video';
const extensions:Record<MediaKind,string[]>={image:['png','jpg','jpeg','webp','gif','avif','bmp','svg'],audio:['mp3','wav','ogg','m4a','aac','flac','opus'],video:['mp4','webm','ogv','mov','m4v']};
export function mediaKind(name:string):MediaKind|undefined{const ext=name.split('.').pop()?.toLowerCase()??'';return (Object.keys(extensions) as MediaKind[]).find(kind=>extensions[kind].includes(ext))}
export function mediaPlaylist(file:FileEntry,siblings:FileEntry[]){const kind=mediaKind(file.name);if(!kind)return [];return siblings.filter(f=>f.type==='file'&&!!f.url&&mediaKind(f.name)===kind)}
export function mediaIndex(index:number,delta:number,length:number){return length?((index+delta)%length+length)%length:0}
let active=false;
export const isMediaOpen=()=>active;
const formatTime=(n:number)=>Number.isFinite(n)?`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`:'0:00';
export function createMediaViewer(){
 const dialog=document.createElement('dialog');dialog.className='media-viewer';dialog.setAttribute('aria-label','Просмотр медиа');
 dialog.innerHTML='<header class="media-header"><div><h2 id="media-title"></h2><small id="media-count"></small></div><button type="button" id="media-full">На весь экран</button><button type="button" id="media-close" aria-label="Закрыть просмотр">Закрыть · Esc</button></header><div class="media-content"></div><p class="media-status" role="status"></p><nav class="media-photo-controls" aria-label="Фотографии"><button type="button" id="media-prev">← Назад</button><span>← → перелистывание</span><button type="button" id="media-next">Вперёд →</button></nav>';
 const el=<T extends HTMLElement>(s:string)=>dialog.querySelector<T>(s)!;
 const content=el<HTMLDivElement>('.media-content'),status=el<HTMLParagraphElement>('.media-status');
 let kind:MediaKind='image',playlist:FileEntry[]=[],index=0,revision=0,media:HTMLMediaElement|undefined,prior:HTMLElement|null=null,ownedFullscreen=false;
 let volume=.65;try{const v=localStorage.getItem('pixel-world.media-volume');if(v!==null&&Number.isFinite(Number(v)))volume=Math.max(0,Math.min(1,Number(v)))}catch{}
 function disposeMedia(){if(media){media.pause();media.removeAttribute('src');media.load();media=undefined}content.replaceChildren()}
 function close(){if(!active)return;active=false;revision++;disposeMedia();dialog.close();dialog.remove();if(ownedFullscreen&&document.fullscreenElement===dialog)void document.exitFullscreen().catch(()=>{});ownedFullscreen=false;prior?.focus({preventScroll:true})}
 function move(delta:number){index=mediaIndex(index,delta,playlist.length);render()}
 function render(){
  const entry=playlist[index];if(!entry)return;const mine=++revision;disposeMedia();status.textContent='';el('#media-title').textContent=entry.name;el('#media-count').textContent=`${index+1} / ${playlist.length}`;
  const url=new URL(import.meta.env.BASE_URL+entry.url,location.href).href;
  if(kind==='image'){
   const image=new Image();image.className='media-photo';image.alt=entry.name;image.onload=()=>{if(revision===mine)status.textContent=''};image.onerror=()=>{if(revision===mine)status.textContent='Не удалось открыть изображение. Попробуйте другой файл.'};image.src=url;content.append(image);return;
  }
  const element=document.createElement(kind==='audio'?'audio':'video');media=element;element.preload='metadata';element.volume=volume;element.src=url;
  element.onvolumechange=()=>{volume=element.volume;try{localStorage.setItem('pixel-world.media-volume',String(volume))}catch{}};
  element.onerror=()=>{if(revision===mine)status.textContent='Не удалось воспроизвести файл. Формат или кодек может не поддерживаться браузером.'};
  content.append(element);
  if(kind==='video'){(element as HTMLVideoElement).playsInline=true;element.controls=true;element.className='media-video'}
  else{
   const controls=document.createElement('div');controls.className='music-controls';controls.innerHTML='<p class="music-symbol" aria-hidden="true">♫</p><div class="music-buttons"><button type="button" data-previous aria-label="Предыдущая композиция">⏮</button><button type="button" data-play>Воспроизвести</button><button type="button" data-stop>Стоп</button><button type="button" data-next aria-label="Следующая композиция">⏭</button></div><label>Позиция <input data-seek type="range" min="0" max="100" step="0.1" value="0" disabled></label><output data-time>0:00 / 0:00</output><label>Громкость <input data-volume type="range" min="0" max="100" value="65"><output data-volume-label>65%</output></label>';
   content.append(controls);const q=<T extends HTMLElement>(s:string)=>controls.querySelector<T>(s)!;
   const play=q<HTMLButtonElement>('[data-play]'),seek=q<HTMLInputElement>('[data-seek]'),v=q<HTMLInputElement>('[data-volume]');
   const update=()=>{play.textContent=element.paused?'Воспроизвести':'Пауза';const valid=Number.isFinite(element.duration)&&element.duration>0;seek.disabled=!valid;if(valid)seek.value=String(element.currentTime/element.duration*100);q('[data-time]').textContent=`${formatTime(element.currentTime)} / ${formatTime(element.duration)}`};
   element.onplay=element.onpause=element.ontimeupdate=element.onloadedmetadata=element.ondurationchange=update;
   play.onclick=()=>{if(element.paused)void playMedia(element,mine);else element.pause()};q('[data-stop]').onclick=()=>{element.pause();try{element.currentTime=0}catch{}update()};
   q('[data-previous]').onclick=()=>move(-1);q('[data-next]').onclick=()=>move(1);
   seek.oninput=()=>{if(Number.isFinite(element.duration))element.currentTime=Number(seek.value)/100*element.duration};
   v.value=String(Math.round(volume*100));q('[data-volume-label]').textContent=v.value+'%';v.oninput=()=>{element.volume=Number(v.value)/100;q('[data-volume-label]').textContent=v.value+'%'};
   element.onended=()=>{if(index+1<playlist.length)move(1);else update()};update();
  }
  void playMedia(element,mine);
 }
 async function playMedia(element:HTMLMediaElement,mine:number){try{await element.play();if(revision===mine)status.textContent=''}catch{if(revision===mine&&!element.error)status.textContent='Нажмите кнопку воспроизведения, чтобы запустить файл.'}}
 el('#media-close').onclick=close;el('#media-prev').onclick=()=>move(-1);el('#media-next').onclick=()=>move(1);
 el('#media-full').onclick=()=>{if(document.fullscreenElement===dialog)void document.exitFullscreen();else if(dialog.requestFullscreen)void dialog.requestFullscreen().then(()=>{ownedFullscreen=true}).catch(()=>{status.textContent='Полноэкранный режим недоступен; просмотр открыт на всю страницу.'})};
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 const onFullscreen=()=>{if(ownedFullscreen&&document.fullscreenElement!==dialog){ownedFullscreen=false;close()}};
 document.addEventListener('fullscreenchange',onFullscreen);
 const onKey=(e:KeyboardEvent)=>{
  if(!active||e.isComposing||e.ctrlKey||e.altKey||e.metaKey)return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return}
  const interactive=e.target instanceof Element&&!!e.target.closest('button,input,select,textarea');
  if(kind==='image'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();move(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)}
  else if(kind==='audio'&&e.code==='Space'&&!interactive){e.preventDefault();e.stopImmediatePropagation();if(media?.paused)void playMedia(media,revision);else media?.pause()}
 };
 window.addEventListener('keydown',onKey,true);
 return {open(file:FileEntry,siblings:FileEntry[]){const detected=mediaKind(file.name);if(!detected||!file.url)return false;
  if(active)close();prior=document.activeElement instanceof HTMLElement?document.activeElement:null;kind=detected;playlist=mediaPlaylist(file,siblings);index=playlist.findIndex(f=>f.path===file.path);if(index<0){playlist=[file];index=0}
  (document.fullscreenElement??document.body).append(dialog);dialog.classList.toggle('is-audio',kind==='audio');el<HTMLElement>('.media-photo-controls').hidden=kind!=='image';el('#media-full').hidden=kind==='audio';active=true;dialog.showModal();render();el<HTMLButtonElement>('#media-close').focus();return true;
 },close,dispose(){close();window.removeEventListener('keydown',onKey,true);document.removeEventListener('fullscreenchange',onFullscreen)}};
}
