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

/** Cache de materiais retintados, por hex resultante (compartilhado entre meshes). */
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

const _hsl = { h: 0, s: 0, l: 0 };

function pickConcreteByLuminance(l: number): string {
  // Bandas: escuro → concreteB, médio → concreteA, claro → concreteC.
  if (l < 0.33) return NIGHT.concreteB;
  if (l < 0.66) return NIGHT.concreteA;
  return NIGHT.concreteC;
}

/** true se a cor original sugere vidro/janela (azulado e claro). */
function looksLikeGlassColor(c: THREE.Color): boolean {
  c.getHSL(_hsl);
  return _hsl.h > 0.5 && _hsl.h < 0.65 && _hsl.l > 0.5;
}

function getOrCreateMaterial(hex: string, emissiveHex?: string): THREE.MeshStandardMaterial {
  const key = emissiveHex ? `${hex}|${emissiveHex}` : hex;
  const cached = materialCache.get(key);
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
  materialCache.set(key, mat);
  return mat;
}

/** Escolhe janela quente/fria de forma determinística a partir de um seed + índice. */
function seededWindowTone(seed: number, salt: number): string {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  const frac = x - Math.floor(x);
  return frac < 0.5 ? NIGHT.windowWarm : NIGHT.windowCool;
}

/**
 * Retintagem "fosca" noturna dos materiais do kit Kenney: remapeia a cor
 * original de cada material (via HSL) para a paleta NIGHT e troca por um
 * MeshStandardMaterial fosco (roughness 0.85, metalness 0) compartilhado.
 * Vidros/janelas viram emissivo quente/frio (seeded). Também liga
 * cast/receiveShadow nos meshes (o gate real de sombra é no light/renderer).
 */
export function applyNightMaterials(root: THREE.Object3D, seed = 0): void {
  let meshIndex = 0;

  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const nameLc = mesh.name.toLowerCase();
    const isGlassName = nameLc.includes('glass') || nameLc.includes('window');

    const originalMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const remapped = originalMaterials.map((originalMat, matIndex) => {
      const srcColor = (originalMat as THREE.MeshStandardMaterial)?.color instanceof THREE.Color
        ? (originalMat as THREE.MeshStandardMaterial).color
        : new THREE.Color('#ffffff');

      const isGlass = isGlassName || looksLikeGlassColor(srcColor);
      if (isGlass) {
        const tone = seededWindowTone(seed + meshIndex * 7.13, matIndex);
        return getOrCreateMaterial(tone, tone);
      }

      srcColor.getHSL(_hsl);
      let targetHex: string;
      if (_hsl.s < 0.25) {
        targetHex = pickConcreteByLuminance(_hsl.l);
      } else if (_hsl.h >= 0.02 && _hsl.h <= 0.17) {
        targetHex = NIGHT.trim;
      } else {
        const darkened = srcColor.clone();
        darkened.getHSL(_hsl);
        darkened.setHSL(_hsl.h, _hsl.s * 0.5, _hsl.l * 0.55);
        targetHex = `#${darkened.getHexString()}`;
      }
      return getOrCreateMaterial(targetHex);
    });

    mesh.material = Array.isArray(mesh.material) ? remapped : remapped[0];
    meshIndex += 1;
  });
}
