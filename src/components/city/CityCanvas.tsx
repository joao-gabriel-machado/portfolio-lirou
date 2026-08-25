// src/components/city/CityCanvas.tsx
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import CameraRig from './CameraRig';
import CityBuildings from './CityBuildings';
import { CITY_COLORS, HOME_FRAME, type PlaceId } from './places';

export interface CityCanvasProps {
  activePlace: PlaceId | null;
  onSelect: (id: PlaceId | null) => void;
  onHover: (id: PlaceId | null) => void;
  hoveredId: PlaceId | null;
  labels: Record<string, string>;
  reducedMotion: boolean;
  isMobile: boolean;
  /** Chamado no primeiro frame renderizado (sinal de que a cena está pronta). */
  onReady?: () => void;
}

/** Sinaliza no primeiro tick de useFrame — primeiro frame real renderizado. */
const ReadySignal = ({ onReady }: { onReady?: () => void }) => {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) { fired.current = true; onReady?.(); }
  });
  return null;
};

const CityCanvas = ({ activePlace, onSelect, onHover, hoveredId, labels, reducedMotion, isMobile, onReady }: CityCanvasProps) => {
  return (
  <Canvas
    camera={{ position: HOME_FRAME.position, fov: 45 }}
    dpr={[1, isMobile ? 1.5 : 2]}
    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    onPointerMissed={() => onSelect(null)}
  >
    <color attach="background" args={[CITY_COLORS.background]} />
    <fog attach="fog" args={[CITY_COLORS.background, 45, 90]} />
    <hemisphereLight args={[CITY_COLORS.primary, '#000000', 0.35]} />
    <directionalLight position={[20, 30, 10]} intensity={0.9} color="#9fd8d4" />
    <pointLight position={[0, 12, 0]} intensity={60} color={CITY_COLORS.primary} />

    <CityBuildings
      onSelect={onSelect}
      onHover={onHover}
      hoveredId={hoveredId}
      labels={labels}
      reducedMotion={reducedMotion}
      isMobile={isMobile}
    />

    <CameraRig activePlace={activePlace} reducedMotion={reducedMotion} />

    <ReadySignal onReady={onReady} />
  </Canvas>
  );
};

export default CityCanvas;
