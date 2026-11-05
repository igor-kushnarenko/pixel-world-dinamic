export { AtmosphereEngine } from './AtmosphereEngine';
export { DEFAULT_PARAMETERS, PRESETS, resolveParameters, getPreset, parsePreset, paletteAt } from './parameters';
export type { AtmosphereParameters, LayerAtmosphere, CloudPlane, DeepPartial, EngineOptions, EngineDiagnostics, ImageLayer, LayerPlacement, RoomLightAssets, LightGroup, LightMask, PaletteName, ParameterPatch, SceneDefinition, TextureSource } from './types';

export { randomWeatherPreset, WEATHER_NAMES } from './randomWeather';
export type { WeatherKind } from './randomWeather';

export {createSpriteMaterial,sampleSpriteLight,windowTransmission} from './spriteLighting';
export type {SpriteLight,SpriteLightingState} from './spriteLighting';
export const ATMOSPHERE_ENGINE_VERSION='0.3.0';
export {resolveShutter} from './shutter';
export type {ShutterDefinition,ShutterLight} from './types';
