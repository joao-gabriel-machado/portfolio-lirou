// src/components/city/assets.ts
// Manifesto dos modelos 3D da cidade (Kenney, CC0). Paths servidos de public/.
// Fonte: City Kit (Commercial), City Kit (Roads), Car Kit — kenney.nl.
// Inventário completo com licença em docs/superpowers/specs/assets-cidade-v2.md.
import { useGLTF } from '@react-three/drei';

export const CITY_MODELS = {
  buildings: {
    smallA: '/models/city/building-small-a.glb',
    smallB: '/models/city/building-small-b.glb',
    mediumA: '/models/city/building-medium-a.glb',
    mediumB: '/models/city/building-medium-b.glb',
    largeA: '/models/city/building-large-a.glb',
    largeB: '/models/city/building-large-b.glb',
    tallA: '/models/city/building-tall-a.glb',
    tallB: '/models/city/building-tall-b.glb',
    wideA: '/models/city/building-wide-a.glb',
    thinA: '/models/city/building-thin-a.glb',
  },
  roads: {
    straight: '/models/city/road-straight.glb',
    crossroad: '/models/city/road-crossroad.glb',
    intersectionT: '/models/city/road-intersection-t.glb',
    intersection: '/models/city/road-intersection.glb',
    curve: '/models/city/road-curve.glb',
    end: '/models/city/road-end.glb',
    sidewalkStraight: '/models/city/sidewalk-straight.glb',
    sidewalkCorner: '/models/city/sidewalk-corner.glb',
  },
  cars: {
    sedan: '/models/city/car-sedan.glb',
    hatchback: '/models/city/car-hatchback.glb',
    van: '/models/city/car-van.glb',
    taxi: '/models/city/car-taxi.glb',
    police: '/models/city/car-police.glb',
    suv: '/models/city/car-suv.glb',
  },
} as const;

/** Pré-carrega todos os modelos da cidade (chamar uma vez, ex. no boot da cena). */
export function preloadCityModels(): void {
  Object.values(CITY_MODELS).forEach((group) =>
    Object.values(group).forEach((path) => useGLTF.preload(path)));
}
