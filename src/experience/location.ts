import type { SceneDefinition } from '../engine';
import { CITY_LAYOUTS, HEIGHT, WIDTH } from './config';
import type { CityId } from './config';

/** Extracts a separate binary occlusion mask, without editing source image data. */
async function windowMask(roomUrl: string): Promise<HTMLCanvasElement> {
  const image = new Image(); image.src = roomUrl; await image.decode();
  if (image.width !== WIDTH || image.height !== HEIGHT) throw new Error('Room asset dimensions do not match the authored layout');
  const c = document.createElement('canvas'); c.width = WIDTH; c.height = HEIGHT;
  const ctx = c.getContext('2d', { willReadFrequently: true })!; ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const open = pixels.data[i + 3] < 128 ? 255 : 0;
    pixels.data[i] = open; pixels.data[i + 1] = open; pixels.data[i + 2] = open; pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0); return c;
}
export async function createApartmentLocation(city: CityId, _computerScreen?:HTMLCanvasElement): Promise<SceneDefinition> {
  const originals = `${import.meta.env.BASE_URL}assets/nightcity/originals/`;
  const masks = `${import.meta.env.BASE_URL}assets/apartment/masks/`;
  const prepared = `${import.meta.env.BASE_URL}assets/room-v3/prepared/`;
  const room = `${prepared}room-composite.png`;
  const ids = ['far', 'midfar', 'midnear', 'near'];
  const files = ['city-far', 'city-mid-far', 'city-mid-near', 'city-near'];
  return {
    width: WIDTH, height: HEIGHT, windowMask: await windowMask(room), fogDepth: 50, rainDepth: 90,shutter:{top:121,bottom:749,depth:99,texture:`${prepared}shutter-tile.png`},
    layers: [
      ...ids.map((id, i) => ({
        id, source: `${originals}${files[i]}.png`, depth: 20 + i * 20, scope: 'world' as const,
        receivesLightning: true, placement: CITY_LAYOUTS[city].layers[id], cityLightMask: `${masks}${id}_fx.png`,
        closeTraffic: id === 'midnear'
      })),
      { id: 'apartment', source: room, depth: 100, scope: 'room', receivesLightning: true,
        tint: [0.76, 0.78, 0.84], roomLights: {
          left: `${prepared}shelf-light.png`, right: `${prepared}panel-light.png`, emitters: `${prepared}panel-emission.png`,
          radioDial: [-100,-100,-90,-90], radioLed: [-100,-100], computerRect:[-1000,-1000,-990,-990]
        }
      }
    ]
  };
}
