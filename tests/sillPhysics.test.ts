import {it,expect} from 'vitest';
import {SillPhysics} from '../src/experience/objectPhysics';
const body=(x:number,y=835)=>({x,y,vy:0,width:220,height:160});
it('slides after release and comes to rest',()=>{const world=new SillPhysics(),a=world.add(body(300),2);a.begin(0);a.drag(380,835,100);a.release(110);const start=a.body.x;for(let i=0;i<240;i++)a.step(1/60);expect(a.body.x).toBeGreaterThan(start);expect(a.sleeping).toBe(true);expect(a.body.y).toBe(835)});
it('resolves same depth contacts but permits depth overlap',()=>{const world=new SillPhysics(),a=world.add(body(300),5),b=world.add(body(550),2);a.begin(0);a.drag(500,835,100);expect(b.body.x).toBeGreaterThanOrEqual(a.body.x+220);const other=new SillPhysics(),c=other.add(body(300,775),2),d=other.add(body(300,835),2);c.step(.02);d.step(.02);expect(c.body.x).toBe(d.body.x)});
it('falls and respects sill boundaries without a throw on cancellation',()=>{const world=new SillPhysics(),a=world.add(body(300),2);a.begin(0);a.drag(10000,400,100);a.release(101,true);for(let i=0;i<240;i++)a.step(1/60);expect(a.body.y).toBe(775);expect(a.body.vy).toBe(0);expect(a.sleeping).toBe(true);expect(a.body.x).toBeLessThanOrEqual(1370)});
