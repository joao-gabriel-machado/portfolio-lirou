// src/components/city/CityCanvas.tsx
// Stub temporário — a cena 3D é implementada na Task 3.
import type { PlaceId } from '@/components/city/places';

interface CityCanvasProps {
  activePlace: PlaceId | null;
  onSelect: (id: PlaceId | null) => void;
  onHover: (id: PlaceId | null) => void;
  reducedMotion: boolean;
  isMobile: boolean;
}

const CityCanvas = (_props: CityCanvasProps) => null;

export default CityCanvas;
