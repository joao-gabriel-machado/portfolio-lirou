import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Floating geometric shapes scene. Full intensity over the hero viewport,
 * fading to a subtle ambient layer as the user scrolls past it. Loaded
 * lazily by FloatingShapesLayer — never import this file statically.
 */

// Design tokens (src/index.css): --primary 178 70% 41%, --accent 175 65% 45%.
const PRIMARY = '#1fb2aa';
const ACCENT = '#2cbdb4';
const BACKGROUND = '#050607';

interface ShapeDef {
  kind: 'icosahedron' | 'octahedron' | 'torus';
  wire: boolean;
  position: [number, number, number];
  scale: number;
  rotSpeed: [number, number];
  floatAmp: number;
  floatSpeed: number;
  phase: number;
  /** Kept when rendering the reduced mobile set. */
  mobile?: boolean;
}

const SHAPES: ShapeDef[] = [
  { kind: 'icosahedron', wire: true, position: [-4.6, 1.6, -3.5], scale: 1.5, rotSpeed: [0.12, 0.18], floatAmp: 0.45, floatSpeed: 0.5, phase: 0.0, mobile: true },
  { kind: 'torus', wire: false, position: [4.4, -1.2, -3], scale: 1.05, rotSpeed: [0.2, 0.1], floatAmp: 0.4, floatSpeed: 0.42, phase: 1.4, mobile: true },
  { kind: 'octahedron', wire: false, position: [3.6, 2.3, -5], scale: 1.15, rotSpeed: [0.16, 0.22], floatAmp: 0.5, floatSpeed: 0.36, phase: 2.8, mobile: true },
  { kind: 'icosahedron', wire: false, position: [-3.4, -2.2, -4.5], scale: 0.95, rotSpeed: [0.1, 0.14], floatAmp: 0.35, floatSpeed: 0.55, phase: 4.1, mobile: true },
  { kind: 'octahedron', wire: true, position: [1.2, -2.8, -2.5], scale: 0.6, rotSpeed: [0.24, 0.12], floatAmp: 0.3, floatSpeed: 0.6, phase: 5.3, mobile: true },
  { kind: 'torus', wire: true, position: [-1.8, 2.9, -6], scale: 0.85, rotSpeed: [0.14, 0.2], floatAmp: 0.55, floatSpeed: 0.33, phase: 0.7 },
  { kind: 'octahedron', wire: false, position: [-5.6, -0.4, -7], scale: 1.35, rotSpeed: [0.08, 0.12], floatAmp: 0.6, floatSpeed: 0.28, phase: 1.9 },
  { kind: 'icosahedron', wire: true, position: [5.8, 0.9, -7.5], scale: 1.7, rotSpeed: [0.1, 0.08], floatAmp: 0.65, floatSpeed: 0.25, phase: 3.5 },
  { kind: 'torus', wire: false, position: [0.4, 3.4, -8], scale: 1.2, rotSpeed: [0.12, 0.16], floatAmp: 0.5, floatSpeed: 0.3, phase: 4.8 },
  { kind: 'octahedron', wire: true, position: [-0.9, -3.6, -6.5], scale: 0.75, rotSpeed: [0.2, 0.24], floatAmp: 0.4, floatSpeed: 0.48, phase: 2.2 },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface SceneProps {
  reducedMotion: boolean;
  isMobile: boolean;
}

const ShapesScene = ({ reducedMotion, isMobile }: SceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const shapes = useMemo(
    () => (isMobile ? SHAPES.filter((s) => s.mobile) : SHAPES),
    [isMobile],
  );

  const geometries = useMemo(
    () => ({
      icosahedron: new THREE.IcosahedronGeometry(1, 0),
      octahedron: new THREE.OctahedronGeometry(1, 0),
      torus: new THREE.TorusGeometry(0.7, 0.26, 12, 40),
    }),
    [],
  );

  // Two shared materials keep every mesh in the same two draw-call batches
  // and let the scroll fade touch just two opacity values per frame.
  const materials = useMemo(
    () => ({
      wire: new THREE.MeshBasicMaterial({
        color: PRIMARY,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      }),
      solid: new THREE.MeshStandardMaterial({
        color: '#10171a',
        metalness: 0.85,
        roughness: 0.25,
        emissive: ACCENT,
        emissiveIntensity: 0.06,
        transparent: true,
        opacity: 0.92,
      }),
    }),
    [],
  );

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.getElapsedTime();

    // 1 over the hero viewport → 0 after scrolling past it; eased by lerp.
    const vh = Math.max(1, window.innerHeight);
    const fade = clamp01(1 - window.scrollY / (vh * 0.9));
    const intensity = 0.22 + 0.78 * fade; // ambient floor after the hero

    materials.wire.opacity = 0.12 + 0.43 * fade;
    materials.solid.opacity = 0.35 + 0.57 * fade;

    group.children.forEach((child, i) => {
      const def = shapes[i];
      if (!def) return;
      child.rotation.x += def.rotSpeed[0] * delta * intensity;
      child.rotation.y += def.rotSpeed[1] * delta * intensity;
      child.position.y =
        def.position[1] + Math.sin(t * def.floatSpeed + def.phase) * def.floatAmp * intensity;
    });

    // Camera parallax: damped follow of the pointer (scroll drift on mobile).
    const targetX = isMobile ? 0 : state.pointer.x * 0.9 * fade;
    const targetY = isMobile
      ? window.scrollY * -0.0006
      : state.pointer.y * 0.55 * fade;
    const damp = Math.min(1, delta * 2.5);
    state.camera.position.x += (targetX - state.camera.position.x) * damp;
    state.camera.position.y += (targetY - state.camera.position.y) * damp;
    state.camera.lookAt(0, 0, -4);
  });

  return (
    <>
      <fog attach="fog" args={[BACKGROUND, 7, 16]} />
      <hemisphereLight args={[PRIMARY, '#000000', 0.5]} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} color="#bfeeea" />
      <pointLight position={[-5, -3, 2]} intensity={22} color={PRIMARY} />

      <group ref={groupRef}>
        {shapes.map((def, i) => (
          <mesh
            key={i}
            geometry={geometries[def.kind]}
            material={def.wire ? materials.wire : materials.solid}
            position={def.position}
            scale={def.scale}
            rotation={[def.phase, def.phase * 0.7, 0]}
          />
        ))}
      </group>
    </>
  );
};

const FloatingShapesCanvas = ({ reducedMotion, isMobile }: SceneProps) => (
  <Canvas
    camera={{ position: [0, 0, 9], fov: 45 }}
    dpr={[1, isMobile ? 1.5 : 2]}
    frameloop={reducedMotion ? 'demand' : 'always'}
    gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
  >
    <ShapesScene reducedMotion={reducedMotion} isMobile={isMobile} />
  </Canvas>
);

export default FloatingShapesCanvas;
