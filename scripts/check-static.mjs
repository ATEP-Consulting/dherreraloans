// Gate del ADR-0003 §1: toda página de contenido debe estar prerenderizada.
// Compara las rutas derivadas de config/routes.mjs con .next/prerender-manifest.json.
import { readFileSync } from 'node:fs';
import { locales, pathnames, programSlugs } from '../config/routes.mjs';

const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'));
const prerendered = new Set(Object.keys(manifest.routes));

const expected = [];
for (const locale of locales) {
  for (const [route, byLocale] of Object.entries(pathnames)) {
    if (route.includes('[')) continue;
    // Para rutas simples, el filesystem siempre usa nombres en inglés
    const fsRoute = byLocale['en'];
    expected.push(`/${locale}${fsRoute === '/' ? '' : fsRoute}`);
  }
  // Para programas: el base usa nombres en inglés, pero los slugs usan nombres localizados
  const base = pathnames['/loan-options/[program]']['en'].replace('/[program]', '');
  for (const slugs of Object.values(programSlugs)) {
    expected.push(`/${locale}${base}/${slugs[locale]}`);
  }
}

const missing = expected.filter((route) => !prerendered.has(route));
if (missing.length > 0) {
  console.error('❌ Rutas de contenido NO prerenderizadas (ADR-0003 §1):');
  for (const route of missing) console.error(`  - ${route}`);
  process.exit(1);
}
console.log(`✅ ${expected.length} rutas de contenido prerenderizadas.`);
