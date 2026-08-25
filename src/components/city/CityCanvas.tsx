// src/components/city/CityCanvas.tsx
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
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
}

const CityCanvas = ({ activePlace, onSelect, onHover, hoveredId, labels, reducedMotion, isMobile }: CityCanvasProps) => {
  // Rastreia a posição do pointerdown para não desselecionar quando o
  // "miss" é, na verdade, o fim de um drag de órbita (não um clique real).
  const downPos = useRef<[number, number]>([0, 0]);

  return (
  <Canvas
    camera={{ position: HOME_FRAME.position, fov: 45 }}
    dpr={[1, isMobile ? 1.5 : 2]}
    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    onPointerDown={(e) => { downPos.current = [e.clientX, e.clientY]; }}
    onPointerMissed={(e) => {
      const [x, y] = downPos.current;
      if (Math.hypot(e.clientX - x, e.clientY - y) <= 4) onSelect(null);
    }}
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
  </Canvas>
  );
};

export default CityCanvas;
