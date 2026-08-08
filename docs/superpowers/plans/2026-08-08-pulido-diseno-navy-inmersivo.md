# Pulido de diseño «Navy inmersivo» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar todas las secciones del sitio (el hero queda intacto) hacia la dirección «Navy inmersivo» con motion escenográfico CSS-only, según `docs/superpowers/specs/2026-08-08-pulido-diseno-navy-inmersivo-design.md`.

**Architecture:** Estrategia «sistema primero» en 3 PRs + 1 opcional: (A) tokens + vocabulario de motion + componentes nuevos + home recompuesta; (B) interiores editoriales (índice de programas, 12 fichas, learn, about); (C) superficies funcionales re-tematizadas (calculadoras, quote, pre-qualify, contact, legales); (D, opcional y descartable) evaluación de View Transitions. Motion: CSS scroll-driven animations dentro de `@supports (animation-timeline: view())` + `template.tsx` para la entrada entre páginas. Cero client components nuevos, cero librerías nuevas.

**Tech Stack:** Next.js 16.3 App Router · next-intl 4 · Tailwind v4 (todo en `app/globals.css`, sin config) · Vitest · Playwright (proyecto único `mobile-chrome`).

## Global Constraints

- Lighthouse **≥ 0.95 ×4 categorías** en las 8 URLs del preview (CI `deploy-preview.yml`); `skipAudits` de `lighthouserc.json` NO se tocan.
- El **hero (`PageHero`) no se toca**: ni JSX, ni fuentes (`display:'optional'`, `preload:false` en `app/[locale]/layout.tsx:18-21` — tocar eso rompe el gate de perf, costó 6 iteraciones de CI).
- Motion **solo compositor**: `transform`, `opacity`, `clip-path`. Nada que dispare layout (cero CLS). La animación de entrada de página anima SOLO `transform` (nada de `opacity`: el h1/imagen del hero es el LCP y un fade lo retrasaría).
- Todo reveal vive dentro de `@supports (animation-timeline: view())` + `@media (prefers-reduced-motion: no-preference)` — Firefox y reduced-motion ven contenido estático, sin JS de respaldo.
- Cero client components nuevos; interactividad CSS-only (`:hover`, `:has()`, `<details>`).
- Todo color/curva/duración nuevos = token en `@theme` o var en `:root` de `app/globals.css` (ADR-0010). Estilos ad hoc = defecto Important.
- Todo texto visible nuevo en `messages/{en,es}.json` (paridad exigida por `tests/unit/i18n-parity.test.ts`: mismo set de claves, sin valores vacíos). Copy nuevo = borrador YMYL pendiente de David.
- Imágenes: descarga a `assets/img/` + import estático (`StaticImageData`), NUNCA hotlink. Cada imagen nueva ≤ 300 KB.
- Todas las páginas prerenderizadas: `npm run check:static` debe pasar; rutas solo desde `config/routes.mjs`.
- Commits `tipo: descripción` en español + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Flujo: rama → PR → checks verdes → squash merge.
- Gate local completo (para los cierres de PR): `npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e`.

---

## PR A — Sistema navy inmersivo + home (`redesign/sistema-navy`)

### Task 1: Tokens y vocabulario de motion en `globals.css`

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: tokens `--color-navy-deep`, `--color-paper-a15`, `--color-paper-a28`, `--ease-expo`, `--ease-curtain` (→ utilidades Tailwind `bg-navy-deep`, `border-paper-a15`, `border-paper-a28`, `ease-expo`); vars `:root` `--scrim-interlude`, `--glow-cta`; clases CSS `reveal-rise`, `reveal-mask`, `reveal-left`, `reveal-curtain`, `reveal-curtain-l`, `reveal-zoom`, `reveal-stagger`, `marquee`, `marquee-track`, `page-enter`. Todas las tasks posteriores dependen de esto.

- [ ] **Step 1: Añadir tokens al bloque `@theme`**

En `app/globals.css`, dentro del bloque `@theme` existente, tras `--color-paper-a85`:

```css
  --color-navy-deep: #0b2438; /* cierre de página: CTA+footer funden en oscuro */
  --color-paper-a15: rgb(247 245 240 / 0.15); /* bordes de fila sobre navy */
  --color-paper-a28: rgb(247 245 240 / 0.28); /* guía punteada sobre navy */

  /* Curvas de motion escenográfico (spec 2026-08-08) */
  --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-curtain: cubic-bezier(0.7, 0, 0.2, 1);
```

- [ ] **Step 2: Añadir vars de scrim/glow al `:root`**

Tras `--scrim-interior` en el `:root` existente:

```css
  --scrim-interlude: linear-gradient(10deg, rgb(11 36 56 / 0.78) 8%, rgb(11 36 56 / 0.25) 55%, rgb(11 36 56 / 0.15) 100%);
  --glow-cta: radial-gradient(720px 340px at 88% 0%, rgb(34 135 198 / 0.22), transparent 70%);
```

- [ ] **Step 3: Añadir el vocabulario de motion al final del fichero**

```css
/* ── Motion escenográfico (spec 2026-08-08) ──────────────────────────
   Solo compositor (transform/opacity/clip-path). Los reveals viven en
   @supports+@media: Firefox y reduced-motion ven contenido estático. */

@keyframes reveal-rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
@keyframes reveal-mask { from { clip-path: inset(0 0 100% 0); transform: translateY(16px); } to { clip-path: inset(0 0 -12% 0); transform: none; } }
@keyframes reveal-left { from { opacity: 0; transform: translateX(-34px); } to { opacity: 1; transform: none; } }
@keyframes reveal-curtain { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
@keyframes reveal-curtain-l { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0); } }
@keyframes reveal-zoom { from { transform: scale(1.16); } to { transform: scale(1); } }

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal-rise, .reveal-mask, .reveal-left, .reveal-curtain, .reveal-curtain-l, .reveal-zoom {
      animation-fill-mode: both;
      animation-timing-function: var(--ease-expo);
      animation-timeline: view();
      animation-range: entry 0% entry 40%;
    }
    .reveal-rise { animation-name: reveal-rise; }
    .reveal-mask { animation-name: reveal-mask; animation-range: entry 5% entry 45%; }
    .reveal-left { animation-name: reveal-left; }
    .reveal-curtain { animation-name: reveal-curtain; animation-timing-function: var(--ease-curtain); animation-range: entry 5% entry 55%; }
    .reveal-curtain-l { animation-name: reveal-curtain-l; animation-timing-function: var(--ease-curtain); animation-range: entry 5% entry 55%; }
    .reveal-zoom { animation-name: reveal-zoom; animation-range: entry 5% entry 75%; }

    /* Stagger: el contenedor lleva .reveal-stagger; cada hijo lleva su .reveal-* */
    .reveal-stagger > :nth-child(1) { animation-range: entry 0% entry 42%; }
    .reveal-stagger > :nth-child(2) { animation-range: entry 6% entry 48%; }
    .reveal-stagger > :nth-child(3) { animation-range: entry 12% entry 54%; }
    .reveal-stagger > :nth-child(4) { animation-range: entry 18% entry 60%; }
    .reveal-stagger > :nth-child(5) { animation-range: entry 24% entry 66%; }
    .reveal-stagger > :nth-child(6) { animation-range: entry 30% entry 72%; }
    .reveal-stagger > :nth-child(n + 7) { animation-range: entry 32% entry 74%; }
  }
}

/* ── Marquesina de ciudades ── */
@keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.marquee { overflow: hidden; }
.marquee-track { display: flex; width: max-content; animation: marquee-scroll 28s linear infinite; }
.marquee:hover .marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }

/* ── Entrada de página (template.tsx). SOLO transform: el hero es el LCP ── */
@keyframes page-enter { from { transform: translateY(12px); } to { transform: none; } }
@media (prefers-reduced-motion: no-preference) {
  .page-enter { animation: page-enter 0.55s var(--ease-expo); }
}
```

- [ ] **Step 4: Verificar que compila**

Run: `npm run build`
Expected: build verde (los tokens nuevos generan utilidades sin colisión).

- [ ] **Step 5: Commit**

```bash
git checkout -b redesign/sistema-navy
git add app/globals.css
git commit -m "feat: tokens navy-deep y vocabulario de motion escenográfico CSS-only

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 2: e2e inmunes al motion (`reducedMotion`)

**Files:**
- Modify: `playwright.config.ts`

Los reveals dejan contenido bajo el fold con `opacity: 0` hasta que se scrollea; sin esto, cualquier `toBeVisible()` sobre elementos no scrolleados fallaría en Chromium.

- [ ] **Step 1: Añadir `reducedMotion: 'reduce'` al bloque `use` de `playwright.config.ts`**

```ts
  use: {
    // ...lo existente (baseURL, etc.)...
    reducedMotion: 'reduce', // los reveals scroll-driven no deben condicionar los asserts
  },
```

(Si el config define `use` dentro del proyecto `mobile-chrome`, añadirlo al `use` global igualmente — Playwright los fusiona.)

- [ ] **Step 2: Verificar que la suite actual sigue verde**

Run: `npm run build && npm run test:e2e`
Expected: PASS (sin cambios de comportamiento aún).

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts
git commit -m "test: e2e con prefers-reduced-motion para independizarlos del motion

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 3: Fotografía stock → `assets/img`

**Files:**
- Create: `assets/img/interlude-miami.jpg`, `assets/img/interlude-skyline.jpg`, `assets/img/program-{fha,conventional,va,firstTimeHomebuyer,refinance,fixedRate,usda,jumbo,lowDownPayment,investment,cashOutRefinance,vaRefinance}.jpg` (14 ficheros)

**Interfaces:**
- Produces: imports estáticos `@/assets/img/interlude-miami.jpg`, `@/assets/img/program-<key>.jpg` usados por Tasks 6, 9, 12, 13, 14.

- [ ] **Step 1: Descargar los interludios (anchura 1600) y las 12 de programa (anchura 800)**

Licencia Unsplash (uso libre, sin atribución obligatoria). Ejecutar desde la raíz:

```bash
cd assets/img
curl -fL -o interlude-miami.jpg    "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=1600&q=70&fm=jpg"
curl -fL -o interlude-skyline.jpg  "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1600&q=70&fm=jpg"
curl -fL -o program-conventional.jpg      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=70&fm=jpg"
curl -fL -o program-fha.jpg               "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=70&fm=jpg"
curl -fL -o program-va.jpg                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=70&fm=jpg"
curl -fL -o program-firstTimeHomebuyer.jpg "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=70&fm=jpg"
curl -fL -o program-refinance.jpg         "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=70&fm=jpg"
curl -fL -o program-fixedRate.jpg         "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=70&fm=jpg"
curl -fL -o program-usda.jpg              "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=70&fm=jpg"
curl -fL -o program-jumbo.jpg             "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=70&fm=jpg"
curl -fL -o program-lowDownPayment.jpg    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=70&fm=jpg"
curl -fL -o program-investment.jpg        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=70&fm=jpg"
curl -fL -o program-cashOutRefinance.jpg  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=70&fm=jpg"
curl -fL -o program-vaRefinance.jpg       "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=70&fm=jpg"
```

Si alguna URL devuelve error (curl `-f` aborta), sustituirla por otra foto de Unsplash de arquitectura residencial/Miami buscada a mano y anotar el ID en el commit.

- [ ] **Step 2: Verificar formato y pesos**

Run: `file *.jpg | grep -v JPEG; find . -name '*.jpg' -size +300k`
Expected: salida vacía (todo JPEG y ≤ 300 KB). Si algo pesa más, rebajar `q=60`.

- [ ] **Step 3: Commit**

```bash
git add assets/img
git commit -m "feat: stock curado para secciones navy (2 interludios + 12 programas)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 4: Componente `Marquee` (ciudades)

**Files:**
- Create: `components/ui/marquee.tsx`
- Delete: `components/ui/cities-strip.tsx` (en Task 9, cuando la home deje de usarlo)
- Modify: `messages/en.json`, `messages/es.json` (namespace `home.cities`)

**Interfaces:**
- Produces: `Marquee({ lead, items }: { lead: string; items: string[] })` — server component. Task 9 lo consume con `t('cities.lead')` y `t.raw('cities.items') as string[]`.

- [ ] **Step 1: Reformar mensajes**

En `messages/en.json` y `messages/es.json`, dentro de `home.cities`: conservar `lead` tal cual; **sustituir la clave `list` por `items`**, un array cuyos elementos son las mismas ciudades que hoy contiene `list`, una por elemento y en el mismo orden (separar por el delimitador visual actual del string; idéntico proceso en ambos idiomas).

- [ ] **Step 2: Verificar paridad**

Run: `npm test -- i18n-parity`
Expected: PASS (misma clave nueva en ambos locales; `list` eliminada de ambos).

- [ ] **Step 3: Crear `components/ui/marquee.tsx`**

```tsx
import { Fragment } from 'react';

type Props = {
  lead: string;
  items: string[];
};

function Track({ lead, items, hidden }: Props & { hidden?: boolean }) {
  return (
    <span aria-hidden={hidden || undefined} className="flex items-baseline whitespace-nowrap pr-9">
      <span className="font-display text-[15px] italic text-body">{lead}</span>
      {items.map((city) => (
        <Fragment key={city}>
          <span aria-hidden className="mx-4 font-display italic text-leader">·</span>
          <span className="font-sans text-micro font-medium uppercase tracking-cities text-muted">{city}</span>
        </Fragment>
      ))}
    </span>
  );
}

export function Marquee(props: Props) {
  return (
    <div className="marquee border-b border-hairline py-[18px]">
      <div className="marquee-track">
        <Track {...props} />
        <Track {...props} hidden />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS (el componente aún no se usa; se integra en Task 9).

- [ ] **Step 5: Commit**

```bash
git add components/ui/marquee.tsx messages/en.json messages/es.json
git commit -m "feat: marquesina de ciudades (cities.list → cities.items)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 5: `IndexRow` tono navy + `ProgramsIndex` con preview

**Files:**
- Modify: `components/ui/index-row.tsx`
- Create: `components/ui/programs-index.tsx`
- Modify: `app/globals.css` (bloque `.pindex-*`)
- Modify: `lib/programs.ts`

**Interfaces:**
- Consumes: tokens de Task 1; imágenes de Task 3.
- Produces:
  - `IndexRow` gana prop opcional `tone?: 'paper' | 'navy'` (default `'paper'`, usos existentes intactos).
  - `FEATURED_PROGRAM_KEYS: readonly ['conventional', 'fha', 'va', 'jumbo', 'investment']` exportado desde `lib/programs.ts`.
  - `ProgramsIndex({ items, viewAll })` con `items: ProgramsIndexItem[]` donde `ProgramsIndexItem = { key: string; number?: string; name: string; stat: string; description?: string; image: StaticImageData; href: { pathname: '/loan-options/[program]'; params: { program: string } } }` y `viewAll?: { label: string }` (enlaza a `/loan-options`). Consumido por Task 9 (home, 5 destacados) y Task 12 (índice completo, 12).

- [ ] **Step 1: Variante navy en `IndexRow`**

Sustituir el cuerpo de `components/ui/index-row.tsx` por:

```tsx
import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type Props = {
  number?: string; // "No. 1" — oculto < lg
  name: string;
  stat: string;
  href: { pathname: string; params: Record<string, string> };
  tone?: 'paper' | 'navy';
  className?: string; // p. ej. reveal-left — se concatena al Link
  children?: ReactNode; // descripción opcional (Loan Options)
};

const tones = {
  paper: {
    row: 'border-hairline',
    number: 'text-leader',
    name: 'text-ink group-hover:text-azure',
    fill: 'border-leader',
    stat: 'text-navy',
    desc: 'text-muted',
  },
  navy: {
    row: 'border-paper-a15 transition-[padding] duration-300 hover:pl-3',
    number: 'text-azure-soft',
    name: 'text-paper group-hover:underline group-hover:decoration-azure-soft group-hover:decoration-1 group-hover:underline-offset-[5px]',
    fill: 'border-paper-a28',
    stat: 'text-azure-light',
    desc: 'text-paper-a75',
  },
} as const;

export function IndexRow({ number, name, stat, href, tone = 'paper', className = '', children }: Props) {
  const c = tones[tone];
  return (
    <Link
      href={href as never}
      className={`group flex flex-wrap items-baseline border-b py-4 lg:py-[21px] ${c.row} ${className}`}
    >
      {number ? (
        <span className={`hidden w-14 shrink-0 font-display text-[22px] font-extralight lg:inline ${c.number}`}>{number}</span>
      ) : null}
      <span className={`font-display text-index font-light ${c.name}`}>{name}</span>
      <span aria-hidden className={`mx-3 flex-1 -translate-y-1 border-b border-dotted lg:mx-4 ${c.fill}`} />
      <span className={`font-sans text-[12.5px] font-medium tracking-[.04em] lg:text-sm ${c.stat}`}>{stat}</span>
      {children ? <span className={`mt-1 w-full pl-0 font-sans text-sm lg:pl-14 ${c.desc}`}>{children}</span> : null}
    </Link>
  );
}
```

Nota: el numeral pasa de sans 13px a **Spectral extralight 22px** en ambos tonos (decisión del mockup aprobado).

- [ ] **Step 2: Añadir `FEATURED_PROGRAM_KEYS` a `lib/programs.ts`**

```ts
/** Programas destacados en la home (mockup aprobado 2026-08-08), en este orden. */
export const FEATURED_PROGRAM_KEYS = ['conventional', 'fha', 'va', 'jumbo', 'investment'] as const;
```

- [ ] **Step 3: CSS del preview en `globals.css`** (tras el bloque de marquee)

```css
/* ── ProgramsIndex: panel de preview fotográfica (CSS-only via :has) ── */
.pindex-preview { display: none; }
@media (min-width: 61.25rem) {
  .pindex-preview { display: block; position: sticky; top: 24px; overflow: hidden; }
  .pindex-preview > * { position: absolute; inset: 0; opacity: 0; transition: opacity 0.5s ease; }
  .pindex-preview > :first-child { position: relative; opacity: 1; }
  .pindex-rows:has(> a:nth-child(1):hover) ~ .pindex-preview > :nth-child(1),
  .pindex-rows:has(> a:nth-child(2):hover) ~ .pindex-preview > :nth-child(2),
  .pindex-rows:has(> a:nth-child(3):hover) ~ .pindex-preview > :nth-child(3),
  .pindex-rows:has(> a:nth-child(4):hover) ~ .pindex-preview > :nth-child(4),
  .pindex-rows:has(> a:nth-child(5):hover) ~ .pindex-preview > :nth-child(5),
  .pindex-rows:has(> a:nth-child(6):hover) ~ .pindex-preview > :nth-child(6),
  .pindex-rows:has(> a:nth-child(7):hover) ~ .pindex-preview > :nth-child(7),
  .pindex-rows:has(> a:nth-child(8):hover) ~ .pindex-preview > :nth-child(8),
  .pindex-rows:has(> a:nth-child(9):hover) ~ .pindex-preview > :nth-child(9),
  .pindex-rows:has(> a:nth-child(10):hover) ~ .pindex-preview > :nth-child(10),
  .pindex-rows:has(> a:nth-child(11):hover) ~ .pindex-preview > :nth-child(11),
  .pindex-rows:has(> a:nth-child(12):hover) ~ .pindex-preview > :nth-child(12) { opacity: 1; }
}
```

- [ ] **Step 4: Crear `components/ui/programs-index.tsx`**

```tsx
import Image, { type StaticImageData } from 'next/image';
import { Link } from '@/i18n/routing';
import { IndexRow } from '@/components/ui/index-row';

export type ProgramsIndexItem = {
  key: string;
  number?: string;
  name: string;
  stat: string;
  description?: string;
  image: StaticImageData;
  href: { pathname: '/loan-options/[program]'; params: { program: string } };
};

type Props = {
  items: ProgramsIndexItem[];
  viewAll?: { label: string };
};

export function ProgramsIndex({ items, viewAll }: Props) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px] lg:gap-16">
      <div>
        {/* Filas como hijas DIRECTAS de .pindex-rows: el :has(> a:hover) del preview depende de ello */}
        <div className="pindex-rows reveal-stagger flex flex-col">
          {items.map((item) => (
            <IndexRow key={item.key} tone="navy" className="reveal-left" number={item.number} name={item.name} stat={item.stat} href={item.href}>
              {item.description}
            </IndexRow>
          ))}
        </div>
        {viewAll ? (
          <Link
            href="/loan-options"
            className="mt-7 inline-block border-b border-azure-soft pb-1 font-sans text-btn font-semibold uppercase tracking-button text-azure-light"
          >
            {viewAll.label}
          </Link>
        ) : null}
      </div>
      <div aria-hidden className="pindex-preview reveal-curtain-l h-[340px]">
        {items.map((item) => (
          <div key={item.key} className="relative">
            <Image src={item.image} alt="" fill sizes="300px" className="object-cover" />
            <div className="absolute inset-0 bg-navy/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/ui/index-row.tsx components/ui/programs-index.tsx lib/programs.ts app/globals.css
git commit -m "feat: IndexRow tono navy y ProgramsIndex con preview fotográfica CSS-only

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 6: Componente `Interlude`

**Files:**
- Create: `components/ui/interlude.tsx`

**Interfaces:**
- Consumes: `--scrim-interlude` (Task 1), imágenes (Task 3).
- Produces: `Interlude({ image, alt, quote?, cite? }: { image: StaticImageData; alt: string; quote?: string; cite?: string })`. Consumido por Tasks 9 (home), 14 (learn/about).

- [ ] **Step 1: Crear `components/ui/interlude.tsx`**

```tsx
import Image, { type StaticImageData } from 'next/image';
import { Container } from '@/components/ui/container';

type Props = {
  image: StaticImageData;
  alt: string;
  quote?: string;
  cite?: string;
};

export function Interlude({ image, alt, quote, cite }: Props) {
  return (
    <figure className="relative overflow-hidden bg-navy-deep">
      <div className="reveal-curtain relative h-[300px] lg:h-[420px]">
        <Image src={image} alt={alt} fill sizes="100vw" className="reveal-zoom object-cover" />
        <div aria-hidden className="absolute inset-0 [background:var(--scrim-interlude)]" />
      </div>
      {quote ? (
        <figcaption className="absolute inset-x-0 bottom-0">
          <Container className="reveal-rise flex flex-col gap-3 px-5 pb-9 lg:px-[72px] lg:pb-12">
            <blockquote className="max-w-[560px] font-display text-[22px] font-light italic leading-[1.4] text-paper lg:text-[26px]">
              {quote}
            </blockquote>
            {cite ? (
              <cite className="font-sans text-micro font-medium uppercase not-italic tracking-label text-azure-light">{cite}</cite>
            ) : null}
          </Container>
        </figcaption>
      ) : null}
    </figure>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit` → PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ui/interlude.tsx
git commit -m "feat: Interlude — foto-cortina a sangre con cita opcional

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 7: Evoluciones — `ActionCards`, `CtaBand`, `Band`, `SiteFooter`

**Files:**
- Modify: `components/ui/action-cards.tsx`, `components/ui/cta-band.tsx`, `components/ui/band.tsx`, `components/layout/site-footer.tsx`

**Interfaces:**
- Produces: `Band` gana tono `'navyDeep'` y prop `glow?: boolean` (solo efecto en tonos navy). API de `ActionCards`/`CtaBand` sin cambios. Footer pasa a navy-deep en TODO el sitio desde este commit (decisión aceptada: convive unos commits con secciones aún claras).

- [ ] **Step 1: `Band` — tono navyDeep + glow**

```tsx
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';

type Props = {
  tone: 'sand' | 'navy' | 'navyDeep';
  glow?: boolean; // brillo radial azure (solo se nota sobre navy)
  children: ReactNode;
};

const tones = {
  sand: 'bg-sand border-y border-ink py-8 lg:py-16',
  navy: 'bg-navy py-12 lg:py-[84px]',
  navyDeep: 'bg-navy-deep py-12 lg:py-[84px]',
};

export function Band({ tone, glow, children }: Props) {
  return (
    <div className={`relative overflow-hidden ${tones[tone]}`}>
      {glow ? <div aria-hidden className="absolute inset-0 [background:var(--glow-cta)]" /> : null}
      <Container className="relative px-5 lg:px-[72px]">{children}</Container>
    </div>
  );
}
```

- [ ] **Step 2: `CtaBand` — glow + título con máscara**

En `components/ui/cta-band.tsx`: `<Band tone="navy">` → `<Band tone="navy" glow>`; al `h2` añadirle la clase `reveal-mask` y al contenedor del botón `reveal-rise`:

```tsx
    <Band tone="navy" glow>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="reveal-mask max-w-[760px] font-display text-h2 font-light text-paper [text-wrap:pretty] [&_em]:italic">
          {t.rich('home.ctaBand.title', em)}
        </h2>
        {ctas ?? (
          <span className="reveal-rise shrink-0">
            <Button href="/quote" variant="paper" size="lg">
              {tc('cta.quote')}
            </Button>
          </span>
        )}
      </div>
    </Band>
```

- [ ] **Step 3: `ActionCards` — inversión navy al hover + flecha**

Sustituir el `inner` y el grid por:

```tsx
    <section>
      <Container className="reveal-stagger grid gap-px border-y border-hairline bg-hairline px-0 lg:grid-cols-3">
        {CARDS.map(({ key, href, external }) => {
          const inner = (
            <span className="relative flex h-full flex-col gap-3 overflow-hidden bg-paper px-5 py-8 transition-colors duration-500 ease-expo group-hover:bg-navy lg:px-8 lg:py-10">
              <span className="font-sans text-micro font-medium uppercase tracking-label text-muted transition-colors duration-500 group-hover:text-azure-light">{t(`${key}.eyebrow`)}</span>
              <span className="font-display text-h3 font-light text-ink transition-colors duration-500 group-hover:text-paper">{t(`${key}.title`)}</span>
              <span className="max-w-[38ch] font-sans text-sm text-body transition-colors duration-500 group-hover:text-paper-a75">{t(`${key}.body`)}</span>
              <span aria-hidden className="absolute bottom-5 right-6 font-display text-[22px] text-leader transition-[color,transform] duration-500 group-hover:translate-x-1.5 group-hover:text-azure-light">→</span>
            </span>
          );
          return external ? (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="group reveal-rise">
              {inner}
            </a>
          ) : (
            <Link key={key} href={href} className="group reveal-rise">
              {inner}
            </Link>
          );
        })}
      </Container>
    </section>
```

- [ ] **Step 4: `SiteFooter` — navy profundo**

En `components/layout/site-footer.tsx`, re-tematizar (la estructura no cambia):
- wrapper raíz: fondo → `bg-navy-deep`, borde superior → `border-t border-paper-a15`, texto base → `text-paper-a75`;
- logo: usar `logo-light.png` (import ya existente en el repo para el header) en lugar del `logo.png` oscuro;
- títulos de columna → `text-paper`; links → `text-paper-a75 hover:text-paper` (si usan `TextLink`, pasar `tone="paper"`);
- disclaimer y copyright → `text-paper-a55`;
- `EhoMark` y cualquier SVG heredan `currentColor` — verificar que se ven sobre oscuro.

- [ ] **Step 5: Verificación visual + tipos**

Run: `npx tsc --noEmit && npm run dev` — abrir `http://localhost:3000/en`, comprobar footer oscuro, hover de ActionCards, glow del CTA.

- [ ] **Step 6: Commit**

```bash
git add components/ui/action-cards.tsx components/ui/cta-band.tsx components/ui/band.tsx components/layout/site-footer.tsx
git commit -m "feat: cierre oscuro — ActionCards con inversión navy, CtaBand con glow, footer navy-deep

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 8: Mensajes nuevos de la home (EN/ES)

**Files:**
- Modify: `messages/en.json`, `messages/es.json`

**Interfaces:**
- Produces: claves `home.programsIndex.viewAll`, `home.interlude.{quote, cite, imageAlt}`. Consumidas por Task 9. (Copy borrador YMYL.)

- [ ] **Step 1: Añadir claves en `messages/en.json`**

En `home.programsIndex`: `"viewAll": "See all 12 programs"`.
Nuevo objeto `home.interlude`:

```json
"interlude": {
  "quote": "“A mortgage isn’t paperwork — it’s the financial architecture of your home.”",
  "cite": "David Herrera · NMLS #1459301",
  "imageAlt": "Aerial view of Miami’s residential coastline"
}
```

- [ ] **Step 2: Añadir claves en `messages/es.json`**

En `home.programsIndex`: `"viewAll": "Ver los 12 programas"`.

```json
"interlude": {
  "quote": "«Una hipoteca no es un trámite: es la arquitectura financiera de tu casa.»",
  "cite": "David Herrera · NMLS #1459301",
  "imageAlt": "Vista aérea de la costa residencial de Miami"
}
```

- [ ] **Step 3: Verificar paridad**

Run: `npm test -- i18n-parity` → PASS.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/es.json
git commit -m "feat: copy borrador del interludio y enlace al índice completo (EN/ES)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 9: Recomposición de la home

**Files:**
- Modify: `app/[locale]/page.tsx`
- Delete: `components/ui/cities-strip.tsx`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: todo lo anterior (Tasks 1-8).
- Produces: home con las 9 secciones del mockup aprobado. El bloque del índice pasa de 12 filas a **5 destacados + viewAll**.

- [ ] **Step 1: Actualizar el e2e ANTES de tocar la página (test primero)**

En `tests/e2e/home.spec.ts`, localizar el test que verifica las filas del índice de programas y sustituir su cuerpo para esperar los 5 destacados + enlace:

```ts
test('índice de la home: 5 destacados y enlace al índice completo', async ({ page }) => {
  await page.goto('/en');
  for (const key of ['conventional', 'fha', 'va', 'jumbo', 'investment'] as const) {
    await expect(page.getByRole('link', { name: new RegExp(en.programs[key].indexName) })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: en.home.programsIndex.viewAll })).toBeVisible();
});
```

(Usar el import de `messages/en.json` ya presente en el spec. Si otros asserts del fichero cuentan 12 filas o usan `home.cities.list`, actualizarlos aquí también: la marquesina duplica el texto de ciudades con `aria-hidden`, así que cualquier `getByText` de ciudades debe usar `.first()`.)

- [ ] **Step 2: Verificar que falla**

Run: `npm run build && npm run test:e2e -- home`
Expected: FAIL (la home aún muestra 12 filas y no existe viewAll).

- [ ] **Step 3: Recomponer `app/[locale]/page.tsx`**

Imports: quitar `CitiesStrip`, `IndexRow`; añadir:

```tsx
import interludeMiami from '@/assets/img/interlude-miami.jpg';
import programConventional from '@/assets/img/program-conventional.jpg';
import programFha from '@/assets/img/program-fha.jpg';
import programVa from '@/assets/img/program-va.jpg';
import programJumbo from '@/assets/img/program-jumbo.jpg';
import programInvestment from '@/assets/img/program-investment.jpg';
import { Marquee } from '@/components/ui/marquee';
import { Interlude } from '@/components/ui/interlude';
import { ProgramsIndex, type ProgramsIndexItem } from '@/components/ui/programs-index';
import { FEATURED_PROGRAM_KEYS, slugFor } from '@/lib/programs';
```

Dentro del componente, construir los items:

```tsx
  const featuredImages = {
    conventional: programConventional,
    fha: programFha,
    va: programVa,
    jumbo: programJumbo,
    investment: programInvestment,
  } as const;
  const featured: ProgramsIndexItem[] = FEATURED_PROGRAM_KEYS.map((key, i) => ({
    key,
    number: t('programsIndex.rowLabel', { number: i + 1 }),
    name: tp(`${key}.indexName`),
    stat: tp(`${key}.stat`),
    image: featuredImages[key],
    href: { pathname: '/loan-options/[program]', params: { program: slugFor(locale, key) } },
  }));
```

Y sustituir el JSX desde `<CitiesStrip …/>` hasta `<ActionCards />` (este incluido, que no cambia de posición) por:

```tsx
      <Marquee lead={t('cities.lead')} items={t.raw('cities.items') as string[]} />
      <section id="quiz">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-16">
          <div className="reveal-rise">
            <SectionHeading eyebrow={t('tellUs.eyebrow')} title={t('tellUs.title')} helper={t('tellUs.helper')} />
          </div>
          <QuizDeferred locale={locale} texts={quizTexts} thanksCtas={<QuizThanksCtas />} />
        </Container>
      </section>
      <Band tone="navy">
        <div className="flex flex-col gap-8">
          <div className="reveal-rise">
            <SectionHeading tone="navy" eyebrow={t('programsIndex.eyebrow')} title={t('programsIndex.title')} helper={t('programsIndex.helper')} />
          </div>
          <ProgramsIndex items={featured} viewAll={{ label: t('programsIndex.viewAll') }} />
        </div>
      </Band>
      <Interlude image={interludeMiami} alt={t('interlude.imageAlt')} quote={t('interlude.quote')} cite={t('interlude.cite')} />
      <Band tone="sand">
        <div className="grid items-center gap-6 lg:grid-cols-[400px_1fr] lg:gap-16">
          <div className="reveal-curtain-l">
            <PhotoPlate image={davidImg} alt={t('about.photoAlt')} caption={t('about.caption')} />
          </div>
          <div className="reveal-rise flex flex-col gap-4 lg:gap-5">
            <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
            <p className="max-w-[620px] font-sans text-base leading-[1.7] text-body">{t('about.body')}</p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
              <Button href="/quote" variant="navy">{tc('cta.quote')}</Button>
              <TextLink href={INSTAGRAM_URL} external>{tc('footer.instagram')}</TextLink>
            </div>
          </div>
        </div>
      </Band>
      <ActionCards />
```

`SectionHeading` necesita para esto una prop `tone?: 'paper' | 'navy'` (título `text-ink` → `text-paper`, helper `text-muted` → `text-paper-a75`, eyebrow pasa `tone="azure-light"` cuando navy). Añadirla en `components/ui/section-heading.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';

type Props = {
  eyebrow: ReactNode;
  title: ReactNode;
  helper?: ReactNode;
  tone?: 'paper' | 'navy';
};

export function SectionHeading({ eyebrow, title, helper, tone = 'paper' }: Props) {
  const navy = tone === 'navy';
  return (
    <div className="flex flex-col gap-3">
      <Eyebrow tone={navy ? 'azure-light' : 'muted'}>{eyebrow}</Eyebrow>
      <h2 className={`font-display text-h2 font-light [&_em]:italic ${navy ? 'text-paper' : 'text-ink'}`}>{title}</h2>
      {helper ? <p className={`mt-1.5 font-sans text-sm ${navy ? 'text-paper-a75' : 'text-muted'}`}>{helper}</p> : null}
    </div>
  );
}
```

(Verificar que el valor por defecto de `Eyebrow` hoy es `muted`; si su prop se llama distinto, adaptar aquí, no allí.)

- [ ] **Step 4: Borrar `components/ui/cities-strip.tsx`** (`git rm components/ui/cities-strip.tsx`).

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e`
Expected: todo PASS, incluido el e2e del Step 1 ahora en verde.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: home navy inmersivo — marquesina, índice navy con preview, interludio y cierre oscuro

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 10: Entrada de página (`template.tsx` ×2)

**Files:**
- Create: `app/[locale]/template.tsx`, `app/[locale]/loan-options/template.tsx`

**Interfaces:**
- Consumes: clase `page-enter` (Task 1).
- Nota semántica (doc Next 16 `template.md`): un template se remonta cuando cambia el segmento hijo de SU nivel. `app/[locale]/template.tsx` cubre todas las navegaciones entre páginas top-level (y el cambio de idioma); NO cubre programa→programa, de ahí el segundo template en `loan-options/`.

- [ ] **Step 1: Crear ambos ficheros (contenido idéntico)**

```tsx
import type { ReactNode } from 'react';

// Se remonta en cada navegación de su nivel → re-dispara .page-enter (solo transform: LCP-safe).
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit && npm run build && npm run check:static`
Expected: PASS; `check:static` sigue viendo todas las rutas prerenderizadas.

- [ ] **Step 3: Verificación manual** — `npm run dev`, navegar home → contact → programa → otro programa; la entrada se percibe en todas.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/template.tsx app/[locale]/loan-options/template.tsx
git commit -m "feat: transición de entrada entre páginas vía template.tsx (CSS puro)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

### Task 11: Gate completo + PR A

- [ ] **Step 1: Gate local completo**

Run: `npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e`
Expected: todo verde. Arreglar lo que falle antes de seguir.

- [ ] **Step 2: Push + PR**

```bash
git push -u origin redesign/sistema-navy
gh pr create --title "Rediseño · PR A: sistema navy inmersivo + home" --body "$(cat <<'EOF'
Spec: docs/superpowers/specs/2026-08-08-pulido-diseno-navy-inmersivo-design.md

- Tokens navy-deep + vocabulario de motion escenográfico (CSS scroll-driven, @supports + reduced-motion)
- Marquee, ProgramsIndex (preview :has()), Interlude; ActionCards/CtaBand/Band/SiteFooter evolucionados
- Home recompuesta (9 secciones del mockup aprobado); template.tsx de entrada de página
- e2e con reducedMotion; stock curado en assets/img

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Esperar checks (quality + Lighthouse preview)**

Run: `gh pr checks --watch`
Expected: verdes. Si Lighthouse baja de 0.95: primero mirar QUÉ auditoría cae en el reporte enlazado; los sospechosos por orden son (1) peso de imágenes nuevas → rebajar `q=`, (2) contraste sobre navy → subir alpha del texto afectado, (3) TBT en `/en`/`/es` → comprobar que no se añadió ningún client component. NO tocar fuentes ni `skipAudits`.

- [ ] **Step 4: Squash merge**

```bash
gh pr merge --squash --delete-branch
git checkout main && git pull
```

---

## PR B — Interiores editoriales (`redesign/interiores-editoriales`)

### Task 12: `/loan-options` con índice completo

**Files:**
- Modify: `app/[locale]/loan-options/page.tsx`

**Interfaces:**
- Consumes: `ProgramsIndex` (los 12, con `description` y sin `viewAll`), imágenes `program-*.jpg`, `Band tone="navy"`, `SectionHeading tone="navy"`.

- [ ] **Step 1: Rama nueva** — `git checkout -b redesign/interiores-editoriales`

- [ ] **Step 2: Recomponer la página**

Tras el `PageHero`, la sección del lede se mantiene en paper; el bloque de las 12 `IndexRow` se sustituye por una `Band tone="navy"` con `ProgramsIndex`. Construcción de items (los 12, en el orden actual de la página):

```tsx
  const programImages = {
    fha: programFha, conventional: programConventional, va: programVa,
    firstTimeHomebuyer: programFirstTime, refinance: programRefinance, fixedRate: programFixedRate,
    usda: programUsda, jumbo: programJumbo, lowDownPayment: programLowDown,
    investment: programInvestment, cashOutRefinance: programCashOut, vaRefinance: programVaRefi,
  } as const;
  const items: ProgramsIndexItem[] = programKeys.map((key, i) => ({
    key,
    number: t('rowLabel', { number: i + 1 }), // usar la clave de rowLabel que la página ya consuma hoy
    name: tp(`${key}.indexName`),
    stat: tp(`${key}.stat`),
    description: tp(`${key}.indexDescription`), // usar la clave de descripción que la página ya pase hoy como children
    image: programImages[key],
    href: { pathname: '/loan-options/[program]', params: { program: slugFor(locale, key) } },
  }));
```

(Los 12 imports de imagen como en Task 9. Las claves exactas de `rowLabel`/descripción se copian de cómo la página las usa HOY — no inventar nombres nuevos.)

```tsx
      <Band tone="navy">
        <div className="flex flex-col gap-8">
          <ProgramsIndex items={items} />
        </div>
      </Band>
```

- [ ] **Step 3: Verificar** — `npx tsc --noEmit && npm run build && npm run test:e2e -- smoke` → PASS.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: índice de programas completo en navy con preview` + trailer.

### Task 13: Fichas de programa — `ProgramStats` + relacionados

**Files:**
- Create: `components/ui/program-stats.tsx`
- Modify: `app/[locale]/loan-options/[program]/page.tsx`, `messages/en.json`, `messages/es.json` (namespace `common`)

**Interfaces:**
- Produces: `ProgramStats({ eyebrow, stat, items }: { eyebrow: string; stat: string; items: string[] })`; claves `common.programStats.eyebrow` y `common.related.title`.

- [ ] **Step 1: Mensajes** — en `common` de ambos locales:

EN: `"programStats": { "eyebrow": "Key facts" }`, `"related": { "title": "Other programs to consider" }`
ES: `"programStats": { "eyebrow": "Datos clave" }`, `"related": { "title": "Otros programas a considerar" }`

Run: `npm test -- i18n-parity` → PASS.

- [ ] **Step 2: Crear `components/ui/program-stats.tsx`**

```tsx
import { Band } from '@/components/ui/band';
import { Eyebrow } from '@/components/ui/eyebrow';

type Props = {
  eyebrow: string;
  stat: string;
  items: string[];
};

export function ProgramStats({ eyebrow, stat, items }: Props) {
  return (
    <Band tone="navy">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="reveal-rise flex flex-col gap-3">
          <Eyebrow tone="azure-light">{eyebrow}</Eyebrow>
          <p className="reveal-mask font-display text-h2 font-light text-paper">{stat}</p>
        </div>
        <ul className="reveal-stagger flex flex-col">
          {items.map((item) => (
            <li key={item} className="reveal-left border-b border-paper-a15 py-3.5 font-sans text-sm leading-relaxed text-paper-a85">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
```

- [ ] **Step 3: Integrar en la ficha**

En `app/[locale]/loan-options/[program]/page.tsx`:
- Tras el breadcrumb, insertar `<ProgramStats eyebrow={tc('programStats.eyebrow')} stat={tp('stat')} items={(tp.raw('required.items') as string[]).slice(0, 3)} />` (adaptar los nombres `tc/tp` a los del fichero; `required.items` es la lista que la sección `required` ya pinta — aquí solo se ADELANTAN las 3 primeras como datos clave, la sección `required` completa se conserva).
- Añadir `reveal-rise` al wrapper de cada `SectionHeading` de las secciones `whatIs`/`required`/`how` y `reveal-stagger`/`reveal-left` al `<ul>` de `how`.
- Antes del `CtaBand`, bloque de relacionados (3 siguientes en el orden de `programKeys`, excluyendo el actual):

```tsx
      <Band tone="navy">
        <div className="flex flex-col gap-6">
          <h2 className="reveal-rise font-display text-h3 font-light text-paper">{tc('related.title')}</h2>
          <div className="reveal-stagger flex flex-col">
            {relatedKeys.map((k, i) => (
              <IndexRow key={k} tone="navy" className="reveal-left" name={tp2(`${k}.indexName`)} stat={tp2(`${k}.stat`)}
                href={{ pathname: '/loan-options/[program]', params: { program: slugFor(locale, k) } }} />
            ))}
          </div>
        </div>
      </Band>
```

con `const relatedKeys = programKeys.filter((k) => k !== programKey).slice(0, 3);` y `tp2 = await getTranslations('programs')`.

- [ ] **Step 4: Verificar** — `npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e -- smoke` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: fichas de programa — banda navy de datos clave y programas relacionados"` + trailer.

### Task 14: `learn`, `about`, 404s + PR B

**Files:**
- Modify: `app/[locale]/learn/page.tsx`, `app/[locale]/about/page.tsx`, `app/global-not-found.tsx` (solo verificación)

- [ ] **Step 1: `learn`** — añadir `reveal-rise` al wrapper del `SectionHeading` de cada item; tras el último item e inmediatamente antes del `CtaBand`, insertar `<Interlude image={interludeSkyline} alt={t('interludeAlt')} />` — nueva clave `learn.interludeAlt` en ambos locales (EN: `"Miami skyline at dusk"` / ES: `"El horizonte de Miami al atardecer"`); import de `interlude-skyline.jpg`.

- [ ] **Step 2: `about`** — `reveal-curtain-l` en el wrapper del `PhotoPlate`, `reveal-rise` en los `SectionHeading`/bloques de texto de `values`/`license`/`reach`; tras `license` insertar `<Interlude image={interludeMiami} alt={ta('interludeAlt')} />` — nueva clave `about.interludeAlt` (EN: `"Residential Miami from above"` / ES: `"El Miami residencial desde el aire"`).

- [ ] **Step 3: Paridad** — `npm test -- i18n-parity` → PASS.

- [ ] **Step 4: `global-not-found.tsx`** — verificación: sus clases copiadas del hero no cambian (el hero no se ha tocado). Único cambio: si referencia el footer claro… no lo hace (no monta SiteFooter). No tocar.

- [ ] **Step 5: Gate completo + PR B**

Run: gate local completo. Después:

```bash
git push -u origin redesign/interiores-editoriales
gh pr create --title "Rediseño · PR B: interiores editoriales" --body "$(cat <<'EOF'
Spec: docs/superpowers/specs/2026-08-08-pulido-diseno-navy-inmersivo-design.md

- /loan-options: índice completo navy con preview fotográfica
- Fichas de programa: ProgramStats + relacionados en navy + reveals
- learn/about: reveals + interludios fotográficos

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
gh pr checks --watch
gh pr merge --squash --delete-branch
git checkout main && git pull
```

---

## PR C — Superficies funcionales (`redesign/superficies-funcionales`)

### Task 15: Re-tema de calculadoras, conversión y legales + PR C

**Files:**
- Modify: `app/[locale]/calculator/page.tsx`, `app/[locale]/quote/page.tsx`, `app/[locale]/pre-qualify/page.tsx`, `app/[locale]/contact/page.tsx`, `app/[locale]/privacy/page.tsx`, `app/[locale]/accessibility/page.tsx`

Motion CONTENIDO aquí (spec §2): solo `reveal-rise` en cabeceras de sección; nada de máscaras/cortinas; los formularios y tabs no llevan reveal (nunca ocultar controles).

- [ ] **Step 1: Rama** — `git checkout -b redesign/superficies-funcionales`

- [ ] **Step 2: `calculator`** — `reveal-rise` en el wrapper del `SectionHeading` de `explain` y en el heading de `calc.sectionTitle`. El `CalcTabs` NO se toca (client, funcional). El `CtaBand` del cierre ya hereda el glow del PR A.

- [ ] **Step 3: `quote`** — sin reveals (el quiz es above-the-fold y es la tarea). Verificar visualmente que el cierre oscuro del footer no rompe nada.

- [ ] **Step 4: `pre-qualify` y `contact`** — `reveal-rise` en los wrappers de `SectionHeading` de las secciones de texto (`why`/`credit`/`quizLead` y las tarjetas de contacto). Las tarjetas `plateClass` de contact se conservan (plate sobre paper ya es el patrón aprobado del quiz de home).

- [ ] **Step 5: `privacy` / `accessibility`** — sin reveals (legal, lectura). Ningún cambio estructural: solo verificar que heredan footer/CTA oscuros correctamente.

- [ ] **Step 6: Gate completo + PR C**

Run: gate local completo. Después `git push -u origin redesign/superficies-funcionales`, `gh pr create --title "Rediseño · PR C: superficies funcionales re-tematizadas"` (body análogo con referencia al spec + trailer 🤖), `gh pr checks --watch`, `gh pr merge --squash --delete-branch`, `git checkout main && git pull`.

---

## PR D (OPCIONAL, descartable) — Evaluación View Transitions

### Task 16: Spike `ViewTransition`

**Files:**
- Create: `types/react-experimental.d.ts`, rama `spike/view-transitions`

Contexto verificado: Next 16 soporta View Transitions en App Router **sin flag**; la API es de React (`ViewTransition`), presente en el React vendorizado de Next pero **no exportada ni tipada** por `react@19.2.8` estable → sin shim, `tsc --noEmit` rompe.

- [ ] **Step 1: Leer la guía oficial** — `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` entera antes de escribir código; seguir sus imports/props EXACTOS (no los de blogs).

- [ ] **Step 2: Shim de tipos mínimo** (ajustar el nombre del export al que indique la guía):

```ts
// types/react-experimental.d.ts — SOLO mientras react estable no exporte ViewTransition
import 'react';
declare module 'react' {
  export function ViewTransition(props: {
    children?: React.ReactNode;
    name?: string;
    enter?: string;
    exit?: string;
    default?: string;
  }): React.ReactNode;
}
```

- [ ] **Step 3: Aplicar al `<main>` del layout** según la guía + CSS de la transición (cross-fade 300ms `var(--ease-expo)`, `@media (prefers-reduced-motion: reduce)` lo anula, `::view-transition { pointer-events: none }`).

- [ ] **Step 4: Verificar runtime real** — `npm run build && npm run start` y navegar: si `ViewTransition` es `undefined` en runtime (React estable local vs vendorizado), el spike FALLA → documentar y abandonar.

- [ ] **Step 5: Gate + decisión** — gate local completo + PR de preview para medir Lighthouse. Criterio del spec: si CUALQUIER categoría baja de 0.95 o hay flakiness, cerrar el PR sin merge y anotar el resultado en `docs/superpowers/plans/` (este fichero, sección Notas). Si todo verde y la transición aporta, merge como los demás.

---

## Verificación final (tras PR C)

- [ ] Gate local completo en `main` actualizado.
- [ ] Revisión manual con el mockup aprobado al lado (`.superpowers/brainstorm/94878-1786182921/content/home-full.html`): home EN y ES, un programa, calculadoras, contact — desktop y móvil (DevTools).
- [ ] Firefox: todo el contenido visible sin animaciones (reveals dentro de `@supports`).
- [ ] `prefers-reduced-motion` (DevTools → emulación): sin reveals, marquesina quieta, sin entrada de página.
- [ ] Producción tras merge: visual OK en https://dherreraloans.vercel.app.

## Notas

- (Reservado para el resultado del spike de View Transitions.)
