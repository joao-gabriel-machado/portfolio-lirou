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

Formato: `.glb` (glTF binário), pasta `Models/GLB format/` de cada kit. Apesar
de "binário", cada `.glb` do Kenney City/Car Kit referencia uma textura
EXTERNA `Textures/colormap.png` por caminho relativo ao próprio arquivo (não
embutida no binário) — por isso os modelos estão organizados em **uma
subpasta por kit**, cada uma com seu próprio `Textures/colormap.png` (kits
diferentes têm colormaps diferentes com o mesmo nome de arquivo; misturar
tudo numa pasta plana faz um kit carregar a textura errada do outro, ou
falhar o load por 404). Curadoria de subconjunto abaixo; os zips completos
NÃO foram commitados (baixados/extraídos apenas em scratchpad local).

## Inventário

| Arquivo (`public/models/city/`) | Origem no kit | Kit | Tamanho |
|---|---|---|---|
| commercial/building-small-a.glb | low-detail-building-a.glb | City Kit (Commercial) | 14.0 KB |
| commercial/building-small-b.glb | low-detail-building-c.glb | City Kit (Commercial) | 12.0 KB |
| commercial/building-medium-a.glb | building-a.glb | City Kit (Commercial) | 106.4 KB |
| commercial/building-medium-b.glb | building-c.glb | City Kit (Commercial) | 100.4 KB |
| commercial/building-large-a.glb | building-g.glb | City Kit (Commercial) | 162.5 KB |
| commercial/building-large-b.glb | building-i.glb | City Kit (Commercial) | 204.8 KB |
| commercial/building-tall-a.glb | building-skyscraper-a.glb | City Kit (Commercial) | 108.7 KB |
| commercial/building-tall-b.glb | building-skyscraper-d.glb | City Kit (Commercial) | 163.2 KB |
| commercial/building-wide-a.glb | low-detail-building-wide-b.glb | City Kit (Commercial) | 18.3 KB |
| commercial/building-thin-a.glb | low-detail-building-n.glb | City Kit (Commercial) | 5.8 KB |
| commercial/Textures/colormap.png | Textures/colormap.png | City Kit (Commercial) | 10.7 KB |
| roads/road-straight.glb | road-straight.glb | City Kit (Roads) | 5.1 KB |
| roads/road-crossroad.glb | road-crossroad.glb | City Kit (Roads) | 9.8 KB |
| roads/road-intersection.glb | road-intersection.glb | City Kit (Roads) | 7.7 KB |
| roads/sidewalk-straight.glb | road-side.glb | City Kit (Roads) | 5.1 KB |
| roads/Textures/colormap.png | Textures/colormap.png | City Kit (Roads) | 11.2 KB |
| cars/car-sedan.glb | sedan.glb | Car Kit | 168.2 KB |
| cars/car-hatchback.glb | hatchback-sports.glb | Car Kit | 193.2 KB |
| cars/car-van.glb | van.glb | Car Kit | 171.5 KB |
| cars/car-taxi.glb | taxi.glb | Car Kit | 171.5 KB |
| cars/car-police.glb | police.glb | Car Kit | 190.8 KB |
| cars/car-suv.glb | suv.glb | Car Kit | 202.7 KB |
| cars/Textures/colormap.png | Textures/colormap.png | Car Kit | 12.1 KB |

**Total: 23 arquivos (20 modelos + 3 colormaps), ~2.01 MB** (limite do plano:
12 MB — bem abaixo). *(Atualizado: 4 tiles do Roads Kit nunca referenciados
pelo layout — `road-intersection-t` (T), `road-curve`, `road-end` e
`sidewalk-corner` — foram removidos do manifesto e do repo; a malha viária
usa só reta + cruzamento + interseção em cruz + calçada reta.)*

## Manifest

Paths tipados expostos em `src/components/city/assets.ts` (`CITY_MODELS.buildings`,
`.roads`, `.cars`), já apontando para as subpastas por kit — path do JSON do
GLB (`Textures/colormap.png`) resolve relativo à localização de cada `.glb`.
Helper `preloadCityModels()` (chama `useGLTF.preload` em todos os paths).
