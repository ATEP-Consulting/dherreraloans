@AGENTS.md

# DherreraLoans

Web bilingüe (EN/ES) de captación de leads hipotecarios para David Herrera, loan originator en Miami (NMLS #1459301). Next.js 16 App Router · next-intl · Tailwind v4 · TS strict. Producción: https://dherreraloans.vercel.app (noindex hasta Fase 4).

## Fuentes de verdad (en este orden)

1. `docs/propuesta-dherreraloans.md` — alcance funcional contractual.
2. `docs/adr/` — 10 ADRs que gobiernan toda decisión técnica (0003 SEO/rendimiento y 0010 calidad/estilado son los críticos).
3. `design_handoff_home_fachada/` — fuente de verdad VISUAL (editorial impreso: Spectral + Instrument Sans, paper/navy, radius 0, bordes 1px, sin sombras). No inventar estética.
4. `docs/superpowers/specs/` y `docs/superpowers/plans/` — spec y plan de la fase en curso.
5. Contenido: basado en la estructura y flujos de https://aimsmtg.com/ (compañía licenciante) — misma base de secciones/temas, redacción propia, NUNCA copia literal; todo copy es borrador YMYL hasta validación del cliente.

## Reglas innegociables

- **Lighthouse ≥ 95 ×4** en cada PR (gate contractual en CI; los `skipAudits` de `lighthouserc.json` no se tocan hasta Fase 4).
- **Componentización total** (ADR-0010 + requisito del cliente): todo valor de estilo es un token `@theme` en `app/globals.css`; todo elemento repetido vive en `components/ui|layout/`. Cambiar un color = tocar UN token. Estilos ad hoc = defecto Important en review.
- **Todo texto visible en `messages/{en,es}.json`** (paridad testeada). Datos no-copy (NMLS, URLs, teléfono) en `lib/site.ts`.
- **Todas las páginas prerenderizadas** (`npm run check:static`); rutas desde `config/routes.mjs` (fuente única).
- **Todas las páginas abren con `PageHero`** (foto full-bleed + header integrado); contenido capado a 1440px centrado (`--container-max`), fondos a sangre; hero de home 100svh.
- Cero client components propios; interactividad CSS-only.
- Teléfono/email son placeholders obvios hasta recibir datos reales del cliente.

## Comandos

`npm run dev` · gate local completo: `npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e`

## Flujo

Rama feature → PR → checks verdes (quality + preview con Lighthouse) → squash merge. Commits `tipo: descripción` en español + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
