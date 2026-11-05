import { expect, it } from 'vitest';
import { WindowDrops } from '../src/engine/WindowDrops';
it('merges nearby water masses and falls down',()=>{
  const s=new WindowDrops(100,100,7);
  s.wetness=1;
  s.drops=[{x:50,y:40,mass:9,speed:20,phase:0},{x:51,y:41,mass:8,speed:15,phase:1}];
  s.update(1/60,0);
  expect(s.drops).toHaveLength(1);expect(s.drops[0].mass).toBeCloseTo(17-0.012);
  const y=s.drops[0].y;s.update(1,0);expect(s.drops[0].y).toBeGreaterThan(y);
});
it('keeps rain repeatable, bounded and does not spawn in dry weather',()=>{
  const a=new WindowDrops(1672,941,7),b=new WindowDrops(1672,941,7);
  for(let i=0;i<600;i++){a.update(1/60,1);b.update(1/60,1);}
  expect(a.drops).toEqual(b.drops);expect(a.drops.length).toBeGreaterThan(0);expect(a.drops.length).toBeLessThanOrEqual(64);
  a.reset(7);a.update(1,0);expect(a.drops).toEqual([]);
});

it('dries completely ten seconds after rain stops',()=>{const s=new WindowDrops(1672,941,7);s.update(1,1);expect(s.wetness).toBe(1);for(let i=0;i<5;i++)s.update(1,0);expect(s.wetness).toBeCloseTo(.5);for(let i=0;i<6;i++)s.update(1,0);expect(s.wetness).toBe(0);expect(s.drops).toEqual([])});
