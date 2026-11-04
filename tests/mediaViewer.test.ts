import {describe,it,expect} from 'vitest';
import {mediaKind,mediaPlaylist,mediaIndex} from '../src/experience/mediaViewer';
import {FileBrowser} from '../src/experience/fileBrowser';
import {parseByteRange} from '../tools/file-system-plugin.mjs';
const f=(name:string)=>({type:'file' as const,name,path:name,url:'file_system/'+encodeURIComponent(name)});
describe('file media',()=>{
 it('recognises media extensions without case sensitivity',()=>{expect(mediaKind('Фото.PNG')).toBe('image');expect(mediaKind('track.MP3')).toBe('audio');expect(mediaKind('clip.mp4')).toBe('video');expect(mediaKind('README.txt')).toBeUndefined()});
 it('keeps the gallery in its current folder and excludes other kinds',()=>{const photo=f('фото.png');expect(mediaPlaylist(photo,[photo,f('2.jpg'),f('audio.mp3')]).map(x=>x.name)).toEqual(['фото.png','2.jpg'])});
 it('wraps previous and next at gallery boundaries',()=>{expect(mediaIndex(0,-1,2)).toBe(1);expect(mediaIndex(1,1,2)).toBe(0);expect(mediaIndex(0,1,0)).toBe(0)});
 it('opens a selected file without losing navigation state',()=>{let opened='';const b=new FileBrowser(file=>{opened=file.path;return true});b.setRoot({type:'directory',name:'file_system',path:'',children:[f('test.png')]});b.key('Enter');expect(opened).toBe('test.png');expect(b.frame.index).toBe(0);expect(b.path).toBe('');expect(b.status).toBe('')});
 it('serves byte ranges needed for seeking',()=>{expect(parseByteRange('bytes=10-19',100)).toEqual({start:10,end:19});expect(parseByteRange('bytes=-10',100)).toEqual({start:90,end:99});expect(parseByteRange('bytes=20-',100)).toEqual({start:20,end:99});expect(parseByteRange('bytes=200-300',100)).toBe('invalid');expect(parseByteRange(undefined,100)).toBeNull()});
});
