// Post-build: generate per-route HTML files with route-specific meta tags.
// The SPA bundle is identical across routes; only the static <head> meta
// differs, which is what social scrapers (WhatsApp/LinkedIn/etc.) read.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://portfolio-liroudev.vercel.app';
const DIST = 'dist';

const ROUTES = [
  {
    file: 'orcamento.html',
    path: '/orcamento',
    title: 'Solicitar orçamento | João Gabriel',
    description:
      'Conte seu projeto — site ou sistema — e receba uma proposta. Formulário rápido em poucos passos.',
  },
  {
    file: 'links.html',
    path: '/links',
    title: 'Links | João Gabriel',
    description: 'Portfólio e orçamento de João Gabriel, Desenvolvedor Full-Stack.',
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function applyMeta(html, route) {
  const url = BASE + route.path;
  const title = esc(route.title);
  const desc = esc(route.description);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
}

const indexHtml = readFileSync(join(DIST, 'index.html'), 'utf8');

for (const route of ROUTES) {
  const out = applyMeta(indexHtml, route);
  writeFileSync(join(DIST, route.file), out);
  console.log(`prerender-meta: ${route.file}  →  "${route.title}"`);
}
