// src/components/city/CityCanvas.tsx
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, N8AO } from '@react-three/postprocessing';
import CameraRig from './CameraRig';
import CityAtmosphere from './CityAtmosphere';
import CityBuildings from './CityBuildings';
import CityStreets from './CityStreets';
import CityLife from './CityLife';
import { HOME_FRAME, type PlaceId } from './places';
import { preloadCityModels } from './assets';

// Dispara o fetch dos GLBs da cidade assim que este chunk carrega, para que
// os modelos já estejam no cache do useGLTF quando os componentes montarem.
preloadCityModels();

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
    shadows={!isMobile && !reducedMotion}
    onPointerMissed={() => onSelect(null)}
  >
    <CityAtmosphere reducedMotion={reducedMotion} isMobile={isMobile} />

    <CityBuildings
      onSelect={onSelect}
      onHover={onHover}
      hoveredId={hoveredId}
      labels={labels}
      reducedMotion={reducedMotion}
      isMobile={isMobile}
    />

    <CityStreets reducedMotion={reducedMotion} isMobile={isMobile} />

    <CityLife reducedMotion={reducedMotion} isMobile={isMobile} />

    <CameraRig activePlace={activePlace} reducedMotion={reducedMotion} />

    {!isMobile && !reducedMotion && (
      <EffectComposer>
        <N8AO halfRes aoRadius={2} intensity={2.5} />
        <Bloom intensity={0.35} luminanceThreshold={0.35} luminanceSmoothing={0.7} mipmapBlur />
      </EffectComposer>
    )}

    <ReadySignal onReady={onReady} />
  </Canvas>
  );
};

export default CityCanvas;
