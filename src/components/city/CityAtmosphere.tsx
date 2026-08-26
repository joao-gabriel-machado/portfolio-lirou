// src/components/city/CityAtmosphere.tsx
// Atmosfera noturna da Cidade v2: céu em gradiente, estrelas estáticas,
// fog azulada, luz de lua (com sombra em desktop) e hemisfério fraco.
import { useMemo } from 'react';
import * as THREE from 'three';
import { NIGHT } from './nightPalette';

const SKY_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const SKY_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uTopColor;
  uniform vec3 uBottomColor;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition).y;
    float t = clamp(h * 0.5 + 0.5, 0.0, 1.0);
    gl_FragColor = vec4(mix(uBottomColor, uTopColor, t), 1.0);
  }
`;

/** Céu em esfera invertida com gradiente vertical simples (sem fog aplicado). */
const SkyDome = () => {
  const uniforms = useMemo(() => ({
    uTopColor: { value: new THREE.Color(NIGHT.skyTop) },
    uBottomColor: { value: new THREE.Color(NIGHT.skyBottom) },
  }), []);

  return (
    <mesh raycast={() => null}>
      <sphereGeometry args={[220, 24, 16]} />
      <shaderMaterial
        vertexShader={SKY_VERTEX_SHADER}
        fragmentShader={SKY_FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.BackSide}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  );
};

/** Campo de estrelas estático na semiesfera superior (sem cintilar). */
const Stars = ({ count }: { count: number }) => {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const radius = 200;
    for (let i = 0; i < count; i++) {
      // Amostra uniforme na semiesfera superior (y >= 0): theta ao redor do
      // eixo Y, cosPhi em [0,1] mantém o ponto acima do horizonte.
      const theta = 2 * Math.PI * Math.random();
      const cosPhi = Math.random();
      const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
      arr[i * 3] = radius * sinPhi * Math.cos(theta);
      arr[i * 3 + 1] = radius * cosPhi;
      arr[i * 3 + 2] = radius * sinPhi * Math.sin(theta);
    }
    return arr;
  }, [count]);

  return (
    <points raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        sizeAttenuation
        color="#cfd8ff"
        transparent
        opacity={0.8}
        depthWrite={false}
        fog={false}
      />
    </points>
  );
};

export interface CityAtmosphereProps {
  reducedMotion: boolean;
  isMobile: boolean;
}

/**
 * Monta toda a atmosfera noturna da cena: céu, estrelas, fog, cor de fundo
 * e as luzes (lua direcional + hemisfério). Substitui por completo os
 * elementos equivalentes da v1 (que o CityCanvas removeu).
 */
const CityAtmosphere = ({ reducedMotion, isMobile }: CityAtmosphereProps) => {
  const castMoonShadow = !isMobile && !reducedMotion;

  return (
    <>
      <color attach="background" args={[NIGHT.skyTop]} />
      <fog attach="fog" args={[NIGHT.fog, 50, 110]} />

      <SkyDome />
      <Stars count={isMobile ? 150 : 400} />

      <directionalLight
        name="moon"
        position={[30, 45, -20]}
        intensity={0.7}
        color="#aebcdf"
        castShadow={castMoonShadow}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-near={10}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={['#22305a', '#0a0d18', 0.5]} />
    </>
  );
};

export default CityAtmosphere;
