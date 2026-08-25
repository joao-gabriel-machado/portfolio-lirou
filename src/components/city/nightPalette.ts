// src/components/city/nightPalette.ts
// Paleta noturna da Cidade v2 + utilitário de retintagem dos GLTFs (Kenney
// City Kit) para os tons "fosco" da cena noturna. Consumido por
// CityAtmosphere (Task 2) e pelos loaders de prédios/ruas (Tasks 3/5/6).
import * as THREE from 'three';

export const NIGHT = {
  skyTop: '#0b1026',
  skyBottom: '#1a2547',
  fog: '#141c33',
  ground: '#10141f',
  concreteA: '#3a4666',
  concreteB: '#2c3654',
  concreteC: '#4a5578',
  trim: '#232c4a',
  windowWarm: '#ffd9a0',
  windowCool: '#bcd7ff',
  neon: '#1fb2aa',
} as const;

/** Tint multiplicativo aplicado sobre o colormap original (map × color = tudo mais escuro/frio, preservando a variação de cor do kit). */
const MAP_TINT = '#8a93b8';

/** Cache de materiais "com map" clonados, por `map.uuid|emissiveHex`. */
const mappedMaterialCache = new Map<string, THREE.MeshStandardMaterial>();
/** Cache de materiais "sem map" (fallback HSL), por hex resultante. */
const flatMaterialCache = new Map<string, THREE.MeshStandardMaterial>();

const _hsl = { h: 0, s: 0, l: 0 };

function pickConcreteByLuminance(l: number): string {
  // Bandas: escuro → concreteB, médio → concreteA, claro → concreteC.
  if (l < 0.33) return NIGHT.concreteB;
  if (l < 0.66) return NIGHT.concreteA;
  return NIGHT.concreteC;
}

function getOrCreateFlatMaterial(hex: string, emissiveHex?: string): THREE.MeshStandardMaterial {
  const key = emissiveHex ? `${hex}|${emissiveHex}` : hex;
  const cached = flatMaterialCache.get(key);
  if (cached) return cached;

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness: 0.85,
    metalness: 0,
  });
  if (emissiveHex) {
    mat.color.set('#0d1117');
    mat.emissive = new THREE.Color(emissiveHex);
    mat.emissiveIntensity = 0.9;
  }
  flatMaterialCache.set(key, mat);
  return mat;
}

/**
 * Clona um material que tem `map` (colormap do kit Kenney), preservando o
 * map (e demais texturas), e aplica o tint noturno multiplicativo. Se
 * `emissiveHex` for passado (janela/vidro), soma emissivo por cima — o
 * emissivo funciona independente do map.
 */
function getOrCreateMappedMaterial(
  original: THREE.MeshStandardMaterial,
  emissiveHex?: string,
): THREE.MeshStandardMaterial {
  const map = original.map!;
  const key = `${map.uuid}|${emissiveHex ?? 'none'}`;
  const cached = mappedMaterialCache.get(key);
  if (cached) return cached;

  const mat = original.clone();
  mat.roughness = 0.85;
  mat.metalness = 0;
  mat.color.set(MAP_TINT);
  if (emissiveHex) {
    mat.emissive = new THREE.Color(emissiveHex);
    mat.emissiveIntensity = 0.9;
  } else {
    mat.emissive = new THREE.Color('#000000');
    mat.emissiveIntensity = 0;
  }
  mappedMaterialCache.set(key, mat);
  return mat;
}

/** Escolhe janela quente/fria de forma determinística a partir de um seed + índice. */
function seededWindowTone(seed: number, salt: number): string {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  const frac = x - Math.floor(x);
  return frac < 0.5 ? NIGHT.windowWarm : NIGHT.windowCool;
}

/**
 * Retintagem "fosca" noturna dos materiais do kit Kenney.
 *
 * O kit carrega a cor de cada peça num colormap (textura), não em
 * `material.color` (que fica branco) — então:
 * - Material COM `map`: clona (preservando o map) e aplica um tint
 *   multiplicativo `#8a93b8` (escurece/esfria mantendo a variação de cor do
 *   colormap). Cacheado por `map.uuid` + tint/emissivo.
 * - Material SEM `map`: fallback — remapeia `material.color` original (via
 *   HSL) para a paleta NIGHT, como antes.
 * - Vidro/janela: detectado só por NOME (mesh.name ou material.name contendo
 *   'glass'/'window') — ganha emissivo quente/frio (seeded), intensity 0.9,
 *   funciona nos dois casos acima (com ou sem map).
 * Também liga cast/receiveShadow nos meshes (o gate real de sombra é no
 * light/renderer).
 */
export function applyNightMaterials(root: THREE.Object3D, seed = 0): void {
  let meshIndex = 0;

  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const meshNameLc = mesh.name.toLowerCase();

    const originalMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const remapped = originalMaterials.map((originalMatUnknown, matIndex) => {
      const originalMat = originalMatUnknown as THREE.MeshStandardMaterial;
      const matNameLc = (originalMat?.name ?? '').toLowerCase();
      const isGlass = meshNameLc.includes('glass') || meshNameLc.includes('window')
        || matNameLc.includes('glass') || matNameLc.includes('window');

      if (originalMat?.map) {
        if (isGlass) {
          const tone = seededWindowTone(seed + meshIndex * 7.13, matIndex);
          return getOrCreateMappedMaterial(originalMat, tone);
        }
        return getOrCreateMappedMaterial(originalMat);
      }

      // Fallback sem map: remapeia material.color original via HSL.
      if (isGlass) {
        const tone = seededWindowTone(seed + meshIndex * 7.13, matIndex);
        return getOrCreateFlatMaterial(tone, tone);
      }

      const srcColor = originalMat?.color instanceof THREE.Color
        ? originalMat.color
        : new THREE.Color('#ffffff');
      srcColor.getHSL(_hsl);
      let targetHex: string;
      if (_hsl.s < 0.25) {
        targetHex = pickConcreteByLuminance(_hsl.l);
      } else if (_hsl.h >= 0.02 && _hsl.h <= 0.17) {
        targetHex = NIGHT.trim;
      } else {
        const darkened = srcColor.clone();
        darkened.setHSL(_hsl.h, _hsl.s * 0.5, _hsl.l * 0.55);
        targetHex = `#${darkened.getHexString()}`;
      }
      return getOrCreateFlatMaterial(targetHex);
    });

    mesh.material = Array.isArray(mesh.material) ? remapped : remapped[0];
    meshIndex += 1;
  });
}
