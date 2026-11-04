import {describe,it,expect} from 'vitest';
import {dragPosition,fallStep,restingPosition} from '../src/experience/objectPhysics';
const body={x:300,y:150,vy:0,width:220,height:179};
describe('full sill surface',()=>{
 it('keeps window dragging out of decorative shelving',()=>expect(dragPosition(72,300,220,179)).toEqual({x:235,y:300}));
 it('preserves rear, middle and front placements',()=>{for(const y of [775,800,835])expect(restingPosition({...body,y}).y).toBe(y)});
 it('lets an object fall from the window to the rear edge',()=>{let b={...body};for(let i=0;i<100;i++)b=fallStep(b,.05);expect(b.y).toBe(775);expect(b.vy).toBe(0)});
 it('keeps each tabletop depth stable without sliding forward',()=>{for(const y of [775,800,835]){const b={...body,y};expect(fallStep(b,.05)).toEqual(b)}});
 it('allows both full-width front corners while respecting the narrower back',()=>{expect(dragPosition(0,835,220,179).x).toBe(70);expect(dragPosition(2000,835,220,179).x).toBe(1420);expect(dragPosition(0,775,220,179).x).toBe(235)});
});
