# Assets Cidade v2 — Inventário (Kenney, CC0)

**Data:** 2026-08-25 · **Task:** 1/plano `2026-08-25-cidade-v2`

## Licença

Todos os modelos abaixo vêm de kits gratuitos do [kenney.nl](https://kenney.nl),
licenciados sob **[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)**
(domínio público) — uso livre, sem atribuição obrigatória, comercial ou não.
Baixados diretamente do site oficial, sem autenticação.

Kits de origem:
- **City Kit (Commercial)** — https://kenney.nl/assets/city-kit-commercial (v2.1)
- **City Kit (Roads)** — https://kenney.nl/assets/city-kit-roads
- **Car Kit** — https://kenney.nl/assets/car-kit

Formato: `.glb` (glTF binário, single-file), pasta `Models/GLB format/` de cada
kit. Curadoria de subconjunto abaixo; os zips completos NÃO foram commitados
(baixados/extraídos apenas em scratchpad local).

## Inventário

| Arquivo (`public/models/city/`) | Origem no kit | Kit | Tamanho |
|---|---|---|---|
| building-small-a.glb | low-detail-building-a.glb | City Kit (Commercial) | 14.0 KB |
| building-small-b.glb | low-detail-building-c.glb | City Kit (Commercial) | 12.0 KB |
| building-medium-a.glb | building-a.glb | City Kit (Commercial) | 106.4 KB |
| building-medium-b.glb | building-c.glb | City Kit (Commercial) | 100.4 KB |
| building-large-a.glb | building-g.glb | City Kit (Commercial) | 162.5 KB |
| building-large-b.glb | building-i.glb | City Kit (Commercial) | 204.8 KB |
| building-tall-a.glb | building-skyscraper-a.glb | City Kit (Commercial) | 108.7 KB |
| building-tall-b.glb | building-skyscraper-d.glb | City Kit (Commercial) | 163.2 KB |
| building-wide-a.glb | low-detail-building-wide-b.glb | City Kit (Commercial) | 18.3 KB |
| building-thin-a.glb | low-detail-building-n.glb | City Kit (Commercial) | 5.8 KB |
| road-straight.glb | road-straight.glb | City Kit (Roads) | 5.1 KB |
| road-crossroad.glb | road-crossroad.glb | City Kit (Roads) | 9.8 KB |
| road-intersection-t.glb | road-split.glb | City Kit (Roads) | 58.7 KB |
| road-intersection.glb | road-intersection.glb | City Kit (Roads) | 7.7 KB |
| road-curve.glb | road-curve.glb | City Kit (Roads) | 23.4 KB |
| road-end.glb | road-end.glb | City Kit (Roads) | 4.8 KB |
| sidewalk-straight.glb | road-side.glb | City Kit (Roads) | 5.1 KB |
| sidewalk-corner.glb | road-bend-sidewalk.glb | City Kit (Roads) | 16.6 KB |
| car-sedan.glb | sedan.glb | Car Kit | 168.2 KB |
| car-hatchback.glb | hatchback-sports.glb | Car Kit | 193.2 KB |
| car-van.glb | van.glb | Car Kit | 171.5 KB |
| car-taxi.glb | taxi.glb | Car Kit | 171.5 KB |
| car-police.glb | police.glb | Car Kit | 190.8 KB |
| car-suv.glb | suv.glb | Car Kit | 202.7 KB |

**Total: 24 arquivos, ~2.08 MB** (limite do plano: 12 MB — bem abaixo).

## Manifest

Paths tipados expostos em `src/components/city/assets.ts` (`CITY_MODELS.buildings`,
`.roads`, `.cars`) + helper `preloadCityModels()` (chama `useGLTF.preload` em
todos os paths).
