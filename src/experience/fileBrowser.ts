export interface FileEntry {type:'directory'|'file';name:string;path:string;children?:FileEntry[];size?:number;url?:string}
export class FileBrowser {
 root:FileEntry={type:'directory',name:'file_system',path:'',children:[]};
 frames:{node:FileEntry;index:number}[]=[{node:this.root,index:0}];
 status='Загрузка…';ready=false;
 setRoot(root:FileEntry){this.root=root;this.frames=[{node:root,index:0}];this.ready=true;this.status=''}
 get frame(){return this.frames[this.frames.length-1]}
 get path(){return this.frame.node.path}
 get entries():FileEntry[]{const children=this.frame.node.children??[];return this.frames.length>1?[{type:'directory',name:'..',path:'..'},...children]:children}
 get selected(){return this.entries[this.frame.index]}
 get offset(){return Math.floor(this.frame.index/5)*5}
 key(key:string):'handled'|'exit'|false {
  if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Escape'].includes(key))return false;
  if(key==='Escape'){if(this.frames.length===1)return 'exit';this.frames.pop();this.status='';return 'handled'}
  if(!this.ready)return 'handled';
  if(key.startsWith('Arrow')){const delta=key==='ArrowUp'?-1:key==='ArrowDown'?1:key==='ArrowLeft'?-5:5;this.frame.index=Math.max(0,Math.min(Math.max(0,this.entries.length-1),this.frame.index+delta));this.status='';return 'handled'}
  const item=this.selected;if(!item)return 'handled';
  if(item.name==='..'){this.frames.pop();this.status=''}
  else if(item.type==='directory'){this.frames.push({node:item,index:0});this.status=''}
  else this.status='Просмотр файлов — позже';
  return 'handled';
 }
}
