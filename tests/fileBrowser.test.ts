import {describe,it,expect} from 'vitest';
import {FileBrowser} from '../src/experience/fileBrowser';
const make=()=>{const b=new FileBrowser();b.setRoot({type:'directory',name:'file_system',path:'',children:[{type:'directory',name:'Фото',path:'Фото',children:[{type:'directory',name:'Вложенная',path:'Фото/Вложенная',children:[]}]},...Array.from({length:12},(_,i)=>({type:'file' as const,name:'file'+i+'.txt',path:'file'+i+'.txt'}))]});return b};
describe('file browser',()=>{
 it('enters nested and empty directories and returns with selection intact',()=>{const b=make();b.key('Enter');expect(b.path).toBe('Фото');b.key('ArrowDown');b.key('Enter');expect(b.path).toBe('Фото/Вложенная');expect(b.entries.map(x=>x.name)).toEqual(['..']);b.key('Escape');expect(b.selected?.name).toBe('Вложенная');b.key('Escape');expect(b.path).toBe('');expect(b.selected?.name).toBe('Фото');expect(b.key('Escape')).toBe('exit')});
 it('keeps all entries accessible through scrolling and clamps selection',()=>{const b=make();b.key('ArrowRight');expect(b.frame.index).toBe(5);expect(b.offset).toBe(5);for(let i=0;i<20;i++)b.key('ArrowDown');expect(b.frame.index).toBe(12);for(let i=0;i<20;i++)b.key('ArrowUp');expect(b.frame.index).toBe(0)});
 it('does not pretend to open a file',()=>{const b=make();b.key('ArrowDown');b.key('Enter');expect(b.path).toBe('');expect(b.status).toContain('позже')});
 it('handles a genuinely empty root without invalid selections',()=>{const b=new FileBrowser();b.setRoot({type:'directory',name:'file_system',path:'',children:[]});b.key('ArrowDown');b.key('Enter');expect(b.selected).toBeUndefined();expect(b.key('Escape')).toBe('exit')});
});
