// src/components/city/CityStreets.tsx
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkeletonUtils, mergeBufferGeometries } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import { CITY_COLORS, PLACES, type PlaceId } from './places';
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

interface TileTransform { pos: [number, number, number]; rotY: number; }

/**
 * Malha viária a partir dos tiles do Roads Kit: retas instanciadas nas 4
 * radiais + anel (polígono de 16 lados aproximando r=27), calçadas
 * flanqueando as radiais, e os singletons (cruzamento central + 4
 * interseções radial×anel) como clones diretos.
 */
const RoadTiles = () => {
  const { scene: straightScene } = useGLTF(CITY_MODELS.roads.straight);
  const { scene: sidewalkScene } = useGLTF(CITY_MODELS.roads.sidewalkStraight);

  const { geometry: roadGeo, material: roadMat, scale: roadScale, tileStep } = useMemo(() => {
    const { geometry, material } = extractSingleMesh(straightScene, 501);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const nativeWidth = Math.max(box.max.x - box.min.x, 0.001);
    const nativeDepth = Math.max(box.max.z - box.min.z, 0.001);
    const scale = ROAD_TILE_WIDTH / nativeWidth;
    return { geometry, material, scale, tileStep: nativeDepth * scale };
  }, [straightScene]);

  const { geometry: sidewalkGeo, material: sidewalkMat, halfWidth: sidewalkHalfWidth } = useMemo(() => {
    const { geometry, material } = extractSingleMesh(sidewalkScene, 502);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const nativeWidth = Math.max(box.max.x - box.min.x, 0.001);
    return { geometry, material, halfWidth: (nativeWidth * roadScale) / 2 };
  }, [sidewalkScene, roadScale]);

  const roadTransforms = useMemo(() => {
    const out: TileTransform[] = [];
    // Retas ao longo das 4 radiais (deixa vão perto do anel pro tile de interseção).
    RADIAL_ANGLES.forEach((angle) => {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle);
      for (let z = RADIAL_INNER + tileStep / 2; z < RADIAL_OUTER; z += tileStep) {
        if (Math.abs(z - RING_RADIUS) < tileStep * 0.6) continue;
        const p = new THREE.Vector3(0, 0, z).applyQuaternion(qYaw);
        out.push({ pos: [p.x, 0, p.z], rotY: angle });
      }
    });
    // Anel aproximado por polígono regular de 16 lados (pula os 4 pontos que
    // coincidem com as radiais — esses levam o tile de interseção).
    const skipEvery = RING_SEGMENTS / RADIAL_ANGLES.length;
    for (let i = 0; i < RING_SEGMENTS; i++) {
      if (i % skipEvery === 0) continue;
      const segAngle = (i / RING_SEGMENTS) * Math.PI * 2;
      const p = new THREE.Vector3(0, 0, RING_RADIUS)
        .applyQuaternion(new THREE.Quaternion().setFromAxisAngle(Y_UP, segAngle));
      out.push({ pos: [p.x, 0, p.z], rotY: segAngle + Math.PI / 2 });
    }
    return out;
  }, [tileStep]);

  const sidewalkTransforms = useMemo(() => {
    const out: TileTransform[] = [];
    const axisOffset = ROAD_TILE_WIDTH / 2 + sidewalkHalfWidth;
    RADIAL_ANGLES.forEach((angle) => {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle);
      for (let z = RADIAL_INNER + tileStep / 2; z < RADIAL_OUTER; z += tileStep) {
        [-1, 1].forEach((side) => {
          const p = new THREE.Vector3(side * axisOffset, 0, z).applyQuaternion(qYaw);
          out.push({ pos: [p.x, 0, p.z], rotY: angle });
        });
      }
    });
    return out;
  }, [tileStep, sidewalkHalfWidth]);

  return (
    <group raycast={() => null}>
      <Instances geometry={roadGeo} material={roadMat} limit={Math.max(roadTransforms.length, 1)} raycast={() => null}>
        {roadTransforms.map((t, i) => (
          <Instance key={i} position={t.pos} rotation={[0, t.rotY, 0]} scale={roadScale} />
        ))}
      </Instances>
      <Instances geometry={sidewalkGeo} material={sidewalkMat} limit={Math.max(sidewalkTransforms.length, 1)} raycast={() => null}>
        {sidewalkTransforms.map((t, i) => (
          <Instance key={i} position={t.pos} rotation={[0, t.rotY, 0]} scale={roadScale} />
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
      m.compose(new THREE.Vector3(p.x, 0.02, p.z), FLAT_QUAT, UNIT_SCALE);
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
 * Posições determinísticas de carros estacionados: a maioria nos meios-fios
 * das radiais (entre os postes, offset ±2.2 do eixo), e 2 (1 no mobile)
 * "estacionados em paralelo" no anel (rotação tangencial à curva).
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
      const p = new THREE.Vector3(side * 2.2, 0, z).applyQuaternion(qYaw);
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

/** Carro de luz circulando o anel viário. */
const RingCar = ({ speed, startAngle, reducedMotion }: { speed: number; startAngle: number; reducedMotion: boolean }) => {
  const ref = useRef<THREE.Mesh>(null);
  const angle = useRef(startAngle);
  const prevPos = useRef(new THREE.Vector3());

  const initial = useMemo(() => new THREE.Vector3(0, 0.2, RING_RADIUS)
    .applyQuaternion(new THREE.Quaternion().setFromAxisAngle(Y_UP, startAngle)), [startAngle]);
  prevPos.current.copy(initial);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh || reducedMotion) return;
    angle.current += delta * speed;
    const q = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle.current);
    const pos = new THREE.Vector3(0, 0.2, RING_RADIUS).applyQuaternion(q);
    const dx = pos.x - prevPos.current.x;
    const dz = pos.z - prevPos.current.z;
    if (Math.abs(dx) > 1e-6 || Math.abs(dz) > 1e-6) {
      mesh.rotation.y = Math.atan2(-dz, dx);
    }
    mesh.position.copy(pos);
    prevPos.current.copy(pos);
  });

  return (
    <mesh ref={ref} position={initial.toArray()} raycast={() => null}>
      <boxGeometry args={[0.5, 0.15, 0.28]} />
      <meshStandardMaterial color={CITY_COLORS.primary} emissive={CITY_COLORS.primary} emissiveIntensity={1.4} />
    </mesh>
  );
};

/** Carro de luz fazendo vai-e-vem numa avenida radial. */
const RadialCar = ({ radialAngle, laneOffset, phaseSpeed, phaseOffset, reducedMotion }: {
  radialAngle: number; laneOffset: number; phaseSpeed: number; phaseOffset: number; reducedMotion: boolean;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const prevPos = useRef(new THREE.Vector3());
  const qYaw = useMemo(() => new THREE.Quaternion().setFromAxisAngle(Y_UP, radialAngle), [radialAngle]);

  const computePos = (t: number) => {
    const ease = (Math.sin(t) + 1) / 2;
    const r = 6 + ease * (40 - 6);
    return new THREE.Vector3(laneOffset, 0.2, r).applyQuaternion(qYaw);
  };

  const initial = useMemo(() => computePos(phaseOffset), []); // eslint-disable-line react-hooks/exhaustive-deps
  prevPos.current.copy(initial);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh || reducedMotion) return;
    const pos = computePos(clock.elapsedTime * phaseSpeed + phaseOffset);
    const dx = pos.x - prevPos.current.x;
    const dz = pos.z - prevPos.current.z;
    if (Math.abs(dx) > 1e-6 || Math.abs(dz) > 1e-6) {
      mesh.rotation.y = Math.atan2(-dz, dx);
    }
    mesh.position.copy(pos);
    prevPos.current.copy(pos);
  });

  return (
    <mesh ref={ref} position={initial.toArray()} raycast={() => null}>
      <boxGeometry args={[0.5, 0.15, 0.28]} />
      <meshStandardMaterial color={CITY_COLORS.primary} emissive={CITY_COLORS.primary} emissiveIntensity={1.4} />
    </mesh>
  );
};

const Cars = ({ reducedMotion, isMobile }: { reducedMotion: boolean; isMobile: boolean }) => (
  <group raycast={() => null}>
    <RingCar speed={0.22} startAngle={0} reducedMotion={reducedMotion} />
    <RingCar speed={-0.3} startAngle={Math.PI} reducedMotion={reducedMotion} />
    {!isMobile && (
      <>
        <RadialCar radialAngle={Math.PI} laneOffset={0.8} phaseSpeed={0.3} phaseOffset={0} reducedMotion={reducedMotion} />
        <RadialCar radialAngle={Math.PI / 2} laneOffset={-0.8} phaseSpeed={0.22} phaseOffset={1.4} reducedMotion={reducedMotion} />
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
