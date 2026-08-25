// src/components/city/CameraRig.tsx
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { HOME_FRAME, PLACES, type PlaceId } from './places';

interface Props {
  activePlace: PlaceId | null;
  reducedMotion: boolean;
}

const IDLE_MS = 10_000;

/** Órbita limitada + voo suave até o enquadramento do lugar ativo. */
const CameraRig = ({ activePlace, reducedMotion }: Props) => {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...HOME_FRAME.position));
  const targetLook = useRef(new THREE.Vector3(...HOME_FRAME.target));
  const flying = useRef(false);
  const lastInput = useRef(Date.now());

  useEffect(() => {
    const frame = activePlace
      ? PLACES.find((p) => p.id === activePlace)!.cameraFrame
      : HOME_FRAME;
    targetPos.current.set(...frame.position);
    targetLook.current.set(...frame.target);
    flying.current = true;
  }, [activePlace]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;
    if (flying.current) {
      const k = Math.min(1, delta * 2.2);
      camera.position.lerp(targetPos.current, k);
      c.target.lerp(targetLook.current, k);
      if (camera.position.distanceTo(targetPos.current) < 0.05) flying.current = false;
    }
    // Auto-rotação lenta quando ocioso, sem lugar aberto.
    c.autoRotate = !reducedMotion && !activePlace &&
      Date.now() - lastInput.current > IDLE_MS;
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.08}
      autoRotateSpeed={0.5}
      minDistance={10}
      maxDistance={55}
      maxPolarAngle={Math.PI * 0.44}   // nunca por baixo do chão
      target={HOME_FRAME.target}
      onStart={() => { lastInput.current = Date.now(); flying.current = false; }}
      onEnd={() => { lastInput.current = Date.now(); }}
    />
  );
};

export default CameraRig;
