// src/components/city/CityStreets.tsx
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkeletonUtils, mergeBufferGeometries } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import { PLACES, type PlaceId } from './places';
import { applyNightMaterials } from './nightPalette';
import { CITY_MODELS } from './assets';

const Y_UP = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);
/** Rotação que deita uma geometria vertical (XY) no plano do chão (XZ). */
const FLAT_QUAT = new THREE.Quaternion().setFromAxisAngle(X_AXIS, -Math.PI / 2);

/** Ângulos das 4 avenidas radiais (norte, sul, leste, oeste). */
const RADIAL_ANGLES = [Math.PI, 0, Math.PI / 2, -Math.PI / 2] as const;

const RADIAL_INNER = 2;
const RADIAL_OUTER = 42;
const RING_RADIUS = 27;
const RING_SEGMENTS = 16;

/** Largura alvo (mundo) das faixas de rodagem — usada pra derivar a escala uniforme dos tiles do kit. */
const ROAD_TILE_WIDTH = 3;

/** PRNG determinístico (LCG) — mesmo gerador usado em todo o pacote city/. */
function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

/**
 * Extrai um único par geometria+material de um GLTF clonado (retintado),
 * pra alimentar `<Instances>`. Kits Kenney costumam ser single-mesh por
 * peça; o fallback de merge/maior-malha cobre o caso multi-mesh com mesmo
 * material (mesmo helper usado em CityBuildings/BackgroundVariation —
 * duplicado aqui por escopo de arquivo, ver pre-flight da task).
 */
function extractSingleMesh(scene: THREE.Object3D, seed: number): { geometry: THREE.BufferGeometry; material: THREE.Material } {
  const clone = SkeletonUtils.clone(scene) as THREE.Group;
  applyNightMaterials(clone, seed);
  const meshes: THREE.Mesh[] = [];
  clone.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });

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
  return { geometry: mesh.geometry, material: mesh.material as THREE.Material };
}

interface TileTransform { pos: [number, number, number]; rotY: number; scale: [number, number, number]; }
interface RadialTileSpec { z: number; halfLength: number; }
interface RingTileSpec { pos: THREE.Vector3; rotY: number; halfLength: number; }

/**
 * Gera os centros (+semi-comprimento, pra permitir stretch) dos tiles retos
 * ao longo de UMA radial: começa rente à borda do cruzamento central
 * (`crossroadHalf + tileStep/2`, sem os 0.5 de vão do v1), pula a faixa
 * ocupada pelo tile de interseção do anel (`|z-RING_RADIUS| < intersectionHalf
 * + tileStep/2`) e estica os dois tiles vizinhos ao vão pra fechar sem gap
 * (borda encosta exatamente na borda da interseção; overlap é aceitável,
 * gap não). Fix round Task 5 — findings 4 e 5.
 */
function buildRadialTileSpecs(tileStep: number, crossroadHalf: number, intersectionHalf: number): RadialTileSpec[] {
  const exclusionRadius = intersectionHalf + tileStep / 2;
  const start = crossroadHalf + tileStep / 2;

  const nominalZs: number[] = [];
  for (let z = start; z < RADIAL_OUTER; z += tileStep) nominalZs.push(z);

  const kept: RadialTileSpec[] = nominalZs
    .filter((z) => Math.abs(z - RING_RADIUS) >= exclusionRadius)
    .map((z) => ({ z, halfLength: tileStep / 2 }));

  // Tile logo antes/depois do vão da interseção — esticados pra fechar sem gap.
  let beforeIdx = -1;
  let afterIdx = -1;
  kept.forEach((t, i) => {
    if (t.z < RING_RADIUS) beforeIdx = i;
    else if (afterIdx === -1) afterIdx = i;
  });

  if (beforeIdx >= 0) {
    const t = kept[beforeIdx];
    const innerEdge = t.z - t.halfLength; // borda que já encosta no tile anterior — não mexe
    const targetOuterEdge = RING_RADIUS - intersectionHalf; // borda da interseção
    const newHalf = (targetOuterEdge - innerEdge) / 2;
    kept[beforeIdx] = { z: innerEdge + newHalf, halfLength: newHalf };
  }
  if (afterIdx >= 0) {
    const t = kept[afterIdx];
    const outerEdge = t.z + t.halfLength; // borda que já encosta no próximo tile — não mexe
    const targetInnerEdge = RING_RADIUS + intersectionHalf; // borda da interseção
    const newHalf = (outerEdge - targetInnerEdge) / 2;
    kept[afterIdx] = { z: targetInnerEdge + newHalf, halfLength: newHalf };
  }

  return kept;
}

/**
 * Gera os tiles retos ao longo dos 16 lados do polígono que aproxima o anel
 * (r=27): por lado, `count = ceil(comprimentoDoLado / tileStep)` tiles
 * uniformemente distribuídos, cada um esticado pra `comprimentoDoLado /
 * count` (fecha o lado inteiro — antes só 1 tile por vértice, ~72% do anel
 * ficava sem malha). Fix round Task 5 — finding 1.
 *
 * Fix round 2 (regressão do finding 1): os 4 vértices alinhados com as
 * radiais (0/90/180/270°) hospedam o `IntersectionTile` (footprint
 * `intersectionHalf`, mesmo plano y) — sem tratamento, os tiles terminais
 * dos lados adjacentes a esses vértices avançavam ~1.5 unidade em cima do
 * singleton (z-fighting coplanar). Por lado: se um dos vértices extremos é
 * um desses 4, encurta o vão coberto (`span`) pra parar `intersectionHalf`
 * antes dele ao longo da própria corda, e redistribui/estica os tiles só
 * sobre o `span` encurtado (mesma lógica de `count`/stretch, agora sobre o
 * vão menor) — cobertura estanque até a borda da interseção, sem invadi-la.
 */
function buildRingTileSpecs(tileStep: number, intersectionHalf: number): RingTileSpec[] {
  const angleStep = (Math.PI * 2) / RING_SEGMENTS;
  const crossingEvery = RING_SEGMENTS / RADIAL_ANGLES.length; // vértices 0,4,8,12 = interseções

  const out: RingTileSpec[] = [];
  for (let i = 0; i < RING_SEGMENTS; i++) {
    const a = new THREE.Vector3(0, 0, RING_RADIUS)
      .applyQuaternion(new THREE.Quaternion().setFromAxisAngle(Y_UP, i * angleStep));
    const b = new THREE.Vector3(0, 0, RING_RADIUS)
      .applyQuaternion(new THREE.Quaternion().setFromAxisAngle(Y_UP, (i + 1) * angleStep));
    const dir = b.clone().sub(a).normalize();
    const rotY = Math.atan2(dir.x, dir.z);

    // Um lado nunca tem os DOIS vértices como interseção (eles ficam 4
    // índices — bem mais que 1 lado — de distância um do outro).
    const startIsCrossing = i % crossingEvery === 0;
    const endIsCrossing = (i + 1) % crossingEvery === 0;
    const effStart = startIsCrossing ? a.clone().addScaledVector(dir, intersectionHalf) : a;
    const effEnd = endIsCrossing ? b.clone().addScaledVector(dir, -intersectionHalf) : b;

    const span = effStart.distanceTo(effEnd);
    if (span <= 0.001) continue; // vão totalmente consumido pelas interseções (guard defensivo)

    const count = Math.max(Math.ceil(span / tileStep), 1);
    const halfLength = span / count / 2;
    for (let k = 0; k < count; k++) {
      const pos = new THREE.Vector3().lerpVectors(effStart, effEnd, (k + 0.5) / count);
      out.push({ pos, rotY, halfLength });
    }
  }
  return out;
}

/**
 * Malha viária a partir dos tiles do Roads Kit: retas instanciadas nas 4
 * radiais + anel (polígono de 16 lados aproximando r=27), calçadas
 * flanqueando as radiais, e os singletons (cruzamento central + 4
 * interseções radial×anel) como clones diretos.
 */
const RoadTiles = () => {
  const { scene: straightScene } = useGLTF(CITY_MODELS.roads.straight);
  const { scene: sidewalkScene } = useGLTF(CITY_MODELS.roads.sidewalkStraight);
  const { scene: crossroadScene } = useGLTF(CITY_MODELS.roads.crossroad);
  const { scene: intersectionScene } = useGLTF(CITY_MODELS.roads.intersection);

  const { geometry: roadGeo, material: roadMat, scale: roadScale, tileStep, nativeDepth: roadNativeDepth } = useMemo(() => {
    const { geometry, material } = extractSingleMesh(straightScene, 501);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const nativeWidth = Math.max(box.max.x - box.min.x, 0.001);
    const nativeDepth = Math.max(box.max.z - box.min.z, 0.001);
    const scale = ROAD_TILE_WIDTH / nativeWidth;
    return { geometry, material, scale, tileStep: nativeDepth * scale, nativeDepth };
  }, [straightScene]);

  // Footprint (metade da largura, já em unidades de mundo) dos singletons —
  // medido no scene cru (retintagem não afeta bbox), reaproveitado pra achar
  // onde as retas devem parar/esticar (findings 4 e 5).
  const crossroadHalf = useMemo(() => {
    const box = new THREE.Box3().setFromObject(crossroadScene);
    return ((box.max.x - box.min.x) / 2) * roadScale;
  }, [crossroadScene, roadScale]);

  const intersectionHalf = useMemo(() => {
    const box = new THREE.Box3().setFromObject(intersectionScene);
    return ((box.max.x - box.min.x) / 2) * roadScale;
  }, [intersectionScene, roadScale]);

  // Calçada: passo e pivot medidos NELA MESMA (não reaproveita o tileStep da
  // via — sidewalk-straight tem profundidade nativa 1.31, diferente do 1.0
  // da via, e pivot fora do centro em Z). Fix round Task 5 — finding 6.
  const { geometry: sidewalkGeo, material: sidewalkMat, halfWidth: sidewalkHalfWidth, tileStep: sidewalkStep, pivotOffsetZ: sidewalkPivotZ } = useMemo(() => {
    const { geometry, material } = extractSingleMesh(sidewalkScene, 502);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const nativeWidth = Math.max(box.max.x - box.min.x, 0.001);
    const nativeDepth = Math.max(box.max.z - box.min.z, 0.001);
    return {
      geometry,
      material,
      halfWidth: (nativeWidth * roadScale) / 2,
      tileStep: nativeDepth * roadScale,
      pivotOffsetZ: (box.min.z + box.max.z) / 2,
    };
  }, [sidewalkScene, roadScale]);

  const roadTransforms = useMemo(() => {
    const out: TileTransform[] = [];

    const radialSpecs = buildRadialTileSpecs(tileStep, crossroadHalf, intersectionHalf);
    RADIAL_ANGLES.forEach((angle) => {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle);
      radialSpecs.forEach((spec) => {
        const p = new THREE.Vector3(0, 0, spec.z).applyQuaternion(qYaw);
        const scaleZ = (spec.halfLength * 2) / roadNativeDepth;
        out.push({ pos: [p.x, 0, p.z], rotY: angle, scale: [roadScale, roadScale, scaleZ] });
      });
    });

    const ringSpecs = buildRingTileSpecs(tileStep, intersectionHalf);
    ringSpecs.forEach((spec) => {
      const scaleZ = (spec.halfLength * 2) / roadNativeDepth;
      out.push({ pos: [spec.pos.x, 0, spec.pos.z], rotY: spec.rotY, scale: [roadScale, roadScale, scaleZ] });
    });

    return out;
  }, [tileStep, roadScale, roadNativeDepth, crossroadHalf, intersectionHalf]);

  const sidewalkTransforms = useMemo(() => {
    const out: TileTransform[] = [];
    const axisOffset = ROAD_TILE_WIDTH / 2 + sidewalkHalfWidth;
    const start = crossroadHalf + sidewalkStep / 2;
    RADIAL_ANGLES.forEach((angle) => {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle);
      for (let z = start; z < RADIAL_OUTER; z += sidewalkStep) {
        [-1, 1].forEach((side) => {
          // Compensa o pivot fora do centro (em Z local) ANTES de rotacionar,
          // pra que o CENTRO VISUAL do tile — não o pivot cru do GLB — caia
          // em (side*axisOffset, z) no mundo.
          const local = new THREE.Vector3(side * axisOffset, 0, z - sidewalkPivotZ * roadScale);
          const p = local.applyQuaternion(qYaw);
          out.push({ pos: [p.x, 0, p.z], rotY: angle, scale: [roadScale, roadScale, roadScale] });
        });
      }
    });
    return out;
  }, [sidewalkStep, sidewalkHalfWidth, sidewalkPivotZ, roadScale, crossroadHalf]);

  return (
    <group raycast={() => null}>
      <Instances geometry={roadGeo} material={roadMat} limit={Math.max(roadTransforms.length, 1)} raycast={() => null}>
        {roadTransforms.map((t, i) => (
          <Instance key={i} position={t.pos} rotation={[0, t.rotY, 0]} scale={t.scale} />
        ))}
      </Instances>
      <Instances geometry={sidewalkGeo} material={sidewalkMat} limit={Math.max(sidewalkTransforms.length, 1)} raycast={() => null}>
        {sidewalkTransforms.map((t, i) => (
          <Instance key={i} position={t.pos} rotation={[0, t.rotY, 0]} scale={t.scale} />
        ))}
      </Instances>

      <CrossroadTile scale={roadScale} />
      {RADIAL_ANGLES.map((angle, i) => (
        <IntersectionTile key={i} angle={angle} scale={roadScale} />
      ))}
    </group>
  );
};

/** Cruzamento das 4 radiais na praça central — clone único (não repetido). */
const CrossroadTile = ({ scale }: { scale: number }) => {
  const { scene } = useGLTF(CITY_MODELS.roads.crossroad);
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    applyNightMaterials(c, 601);
    return c;
  }, [scene]);

  return (
    <group scale={scale} raycast={() => null}>
      <primitive object={clone} raycast={() => null} />
    </group>
  );
};

/** Interseção radial × anel — 4 clones únicos, um por radial, em r=27. */
const IntersectionTile = ({ angle, scale }: { angle: number; scale: number }) => {
  const { scene } = useGLTF(CITY_MODELS.roads.intersection);
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    applyNightMaterials(c, 611);
    return c;
  }, [scene]);

  const pos = useMemo(() => new THREE.Vector3(0, 0, RING_RADIUS)
    .applyQuaternion(new THREE.Quaternion().setFromAxisAngle(Y_UP, angle)), [angle]);

  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, angle, 0]} raycast={() => null}>
      <group scale={scale} raycast={() => null}>
        <primitive object={clone} raycast={() => null} />
      </group>
    </group>
  );
};

/** Postes (hastes + lâmpadas + poça de luz no chão) ao longo das radiais e do anel. */
const StreetLamps = ({ isMobile }: { isMobile: boolean }) => {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const bulbRef = useRef<THREE.InstancedMesh>(null);
  const poolRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const radialStep = isMobile ? 12 : 6;
    RADIAL_ANGLES.forEach((angle) => {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle);
      let idx = 0;
      for (let z = RADIAL_INNER + 2; z <= RADIAL_OUTER; z += radialStep, idx++) {
        const side = idx % 2 === 0 ? 1 : -1;
        out.push(new THREE.Vector3(side * 2.1, 0, z).applyQuaternion(qYaw));
      }
    });
    const ringCount = isMobile ? 6 : 12;
    for (let i = 0; i < ringCount; i++) {
      const ringAngle = (i / ringCount) * Math.PI * 2;
      const qRing = new THREE.Quaternion().setFromAxisAngle(Y_UP, ringAngle);
      out.push(new THREE.Vector3(0, 0, RING_RADIUS).applyQuaternion(qRing));
    }
    return out;
  }, [isMobile]);

  useFrame(() => {
    const poles = poleRef.current;
    const bulbs = bulbRef.current;
    const pools = poolRef.current;
    if (!poles || !bulbs || !pools || poles.userData.done) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    positions.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, 1.1, p.z), q, UNIT_SCALE);
      poles.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(p.x, 2.2, p.z), q, UNIT_SCALE);
      bulbs.setMatrixAt(i, m);
      // y=0.07: tiles de via/calçada têm 0.02 de espessura nativa × roadScale
      // (~3) = topo em y≈0.06 — a poça precisa ficar acima disso (fix round
      // Task 5, finding 2).
      m.compose(new THREE.Vector3(p.x, 0.07, p.z), FLAT_QUAT, UNIT_SCALE);
      pools.setMatrixAt(i, m);
    });
    poles.instanceMatrix.needsUpdate = true;
    bulbs.instanceMatrix.needsUpdate = true;
    pools.instanceMatrix.needsUpdate = true;
    poles.userData.done = true;
  });

  return (
    <>
      <instancedMesh ref={poleRef} args={[undefined, undefined, positions.length]} raycast={() => null}>
        <cylinderGeometry args={[0.05, 0.05, 2.2]} />
        <meshStandardMaterial color="#1a2226" roughness={0.6} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={bulbRef} args={[undefined, undefined, positions.length]} raycast={() => null}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#bfeeea" emissive="#bfeeea" emissiveIntensity={1.2} />
      </instancedMesh>
      <instancedMesh ref={poolRef} args={[undefined, undefined, positions.length]} raycast={() => null}>
        <circleGeometry args={[1.1, 16]} />
        <meshBasicMaterial color="#ffedc2" transparent opacity={0.14} toneMapped={false} />
      </instancedMesh>
    </>
  );
};

const CAR_TARGET_LENGTH = 1.8;
const PARKED_CAR_KEYS = Object.keys(CITY_MODELS.cars) as (keyof typeof CITY_MODELS.cars)[];

interface ParkedCarSpec {
  pos: [number, number, number];
  yaw: number;
  modelKey: keyof typeof CITY_MODELS.cars;
  seed: number;
}

/**
 * Offset (mundo) do eixo da radial até o centro do carro estacionado no
 * meio-fio. A via tem meia-largura 1.5 — 1.05 deixa o carro DENTRO da faixa
 * de rodagem, encostado no meio-fio (estacionamento em fileira), em vez de
 * em cima da calçada (era 2.2, dentro da faixa [1.5,4.5] da calçada — fix
 * round Task 5, finding 3).
 */
const PARKED_CAR_CURB_OFFSET = 1.05;

/**
 * Posições determinísticas de carros estacionados: a maioria nos meios-fios
 * das radiais (entre os postes, offset ±1.05 do eixo — dentro da via, meia-
 * largura 1.5), e 2 (1 no mobile) "estacionados em paralelo" no anel
 * (rotação tangencial à curva).
 */
function generateParkedCarSpecs(isMobile: boolean): ParkedCarSpec[] {
  const total = isMobile ? 4 : 8;
  const ringCount = isMobile ? 1 : 2;
  const radialCount = total - ringCount;
  const rand = createSeededRandom(777);
  const specs: ParkedCarSpec[] = [];

  const perRadial = Math.ceil(radialCount / RADIAL_ANGLES.length);
  let placed = 0;
  RADIAL_ANGLES.forEach((angle, a) => {
    const qYaw = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle);
    for (let k = 0; k < perRadial && placed < radialCount; k++, placed++) {
      const z = Math.min(RADIAL_INNER + 6 + k * 9 + rand() * 2, RADIAL_OUTER - 3);
      const side = (a + k) % 2 === 0 ? 1 : -1;
      const p = new THREE.Vector3(side * PARKED_CAR_CURB_OFFSET, 0, z).applyQuaternion(qYaw);
      const jitter = (rand() - 0.5) * 0.25;
      specs.push({
        pos: [p.x, 0, p.z],
        yaw: angle + jitter,
        modelKey: PARKED_CAR_KEYS[placed % PARKED_CAR_KEYS.length],
        seed: placed * 13 + 3,
      });
    }
  });

  for (let i = 0; i < ringCount; i++) {
    const ringAngle = ((i + 0.5) / 8) * Math.PI * 2;
    const qRing = new THREE.Quaternion().setFromAxisAngle(Y_UP, ringAngle);
    const p = new THREE.Vector3(0, 0, RING_RADIUS + 1.6).applyQuaternion(qRing);
    const jitter = (rand() - 0.5) * 0.2;
    specs.push({
      pos: [p.x, 0, p.z],
      yaw: ringAngle + Math.PI / 2 + jitter,
      modelKey: PARKED_CAR_KEYS[(placed + i) % PARKED_CAR_KEYS.length],
      seed: (placed + i) * 13 + 3,
    });
  }

  return specs;
}

/** Um carro estacionado — clone do Car Kit, retintado, normalizado a ~1.8 de comprimento. */
const ParkedCar = ({ spec }: { spec: ParkedCarSpec }) => {
  const { scene } = useGLTF(CITY_MODELS.cars[spec.modelKey]);
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    applyNightMaterials(c, spec.seed);
    return c;
  }, [scene, spec.seed]);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone);
    const rawLength = Math.max(box.max.z - box.min.z, 0.001);
    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;
    const s = CAR_TARGET_LENGTH / rawLength;
    return { scale: s, offset: [-centerX, -box.min.y, -centerZ] as [number, number, number] };
  }, [clone]);

  return (
    <group position={spec.pos} rotation={[0, spec.yaw, 0]} raycast={() => null}>
      <group scale={scale} raycast={() => null}>
        <primitive object={clone} position={offset} raycast={() => null} />
      </group>
    </group>
  );
};

const ParkedCars = ({ isMobile }: { isMobile: boolean }) => {
  const specs = useMemo(() => generateParkedCarSpecs(isMobile), [isMobile]);
  return (
    <group raycast={() => null}>
      {specs.map((spec, i) => (
        <ParkedCar key={i} spec={spec} />
      ))}
    </group>
  );
};

/**
 * Offset fixo de orientação: os modelos do Car Kit têm o nariz no eixo local
 * +Z (rodas dianteiras em z>0, ver `wheel-front-*` no GLB — traseiras em
 * z<0), mas a fórmula de rotação abaixo (herdada do v1, quando o "carro" era
 * uma caixa emissiva com o comprimento em X, não em Z) calcula `rotation.y`
 * assumindo que o "nariz" é o eixo local +X. Rotacionar o corpo +90° em Y
 * realinha o nariz (+Z do modelo) com o +X que a fórmula espera — sem tocar
 * a fórmula (mesma lógica de rota/velocidade do v1) nem o cálculo do
 * ângulo/posição.
 */
const CAR_FRONT_OFFSET = Math.PI / 2;

/** Altura do topo da via (tiles têm 0.02 nativo × roadScale ~3 → topo em y≈0.06 — mesma referência usada pelas poças de luz dos postes). */
const ROAD_TOP_Y = 0.06;

/**
 * Corpo de um carro de tráfego: modelo do Car Kit retintado (night materials)
 * + faróis brancos na frente + lanternas vermelhas atrás. Compartilhado por
 * RingCar/RadialCar — só a posição/rotação do grupo pai (ref) muda a cada
 * frame; a orientação nariz/traseira aqui é fixa em relação ao corpo.
 */
const TrafficCarBody = ({ modelKey, seed }: { modelKey: keyof typeof CITY_MODELS.cars; seed: number }) => {
  const { scene } = useGLTF(CITY_MODELS.cars[modelKey]);
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    applyNightMaterials(c, seed);
    return c;
  }, [scene, seed]);

  const { scale, offset, halfLength, halfWidth, lightY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone);
    const rawLength = Math.max(box.max.z - box.min.z, 0.001);
    const rawWidth = Math.max(box.max.x - box.min.x, 0.001);
    const rawHeight = Math.max(box.max.y - box.min.y, 0.001);
    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;
    const s = CAR_TARGET_LENGTH / rawLength;
    return {
      scale: s,
      offset: [-centerX, -box.min.y, -centerZ] as [number, number, number],
      halfLength: CAR_TARGET_LENGTH / 2,
      halfWidth: (rawWidth / 2) * s,
      lightY: rawHeight * s * 0.35,
    };
  }, [clone]);

  return (
    <group rotation={[0, CAR_FRONT_OFFSET, 0]} raycast={() => null}>
      <group scale={scale} raycast={() => null}>
        <primitive object={clone} position={offset} raycast={() => null} />
      </group>
      {/* Faróis brancos — frente (nariz local +Z) */}
      {[-1, 1].map((side) => (
        <mesh key={`headlight-${side}`} position={[side * halfWidth * 0.6, lightY, halfLength - 0.06]} raycast={() => null}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#fff4d6" emissive="#fff4d6" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      ))}
      {/* Lanternas vermelhas — traseira (local -Z) */}
      {[-1, 1].map((side) => (
        <mesh key={`taillight-${side}`} position={[side * halfWidth * 0.6, lightY, -halfLength + 0.06]} raycast={() => null}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#ff5a5a" emissive="#ff5a5a" emissiveIntensity={1.3} />
        </mesh>
      ))}
    </group>
  );
};

/** Carro de tráfego circulando o anel viário. */
const RingCar = ({ speed, startAngle, reducedMotion, modelKey, seed }: {
  speed: number; startAngle: number; reducedMotion: boolean; modelKey: keyof typeof CITY_MODELS.cars; seed: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const angle = useRef(startAngle);
  const prevPos = useRef(new THREE.Vector3());

  const initial = useMemo(() => new THREE.Vector3(0, ROAD_TOP_Y, RING_RADIUS)
    .applyQuaternion(new THREE.Quaternion().setFromAxisAngle(Y_UP, startAngle)), [startAngle]);
  prevPos.current.copy(initial);

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group || reducedMotion) return;
    angle.current += delta * speed;
    const q = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle.current);
    const pos = new THREE.Vector3(0, ROAD_TOP_Y, RING_RADIUS).applyQuaternion(q);
    const dx = pos.x - prevPos.current.x;
    const dz = pos.z - prevPos.current.z;
    if (Math.abs(dx) > 1e-6 || Math.abs(dz) > 1e-6) {
      group.rotation.y = Math.atan2(-dz, dx);
    }
    group.position.copy(pos);
    prevPos.current.copy(pos);
  });

  return (
    <group ref={ref} position={initial.toArray()} raycast={() => null}>
      <TrafficCarBody modelKey={modelKey} seed={seed} />
    </group>
  );
};

/** Carro de tráfego fazendo vai-e-vem numa avenida radial. */
const RadialCar = ({ radialAngle, laneOffset, phaseSpeed, phaseOffset, reducedMotion, modelKey, seed }: {
  radialAngle: number; laneOffset: number; phaseSpeed: number; phaseOffset: number; reducedMotion: boolean;
  modelKey: keyof typeof CITY_MODELS.cars; seed: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const prevPos = useRef(new THREE.Vector3());
  const qYaw = useMemo(() => new THREE.Quaternion().setFromAxisAngle(Y_UP, radialAngle), [radialAngle]);

  const computePos = (t: number) => {
    const ease = (Math.sin(t) + 1) / 2;
    const r = 6 + ease * (40 - 6);
    return new THREE.Vector3(laneOffset, ROAD_TOP_Y, r).applyQuaternion(qYaw);
  };

  const initial = useMemo(() => computePos(phaseOffset), []); // eslint-disable-line react-hooks/exhaustive-deps
  prevPos.current.copy(initial);

  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group || reducedMotion) return;
    const pos = computePos(clock.elapsedTime * phaseSpeed + phaseOffset);
    const dx = pos.x - prevPos.current.x;
    const dz = pos.z - prevPos.current.z;
    if (Math.abs(dx) > 1e-6 || Math.abs(dz) > 1e-6) {
      group.rotation.y = Math.atan2(-dz, dx);
    }
    group.position.copy(pos);
    prevPos.current.copy(pos);
  });

  return (
    <group ref={ref} position={initial.toArray()} raycast={() => null}>
      <TrafficCarBody modelKey={modelKey} seed={seed} />
    </group>
  );
};

const Cars = ({ reducedMotion, isMobile }: { reducedMotion: boolean; isMobile: boolean }) => (
  <group raycast={() => null}>
    <RingCar speed={0.22} startAngle={0} reducedMotion={reducedMotion} modelKey="sedan" seed={821} />
    <RingCar speed={-0.3} startAngle={Math.PI} reducedMotion={reducedMotion} modelKey="hatchback" seed={822} />
    {!isMobile && (
      <>
        <RadialCar radialAngle={Math.PI} laneOffset={0.8} phaseSpeed={0.3} phaseOffset={0} reducedMotion={reducedMotion} modelKey="hatchback" seed={823} />
        <RadialCar radialAngle={Math.PI / 2} laneOffset={-0.8} phaseSpeed={0.22} phaseOffset={1.4} reducedMotion={reducedMotion} modelKey="sedan" seed={824} />
      </>
    )}
  </group>
);

// 'contact' fica de fora: o beacon próprio (ContactAntenna, em CityBuildings)
// já ocupa o topo desse prédio — duplicar aqui causaria z-fighting.
const ROOF_IDS: PlaceId[] = ['metrifica', 'prontiva', 'exp-twiniti', 'delpupo'];

/** Mastro-antena com luz vermelha piscante + caixa de AC num telhado. */
const RoofDetail = ({ id, index, reducedMotion }: { id: PlaceId; index: number; reducedMotion: boolean }) => {
  const light = useRef<THREE.Mesh>(null);
  const place = PLACES.find((p) => p.id === id);

  useFrame(({ clock }) => {
    if (reducedMotion || !light.current) return;
    const mat = light.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = Math.sin(clock.elapsedTime * 5 + index) > 0 ? 1.8 : 0.2;
  });

  if (!place) return null;
  const [w, h, d] = place.size;

  return (
    <group position={[place.position[0], 0, place.position[2]]} raycast={() => null}>
      {/* Mastro */}
      <mesh position={[0, h + 0.65, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.03, 0.03, 1.3]} />
        <meshStandardMaterial color="#1a2226" />
      </mesh>
      {/* Luz vermelha piscante */}
      <mesh ref={light} position={[0, h + 1.3, 0]} raycast={() => null}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#e05d5d" emissive="#e05d5d" emissiveIntensity={1.2} />
      </mesh>
      {/* Caixa de AC (offset determinístico por telhado) */}
      <mesh position={[w * 0.25, h + 0.15, -d * 0.2]} raycast={() => null}>
        <boxGeometry args={[0.45, 0.3, 0.45]} />
        <meshStandardMaterial color="#10171a" />
      </mesh>
    </group>
  );
};

const Rooftops = ({ reducedMotion }: { reducedMotion: boolean }) => (
  <group raycast={() => null}>
    {ROOF_IDS.map((id, i) => (
      <RoofDetail key={id} id={id} index={i} reducedMotion={reducedMotion} />
    ))}
  </group>
);

const CityStreets = ({ reducedMotion, isMobile }: { reducedMotion: boolean; isMobile: boolean }) => (
  <group raycast={() => null}>
    <RoadTiles />
    <StreetLamps isMobile={isMobile} />
    <ParkedCars isMobile={isMobile} />
    <Cars reducedMotion={reducedMotion} isMobile={isMobile} />
    <Rooftops reducedMotion={reducedMotion} />
  </group>
);

export default CityStreets;
