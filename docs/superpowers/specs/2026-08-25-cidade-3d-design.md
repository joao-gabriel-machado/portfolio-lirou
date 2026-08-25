# Cidade 3D — Portfolio explorável em `/cidade`

**Data:** 2026-08-25 · **Status:** aprovado pelo João (design em chat) · **Versão-alvo:** v1

## Resumo

Nova rota `/cidade`: um diorama 3D orbital de um centro urbano em estética
"void tech" (identidade do site: OLED black + neon cyan/teal), construído
com Three.js + @react-three/fiber. O visitante gira, dá zoom e arrasta a
câmera; cada prédio/totem é um ponto de interesse que, ao ser clicado,
enquadra a câmera e abre um card com conteúdo do portfolio. Um mini
personagem **autônomo** (não controlável) corre pela cidade como vida
ambiente. Exploração livre — sem XP, missões ou conquistas.

## Objetivos

- Vitrine memorável dos projetos e da trajetória, na identidade do site.
- Funcionar bem em desktop e mobile (gestos de toque = órbita nativa).
- Zero assets 3D externos obrigatórios: cidade procedural (geometria +
  materiais emissivos). Exceção permitida: modelo GLTF simples para o
  personagem, se compensar sobre um robozinho procedural.
- Bundle inicial do site intocado: rota inteira em chunk lazy (mesmo
  padrão de `FloatingShapesLayer`).

## Não-objetivos (v1)

- Personagem controlável ("Modo passeio") — fica para v2 (ver Contratos).
- Física/colisão real, pathfinding dinâmico, multiplayer, som.
- Gamificação formal (conquistas, progresso, coletáveis).
- Fallback 2D da rota: sem WebGL, mostra mensagem amigável + link de volta.

## Conceito visual

- Cidade flutuando num vazio escuro; fog dissolve as bordas (a cidade
  "termina" em névoa, não em borda dura).
- Chão escuro levemente brilhante com grid sutil (linhas cyan fracas).
- Prédios = volumes escuros com janelas emissivas (textura de janelas
  gerada em canvas, aleatória por prédio) e letreiros neon.
- Vida ambiente: neons pulsando, um "trem de luz" circulando a cidade,
  mini-formas geométricas do hero flutuando sobre os telhados, e o
  personagem correndo pelas ruas.
- Polimento condicional: bloom (pós-processamento) apenas em desktop.

## Layout da cidade (distritos)

Praça central com o nome "João Gabriel — LirouDev" em neon; câmera inicia
enquadrando a praça com a cidade ao redor.

| Distrito | Onde | Conteúdo |
|---|---|---|
| Projetos | centro, ao redor da praça | 7 prédios, um por projeto. Metrifica e Prontiva (produtos próprios) são as torres mais altas; Prontiva com letreiro "em breve" piscando; Coffee Delivery é uma cafeteria pequena com fumaça |
| Experiência | quarteirão corporativo | prédios Twiniti e Titaniumfix |
| Formação | campus | prédio UNIP + outdoors Rocketseat (cursos) |
| Skills | zona lab/industrial | 4 totens por categoria: frontend, backend, ferramentas, IA |
| Contato | borda da cidade | torre de comunicação com antena pulsante |

**Easter eggs (4–6, sem UI que os liste):** gato num telhado, outdoor com
piada dev, placa "404" num beco sem saída, o trem de luz, o personagem
clicável, mini-formas do hero no céu. Clicar num easter egg dá um feedback
pequeno (animação/tooltip), não abre card.

## Personagem ambiente

- Mini-avatar (low-poly do João ou robô na estética do site — decidir na
  implementação pelo que ficar melhor com menor custo).
- Corre sozinho num circuito de **waypoints** definido nos dados da
  cidade; para em alguns lugares por alguns segundos ("olha vitrine"),
  depois segue. Rotação suave nas curvas; ciclo de corrida simples
  (procedural ou clip GLTF).
- Clicável (easter egg): reação curta (aceno/pulo + balão), sem card.
- Em `prefers-reduced-motion`: personagem parado num ponto fixo.

## Interação

- **Órbita** (OrbitControls/drei) com limites: ângulo polar máx ~80°
  (nunca por baixo do chão), distância min/max, alvo travado na área da
  cidade. Auto-rotação lenta após ~10s ocioso (desativada em
  reduced-motion); qualquer input cancela.
- **Hover** (desktop): lugar destaca (emissive↑) + tooltip com nome +
  cursor pointer. Raycast com throttle.
- **Clique/toque** num lugar: câmera voa suavemente (lerp ~1s, ease
  out-expo) até enquadramento pré-definido do lugar → abre card HTML.
- **Card de conteúdo**: overlay glass (design system atual — `card-outer`
  / `card-inner`), com título, descrição, stack e link ao vivo quando
  houver; botão fechar → câmera volta ao enquadramento geral.
- **HUD mínimo**: dica "arraste para explorar" (some após primeiro
  input), botão voltar ao site, toggle BR/EN (padrão das outras rotas).

## Contratos de extensão (preparação para v2 "Modo passeio")

Custam quase nada na v1 e evitam retrabalho se o personagem virar
controlável:

1. **Chão navegável em dados** — ruas/calçadas existem como dados (malha
   de waypoints + áreas), não só como visual. O personagem ambiente já
   usa esses dados.
2. **Lugares como entidades** — todo ponto de interesse é um registro
   `{ id, position, cameraFrame, interactionRadius, contentKey }` em
   `places.ts`. Abrir conteúdo é sempre `openPlace(id)`, agnóstico do
   gatilho (clique hoje; "personagem entrou no raio" na v2).
3. **CameraRig com modos** — módulo de câmera com modo `orbit` (v1);
   interface comporta `follow` (v2) sem tocar no resto.

## Dados e i18n

- `src/components/city/places.ts`: registros tipados de todos os lugares,
  waypoints do personagem e do trem, enquadramentos de câmera.
- Textos em `src/utils/translations.ts`, nova chave `city` (pt/en):
  títulos de distritos, tooltips, HUD, mensagens. Descrições de projetos
  **reusam** `projects.items` existente — nada de conteúdo duplicado.
- SEO: rota adicionada ao `scripts/prerender-meta.mjs` (title/description
  próprios), ao `public/sitemap.xml` e ao rewrite do `vercel.json`
  (`/cidade` → `/cidade.html`, como `/orcamento` e `/links`).

## Arquitetura de código

```
src/pages/CityPage.tsx            # shell HTML: HUD, cards, Suspense, sem three
src/components/city/
  CityCanvas.tsx                  # <Canvas> + composição da cena (lazy)
  CityBuildings.tsx               # distritos, prédios, letreiros (instancing p/ fundo)
  CityLife.tsx                    # personagem, trem de luz, formas no céu
  CameraRig.tsx                   # órbita com limites + fly-to + (v2: follow)
  places.ts                       # dados: lugares, waypoints, enquadramentos
```

- Rota `/cidade` no `App.tsx`; import lazy do `CityCanvas` (chunk
  separado; three já é compartilhado com o chunk do hero — Vite deduplica).
- Estado do card aberto vive no `CityPage` (React), alimentado por
  `openPlace(id)` vindo da cena via callback.
- Materiais e geometrias compartilhados; prédios genéricos de fundo em
  `InstancedMesh`.
- Entrada: botão "Explorar a cidade" na landing (posição definida na
  implementação) + acesso direto pela URL.

## Performance e fallbacks

- DPR limitado (mobile ≤1.5), fog encurta distância visível, instancing
  nos prédios de fundo, raycast com throttle, bloom só desktop (e primeiro
  corte se FPS cair).
- `prefers-reduced-motion`: sem auto-rotação, neons estáticos, trem
  parado, personagem parado — cidade continua navegável e clicável.
- Sem WebGL: mensagem amigável + link de volta ao site.
- Aba oculta: rAF nativo já pausa o loop.

## Verificação

Sem infra de testes no projeto. Critérios: `npm run lint` e `npm run
build` limpos (erros pré-existentes do shadcn não contam); inspeção no
Chrome (desktop + viewport mobile): órbita, hover, clique→card→voltar,
personagem circulando, console sem erros; FPS aceitável em viewport
mobile (sem travamentos perceptíveis).

## v2 (registrada, não escopada)

"Modo passeio": assumir o controle do personagem (WASD/joystick virtual),
câmera `follow`, `openPlace` disparado por proximidade. Só entra se a v1
justificar.
