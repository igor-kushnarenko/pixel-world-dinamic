import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../file_system');
export function scanFileSystem(directory=root){
 const files=[];
 function walk(dir,parts=[]){
  const children=fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='.gitkeep'&&!e.isSymbolicLink()).sort((a,b)=>Number(b.isDirectory())-Number(a.isDirectory())||a.name.localeCompare(b.name,'ru',{numeric:true})).flatMap(e=>{
   const segments=[...parts,e.name],relative=segments.join('/'),absolute=path.join(dir,e.name);
   if(e.isDirectory())return [walk(absolute,segments)];
   if(!e.isFile())return [];
   const content=fs.readFileSync(absolute);files.push({name:'file_system/'+relative,content});
   return [{type:'file',name:e.name,path:relative,size:content.length,url:'file_system/'+segments.map(encodeURIComponent).join('/')}];
  });
  return {type:'directory',name:parts.at(-1)??'file_system',path:parts.join('/'),children};
 }
 return {root:walk(directory),files};
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
   if(pathname===base+'assets/file-system-index.json'){try{res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({version:1,root:scanFileSystem().root}))}catch{res.statusCode=500;res.end()}return}
   const prefix=base+'file_system/';if(!pathname.startsWith(prefix))return next();
   const relative=pathname.slice(prefix.length);
   try{
    res.setHeader('Cache-Control','no-store');

    const file=path.resolve(root,relative);const rel=path.relative(root,file);
    if(rel.startsWith('..')||path.isAbsolute(rel)){res.statusCode=403;res.end();return}
    // Serve only entries included by the scanner, never symlinks or paths outside the tree.
    const entry=scanFileSystem().files.find(e=>e.name==='file_system/'+relative);
    if(!entry){res.statusCode=404;res.end();return}
    res.setHeader('Content-Type','application/octet-stream');res.end(entry.content);
   }catch{res.statusCode=500;res.end('File system unavailable')}
  });
 },
 generateBundle(){const tree=scanFileSystem();this.emitFile({type:'asset',fileName:'assets/file-system-index.json',source:JSON.stringify({version:1,root:tree.root})});for(const f of tree.files)this.emitFile({type:'asset',fileName:f.name,source:f.content})}
}}
