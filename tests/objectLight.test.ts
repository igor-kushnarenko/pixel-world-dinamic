import {describe,it,expect} from 'vitest';
import {sampleObjectLight} from '../src/experience/objectLight';
const dark={ambient:0,closed:1,panel:0,lamp:1};
describe('movable object lighting',()=>{
 it('dims with distance from the shelf lamp',()=>expect(sampleObjectLight(250,707,.5,dark)[0]).toBeGreaterThan(sampleObjectLight(1300,707,.5,dark)[0]));
 it('lights the side facing the source more strongly',()=>{expect(sampleObjectLight(600,707,0,dark)[0]).toBeGreaterThan(sampleObjectLight(600,707,1,dark)[0]);const right={...dark,lamp:0,panel:1};expect(sampleObjectLight(600,707,1,right)[0]).toBeGreaterThan(sampleObjectLight(600,707,0,right)[0])});
 it('preserves lamp light with a closed shutter',()=>expect(sampleObjectLight(500,707,.5,dark)[0]).toBeGreaterThan(.3));
 it('darkens the external fill when shutter closes',()=>expect(sampleObjectLight(500,707,.5,{...dark,lamp:0,ambient:.5})[0]).toBeLessThan(sampleObjectLight(500,707,.5,{...dark,lamp:0,ambient:.5,closed:0})[0]));
});
