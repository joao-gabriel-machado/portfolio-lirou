// src/components/city/CityStreets.tsx
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CITY_COLORS, PLACES, type PlaceId } from './places';

const Y_UP = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);
/** Rotação que deita um plano vertical (XY) no plano do chão (XZ). */
const FLAT_QUAT = new THREE.Quaternion().setFromAxisAngle(X_AXIS, -Math.PI / 2);

/** Ângulos das 4 avenidas radiais (norte, sul, leste, oeste). */
const RADIAL_ANGLES = [Math.PI, 0, Math.PI / 2, -Math.PI / 2] as const;

const RADIAL_INNER = 2;
const RADIAL_OUTER = 42;
const RADIAL_LEN = RADIAL_OUTER - RADIAL_INNER;
const RADIAL_MID = (RADIAL_INNER + RADIAL_OUTER) / 2;
const RING_RADIUS = 27;

/** Avenida radial + meio-fio (par de faixas em cada borda). */
const RadialAvenue = ({ angle }: { angle: number }) => (
  <group rotation={[0, angle, 0]} raycast={() => null}>
    <mesh position={[0, 0.015, RADIAL_MID]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <planeGeometry args={[3, RADIAL_LEN]} />
      <meshStandardMaterial color="#0a0d0f" roughness={0.75} metalness={0.15} />
    </mesh>
    {[-1, 1].map((side) => (
      <mesh key={side} position={[side * 1.625, 0.016, RADIAL_MID]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[0.25, RADIAL_LEN]} />
        <meshStandardMaterial color="#131a1d" roughness={0.6} metalness={0.2} />
      </mesh>
    ))}
  </group>
);

/** Anel viário em r=27 (anel plano). */
const RingRoad = () => (
  <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
    <ringGeometry args={[25.5, 28.5, 64]} />
    <meshStandardMaterial color="#0a0d0f" roughness={0.75} metalness={0.15} />
  </mesh>
);

/** Traços centrais tracejados nas 4 radiais (InstancedMesh único). */
const DashedLines = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const transforms = useMemo(() => {
    const out: { pos: THREE.Vector3; quat: THREE.Quaternion }[] = [];
    RADIAL_ANGLES.forEach((angle) => {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(Y_UP, angle);
      const quat = qYaw.clone().multiply(FLAT_QUAT);
      for (let z = RADIAL_INNER + 0.5; z <= RADIAL_OUTER - 0.5; z += 2.2) {
        const pos = new THREE.Vector3(0, 0.017, z).applyQuaternion(qYaw);
        out.push({ pos, quat });
      }
    });
    return out;
  }, []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || mesh.userData.done) return;
    const m = new THREE.Matrix4();
    transforms.forEach((tr, i) => {
      m.compose(tr.pos, tr.quat, UNIT_SCALE);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.done = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, transforms.length]} raycast={() => null}>
      <planeGeometry args={[0.12, 0.8]} />
      <meshStandardMaterial color="#0a3a37" emissive={CITY_COLORS.primary} emissiveIntensity={0.6} />
    </instancedMesh>
  );
};

/** Postes (hastes + lâmpadas) ao longo das radiais e do anel. */
const StreetLamps = ({ isMobile }: { isMobile: boolean }) => {
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const bulbRef = useRef<THREE.InstancedMesh>(null);

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
    if (!poles || !bulbs || poles.userData.done) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    positions.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, 1.1, p.z), q, UNIT_SCALE);
      poles.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(p.x, 2.2, p.z), q, UNIT_SCALE);
      bulbs.setMatrixAt(i, m);
    });
    poles.instanceMatrix.needsUpdate = true;
    bulbs.instanceMatrix.needsUpdate = true;
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
    </>
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
    const r = RADIAL_INNER + 4 + ease * (RADIAL_OUTER - 6 - (RADIAL_INNER + 4));
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
    <RingCar speed={0.12} startAngle={0} reducedMotion={reducedMotion} />
    <RingCar speed={-0.18} startAngle={Math.PI} reducedMotion={reducedMotion} />
    {!isMobile && (
      <>
        <RadialCar radialAngle={Math.PI} laneOffset={0.8} phaseSpeed={0.3} phaseOffset={0} reducedMotion={reducedMotion} />
        <RadialCar radialAngle={Math.PI / 2} laneOffset={-0.8} phaseSpeed={0.22} phaseOffset={1.4} reducedMotion={reducedMotion} />
      </>
    )}
  </group>
);

const ROOF_IDS: PlaceId[] = ['metrifica', 'prontiva', 'contact', 'exp-twiniti', 'delpupo'];

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
    <RingRoad />
    {RADIAL_ANGLES.map((angle, i) => (
      <RadialAvenue key={i} angle={angle} />
    ))}
    <DashedLines />
    <StreetLamps isMobile={isMobile} />
    <Cars reducedMotion={reducedMotion} isMobile={isMobile} />
    <Rooftops reducedMotion={reducedMotion} />
  </group>
);

export default CityStreets;
