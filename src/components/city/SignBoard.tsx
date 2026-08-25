// src/components/city/SignBoard.tsx
// Letreiro físico animado — substitui o `Letreiro` v1 (Text flutuante) por
// um painel com moldura, hastes/pórtico de sustentação e uma animação de
// "acendimento" de neon. Heroes (metrifica/prontiva) ganham um pórtico de
// telhado com texto letra-a-letra e uma marquise de lâmpadas persseguidoras.
//
// Fotossensibilidade: toda animação aqui é de baixa amplitude/curta duração
// — quedas de opacidade breves numa área pequena (o texto), e a marquise é
// um chaser contínuo de baixa luminância (não pisca em bloco). Nada dispara
// mais que ~2-3 eventos/s e reducedMotion desliga tudo (fica tudo aceso,
// estático, sem marquise).
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { CITY_COLORS } from './places';

interface SignBoardProps {
  label: string;
  /** Reservado para futura clamps por fachada — a largura do painel é hoje derivada só do texto. */
  width?: number;
  comingSoon?: boolean;
  hero?: boolean;
  hovered: boolean;
  active: boolean;
  reducedMotion: boolean;
  seed: number;
}

const PANEL_HEIGHT = 1.3;
const PANEL_DEPTH = 0.12;
const FRAME_PAD = 0.15;
const FRAME_DEPTH = 0.08;
const STRUT_RADIUS = 0.05;
const STRUT_HEIGHT = 0.5;
const COLUMN_W = 0.18;
const COLUMN_H = 1.9;
const COLUMN_D = 0.18;
// Ambas as camadas do texto-tubo ficam NA FRENTE da face do painel (z do
// painel vai de -PANEL_DEPTH/2 a +PANEL_DEPTH/2) — senão a cópia de trás
// fica ocluída dentro do box opaco e nunca renderiza. O gap de 0.06 entre
// as duas dá a ilusão de profundidade do tubo.
const TUBE_FRONT_Z = PANEL_DEPTH / 2 + 0.10;
const TUBE_BACK_Z = PANEL_DEPTH / 2 + 0.04;
const BACK_TUBE_COLOR = '#0a4a45';
const FRAME_COLOR = '#1a2230';
const PANEL_COLOR = '#0d1117';

const IGNITION_DURATION = 0.5;
const LETTER_STAGGER = 0.08;
const LETTER_RAMP = 0.15;
const MARQUEE_COUNT = 24;
const MARQUEE_LOOP_SECONDS = 1;
const MARQUEE_DIM = new THREE.Color('#123a37');
const MARQUEE_LIT = new THREE.Color('#5fe6da');

/** drei `Text` (troika) tipa a ref como `any` — este alias evita propagar `any` explícito no resto do arquivo. */
type TextInstance = THREE.Mesh & { fillOpacity: number };

/**
 * Agenda de falha de neon: mostly-on com quedas breves e irregulares.
 * (mesma função do v1 — mantida aqui pois só o SignBoard a usa agora.)
 */
function neonFlickerOn(t: number, seed: number): boolean {
  const cycle = 6 + (seed % 8);              // período do engasgo (6–14s)
  const local = (t + seed * 1.7) % cycle;
  if (local > 0.9) return true;              // 90% do tempo: aceso estável
  return Math.sin(local * 14 + seed) > -0.35;
}

/** Ignição de um letreiro de peça única: fade-in + 1 flicker (2 quedas) nos primeiros 0.5s do próprio disparo. */
function nonHeroIgnitionOpacity(dt: number): number {
  if (dt <= 0) return 0;
  if (dt >= IGNITION_DURATION) return 1;
  let v = dt / IGNITION_DURATION;
  if ((dt > 0.18 && dt < 0.24) || (dt > 0.32 && dt < 0.38)) v *= 0.25;
  return THREE.MathUtils.clamp(v, 0, 1);
}

/** Ignição por letra (heroes): rampa própria + "pisca" (2 quedas rápidas) só na penúltima letra. */
function letterIgnitionOpacity(dt: number, isPenultimate: boolean): number {
  if (dt < 0) return 0.15;
  let v = Math.min(1, dt / LETTER_RAMP);
  if (isPenultimate && ((dt > 0.1 && dt < 0.15) || (dt > 0.22 && dt < 0.27))) v *= 0.2;
  return THREE.MathUtils.clamp(v, 0.15, 1);
}

/** Ponto no perímetro de um retângulo w×h centrado na origem, t em [0,1). */
function pointOnRectPerimeter(t: number, w: number, h: number): [number, number] {
  const perimeter = 2 * (w + h);
  let d = ((t % 1) + 1) % 1 * perimeter;
  if (d < w) return [-w / 2 + d, h / 2];
  d -= w;
  if (d < h) return [w / 2, h / 2 - d];
  d -= h;
  if (d < w) return [w / 2 - d, -h / 2];
  d -= w;
  return [-w / 2, -h / 2 + d];
}

/**
 * Letreiro físico no topo de um prédio: painel + moldura, hastes (POIs
 * normais) ou pórtico de telhado (heroes), com texto-tubo em neon e
 * acendimento animado. `SignBoard` não se posiciona — o grupo é ancorado
 * pelo componente pai no topo do prédio (`y = place.size[1] + offset`).
 */
const SignBoard = ({ label, comingSoon, hero, hovered, active, reducedMotion, seed }: SignBoardProps) => {
  const safeLen = Math.max(label.length, 1);
  const panelWidth = safeLen * 0.42 + 0.8;
  const frameWidth = panelWidth + FRAME_PAD * 2;
  const frameHeight = PANEL_HEIGHT + FRAME_PAD * 2;
  const fontSize = Math.min(0.7, (panelWidth - 0.6) / (safeLen * 0.55));
  const primaryColor = comingSoon ? CITY_COLORS.accent : CITY_COLORS.primary;

  const panelCenterY = hero ? COLUMN_H + PANEL_HEIGHT / 2 : STRUT_HEIGHT + PANEL_HEIGHT / 2;

  // Ignição do letreiro "peça única" (não-hero): fade-in disparado nos
  // primeiros ~2s da cena, escalonado pelo seed — determinístico, sem ref.
  const ignitionStart = useMemo(() => 0.15 + (seed % 6) * 0.28, [seed]);
  const textGroupRef = useRef<THREE.Group>(null);
  // Refs para os meshes de texto (troika/drei `Text`) — só usamos
  // `.fillOpacity`, mutado direto por frame (troika resincroniza sozinho via
  // seu próprio agendador, fora do ciclo do React).
  const frontRef = useRef<TextInstance | null>(null);
  const backRef = useRef<TextInstance | null>(null);

  useFrame(({ clock }) => {
    if (hero) return;
    const front = frontRef.current;
    const back = backRef.current;
    if (reducedMotion) {
      if (front) front.fillOpacity = 1;
      if (back) back.fillOpacity = 1;
      if (textGroupRef.current) textGroupRef.current.visible = true;
      return;
    }
    const t = clock.elapsedTime;
    const dt = t - ignitionStart;
    let opacity: number;
    if (dt < IGNITION_DURATION) {
      opacity = nonHeroIgnitionOpacity(dt);
      if (textGroupRef.current) textGroupRef.current.visible = true;
    } else {
      opacity = 1;
      if (textGroupRef.current) textGroupRef.current.visible = hovered || neonFlickerOn(t, seed);
    }
    if (front) front.fillOpacity = opacity;
    if (back) back.fillOpacity = opacity;
  });

  // Ignição letra-a-letra (heroes): dispara 1x na primeira vez que
  // hovered || active fica true (ref `ignited`), sequencial ~80ms/letra.
  const letters = useMemo(() => label.split(''), [label]);
  const letterAdvance = 0.55 * fontSize;
  const totalWidth = letters.length > 1 ? (letters.length - 1) * letterAdvance : 0;
  const heroGroupRef = useRef<THREE.Group>(null);
  const letterFrontRefs = useRef<(TextInstance | null)[]>([]);
  const letterBackRefs = useRef<(TextInstance | null)[]>([]);
  const ignitedRef = useRef(false);
  const triggerTimeRef = useRef(0);
  const sequenceEnd = letters.length * LETTER_STAGGER + LETTER_RAMP;

  useFrame(({ clock }) => {
    if (!hero) return;
    const t = clock.elapsedTime;
    if (reducedMotion) {
      letterFrontRefs.current.forEach((r) => { if (r) r.fillOpacity = 1; });
      letterBackRefs.current.forEach((r) => { if (r) r.fillOpacity = 1; });
      if (heroGroupRef.current) heroGroupRef.current.visible = true;
      return;
    }
    if (!ignitedRef.current && (hovered || active)) {
      ignitedRef.current = true;
      triggerTimeRef.current = t;
    }
    if (!ignitedRef.current) {
      letterFrontRefs.current.forEach((r) => { if (r) r.fillOpacity = 0.15; });
      letterBackRefs.current.forEach((r) => { if (r) r.fillOpacity = 0.15; });
      if (heroGroupRef.current) heroGroupRef.current.visible = true;
      return;
    }
    const dtTotal = t - triggerTimeRef.current;
    letters.forEach((_, i) => {
      const dt = dtTotal - i * LETTER_STAGGER;
      const isPenultimate = i === letters.length - 2;
      const opacity = letterIgnitionOpacity(dt, isPenultimate);
      const front = letterFrontRefs.current[i];
      const back = letterBackRefs.current[i];
      if (front) front.fillOpacity = opacity;
      if (back) back.fillOpacity = opacity;
    });
    if (heroGroupRef.current) {
      heroGroupRef.current.visible = dtTotal < sequenceEnd || hovered || neonFlickerOn(t, seed);
    }
  });

  // Marquise (só heroes, sem reducedMotion): 24 lâmpadas no perímetro da
  // moldura, corrida clássica (grupos de 3 acesos avançando), ~1 volta/2s.
  const marqueeRef = useRef<THREE.InstancedMesh>(null);
  const marqueePositions = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i < MARQUEE_COUNT; i++) pts.push(pointOnRectPerimeter(i / MARQUEE_COUNT, frameWidth, frameHeight));
    return pts;
  }, [frameWidth, frameHeight]);

  // Posiciona as 24 instâncias uma vez (matrix estática) sobre a moldura;
  // a cor por instância é quem anima a corrida no useFrame abaixo.
  useEffect(() => {
    const mesh = marqueeRef.current;
    if (!hero || !mesh) return;
    const dummy = new THREE.Object3D();
    marqueePositions.forEach(([x, y], i) => {
      // Local ao grupo já transladado para panelCenterY — bulbos na
      // borda da moldura, um pouco à frente do painel.
      dummy.position.set(x, y, PANEL_DEPTH / 2 + 0.03);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, MARQUEE_DIM);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [hero, marqueePositions]);

  useFrame(({ clock }) => {
    const mesh = marqueeRef.current;
    if (!hero || reducedMotion || !mesh) return;
    const head = (clock.elapsedTime / MARQUEE_LOOP_SECONDS) * MARQUEE_COUNT;
    for (let i = 0; i < MARQUEE_COUNT; i++) {
      let d = (i - head) % MARQUEE_COUNT;
      if (d < 0) d += MARQUEE_COUNT;
      mesh.setColorAt(i, d < 3 ? MARQUEE_LIT : MARQUEE_DIM);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      <group position={[0, panelCenterY, 0]}>
        {/* Moldura (atrás do painel) */}
        <mesh position={[0, 0, -(PANEL_DEPTH / 2 + FRAME_DEPTH / 2) + 0.01]} raycast={() => null}>
          <boxGeometry args={[frameWidth, frameHeight, FRAME_DEPTH]} />
          <meshStandardMaterial color={FRAME_COLOR} roughness={0.9} />
        </mesh>

        {/* Painel */}
        <mesh raycast={() => null}>
          <boxGeometry args={[panelWidth, PANEL_HEIGHT, PANEL_DEPTH]} />
          <meshStandardMaterial color={PANEL_COLOR} roughness={0.9} />
        </mesh>

        {hero ? (
          <group ref={heroGroupRef}>
            {letters.map((ch, i) => {
              const x = -totalWidth / 2 + i * letterAdvance;
              return (
                <group key={i}>
                  <Text
                    ref={(r) => { letterFrontRefs.current[i] = r; }}
                    position={[x, 0, TUBE_FRONT_Z]}
                    fontSize={fontSize}
                    color={primaryColor}
                    anchorX="center" anchorY="middle"
                    outlineWidth={0.025} outlineColor="#03302d"
                    fillOpacity={0.15}
                    raycast={() => null}
                  >
                    {ch}
                  </Text>
                  <Text
                    ref={(r) => { letterBackRefs.current[i] = r; }}
                    position={[x, 0, TUBE_BACK_Z]}
                    fontSize={fontSize}
                    color={BACK_TUBE_COLOR}
                    anchorX="center" anchorY="middle"
                    outlineWidth={0.025} outlineColor="#03302d"
                    fillOpacity={0.15}
                    raycast={() => null}
                  >
                    {ch}
                  </Text>
                </group>
              );
            })}
          </group>
        ) : (
          <group ref={textGroupRef}>
            <Text
              ref={frontRef}
              position={[0, 0, TUBE_FRONT_Z]}
              fontSize={fontSize}
              color={primaryColor}
              anchorX="center" anchorY="middle"
              outlineWidth={0.025} outlineColor="#03302d"
              fillOpacity={reducedMotion ? 1 : 0}
              raycast={() => null}
            >
              {label}
            </Text>
            <Text
              ref={backRef}
              position={[0, 0, TUBE_BACK_Z]}
              fontSize={fontSize}
              color={BACK_TUBE_COLOR}
              anchorX="center" anchorY="middle"
              outlineWidth={0.025} outlineColor="#03302d"
              fillOpacity={reducedMotion ? 1 : 0}
              raycast={() => null}
            >
              {label}
            </Text>
          </group>
        )}

        {hero && !reducedMotion && (
          <instancedMesh ref={marqueeRef} args={[undefined, undefined, MARQUEE_COUNT]} raycast={() => null}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshBasicMaterial color="white" toneMapped={false} />
          </instancedMesh>
        )}
      </group>

      {hero ? (
        <>
          <mesh position={[-(panelWidth / 2 - COLUMN_W / 2), COLUMN_H / 2, 0]} raycast={() => null}>
            <boxGeometry args={[COLUMN_W, COLUMN_H, COLUMN_D]} />
            <meshStandardMaterial color={FRAME_COLOR} roughness={0.9} />
          </mesh>
          <mesh position={[panelWidth / 2 - COLUMN_W / 2, COLUMN_H / 2, 0]} raycast={() => null}>
            <boxGeometry args={[COLUMN_W, COLUMN_H, COLUMN_D]} />
            <meshStandardMaterial color={FRAME_COLOR} roughness={0.9} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-(panelWidth / 2 - 0.3), STRUT_HEIGHT / 2, 0]} raycast={() => null}>
            <cylinderGeometry args={[STRUT_RADIUS, STRUT_RADIUS, STRUT_HEIGHT, 8]} />
            <meshStandardMaterial color={FRAME_COLOR} roughness={0.85} metalness={0.2} />
          </mesh>
          <mesh position={[panelWidth / 2 - 0.3, STRUT_HEIGHT / 2, 0]} raycast={() => null}>
            <cylinderGeometry args={[STRUT_RADIUS, STRUT_RADIUS, STRUT_HEIGHT, 8]} />
            <meshStandardMaterial color={FRAME_COLOR} roughness={0.85} metalness={0.2} />
          </mesh>
        </>
      )}
    </group>
  );
};

export default SignBoard;
export { PANEL_HEIGHT as SIGNBOARD_PANEL_HEIGHT, STRUT_HEIGHT as SIGNBOARD_STRUT_HEIGHT, COLUMN_H as SIGNBOARD_COLUMN_H };
