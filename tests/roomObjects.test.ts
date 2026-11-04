import {describe,it,expect} from 'vitest';
import {dragPosition,fallStep,restingPosition} from '../src/experience/objectPhysics';
const body={x:300,y:150,vy:0,width:140,height:114};
describe('window and sill objects',()=>{
 it('allows free lifting in the window, but excludes decorative shelves',()=>{expect(dragPosition(700,300,140,114)).toEqual({x:700,y:300});expect(dragPosition(72,260,140,114)).toEqual({x:235,y:260})});
 it('falls through all former shelf levels',()=>{let b={...body};for(let i=0;i<100;i++)b=fallStep(b,.05);expect(b.y).toBe(835);expect(b.vy).toBe(0)});
 it('migrates saved shelf positions onto the sill',()=>{expect(restingPosition({...body,x:72,y:432})).toEqual({...body,x:235,y:835,vy:0})});
 it('does not pass through the sill at high speed',()=>expect(fallStep({...body,y:830,vy:1100},.05).y).toBe(835));
 it('keeps a resting object still',()=>{const b={...body,y:835};expect(fallStep(b,.05)).toEqual(b)});
});
