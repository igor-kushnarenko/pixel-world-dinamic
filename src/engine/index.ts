export { AtmosphereEngine } from './AtmosphereEngine';
export { DEFAULT_PARAMETERS, PRESETS, resolveParameters, getPreset, parsePreset, paletteAt } from './parameters';
export type { AtmosphereParameters, LayerAtmosphere, CloudPlane, DeepPartial, EngineOptions, EngineDiagnostics, ImageLayer, LayerPlacement, RoomLightAssets, LightGroup, LightMask, PaletteName, ParameterPatch, SceneDefinition, TextureSource } from './types';

export { randomWeatherPreset, WEATHER_NAMES } from './randomWeather';
export type { WeatherKind } from './randomWeather';

export {createSpriteMaterial,sampleSpriteLight,windowTransmission} from './spriteLighting';
export type {SpriteLight,SpriteLightingState} from './spriteLighting';
export const ATMOSPHERE_ENGINE_VERSION='0.5.0';
export { resolveShadowLighting, projectShadowSample } from './shadows';
export type { LayerShadowGeometry, ShadowLight, DirectionalShadowLight, PointShadowLight, ShadowLightingState } from './shadows';
export {resolveShutter} from './shutter';
export type {ShutterDefinition,ShutterLight} from './types';

export {PanoramaExperience} from './PanoramaExperience';
export type {PanoramaExperienceOptions,PanoramaView} from './PanoramaExperience';
export {WeatherTransition} from './WeatherTransition';
export {LandscapeAudio} from './LandscapeAudio';
export type {SoundscapeProfile,LandscapeSound} from './LandscapeAudio';
export {SillPhysics,sillBounds,dragPosition,fallStep,restingPosition,SILL_BACK,SILL_FRONT} from './objectPhysics';
export type {Body,SillGeometry} from './objectPhysics';
