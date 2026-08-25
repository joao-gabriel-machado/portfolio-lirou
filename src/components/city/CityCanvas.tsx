// src/components/city/CityCanvas.tsx
import { Canvas } from '@react-three/fiber';
import CameraRig from './CameraRig';
import { CITY_COLORS, HOME_FRAME, type PlaceId } from './places';

export interface CityCanvasProps {
  activePlace: PlaceId | null;
  onSelect: (id: PlaceId | null) => void;
  onHover: (id: PlaceId | null) => void;
  reducedMotion: boolean;
  isMobile: boolean;
}

const CityCanvas = ({ activePlace, onSelect, onHover, reducedMotion, isMobile }: CityCanvasProps) => (
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

    {/* Chão provisório (Task 4 substitui por CityBuildings) */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[44, 48]} />
      <meshStandardMaterial color={CITY_COLORS.ground} roughness={0.35} metalness={0.5} />
    </mesh>

    <CameraRig activePlace={activePlace} reducedMotion={reducedMotion} />
  </Canvas>
);

export default CityCanvas;
