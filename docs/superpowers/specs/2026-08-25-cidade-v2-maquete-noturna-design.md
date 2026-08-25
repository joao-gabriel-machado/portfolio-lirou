# Cidade 3D v2 — Maquete noturna (estética bruno-simon)

**Data:** 2026-08-25 · **Status:** aprovado em chat · **Base:** v1 merge-ready na `qa`
**Spec v1:** `2026-08-25-cidade-3d-design.md` (sistemas de interação/dados permanecem)

## Objetivo

Retrabalhar o AMBIENTE VISUAL da `/cidade` para o acabamento do
bruno-simon.com — low-poly polido, cores sólidas harmoniosas, materiais
foscos, luz suave "de maquete" — em versão **metrópole noturna**: azuis
profundos, janelas quentes acesas, poças de luz de postes no asfalto.
Não é fotorrealismo; é coesão e polimento.

**Invariante:** TODA a v1 funcional permanece — `places.ts` (posições,
waypoints, enquadramentos), cards/i18n/HUD/relógio/som, CameraRig,
avatar autônomo, trem elevado, easter eggs, SEO. A v2 troca a "casca"
visual (geometria decorativa + materiais + luz), não os sistemas.

## Assets (download aprovado pelo usuário)

| Pacote | Fonte | Licença | Uso |
|---|---|---|---|
| City Kit (Commercial) | kenney.nl | CC0 | prédios (POI + fundo) |
| City Kit (Roads) | kenney.nl | CC0 | ruas, calçadas, cruzamentos |
| Car Kit | kenney.nl | CC0 | carros estacionados + tráfego |

- Formato GLB; copiar para `public/models/city/` **apenas os arquivos
  usados** (subconjunto curado; alvo ≤ 12MB somados).
- Carregamento: `useGLTF` (drei) dentro do chunk lazy existente; preload
  disparado no mount do canvas; sem novo ponto de suspense visível (o
  overlay de load da v1 cobre).
- CC0: créditos não obrigatórios (mencionar Kenney no README por cortesia).

## Direção de arte

- **Paleta noturna:** céu/fundo gradiente azul profundo (topo `#0b1026` →
  horizonte `#1a2547`), fog azulada; estrelas discretas (`Points`).
- **Materiais:** foscos (roughness alta, metalness 0), retintados por
  override central (traverse dos GLTFs → paleta própria: concretos
  azul-acinzentados, detalhes quentes). Nada de texturas fotográficas.
- **Janelas:** emissivas quentes pontuais (planos/faces emissivas
  `#ffd9a0`, poucas por prédio, acesas de forma variada) — substituem a
  textura de janelas da v1 nos modelos.
- **Luz:** 1 directional "lua" fria com **sombras suaves** (shadow map
  2048, só desktop) + hemisphere fraca + **N8AO** (ambient occlusion,
  pacote `n8ao` já presente como dependência transitiva) — é isso que dá
  o "assado" do Bruno sem pipeline de bake.
- **Postes:** modelo do kit + poça de luz no chão (círculo emissivo
  gradiente) + cone translúcido sutil; sem point lights reais por poste.
- **Neon:** restrito aos letreiros dos POIs + selo "em breve" + antena
  do contato (identidade do site). Bloom mantido no desktop com
  intensidade reduzida (~0.35) para os neons e janelas.

## Letreiros físicos animados (pedido do usuário)

Substituir o texto flutuante por **letreiros de verdade**, por POI:

- **Estrutura:** painel escuro (box fino `#0d1117`) com moldura, montado
  na fachada superior do prédio por 2 hastes curtas — ou em pórtico no
  telhado nas 2 torres hero (Metrifica, Prontiva). Dimensionado ao texto.
- **Tubo neon:** o texto (drei Text) sobre o painel com outline forte e
  cor neon; leve profundidade (texto duplicado com offset) para ler como
  tubo, não como fonte flutuante.
- **Animações (todas procedurais, gated por reducedMotion):**
  1. **Acendimento sequencial** — na primeira vez que o POI entra em
     destaque (fly-to/hover) ou nos primeiros segundos da cena, as letras
     acendem uma a uma (~80ms/letra, com um "pisca" curto na penúltima),
     via `fillOpacity`/emissive por letra (um Text por letra nos heroes;
     nos demais, fade único com flicker de ignição).
  2. **Marquee** — nas 2 torres hero, fileira de lâmpadas (esferas
     pequenas instanciadas) na moldura do painel com "corrida" clássica
     (grupos de 3 acendendo em sequência, ~2 voltas/s — abaixo do limiar
     de strobe por serem pontos pequenos em movimento contínuo, não flash
     de tela; manter luminância baixa).
  3. **Falha ocasional** — mantém o `neonFlickerOn` da v1 (lento,
     seguro, nunca no hover).
- reducedMotion: letreiros acesos fixos, sem sequência nem marquee.

## Substituições (arquivo a arquivo)

| v1 | v2 |
|---|---|
| Boxes com textura de janelas (`CityBuildings`) | Modelos do City Kit mapeados por POI (porte compatível com `PLACES.size`; escala normalizada para manter a ALTURA dos dados) + variações instanciadas no anel de fundo |
| Planos de avenida + gridHelper (`CityStreets`) | Tiles de rua do Roads Kit (retas/cruzamentos/curvas) no MESMO traçado v1 (4 radiais + anel), calçadas do kit; grid removido |
| Caixas emissivas (carros de luz) | Carros do Car Kit com faróis emissivos (mesmas rotas/velocidades) + 6–10 carros estacionados nas ruas |
| Chão disco escuro | Chão de quarteirões (pavimento/grama escura do kit) recortado pelo mesmo raio 44 |
| Céu preto | Gradiente noturno + estrelas |
| Avatar procedural | MANTIDO como está (identidade própria; touca+óculos) |
| Trem elevado (caixa) | MANTIDO (ganha trilho fino elevado simples se barato) |

- Letreiros/tooltips/cards/raycast: intactos (o mesh clicável do POI passa
  a ser o modelo GLTF com os mesmos handlers e `e.delta`).
- Easter eggs (gato/outdoor/404/fumaça): mantidos, reposicionados sobre os
  novos telhados/calçadas se necessário.

## Performance e fallbacks (herdados + novos)

- Sombras + N8AO: **só desktop** e fora de reduced-motion; mobile mantém
  o pipeline v1 (sem AO/sombra) com os novos modelos e DPR ≤1.5.
- Fundo instanciado: `<Instances>`/`InstancedMesh` por tipo de modelo;
  mobile usa metade das variações.
- GLB total ≤ 12MB; medir e cortar variações se passar.
- `prefers-reduced-motion`, sem WebGL, aba oculta: comportamentos v1.

## Verificação

Como na v1: `npm run lint` + `npm run build` + browser (desktop e código
dos gates mobile): cidade coesa low-poly noturna, sombras/AO no desktop,
FPS estável, cliques/cards/avatar/trem/som intactos, console limpo.

## v3 (registrada, fora de escopo)

Carrinho dirigível com física (`@react-three/rapier`), colisões com os
quarteirões, WASD/joystick — sobre a cidade v2 pronta.
