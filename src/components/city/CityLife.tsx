// src/components/city/CityLife.tsx
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { AVATAR_WAYPOINTS, CITY_COLORS, TRAIN_RADIUS } from './places';

const SKIN = '#c98e63';
const RUN_SPEED = 2.2; // unidades/s

/** Avatar low-poly do João: touca preta, óculos, roupa escura, detalhe cyan. */
const Avatar = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const limbs = useRef<{ la?: THREE.Mesh; ra?: THREE.Mesh; ll?: THREE.Mesh; rl?: THREE.Mesh }>({});
  const state = useRef({ wp: 0, waitUntil: 0 });
  const [waving, setWaving] = useState(false);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    if (reducedMotion) {
      g.position.set(...AVATAR_WAYPOINTS[0].position);
      return;
    }
    const s = state.current;
    const target = new THREE.Vector3(...AVATAR_WAYPOINTS[s.wp].position);
    const pos = g.position;
    const dist = pos.distanceTo(target);
    const paused = t < s.waitUntil;

    if (dist < 0.15 && !paused) {
      s.waitUntil = t + AVATAR_WAYPOINTS[s.wp].pause;
      s.wp = (s.wp + 1) % AVATAR_WAYPOINTS.length;
    } else if (!paused) {
      const dir = target.clone().sub(pos).normalize();
      pos.addScaledVector(dir, RUN_SPEED * delta);
      const yaw = Math.atan2(dir.x, dir.z);
      g.rotation.y += (yaw - g.rotation.y) * Math.min(1, delta * 8);
      // Ciclo de corrida: balanço de braços/pernas + bob
      const swing = Math.sin(t * 10) * 0.7;
      if (limbs.current.la) limbs.current.la.rotation.x = swing;
      if (limbs.current.ra) limbs.current.ra.rotation.x = -swing;
      if (limbs.current.ll) limbs.current.ll.rotation.x = -swing;
      if (limbs.current.rl) limbs.current.rl.rotation.x = swing;
      g.position.y = Math.abs(Math.sin(t * 10)) * 0.06;
    } else {
      // Parado "olhando vitrine": membros neutros, leve respiração
      [limbs.current.la, limbs.current.ra, limbs.current.ll, limbs.current.rl]
        .forEach((m) => { if (m) m.rotation.x *= 0.9; });
      g.position.y = Math.sin(t * 2) * 0.01;
    }
    if (waving && limbs.current.ra) limbs.current.ra.rotation.x = Math.PI + Math.sin(t * 12) * 0.4;
  });

  return (
    <group ref={group} position={AVATAR_WAYPOINTS[0].position} scale={0.55}
      onClick={(e) => { e.stopPropagation(); setWaving(true); setTimeout(() => setWaving(false), 1600); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}>
      {/* pernas */}
      <mesh ref={(m) => { limbs.current.ll = m!; }} position={[-0.12, 0.35, 0]}>
        <boxGeometry args={[0.16, 0.7, 0.16]} />
        <meshStandardMaterial color="#12181b" />
      </mesh>
      <mesh ref={(m) => { limbs.current.rl = m!; }} position={[0.12, 0.35, 0]}>
        <boxGeometry args={[0.16, 0.7, 0.16]} />
        <meshStandardMaterial color="#12181b" />
      </mesh>
      {/* corpo (moletom escuro com faixa cyan) */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshStandardMaterial color="#171f23" />
      </mesh>
      <mesh position={[0, 0.78, 0.16]}>
        <boxGeometry args={[0.5, 0.06, 0.02]} />
        <meshStandardMaterial color={CITY_COLORS.primary} emissive={CITY_COLORS.primary} emissiveIntensity={0.8} />
      </mesh>
      {/* braços */}
      <mesh ref={(m) => { limbs.current.la = m!; }} position={[-0.33, 0.95, 0]}>
        <boxGeometry args={[0.14, 0.55, 0.14]} />
        <meshStandardMaterial color="#171f23" />
      </mesh>
      <mesh ref={(m) => { limbs.current.ra = m!; }} position={[0.33, 0.95, 0]}>
        <boxGeometry args={[0.14, 0.55, 0.14]} />
        <meshStandardMaterial color="#171f23" />
      </mesh>
      {/* cabeça */}
      <mesh position={[0, 1.45, 0]}>
        <boxGeometry args={[0.34, 0.32, 0.32]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      {/* touca preta */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[0.38, 0.14, 0.36]} />
        <meshStandardMaterial color="#0a0a0c" />
      </mesh>
      {/* óculos: duas lentes + ponte */}
      <mesh position={[-0.08, 1.47, 0.17]}>
        <boxGeometry args={[0.11, 0.08, 0.02]} />
        <meshStandardMaterial color="#0a0a0c" />
      </mesh>
      <mesh position={[0.08, 1.47, 0.17]}>
        <boxGeometry args={[0.11, 0.08, 0.02]} />
        <meshStandardMaterial color="#0a0a0c" />
      </mesh>
      <mesh position={[0, 1.47, 0.17]}>
        <boxGeometry args={[0.06, 0.02, 0.02]} />
        <meshStandardMaterial color="#0a0a0c" />
      </mesh>
    </group>
  );
};

/** Trem de luz circulando a cidade. */
const LightTrain = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reducedMotion ? 0 : clock.elapsedTime * 0.15;
    ref.current.position.set(Math.cos(t) * TRAIN_RADIUS, 0.35, Math.sin(t) * TRAIN_RADIUS);
    ref.current.rotation.y = -t + Math.PI / 2;
  });
  return (
    <mesh ref={ref} raycast={() => null}>
      <boxGeometry args={[3.2, 0.4, 0.5]} />
      <meshStandardMaterial color={CITY_COLORS.primary} emissive={CITY_COLORS.primary} emissiveIntensity={1.6} />
    </mesh>
  );
};

/** Mini-formas do hero flutuando sobre a cidade. */
const SkyShapes = ({ reducedMotion, isMobile }: { reducedMotion: boolean; isMobile: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const defs = useMemo(() => [
    { pos: [10, 18, -8] as const, kind: 'ico' as const, scale: 1.4 },
    { pos: [-14, 21, 6] as const, kind: 'oct' as const, scale: 1.1 },
    { pos: [2, 24, 14] as const, kind: 'ico' as const, scale: 0.9 },
    { pos: [-4, 19, -16] as const, kind: 'oct' as const, scale: 1.2 },
  ].slice(0, isMobile ? 2 : 4), [isMobile]);
  useFrame(({ clock }, delta) => {
    if (reducedMotion || !group.current) return;
    group.current.children.forEach((c, i) => {
      c.rotation.x += delta * 0.15;
      c.rotation.y += delta * 0.2;
      c.position.y = defs[i].pos[1] + Math.sin(clock.elapsedTime * 0.4 + i * 2) * 0.6;
    });
  });
  return (
    <group ref={group} raycast={() => null}>
      {defs.map((d, i) => (
        <mesh key={i} position={[d.pos[0], d.pos[1], d.pos[2]]} scale={d.scale} raycast={() => null}>
          {d.kind === 'ico' ? <icosahedronGeometry args={[1, 0]} /> : <octahedronGeometry args={[1, 0]} />}
          <meshBasicMaterial color={CITY_COLORS.primary} wireframe transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
};

/** Easter eggs estáticos: gato, outdoor com piada, placa 404, fumaça do café. */
const EasterEggs = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const smoke = useRef<THREE.Group>(null);
  const cat = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (smoke.current) {
      smoke.current.children.forEach((p, i) => {
        p.position.y = 0.4 + ((t * 0.4 + i * 0.5) % 1.6);
        (p as THREE.Mesh).scale.setScalar(0.1 + ((t * 0.4 + i * 0.5) % 1.6) * 0.2);
      });
    }
    if (cat.current) cat.current.rotation.y = Math.sin(t * 0.5) * 0.4; // gato "olhando"
  });
  return (
    <group raycast={() => null}>
      {/* Gato no telhado da Samara (-8, 5, -7) */}
      <group ref={cat} position={[-8, 5.1, -7]} scale={0.3} raycast={() => null}>
        <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.6, 0.4, 1]} /><meshStandardMaterial color="#0a0a0c" /></mesh>
        <mesh position={[0, 0.55, 0.45]}><boxGeometry args={[0.4, 0.35, 0.35]} /><meshStandardMaterial color="#0a0a0c" /></mesh>
        <mesh position={[-0.12, 0.8, 0.45]}><coneGeometry args={[0.08, 0.15, 4]} /><meshStandardMaterial color="#0a0a0c" /></mesh>
        <mesh position={[0.12, 0.8, 0.45]}><coneGeometry args={[0.08, 0.15, 4]} /><meshStandardMaterial color="#0a0a0c" /></mesh>
      </group>
      {/* Outdoor com piada dev em (-14, 0, 14) */}
      <group position={[-14, 0, 14]} rotation={[0, Math.PI / 3, 0]}>
        <mesh position={[0, 2, 0]}><boxGeometry args={[4.4, 2.2, 0.15]} /><meshStandardMaterial color="#0c1114" /></mesh>
        <Text position={[0, 2, 0.12]} fontSize={0.34} color={CITY_COLORS.accent} anchorX="center" anchorY="middle" maxWidth={4}>
          {'// TODO: dormir\n// FIXME: café acabou'}
        </Text>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.08, 0.08, 1]} /><meshStandardMaterial color="#1a2226" /></mesh>
      </group>
      {/* Placa 404 num beco em (16, 0, 14) */}
      <group position={[16, 0, 14]} rotation={[0, -Math.PI / 5, 0]}>
        <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.05, 0.05, 2.2]} /><meshStandardMaterial color="#1a2226" /></mesh>
        <mesh position={[0, 2, 0]}><boxGeometry args={[1.6, 0.7, 0.08]} /><meshStandardMaterial color="#0c1114" /></mesh>
        <Text position={[0, 2, 0.06]} fontSize={0.3} color="#e05d5d" anchorX="center" anchorY="middle">
          404 · RUA NÃO ENCONTRADA
        </Text>
      </group>
      {/* Fumaça da cafeteria (3, 2.5, -9) */}
      <group ref={smoke} position={[3, 2.5, -9]} raycast={() => null}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} raycast={() => null}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#9aa0a6" transparent opacity={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const CityLife = ({ reducedMotion, isMobile }: { reducedMotion: boolean; isMobile: boolean }) => (
  <group>
    <Avatar reducedMotion={reducedMotion} />
    <LightTrain reducedMotion={reducedMotion} />
    <SkyShapes reducedMotion={reducedMotion} isMobile={isMobile} />
    <EasterEggs reducedMotion={reducedMotion} />
  </group>
);

export default CityLife;
