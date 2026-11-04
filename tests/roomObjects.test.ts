import {describe,it,expect} from 'vitest';
import {radioPlacement} from '../src/experience/roomObjects';
describe('radio support surface',()=>{it('keeps the full footprint inside sill and away from window and walls',()=>{expect(radioPlacement(-100,-500)).toEqual({x:80,y:795});expect(radioPlacement(1900,1000)).toEqual({x:1400,y:838})});it('preserves a valid position',()=>expect(radioPlacement(1100,820)).toEqual({x:1100,y:820}))});
