// src/components/city/CityBuildings.tsx
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { CITY_COLORS, PLACES, type Place, type PlaceId } from './places';

/** Textura de janelas acesas gerada em canvas (compartilhada). */
function makeWindowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0c1114';
  ctx.fillRect(0, 0, 64, 128);
  for (let y = 4; y < 124; y += 8) {
    for (let x = 4; x < 60; x += 8) {
      if (Math.random() < 0.35) {
        ctx.fillStyle = Math.random() < 0.8 ? '#1fb2aa' : '#e8f6f5';
        ctx.globalAlpha = 0.25 + Math.random() * 0.6;
        ctx.fillRect(x, y, 4, 4);
      }
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

interface Props {
  onSelect: (id: PlaceId) => void;
  onHover: (id: PlaceId | null) => void;
  hoveredId: PlaceId | null;
  labels: Record<string, string>;
  reducedMotion: boolean;
  isMobile: boolean;
}

/**
 * Agenda de falha de neon: mostly-on com quedas breves e irregulares.
 * Seguro para fotossensibilidade: no máx ~2 quedas/s durante um "engasgo"
 * curto, e engasgos raros (a cada 6–14s por letreiro).
 */
function neonFlickerOn(t: number, seed: number): boolean {
  const cycle = 6 + (seed % 8);              // período do engasgo (6–14s)
  const local = (t + seed * 1.7) % cycle;
  if (local > 0.9) return true;              // 90% do tempo: aceso estável
  // Janela de engasgo (0.9s): 2 quedas lentas e irregulares
  return Math.sin(local * 14 + seed) > -0.35;
}

/** Um prédio-POI com letreiro neon (que ocasionalmente falha). */
const PoiBuilding = ({ place, label, hovered, onSelect, onHover, windows, reducedMotion, seed }: {
  place: Place; label: string; hovered: boolean;
  onSelect: (id: PlaceId) => void; onHover: (id: PlaceId | null) => void;
  windows: THREE.Texture; reducedMotion: boolean; seed: number;
}) => {
  const [w, h, d] = place.size;
  const sign = useRef<THREE.Group>(null);
  const body = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    // Neon falhando (nunca no prédio em hover, para não atrapalhar a leitura)
    if (sign.current) sign.current.visible = hovered || neonFlickerOn(t, seed);
    // Janelas "respiram" dessincronizadas (cintilar lento)
    if (body.current && !hovered) {
      body.current.emissiveIntensity = 0.05 + Math.max(0, Math.sin(t * 0.6 + seed)) * 0.05;
    }
  });

  return (
    <group position={[place.position[0], 0, place.position[2]]}>
      <mesh
        position={[0, h / 2, 0]}
        onClick={(e) => { if (e.delta > 4) return; e.stopPropagation(); onSelect(place.id); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(place.id); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          ref={body}
          color={CITY_COLORS.building}
          roughness={0.4}
          metalness={0.6}
          map={windows}
          emissive={CITY_COLORS.primary}
          emissiveIntensity={hovered ? 0.35 : 0.06}
        />
      </mesh>
      {/* Letreiro neon no topo — fixo, legível da vista padrão */}
      <group ref={sign}>
        <Text
          position={[0, h + 0.9, 0]}
          fontSize={Math.min(1.1, Math.max(0.6, w * 0.28))}
          color={place.comingSoon ? CITY_COLORS.accent : CITY_COLORS.primary}
          anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#03302d"
          rotation={[0, Math.PI / 4, 0]}
          raycast={() => null}
        >
          {label}
        </Text>
      </group>
    </group>
  );
};

/** Prédios de fundo instanciados no anel externo (não clicáveis). */
const BackgroundBuildings = ({ count, windows }: { count: number; windows: THREE.Texture }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const transforms = useMemo(() => {
    const m: { pos: THREE.Vector3; scale: THREE.Vector3 }[] = [];
    let seed = 42;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand() * 0.2;
      const radius = 30 + rand() * 11;
      const hgt = 3 + rand() * 7;
      m.push({
        pos: new THREE.Vector3(Math.cos(angle) * radius, hgt / 2, Math.sin(angle) * radius),
        scale: new THREE.Vector3(2 + rand() * 2, hgt, 2 + rand() * 2),
      });
    }
    return m;
  }, [count]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || mesh.userData.done) return;
    const mat = new THREE.Matrix4();
    transforms.forEach((tr, i) => {
      mat.compose(tr.pos, new THREE.Quaternion(), tr.scale);
      mesh.setMatrixAt(i, mat);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.done = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} raycast={() => null}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={CITY_COLORS.building} roughness={0.55} metalness={0.45}
        map={windows} emissive={CITY_COLORS.primary} emissiveIntensity={0.03} />
    </instancedMesh>
  );
};

const CityBuildings = ({ onSelect, onHover, hoveredId, labels, reducedMotion, isMobile }: Props) => {
  const windows = useMemo(makeWindowTexture, []);
  const prontivaSign = useRef<THREE.Group>(null);
  const nextShuffle = useRef(4);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    // Letreiro "em breve" da Prontiva pisca devagar.
    if (prontivaSign.current) prontivaSign.current.visible = Math.sin(t * 3) > -0.3;
    // Janelas da cidade "mudam" (offset da textura compartilhada) a cada 4–8s
    // → ilusão de luzes acendendo/apagando pela cidade inteira.
    if (t > nextShuffle.current) {
      windows.offset.set(Math.random(), Math.random());
      nextShuffle.current = t + 4 + Math.random() * 4;
    }
  });

  const prontiva = PLACES.find((p) => p.id === 'prontiva')!;

  return (
    <group>
      {/* Chão com grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <circleGeometry args={[44, 48]} />
        <meshStandardMaterial color={CITY_COLORS.ground} roughness={0.35} metalness={0.5} />
      </mesh>
      <gridHelper args={[88, 44, '#123a37', '#0b1f1d']} position={[0, 0.02, 0]} raycast={() => null} />

      {/* Praça central: nome em neon */}
      <Text position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        fontSize={1.6} color={CITY_COLORS.primary} anchorX="center" anchorY="middle"
        outlineWidth={0.03} outlineColor="#03302d" raycast={() => null}>
        JOÃO GABRIEL — LIROUDEV
      </Text>

      {/* POIs */}
      {PLACES.map((place, i) => (
        <PoiBuilding key={place.id} place={place} windows={windows}
          label={labels[place.id] ?? place.id}
          hovered={hoveredId === place.id}
          reducedMotion={reducedMotion} seed={i * 3 + 1}
          onSelect={onSelect} onHover={onHover} />
      ))}

      {/* Selo "em breve" piscante da Prontiva */}
      <group ref={prontivaSign} position={[prontiva.position[0], prontiva.size[1] + 2, prontiva.position[2]]}>
        <Text fontSize={0.55} color={CITY_COLORS.accent} anchorX="center" anchorY="middle"
          rotation={[0, Math.PI / 4, 0]} raycast={() => null}>
          {labels['prontiva-soon'] ?? 'EM BREVE'}
        </Text>
      </group>

      {/* Antena pulsante do Contato */}
      <ContactAntenna reducedMotion={reducedMotion} />

      <BackgroundBuildings count={isMobile ? 28 : 60} windows={windows} />
    </group>
  );
};

const ContactAntenna = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const light = useRef<THREE.Mesh>(null);
  const contact = PLACES.find((p) => p.id === 'contact')!;
  useFrame(({ clock }) => {
    if (reducedMotion || !light.current) return;
    const mat = light.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime * 2.5) * 1.3;
  });
  return (
    <group position={[contact.position[0], contact.size[1], contact.position[2]]} raycast={() => null}>
      <mesh position={[0, 1.2, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.05, 0.05, 2.4]} />
        <meshStandardMaterial color="#1a2226" />
      </mesh>
      <mesh ref={light} position={[0, 2.5, 0]} raycast={() => null}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={CITY_COLORS.primary} emissive={CITY_COLORS.primary} emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

export default CityBuildings;
