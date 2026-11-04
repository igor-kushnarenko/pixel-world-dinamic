import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../file_system');
export function scanFileSystem(directory=root,includeContent=true){
 const files=[];
 function walk(dir,parts=[]){
  const children=fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='.gitkeep'&&!e.isSymbolicLink()).sort((a,b)=>Number(b.isDirectory())-Number(a.isDirectory())||a.name.localeCompare(b.name,'ru',{numeric:true})).flatMap(e=>{
   const segments=[...parts,e.name],relative=segments.join('/'),absolute=path.join(dir,e.name);
   if(e.isDirectory())return [walk(absolute,segments)];
   if(!e.isFile())return [];
   const size=fs.statSync(absolute).size;const content=includeContent?fs.readFileSync(absolute):undefined;files.push({name:'file_system/'+relative,content,size,absolute});
   return [{type:'file',name:e.name,path:relative,size,url:'file_system/'+segments.map(encodeURIComponent).join('/')}];
  });
  return {type:'directory',name:parts.at(-1)??'file_system',path:parts.join('/'),children};
 }
 return {root:walk(directory),files};
}
export function parseByteRange(header,size){
 if(!header)return null;
 const m=/^bytes=(\d*)-(\d*)$/.exec(header);if(!m||!size||(!m[1]&&!m[2]))return 'invalid';
 let start=m[1]?Number(m[1]):Math.max(0,size-Number(m[2]));
 let end=m[1]?(m[2]?Math.min(size-1,Number(m[2])):size-1):size-1;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||start<0||end<start)return 'invalid';
 return {start,end};
}
export default function fileSystemPlugin(){return {
 name:'pixel-world-file-system',
 configureServer(server){
  server.watcher.add(root);
  const refresh=file=>{if(file===root||file.startsWith(root+path.sep))server.ws.send({type:'full-reload'})};
  for(const event of ['add','unlink','change','addDir','unlinkDir'])server.watcher.on(event,refresh);
  server.middlewares.use((req,res,next)=>{
   const url=new URL(req.url??'/', 'http://localhost');
   let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{res.statusCode=400;res.end();return}
   const base=server.config.base==='./'?'/':server.config.base;
   if(pathname===base+'assets/file-system-index.json'){try{res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({version:1,root:scanFileSystem(root,false).root}))}catch{res.statusCode=500;res.end()}return}
   const prefix=base+'file_system/';if(!pathname.startsWith(prefix))return next();
   const relative=pathname.slice(prefix.length);
   try{
    res.setHeader('Cache-Control','no-store');

    const file=path.resolve(root,relative);const rel=path.relative(root,file);
    if(rel.startsWith('..')||path.isAbsolute(rel)){res.statusCode=403;res.end();return}
    // Serve only entries included by the scanner, never symlinks or paths outside the tree.
    const entry=scanFileSystem(root,false).files.find(e=>e.name==='file_system/'+relative);
    if(!entry){res.statusCode=404;res.end();return}
    const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.bmp':'image/bmp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.opus':'audio/ogg','.m4a':'audio/mp4','.aac':'audio/aac','.flac':'audio/flac','.mp4':'video/mp4','.m4v':'video/mp4','.webm':'video/webm','.ogv':'video/ogg','.mov':'video/quicktime','.txt':'text/plain; charset=utf-8'}[path.extname(file).toLowerCase()]??'application/octet-stream';
    res.setHeader('Content-Type',mime);res.setHeader('Accept-Ranges','bytes');
    const range=parseByteRange(req.headers.range,entry.size);
    if(range==='invalid'){res.statusCode=416;res.setHeader('Content-Range',`bytes */${entry.size}`);res.end();return}
    if(range){res.statusCode=206;res.setHeader('Content-Range',`bytes ${range.start}-${range.end}/${entry.size}`);res.setHeader('Content-Length',range.end-range.start+1)}else res.setHeader('Content-Length',entry.size);
    if(req.method==='HEAD'){res.end();return}
    const stream=fs.createReadStream(file,range??{});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
   }catch{res.statusCode=500;res.end('File system unavailable')}
  });
 },
 generateBundle(){const tree=scanFileSystem();this.emitFile({type:'asset',fileName:'assets/file-system-index.json',source:JSON.stringify({version:1,root:tree.root})});for(const f of tree.files)this.emitFile({type:'asset',fileName:f.name,source:f.content})}
}}
