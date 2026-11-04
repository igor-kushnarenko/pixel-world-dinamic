import {describe,it,expect} from 'vitest';
import {dragPosition,fallStep,restingPosition,ROOM_SURFACES} from '../src/experience/objectPhysics';
const body={x:72,y:150,vy:0,width:140,height:114};
describe('room support physics',()=>{
 it('allows lifting across the window while keeping the body inside walls',()=>{expect(dragPosition(700,200,140,114)).toEqual({x:700,y:200});expect(dragPosition(-1,-1,140,114)).toEqual({x:70,y:146})});
 it('chooses the nearest shelf below the feet',()=>expect(restingPosition(body).y).toBe(260));
 it('misses shelves when released over the window',()=>expect(restingPosition({...body,x:800}).y).toBe(835));
 it('can land on every shelf from just above it',()=>{for(const s of ROOM_SURFACES)expect(restingPosition({...body,y:s.y-5}).y).toBe(s.y)});
 it('sweeps through a crossed shelf at high speed',()=>expect(fallStep({...body,y:250,vy:1000},.05).y).toBe(260));
 it('settles without sinking or repeated bouncing',()=>{const b={...body,y:260};expect(fallStep(b,.05)).toEqual(b)});
});
