// src/components/city/assets.ts
// Manifesto dos modelos 3D da cidade (Kenney, CC0). Paths servidos de public/.
// Fonte: City Kit (Commercial), City Kit (Roads), Car Kit — kenney.nl.
// Inventário completo com licença em docs/superpowers/specs/assets-cidade-v2.md.
import { useGLTF } from '@react-three/drei';

// Cada kit vem em sua própria subpasta porque os GLBs referenciam a textura
// externa `Textures/colormap.png` por caminho RELATIVO ao próprio .glb — e
// cada kit tem seu colormap com o mesmo nome de arquivo. Misturar tudo numa
// pasta plana faz um kit pisar no colormap do outro (texturas erradas/
// ausentes). Ver public/models/city/{commercial,roads,cars}/Textures/colormap.png.
export const CITY_MODELS = {
  buildings: {
    smallA: '/models/city/commercial/building-small-a.glb',
    smallB: '/models/city/commercial/building-small-b.glb',
    mediumA: '/models/city/commercial/building-medium-a.glb',
    mediumB: '/models/city/commercial/building-medium-b.glb',
    largeA: '/models/city/commercial/building-large-a.glb',
    largeB: '/models/city/commercial/building-large-b.glb',
    tallA: '/models/city/commercial/building-tall-a.glb',
    tallB: '/models/city/commercial/building-tall-b.glb',
    wideA: '/models/city/commercial/building-wide-a.glb',
    thinA: '/models/city/commercial/building-thin-a.glb',
  },
  roads: {
    straight: '/models/city/roads/road-straight.glb',
    crossroad: '/models/city/roads/road-crossroad.glb',
    intersectionT: '/models/city/roads/road-intersection-t.glb',
    intersection: '/models/city/roads/road-intersection.glb',
    curve: '/models/city/roads/road-curve.glb',
    end: '/models/city/roads/road-end.glb',
    sidewalkStraight: '/models/city/roads/sidewalk-straight.glb',
    sidewalkCorner: '/models/city/roads/sidewalk-corner.glb',
  },
  cars: {
    sedan: '/models/city/cars/car-sedan.glb',
    hatchback: '/models/city/cars/car-hatchback.glb',
    van: '/models/city/cars/car-van.glb',
    taxi: '/models/city/cars/car-taxi.glb',
    police: '/models/city/cars/car-police.glb',
    suv: '/models/city/cars/car-suv.glb',
  },
} as const;

/** Pré-carrega todos os modelos da cidade (chamar uma vez, ex. no boot da cena). */
export function preloadCityModels(): void {
  Object.values(CITY_MODELS).forEach((group) =>
    Object.values(group).forEach((path) => useGLTF.preload(path)));
}
