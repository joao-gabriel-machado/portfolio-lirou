// src/components/city/CityBuildings.tsx
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkeletonUtils, mergeBufferGeometries } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';
import { Text, useGLTF, Instances, Instance } from '@react-three/drei';
import { CITY_COLORS, PLACES, type Place, type PlaceId } from './places';
import { applyNightMaterials, NIGHT } from './nightPalette';
import { CITY_MODELS } from './assets';
import SignBoard, { SIGNBOARD_COLUMN_H, SIGNBOARD_PANEL_HEIGHT } from './SignBoard';

/** POIs "hero" — ganham o pórtico de telhado (2 colunas) em vez de hastes. */
const HERO_IDS: ReadonlySet<PlaceId> = new Set(['metrifica', 'prontiva']);

type BuildingModelKey = keyof typeof CITY_MODELS.buildings;

/** Mapeamento POI → modelo GLB (alturas via place.size[1], normalizadas no load). */
const POI_MODEL: Partial<Record<PlaceId, BuildingModelKey>> = {
  metrifica: 'tallA',
  prontiva: 'tallB',
  contact: 'thinA',
  'exp-twiniti': 'largeA',
  'exp-titaniumfix': 'largeB',
  delpupo: 'mediumA',
  twiniti: 'mediumB',
  redes: 'smallA',
  samara: 'smallB',
  'edu-unip': 'wideA',
  coffee: 'smallB',
  'edu-rocketseat': 'thinA',
};

const DESKTOP_VARIATIONS: BuildingModelKey[] = ['smallA', 'mediumA', 'largeA', 'tallA', 'wideA'];
const MOBILE_VARIATIONS: BuildingModelKey[] = ['smallA', 'mediumA', 'tallA'];

/**
 * POIs cujo GLB tem um aspect ratio muito diferente de `place.size` (bbox
 * quase cúbico normalizado por uma altura grande) — escala uniforme por
 * altura produz um monolito largo demais. Para esses, escala por eixo
 * (leve esticamento do modelo, aceitável no low-poly) mantendo o footprint
 * fiel a `place.size[0]/[2]` (importa para waypoints/ruas).
 */
const FOOTPRINT_CLAMPED_IDS: ReadonlySet<PlaceId> = new Set(['contact', 'edu-rocketseat']);

interface Props {
  onSelect: (id: PlaceId) => void;
  onHover: (id: PlaceId | null) => void;
  hoveredId: PlaceId | null;
  labels: Record<string, string>;
  reducedMotion: boolean;
  isMobile: boolean;
  /** POI atualmente selecionado (usado pelo SignBoard hero para disparar a ignição letra-a-letra). */
  activeId?: PlaceId | null;
}

/** PRNG determinístico (LCG) — mesmo gerador usado em todo o pacote city/. */
function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

const WINDOW_COUNT = 6;
const WINDOW_W = 0.28;
const WINDOW_H = 0.4;
const WINDOW_BASE_INTENSITY = 1.2;
const WINDOW_HOVER_INTENSITY = WINDOW_BASE_INTENSITY * 2;

interface WindowPlaneCfg { position: [number, number, number]; rotationY: number; tone: string; }

/**
 * Janelas quentes/frias sintéticas, deterministicamente posicionadas na
 * fachada frontal/lateral do bounding box já escalado do prédio. O kit
 * Kenney (commercial) é single-mesh por prédio — sem malha de vidro
 * separável — então isso substitui a detecção por nome do
 * `applyNightMaterials` para dar às fachadas o brilho de janelas acesas.
 */
function makeWindowPlanes(seed: number, width: number, height: number, depth: number): WindowPlaneCfg[] {
  const rand = createSeededRandom(seed * 97 + 13);
  const planes: WindowPlaneCfg[] = [];
  for (let k = 0; k < WINDOW_COUNT; k++) {
    const y = height * (0.18 + rand() * 0.62);
    const tone = rand() < 0.55 ? NIGHT.windowWarm : NIGHT.windowCool;
    if (k % 2 === 0) {
      // Fachada frontal (+Z)
      const x = (rand() - 0.5) * width * 0.7;
      planes.push({ position: [x, y, depth / 2 + 0.02], rotationY: 0, tone });
    } else {
      // Fachada lateral (+X)
      const z = (rand() - 0.5) * depth * 0.7;
      planes.push({ position: [width / 2 + 0.02, y, z], rotationY: Math.PI / 2, tone });
    }
  }
  return planes;
}

/**
 * Prédio-POI renderizado a partir de um GLB do City Kit (Kenney), retintado
 * para a paleta noturna e normalizado para que a altura final bata com
 * `place.size[1]`. Handlers de click/hover replicam o contrato v1
 * (stopPropagation, guard de e.delta, cursor) no group externo.
 */
const GltfBuilding = ({ place, modelKey, label, hovered, active, onSelect, onHover, reducedMotion, seed }: {
  place: Place; modelKey: BuildingModelKey; label: string; hovered: boolean; active: boolean;
  onSelect: (id: PlaceId) => void; onHover: (id: PlaceId | null) => void;
  reducedMotion: boolean; seed: number;
}) => {
  const { scene } = useGLTF(CITY_MODELS.buildings[modelKey]);
  const clampFootprint = FOOTPRINT_CLAMPED_IDS.has(place.id);

  // Clone + retintagem noturna, feitos juntos dentro do mesmo useMemo (uma
  // única vez por clone, antes do primeiro paint — evita um frame com o
  // colormap cru e evita separar side-effect de criação).
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    applyNightMaterials(c, seed);
    return c;
  }, [scene, seed]);

  // Bounding box medida UMA VEZ: normaliza escala pela altura (e, para os
  // POIs em FOOTPRINT_CLAMPED_IDS, também por largura/profundidade —
  // escala por eixo em vez de uniforme, pra não gerar um monolito largo
  // demais em modelos com aspect ratio muito diferente de place.size) e
  // centraliza a base do modelo em (0,0,0) local (compensado pelo offset).
  const { scale, offset, width, depth } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone);
    const rawHeight = Math.max(box.max.y - box.min.y, 0.001);
    const rawWidth = Math.max(box.max.x - box.min.x, 0.001);
    const rawDepth = Math.max(box.max.z - box.min.z, 0.001);
    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;
    const scaleY = place.size[1] / rawHeight;
    const scaleX = clampFootprint ? place.size[0] / rawWidth : scaleY;
    const scaleZ = clampFootprint ? place.size[2] / rawDepth : scaleY;
    return {
      scale: [scaleX, scaleY, scaleZ] as [number, number, number],
      offset: [-centerX, -box.min.y, -centerZ] as [number, number, number],
      width: rawWidth * scaleX,
      depth: rawDepth * scaleZ,
    };
  }, [clone, place.size, clampFootprint]);

  const windowPlanes = useMemo(
    () => makeWindowPlanes(seed, width, place.size[1], depth),
    [seed, width, place.size, depth],
  );
  const windowMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useEffect(() => {
    const target = hovered ? WINDOW_HOVER_INTENSITY : WINDOW_BASE_INTENSITY;
    windowMatRefs.current.forEach((m) => { if (m) m.emissiveIntensity = target; });
  }, [hovered]);

  return (
    <group
      position={[place.position[0], 0, place.position[2]]}
      onClick={(e) => { if (e.delta > 4) return; e.stopPropagation(); onSelect(place.id); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(place.id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = 'default'; }}
    >
      <group scale={scale}>
        <primitive object={clone} position={offset} />
      </group>

      {windowPlanes.map((wp, wi) => (
        <mesh key={wi} position={wp.position} rotation={[0, wp.rotationY, 0]} raycast={() => null}>
          <planeGeometry args={[WINDOW_W, WINDOW_H]} />
          <meshStandardMaterial
            ref={(el) => { windowMatRefs.current[wi] = el; }}
            color="#0d1117"
            emissive={wp.tone}
            emissiveIntensity={WINDOW_BASE_INTENSITY}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <group position={[0, place.size[1], 0]}>
        <SignBoard label={label} width={width} comingSoon={place.comingSoon} hero={HERO_IDS.has(place.id)}
          hovered={hovered} active={active} reducedMotion={reducedMotion} seed={seed} />
      </group>
    </group>
  );
};

const TOTEM_CAP_HEIGHT = 0.12;

/**
 * Totem dos distritos de skills (4 itens): sem modelo GLB dedicado no kit —
 * mantém o volume box v1, mas retintado (NIGHT.trim, fosco) com uma "coroa"
 * neon fina no topo em vez da textura de janelas (removida nesta task).
 * Abstrato por design.
 */
const SkillsTotem = ({ place, label, hovered, active, onSelect, onHover, reducedMotion, seed }: {
  place: Place; label: string; hovered: boolean; active: boolean;
  onSelect: (id: PlaceId) => void; onHover: (id: PlaceId | null) => void;
  reducedMotion: boolean; seed: number;
}) => {
  const [w, h, d] = place.size;

  return (
    <group position={[place.position[0], 0, place.position[2]]}>
      <mesh
        position={[0, h / 2, 0]}
        onClick={(e) => { if (e.delta > 4) return; e.stopPropagation(); onSelect(place.id); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(place.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={NIGHT.trim}
          roughness={0.85}
          metalness={0}
          emissive={CITY_COLORS.primary}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </mesh>
      {/* Coroa neon: tampa fina no topo do totem */}
      <mesh position={[0, h + TOTEM_CAP_HEIGHT / 2, 0]} raycast={() => null}>
        <boxGeometry args={[w, TOTEM_CAP_HEIGHT, d]} />
        <meshStandardMaterial
          color={NIGHT.trim}
          roughness={0.85}
          metalness={0}
          emissive={CITY_COLORS.primary}
          emissiveIntensity={1.3}
        />
      </mesh>
      <group position={[0, h, 0]}>
        <SignBoard label={label} width={w} hovered={hovered} active={active} reducedMotion={reducedMotion} seed={seed} />
      </group>
    </group>
  );
};

/** Gera o mesmo anel de transforms do v1 (posição/altura), a partir do seed 42. */
function generateBackgroundTransforms(count: number): { pos: THREE.Vector3; hgt: number }[] {
  const out: { pos: THREE.Vector3; hgt: number }[] = [];
  const rand = createSeededRandom(42);
  for (let i = 0; i < count; i++) {
    let angle = (i / count) * Math.PI * 2 + rand() * 0.2;
    // Afasta o prédio dos 4 eixos das avenidas (N/S/E/O) para não nascer em cima da via.
    const a = angle % (Math.PI / 2);
    const dOff = Math.min(a, Math.PI / 2 - a);
    if (dOff < 0.09) angle += 0.15;
    const radius = 30 + rand() * 11;
    const hgt = 3 + rand() * 7;
    rand(); rand(); // consome os mesmos rolls de largura/profundidade do v1 (preserva a sequência ⇒ mesmas posições)
    out.push({ pos: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius), hgt });
  }
  return out;
}

/** Uma variação de prédio de fundo: geometria+material únicos, instanciados via drei <Instances>. */
const BackgroundVariation = ({ modelKey, seed, transforms }: {
  modelKey: BuildingModelKey; seed: number; transforms: { pos: THREE.Vector3; hgt: number }[];
}) => {
  const { scene } = useGLTF(CITY_MODELS.buildings[modelKey]);

  const { geometry, material, height } = useMemo(() => {
    const clone = SkeletonUtils.clone(scene) as THREE.Group;
    applyNightMaterials(clone, seed);
    const meshes: THREE.Mesh[] = [];
    clone.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });

    // Os prédios do City Kit (commercial) são single-mesh (confirmado nos 10
    // GLBs usados). Mantemos o fallback de merge/maior-malha por segurança
    // caso um kit futuro venha multi-mesh — ver report da task 3.
    let mesh: THREE.Mesh;
    if (meshes.length <= 1) {
      mesh = meshes[0];
    } else {
      const sameMaterial = meshes.every((m) => m.material === meshes[0].material);
      const merged = sameMaterial ? mergeBufferGeometries(meshes.map((m) => m.geometry)) : null;
      if (merged) {
        mesh = new THREE.Mesh(merged, meshes[0].material);
      } else {
        mesh = meshes.reduce((a, b) =>
          (a.geometry.attributes.position?.count ?? 0) >= (b.geometry.attributes.position?.count ?? 0) ? a : b);
      }
    }

    const box = new THREE.Box3().setFromObject(mesh);
    return {
      geometry: mesh.geometry,
      material: mesh.material as THREE.Material,
      height: Math.max(box.max.y - box.min.y, 0.001),
    };
  }, [scene, seed]);

  return (
    <Instances geometry={geometry} material={material} limit={transforms.length || 1}>
      {transforms.map((t, i) => (
        <Instance key={i} position={t.pos} scale={t.hgt / height} />
      ))}
    </Instances>
  );
};

/** Prédios de fundo no anel externo (não clicáveis), ~5 variações desktop / 3 mobile. */
const BackgroundBuildings = ({ count, isMobile }: { count: number; isMobile: boolean }) => {
  const variations = isMobile ? MOBILE_VARIATIONS : DESKTOP_VARIATIONS;

  const grouped = useMemo(() => {
    const raw = generateBackgroundTransforms(count);
    const byVariation = new Map<BuildingModelKey, { pos: THREE.Vector3; hgt: number }[]>();
    variations.forEach((v) => byVariation.set(v, []));
    raw.forEach((tr, i) => {
      const key = variations[i % variations.length];
      byVariation.get(key)!.push(tr);
    });
    return byVariation;
  }, [count, variations]);

  return (
    <group raycast={() => null}>
      {variations.map((modelKey, vi) => (
        <BackgroundVariation key={modelKey} modelKey={modelKey} seed={vi * 11 + 5}
          transforms={grouped.get(modelKey) ?? []} />
      ))}
    </group>
  );
};

const ContactAntenna = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const light = useRef<THREE.Mesh>(null);
  const contact = PLACES.find((p) => p.id === 'contact')!;
  useFrame(({ clock }) => {
    if (reducedMotion || !light.current) return;
    const mat = light.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime * 2.5) * 1.3;
  });
  return (
    <group position={[contact.position[0], contact.size[1], contact.position[2]]} raycast={() => null}>
      <mesh position={[0, 1.2, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.05, 0.05, 2.4]} />
        <meshStandardMaterial color="#1a2226" />
      </mesh>
      <mesh ref={light} position={[0, 2.5, 0]} raycast={() => null}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={CITY_COLORS.primary} emissive={CITY_COLORS.primary} emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

const CityBuildings = ({ onSelect, onHover, hoveredId, labels, reducedMotion, isMobile, activeId }: Props) => {
  const prontivaSign = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (reducedMotion || !prontivaSign.current) return;
    // Letreiro "em breve" da Prontiva pisca devagar.
    prontivaSign.current.visible = Math.sin(clock.elapsedTime * 3) > -0.3;
  });

  const prontiva = PLACES.find((p) => p.id === 'prontiva')!;

  return (
    <group>
      {/* Chão com grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <circleGeometry args={[44, 48]} />
        <meshStandardMaterial color={CITY_COLORS.ground} roughness={0.35} metalness={0.5} />
      </mesh>
      <gridHelper args={[88, 44, '#123a37', '#0b1f1d']} position={[0, 0.02, 0]} raycast={() => null} />

      {/* Praça central: nome em neon */}
      <Text position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        fontSize={1.6} color={CITY_COLORS.primary} anchorX="center" anchorY="middle"
        outlineWidth={0.03} outlineColor="#03302d" raycast={() => null}>
        JOÃO GABRIEL — LIROUDEV
      </Text>

      {/* POIs */}
      {PLACES.map((place, i) => {
        const label = labels[place.id] ?? place.id;
        const hovered = hoveredId === place.id;
        const active = activeId === place.id;
        const seed = i * 3 + 1;
        const modelKey = POI_MODEL[place.id];
        return modelKey ? (
          <GltfBuilding key={place.id} place={place} modelKey={modelKey} label={label}
            hovered={hovered} active={active} reducedMotion={reducedMotion} seed={seed}
            onSelect={onSelect} onHover={onHover} />
        ) : (
          <SkillsTotem key={place.id} place={place} label={label}
            hovered={hovered} active={active} reducedMotion={reducedMotion} seed={seed}
            onSelect={onSelect} onHover={onHover} />
        );
      })}

      {/* Selo "em breve" piscante da Prontiva — acima do pórtico hero do SignBoard */}
      <group ref={prontivaSign}
        position={[prontiva.position[0], prontiva.size[1] + SIGNBOARD_COLUMN_H + SIGNBOARD_PANEL_HEIGHT + 0.8, prontiva.position[2]]}>
        <Text fontSize={0.55} color={CITY_COLORS.accent} anchorX="center" anchorY="middle"
          rotation={[0, Math.PI / 4, 0]} raycast={() => null}>
          {labels['prontiva-soon'] ?? 'EM BREVE'}
        </Text>
      </group>

      {/* Antena pulsante do Contato */}
      <ContactAntenna reducedMotion={reducedMotion} />

      <BackgroundBuildings count={isMobile ? 28 : 60} isMobile={isMobile} />
    </group>
  );
};

export default CityBuildings;
