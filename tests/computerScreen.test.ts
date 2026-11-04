import {describe,it,expect} from 'vitest';
import {computerView} from '../src/experience/computerScreen';
describe('computer view',()=>{
 it('opens the single-column placeholder with Enter and restores weather with Escape',()=>{expect(computerView('weather','Enter',true)).toBe('files');expect(computerView('files','Escape',true)).toBe('weather')});
 it('ignores Enter when powered off',()=>expect(computerView('weather','Enter',false)).toBe('weather'));
 it('does not change views for unrelated keys',()=>expect(computerView('files','x',true)).toBe('files'));
});
