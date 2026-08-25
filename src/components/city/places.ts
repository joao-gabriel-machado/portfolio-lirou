// src/components/city/places.ts
// Dados puros da cidade — sem imports de three/react. Fonte única de
// posições, enquadramentos de câmera e rotas (avatar/trem).

export type PlaceId =
  | 'metrifica' | 'prontiva' | 'redes' | 'twiniti' | 'delpupo' | 'samara' | 'coffee'
  | 'exp-twiniti' | 'exp-titaniumfix'
  | 'edu-unip' | 'edu-rocketseat'
  | 'skills-frontend' | 'skills-backend' | 'skills-tools' | 'skills-ai'
  | 'contact';

export type Vec3 = [number, number, number];

export interface CameraFrame {
  position: Vec3;
  target: Vec3;
}

export interface Place {
  id: PlaceId;
  kind: 'project' | 'experience' | 'education' | 'skills' | 'contact';
  /** Centro da base do prédio no chão (y = 0). */
  position: Vec3;
  /** Largura, altura, profundidade do volume principal. */
  size: Vec3;
  cameraFrame: CameraFrame;
  comingSoon?: boolean;
  live?: string;
}

export interface Waypoint {
  position: Vec3;
  /** Segundos parado neste ponto (0 = não para). */
  pause: number;
}

export const CITY_COLORS = {
  primary: '#1fb2aa',
  accent: '#2cbdb4',
  background: '#050607',
  building: '#0c1114',
  ground: '#07090a',
} as const;

export const HOME_FRAME: CameraFrame = {
  position: [28, 22, 28],
  target: [0, 2, 0],
};

export const TRAIN_RADIUS = 32;

// Enquadramento padrão: câmera a ~SE do prédio, olhando o letreiro.
const frame = (p: Vec3, h: number): CameraFrame => ({
  position: [p[0] + 7, h + 4, p[2] + 9],
  target: [p[0], h * 0.6, p[2]],
});

export const PLACES: Place[] = [
  // ── Distrito Projetos (anel central) ──
  { id: 'metrifica', kind: 'project', position: [8, 0, -4], size: [3.4, 14, 3.4],
    cameraFrame: frame([8, 0, -4], 14), live: 'https://metrifica.vercel.app/' },
  { id: 'prontiva', kind: 'project', position: [12, 0, 3], size: [3.2, 12, 3.2],
    cameraFrame: frame([12, 0, 3], 12), comingSoon: true },
  { id: 'redes', kind: 'project', position: [5, 0, 8], size: [3, 6, 3],
    cameraFrame: frame([5, 0, 8], 6), live: 'https://redesdovale.com.br/' },
  { id: 'twiniti', kind: 'project', position: [-6, 0, 9], size: [3, 7, 3],
    cameraFrame: frame([-6, 0, 9], 7), live: 'https://www.twiniti.com.br/' },
  { id: 'delpupo', kind: 'project', position: [-10, 0, 2], size: [3.2, 9, 3.2],
    cameraFrame: frame([-10, 0, 2], 9), live: 'https://www.delpupohomes.com/' },
  { id: 'samara', kind: 'project', position: [-8, 0, -7], size: [3, 5, 3],
    cameraFrame: frame([-8, 0, -7], 5), live: 'https://drasamaragoncalves.vercel.app/' },
  { id: 'coffee', kind: 'project', position: [3, 0, -9], size: [2.6, 2.5, 2.6],
    cameraFrame: frame([3, 0, -9], 2.5), live: 'https://coffee-delivery-two-murex.vercel.app/' },

  // ── Distrito Experiência (oeste) ──
  { id: 'exp-twiniti', kind: 'experience', position: [-20, 0, -8], size: [4, 10, 4],
    cameraFrame: frame([-20, 0, -8], 10) },
  { id: 'exp-titaniumfix', kind: 'experience', position: [-24, 0, 0], size: [4, 8, 4],
    cameraFrame: frame([-24, 0, 0], 8) },

  // ── Distrito Formação (norte, z negativo) ──
  { id: 'edu-unip', kind: 'education', position: [2, 0, -20], size: [8, 5, 4],
    cameraFrame: frame([2, 0, -20], 5) },
  { id: 'edu-rocketseat', kind: 'education', position: [9, 0, -18], size: [0.4, 4, 5],
    cameraFrame: frame([9, 0, -18], 4) },

  // ── Distrito Skills (leste): 4 totens ──
  { id: 'skills-frontend', kind: 'skills', position: [20, 0, 6], size: [1.4, 4, 1.4],
    cameraFrame: frame([20, 0, 6], 4) },
  { id: 'skills-backend', kind: 'skills', position: [23, 0, 1], size: [1.4, 4, 1.4],
    cameraFrame: frame([23, 0, 1], 4) },
  { id: 'skills-tools', kind: 'skills', position: [20, 0, -4], size: [1.4, 4, 1.4],
    cameraFrame: frame([20, 0, -4], 4) },
  { id: 'skills-ai', kind: 'skills', position: [24, 0, -9], size: [1.4, 4, 1.4],
    cameraFrame: frame([24, 0, -9], 4) },

  // ── Contato (borda sul) ──
  { id: 'contact', kind: 'contact', position: [0, 0, 24], size: [2.4, 16, 2.4],
    cameraFrame: frame([0, 0, 24], 16) },
];

// Circuito do avatar: passa pela praça e pelos distritos, sempre em ruas
// (nunca dentro de um volume de prédio).
export const AVATAR_WAYPOINTS: Waypoint[] = [
  { position: [0, 0, 5], pause: 0 },
  { position: [8, 0, 7], pause: 2 },      // vitrine Redes do Vale
  { position: [15, 0, 0], pause: 0 },
  { position: [19, 0, -6], pause: 2 },    // olha os totens de skills
  { position: [10, 0, -12], pause: 0 },
  { position: [3, 0, -15], pause: 2 },    // campus
  { position: [-6, 0, -12], pause: 0 },
  { position: [-16, 0, -5], pause: 2 },   // distrito corporativo
  { position: [-14, 0, 5], pause: 0 },
  { position: [-4, 0, 11], pause: 1 },
];
