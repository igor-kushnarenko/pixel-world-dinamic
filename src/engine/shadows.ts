import type { TextureSource } from './types';

export interface LayerShadowGeometry {
  /** Physical plane height, independent of drawing depth; same units as scene pixels. */
  elevation: number;
  casts?: boolean;
  receives?: boolean;
  /** Optional local red × alpha silhouette. Defaults to the source image's alpha. */
  casterMask?: TextureSource;
  /** Optional local red × alpha receiving mask. Defaults to the source alpha. */
  receiverMask?: TextureSource;
  opacity?: number;
}
interface LightBase {
  id: string;
  color: readonly [number, number, number];
  intensity: number;
  scope?: 'world' | 'room';
  enabled?: boolean;
  /** Penumbra radius in logical receiver pixels; stable five-tap filter. */
  softness?: number;
}
export interface DirectionalShadowLight extends LightBase {
  type: 'directional';
  /** Direction TOWARD the source: 0=right, 90=down in screen coordinates. */
  azimuthDeg: number;
  elevationDeg: number;
  /** Bounds the projection near the horizon, in logical pixels. */
  maxDistance?: number;
}
export interface PointShadowLight extends LightBase {
  type: 'point';
  x: number;
  y: number;
  elevation: number;
  radius: number;
}
export type ShadowLight = DirectionalShadowLight | PointShadowLight;
export interface ShadowLightingState {
  enabled: boolean;
  ambient: number;
  lights: readonly ShadowLight[];
}
export const MAX_SHADOW_LIGHTS = 4;
export const MAX_SHADOW_CASTERS = 4;

/** Validate first, then return an owned copy so failed edits cannot mutate the renderer. */
export function resolveShadowLighting(value: ShadowLightingState): ShadowLightingState {
  if (!value || typeof value.enabled !== 'boolean' || !Number.isFinite(value.ambient) || value.ambient < 0 || value.ambient > 4 || !Array.isArray(value.lights) || value.lights.length > MAX_SHADOW_LIGHTS) throw new Error('Invalid shadow lighting state (maximum four lights)');
  const ids = new Set<string>();
  for (const l of value.lights) {
    if (!l || typeof l.id !== 'string' || !l.id || ids.has(l.id)) throw new Error('Shadow light IDs must be unique');
    ids.add(l.id);
    if (!Array.isArray(l.color) || l.color.length !== 3 || !l.color.every((n: number) => Number.isFinite(n) && n >= 0 && n <= 1) || !Number.isFinite(l.intensity) || l.intensity < 0 || l.intensity > 8) throw new Error(`Invalid shadow light color/intensity: ${l.id}`);
    if (l.scope !== undefined && l.scope !== 'world' && l.scope !== 'room') throw new Error(`Invalid shadow light scope: ${l.id}`);
    if (l.enabled !== undefined && typeof l.enabled !== 'boolean') throw new Error(`Invalid enabled: ${l.id}`);
    if (l.softness !== undefined && (!Number.isFinite(l.softness) || l.softness < 0 || l.softness > 32)) throw new Error(`Invalid softness: ${l.id}`);
    if (l.type === 'directional') {
      if (!Number.isFinite(l.azimuthDeg) || !Number.isFinite(l.elevationDeg) || l.elevationDeg < -90 || l.elevationDeg > 90 || (l.maxDistance !== undefined && (!Number.isFinite(l.maxDistance) || l.maxDistance <= 0))) throw new Error(`Invalid directional light: ${l.id}`);
    } else if (l.type === 'point') {
      if (![l.x, l.y, l.elevation, l.radius].every(Number.isFinite) || l.elevation < 0 || l.radius <= 0) throw new Error(`Invalid point light: ${l.id}`);
    } else throw new Error('Unknown shadow light type');
  }
  return structuredClone(value);
}

/** Inverse project a receiver point onto a parallel caster plane; null means no blocker. */
export function projectShadowSample(x: number, y: number, receiver: number, caster: number, light: ShadowLight): [number, number] | null {
  if (light.enabled === false || caster <= receiver) return null;
  if (light.type === 'point') {
    if (light.elevation <= caster) return null;
    const ratio = (light.elevation - caster) / (light.elevation - receiver);
    return [light.x + (x - light.x) * ratio, light.y + (y - light.y) * ratio];
  }
  if (light.elevationDeg <= 0) return null;
  const distance = Math.min(light.maxDistance ?? 4096, (caster - receiver) / Math.max(0.00001, Math.tan(light.elevationDeg * Math.PI / 180)));
  const a = light.azimuthDeg * Math.PI / 180;
  return [x + Math.cos(a) * distance, y + Math.sin(a) * distance];
}

/** Inject only on opt-in image/room passes; emissive additions stay after this surface term. */
export function withShadowLighting(fragment: string): string {
  const coordinates = fragment.includes('vec2 pos=') ? 'pos+uOrigin, texUV' : 'p+uOrigin, uv';
  return fragment.replace('void main()', shadowGLSL + '\nvoid main()').replace('vec3 col=c.rgb*uTint;', `vec3 col=shadowSurface(c.rgb*uTint, ${coordinates});`);
}

const shadowGLSL = /* glsl */`
uniform sampler2D uCaster0,uCaster1,uCaster2,uCaster3,uShadowReceiver;
uniform vec4 uCasterRect[4],uCasterInfo[4];
uniform vec4 uShadowLight[4],uShadowColor[4],uShadowParams[4];
uniform float uShadowEnabled,uShadowAmbient,uReceiverElevation,uReceiverSelf,uReceiverMask,uShadowTransmission;
float blocker(int i,vec2 p){
  vec4 rect=uCasterRect[i]; vec2 uv=(p-rect.xy)/rect.zw;
  if(any(lessThan(uv,vec2(0.0)))||any(greaterThanEqual(uv,vec2(1.0)))) return 0.0;
  uv.y=1.0-uv.y;
  vec4 m=vec4(0.0);
  if(i==0)m=texture2D(uCaster0,uv);
  else if(i==1)m=texture2D(uCaster1,uv);
  else if(i==2)m=texture2D(uCaster2,uv);
  else m=texture2D(uCaster3,uv);
  return m.a*mix(1.0,m.r,uCasterInfo[i].z)*uCasterInfo[i].y;
}
float lightVisibility(vec2 p,int j){
  float visible=1.0;
  for(int i=0;i<4;i++){
    vec4 info=uCasterInfo[i];
    if(info.w<0.5||abs(float(i)-uReceiverSelf)<0.1||info.x<=uReceiverElevation)continue;
    vec4 light=uShadowLight[j]; vec2 q;
    if(light.w<0.5){
      float distance=min(uShadowParams[j].w,(info.x-uReceiverElevation)/max(0.00001,light.z));
      q=p+light.xy*distance;
    }else{
      if(light.z<=info.x)continue;
      float ratio=(light.z-info.x)/(light.z-uReceiverElevation);
      q=light.xy+(p-light.xy)*ratio;
    }
    visible*=1.0-blocker(i,q);
  }
  return visible;
}
vec3 shadowSurface(vec3 base,vec2 p,vec2 uv){
  if(uShadowEnabled<0.5)return base;
  vec3 illumination=vec3(uShadowAmbient);
  float receive=mix(1.0,texture2D(uShadowReceiver,uv).r*texture2D(uShadowReceiver,uv).a,uReceiverMask);
  for(int j=0;j<4;j++){
    vec4 light=uShadowLight[j], color=uShadowColor[j], params=uShadowParams[j];
    if(color.a<=0.0)continue;
    float attenuation=1.0;
    if(light.w>0.5){
      if(light.z<=uReceiverElevation)continue;
      float d=length(vec3(p-light.xy,light.z-uReceiverElevation));
      attenuation=1.0/(1.0+pow(d/params.y,2.0));
    }
    float v=lightVisibility(p,j);
    if(params.z>0.0){
      vec2 s=vec2(params.z,0.0);
      v=(v+lightVisibility(p+s,j)+lightVisibility(p-s,j)+lightVisibility(p+s.yx,j)+lightVisibility(p-s.yx,j))/5.0;
    }
    illumination+=color.rgb*color.a*attenuation*mix(1.0,v,receive)*uShadowTransmission;
  }
  // Existing engine palette is display-space; decode/encode only this opt-in lighting term.
  vec3 linearBase=mix(base/12.92,pow((base+0.055)/1.055,vec3(2.4)),step(vec3(0.04045),base));
  vec3 lit=linearBase*illumination;
  return mix(lit*12.92,1.055*pow(max(lit,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),lit));
}
`;
