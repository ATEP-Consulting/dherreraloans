# Fase 0 — Fundación con el gate encendido: Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Esqueleto bilingüe de Next.js desplegado en Vercel con todos los gates de CI activos (lint, tipos, paridad i18n, tests, verificación de páginas estáticas, Lighthouse ≥ 95) desde el primer PR.

**Architecture:** App Router con todas las rutas bajo `app/[locale]/`, una fuente única de rutas (`config/routes.mjs`) que alimenta a next-intl (pathnames localizados), sitemap, verificación de estáticas y tests. Deploys vía Vercel CLI desde GitHub Actions (la integración Git nativa no está disponible — nota post-aprobación del ADR-0008). Pre-lanzamiento: todo noindex hasta enlazar dominio (Fase 4).

**Tech Stack:** Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · next-intl v4 · Vitest · Playwright · GitHub Actions · Vercel CLI · Lighthouse CI (`treosh/lighthouse-ci-action`).

## Global Constraints

- **Lighthouse ≥ 95 en las 4 categorías**, móvil, contra la URL de preview, en cada PR (ADR-0003 §8). Es el gate contractual.
- **Toda página de contenido se prerenderiza** (aparece en `prerender-manifest.json`); si no, CI falla (ADR-0003 §1).
- **Ningún texto visible hardcodeado en componentes**: todo en `messages/{en,es}.json` (ADR-0002).
- Idiomas: `en` (x-default) y `es`; **rutas siempre prefijadas** con slugs localizados en ES (ADR-0002); ejemplos comprometidos: `/es/opciones-de-prestamo`, `/es/cotizacion`, `/es/calculadora`, `/es/sobre-mi`, `/es/contacto`.
- **Cero APIs propietarias de Vercel en el código** de aplicación (ADR-0008 §3).
- **Free tier en todo**; Node 24 (coincide con la config del proyecto Vercel).
- **Pre-lanzamiento = noindex**: `app/robots.ts` deniega todo salvo que `SITE_INDEXABLE=true` (se activará en Fase 4 con el dominio). La URL provisional es `https://dherreraloans.vercel.app`.
- Commits: convención `tipo: descripción` en español + línea `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Presupuesto JS: ≤ 130 KB gzip First Load en páginas de contenido (ADR-0003 §7) — en Fase 0 lo vigila el gate de Lighthouse; sin dependencias de cliente nuevas sin justificarlas contra el presupuesto.

## Estructura de archivos resultante

```
config/routes.mjs            # FUENTE ÚNICA: locales, pathnames localizados, slugs de programas
i18n/routing.ts              # defineRouting(next-intl) desde config/routes.mjs
i18n/request.ts              # carga de mensajes por locale
middleware.ts                # negociación de idioma + redirect de /
messages/en.json             # todos los textos EN (por namespace de página)
messages/es.json             # todos los textos ES (misma estructura de claves)
lib/programs.ts              # resolución slug localizado ⇄ programa
lib/metadata.ts              # helper de metadata (canonical + hreflang) por página
app/[locale]/layout.tsx      # layout raíz: html lang, header con nav y selector, footer
app/[locale]/page.tsx        # home placeholder
app/[locale]/loan-options/page.tsx
app/[locale]/loan-options/[program]/page.tsx   # 5 programas prerenderizados
app/[locale]/quote/page.tsx ... (calculator, about, contact, privacy, accessibility)
app/robots.ts                # noindex pre-lanzamiento (SITE_INDEXABLE)
app/sitemap.ts               # sitemap multiidioma desde config/routes.mjs
components/locale-switcher.tsx
scripts/check-static.mjs     # gate: toda ruta esperada está prerenderizada
tests/unit/*.test.ts         # paridad i18n, integridad de rutas, metadata
tests/e2e/*.spec.ts          # smoke bilingüe + pathnames localizados
.github/workflows/ci.yml     # lint, tipos, unit, build, check:static, e2e
.github/workflows/deploy-preview.yml     # PR: vercel build+deploy → comentario URL → Lighthouse CI
.github/workflows/deploy-production.yml  # main: deploy --prod
lighthouserc.json            # asserts ≥ 0.95 × 4, móvil, 3 runs
.env.example                 # SITE_INDEXABLE, NEXT_PUBLIC_SITE_URL documentadas
```

---

### Task 1: Scaffolding Next.js + TypeScript estricto + Tailwind

**Files:**
- Create: proyecto Next.js en la raíz del repo (app/, `tsconfig.json`, `next.config.ts`, `package.json`, `eslint.config.mjs`, `postcss.config.mjs`, `app/globals.css`)
- Modify: `.gitignore` (fusionar el generado con el existente)

**Interfaces:**
- Consumes: repo existente (docs/, propuesta, index.html placeholder — no se tocan aún).
- Produces: `npm run build` funcional; alias `@/*`; TS `strict: true`. Tasks posteriores asumen `npm run dev/build/lint` operativos.

- [x] **Step 1: Scaffolding en directorio temporal y copia al repo**

`create-next-app` rechaza directorios con archivos en conflicto, así que se genera fuera y se copia (sin tocar `.gitignore` todavía):

```bash
cd /private/tmp/claude-501/-Users-pablo-Projects-DHerreraLoans/71091a8c-c7d4-4d9c-85cd-d1fa0f1201fa/scratchpad
npx create-next-app@latest dhl-scaffold --ts --eslint --tailwind --app --no-src-dir --import-alias "@/*" --use-npm --yes
cd dhl-scaffold
rsync -a --exclude .git --exclude .gitignore --exclude README.md ./ /Users/pablo/Projects/DHerreraLoans/
```

- [x] **Step 2: Fusionar .gitignore y limpiar boilerplate**

Añadir al `.gitignore` existente (mantener lo que ya hay) las entradas del generado: `node_modules/`, `.next/`, `out/`, `next-env.d.ts`, `*.tsbuildinfo`, `test-results/`, `playwright-report/`. Borrar los SVG de ejemplo (`app/favicon.ico` se conserva; `public/*.svg` de Vercel/Next se eliminan) y dejar `app/page.tsx` con un `<main>` mínimo (se sustituye en Task 3). El placeholder `index.html` de la raíz **no se borra aún** (lo hace Task 9).

- [x] **Step 3: Verificar TS estricto y build**

```bash
grep '"strict": true' tsconfig.json   # debe existir (default de create-next-app)
npm run build
npm ls next typescript tailwindcss | cat   # anotar versiones instaladas en el commit
```

Esperado: build en verde. Si la major de Next instalada es superior a 15, se mantiene y se anota en el mensaje de commit (el ADR-0001 se redactó sobre la 15; App Router estable es lo decidido).

- [x] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: scaffolding Next.js + TS estricto + Tailwind (versiones en package.json)"
```

---

### Task 2: Fuente única de rutas + Vitest + tests de integridad (TDD)

**Files:**
- Create: `config/routes.mjs`, `vitest.config.ts`, `tests/unit/routes.test.ts`, `tests/unit/i18n-parity.test.ts`, `messages/en.json`, `messages/es.json`
- Modify: `package.json` (scripts `test`, `test:watch`)

**Interfaces:**
- Produces: `config/routes.mjs` exporta `locales: string[]`, `defaultLocale: string`, `pathnames: Record<string, Record<string,string>>`, `programSlugs: Record<string, Record<string,string>>`. `messages/{en,es}.json` con namespaces: `common`, `home`, `loanOptions`, `programs.{fha,conventional,va,firstTimeHomebuyer,refinance}`, `quote`, `calculator`, `about`, `contact`, `legal.privacy`, `legal.accessibility`. Todo lo posterior (routing, sitemap, check-static, sitemap, páginas) consume ESTOS nombres.

- [x] **Step 1: Instalar Vitest**

```bash
npm i -D vitest @vitest/coverage-v8
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: { include: ['tests/unit/**/*.test.ts'] },
});
```

En `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [x] **Step 2: Escribir los tests que fallan**

`tests/unit/routes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, pathnames, programSlugs } from '@/config/routes.mjs';

describe('config/routes', () => {
  it('define en y es, con en como default (ADR-0002)', () => {
    expect(locales).toEqual(['en', 'es']);
    expect(defaultLocale).toBe('en');
  });

  it('todo pathname tiene slug para cada locale', () => {
    for (const [route, byLocale] of Object.entries(pathnames)) {
      for (const locale of locales) {
        expect(byLocale[locale], `${route} sin slug ${locale}`).toBeTypeOf('string');
      }
    }
  });

  it('los slugs comprometidos en el ADR-0002 existen en es', () => {
    const slugsEs = Object.values(pathnames).map((p) => p.es);
    for (const slug of ['/opciones-de-prestamo', '/cotizacion', '/calculadora', '/sobre-mi', '/contacto']) {
      expect(slugsEs).toContain(slug);
    }
  });

  it('los 5 programas tienen slug en ambos idiomas y sin duplicados', () => {
    expect(Object.keys(programSlugs).sort()).toEqual(
      ['conventional', 'fha', 'firstTimeHomebuyer', 'refinance', 'va'],
    );
    for (const locale of locales) {
      const slugs = Object.values(programSlugs).map((s) => s[locale]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});
```

`tests/unit/i18n-parity.test.ts` (gate de paridad del ADR-0002/0008):

```ts
import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

function flatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object'
      ? flatKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

describe('paridad de mensajes EN/ES', () => {
  it('mismas claves exactamente', () => {
    expect(flatKeys(es).sort()).toEqual(flatKeys(en).sort());
  });
  it('ninguna clave con valor vacío', () => {
    for (const messages of [en, es]) {
      for (const key of flatKeys(messages)) {
        const value = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], messages);
        expect(String(value).trim(), key).not.toHaveLength(0);
      }
    }
  });
});
```

- [x] **Step 3: Verificar que fallan**

Run: `npm test` — Esperado: FAIL (no existen `config/routes.mjs` ni los JSON).

- [x] **Step 4: Implementar `config/routes.mjs` y los mensajes**

`config/routes.mjs`:

```js
// FUENTE ÚNICA de rutas de contenido (ADR-0002, ADR-0003 §3).
// La consumen: i18n/routing.ts, app/sitemap.ts, scripts/check-static.mjs y los tests.
// Añadir una página = añadir su entrada aquí + sus claves en messages/{en,es}.json.

export const locales = ['en', 'es'];
export const defaultLocale = 'en';

// Ruta interna → slug por idioma (sin prefijo de locale).
export const pathnames = {
  '/': { en: '/', es: '/' },
  '/loan-options': { en: '/loan-options', es: '/opciones-de-prestamo' },
  '/loan-options/[program]': {
    en: '/loan-options/[program]',
    es: '/opciones-de-prestamo/[program]',
  },
  '/quote': { en: '/quote', es: '/cotizacion' },
  '/calculator': { en: '/calculator', es: '/calculadora' },
  '/about': { en: '/about', es: '/sobre-mi' },
  '/contact': { en: '/contact', es: '/contacto' },
  '/privacy': { en: '/privacy', es: '/privacidad' },
  '/accessibility': { en: '/accessibility', es: '/accesibilidad' },
};

// Programas (ADR-0003 §4: página por programa). Clave interna → slug público por idioma.
export const programSlugs = {
  fha: { en: 'fha-loans', es: 'prestamos-fha' },
  conventional: { en: 'conventional-loans', es: 'prestamos-convencionales' },
  va: { en: 'va-loans', es: 'prestamos-va' },
  firstTimeHomebuyer: { en: 'first-time-homebuyer', es: 'primer-comprador' },
  refinance: { en: 'refinance', es: 'refinanciamiento' },
};
```

`messages/en.json` (estructura completa; copy provisional de Fase 0 — la Fase 1 redacta el contenido real para revisión del cliente):

```json
{
  "common": {
    "brand": "DherreraLoans",
    "nav": {
      "home": "Home",
      "loanOptions": "Loan Options",
      "quote": "Get a Quote",
      "calculator": "Calculator",
      "about": "About",
      "contact": "Contact"
    },
    "localeSwitcher": { "en": "English", "es": "Español", "label": "Language" },
    "footer": { "tagline": "Mortgage solutions in Miami, FL.", "nmls": "NMLS # pending" }
  },
  "home": { "title": "Mortgage solutions in Miami", "description": "Purchase or refinance with a licensed loan originator in Florida.", "heading": "Your path to homeownership starts here" },
  "loanOptions": { "title": "Loan Options", "description": "Explore mortgage programs available in Florida.", "heading": "Loan Options" },
  "programs": {
    "fha": { "title": "FHA Loans", "description": "Flexible requirements for FHA loans in Florida.", "heading": "FHA Loans" },
    "conventional": { "title": "Conventional Loans", "description": "Conventional mortgage options in Florida.", "heading": "Conventional Loans" },
    "va": { "title": "VA Loans", "description": "VA loan benefits for veterans and service members.", "heading": "VA Loans" },
    "firstTimeHomebuyer": { "title": "First Time Homebuyer", "description": "Programs for first time homebuyers in Florida.", "heading": "First Time Homebuyer" },
    "refinance": { "title": "Refinance", "description": "Refinance your mortgage and save.", "heading": "Refinance" }
  },
  "quote": { "title": "Get a Quote", "description": "Answer a few questions and get your personalized quote.", "heading": "Get a Quote" },
  "calculator": { "title": "Mortgage Calculator", "description": "Estimate your monthly mortgage payment.", "heading": "Mortgage Calculator" },
  "about": { "title": "About David Herrera", "description": "Licensed Mortgage Loan Originator in Miami, FL.", "heading": "About me" },
  "contact": { "title": "Contact", "description": "Get in touch by phone, email or WhatsApp.", "heading": "Contact" },
  "legal": {
    "privacy": { "title": "Privacy Policy", "description": "How we handle your personal information.", "heading": "Privacy Policy" },
    "accessibility": { "title": "Accessibility Statement", "description": "Our commitment to an accessible website.", "heading": "Accessibility Statement" }
  }
}
```

`messages/es.json` (misma estructura de claves — el test de paridad lo verifica):

```json
{
  "common": {
    "brand": "DherreraLoans",
    "nav": {
      "home": "Inicio",
      "loanOptions": "Opciones de préstamo",
      "quote": "Cotización",
      "calculator": "Calculadora",
      "about": "Sobre mí",
      "contact": "Contacto"
    },
    "localeSwitcher": { "en": "English", "es": "Español", "label": "Idioma" },
    "footer": { "tagline": "Soluciones hipotecarias en Miami, FL.", "nmls": "NMLS # pendiente" }
  },
  "home": { "title": "Soluciones hipotecarias en Miami", "description": "Compra o refinancia con un originador de préstamos licenciado en Florida.", "heading": "Tu camino a la casa propia empieza aquí" },
  "loanOptions": { "title": "Opciones de préstamo", "description": "Explora los programas hipotecarios disponibles en Florida.", "heading": "Opciones de préstamo" },
  "programs": {
    "fha": { "title": "Préstamos FHA", "description": "Requisitos flexibles para préstamos FHA en Florida.", "heading": "Préstamos FHA" },
    "conventional": { "title": "Préstamos convencionales", "description": "Opciones de hipoteca convencional en Florida.", "heading": "Préstamos convencionales" },
    "va": { "title": "Préstamos VA", "description": "Beneficios de préstamos VA para veteranos y militares.", "heading": "Préstamos VA" },
    "firstTimeHomebuyer": { "title": "Primer comprador", "description": "Programas para compradores de primera vivienda en Florida.", "heading": "Primer comprador" },
    "refinance": { "title": "Refinanciamiento", "description": "Refinancia tu hipoteca y ahorra.", "heading": "Refinanciamiento" }
  },
  "quote": { "title": "Cotización", "description": "Responde unas preguntas y recibe tu cotización personalizada.", "heading": "Obtén tu cotización" },
  "calculator": { "title": "Calculadora de hipoteca", "description": "Estima tu pago mensual de hipoteca.", "heading": "Calculadora de hipoteca" },
  "about": { "title": "Sobre David Herrera", "description": "Originador de préstamos hipotecarios licenciado en Miami, FL.", "heading": "Sobre mí" },
  "contact": { "title": "Contacto", "description": "Comunícate por teléfono, email o WhatsApp.", "heading": "Contacto" },
  "legal": {
    "privacy": { "title": "Política de privacidad", "description": "Cómo tratamos tu información personal.", "heading": "Política de privacidad" },
    "accessibility": { "title": "Declaración de accesibilidad", "description": "Nuestro compromiso con una web accesible.", "heading": "Declaración de accesibilidad" }
  }
}
```

- [x] **Step 5: Verificar que pasan y commit**

Run: `npm test` — Esperado: PASS (los 6 tests).

```bash
git add -A && git commit -m "feat: fuente única de rutas + mensajes EN/ES con tests de paridad"
```

---

### Task 3: next-intl — routing, middleware, layout y páginas esqueleto estáticas

**Files:**
- Create: `i18n/routing.ts`, `i18n/request.ts`, `middleware.ts`, `lib/programs.ts`, `components/locale-switcher.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx` y las páginas: `loan-options/page.tsx`, `loan-options/[program]/page.tsx`, `quote/page.tsx`, `calculator/page.tsx`, `about/page.tsx`, `contact/page.tsx`, `privacy/page.tsx`, `accessibility/page.tsx`
- Delete: `app/page.tsx`, `app/layout.tsx` (los sustituye `app/[locale]/`)
- Modify: `next.config.ts` (plugin de next-intl)
- Test: `tests/unit/programs.test.ts`

**Interfaces:**
- Consumes: `config/routes.mjs` (Task 2) y los namespaces de mensajes definidos en Task 2.
- Produces: `routing` (export de `i18n/routing.ts`) con `Link`/`redirect`/`usePathname` de `createNavigation`; `lib/programs.ts` exporta `programKeyFromSlug(locale: string, slug: string): string | undefined` y `slugFor(locale: string, key: string): string`. Las páginas usan `setRequestLocale` + `getTranslations` (patrón que la Fase 1 replicará).

- [x] **Step 1: Instalar y configurar next-intl**

```bash
npm i next-intl
```

`i18n/routing.ts`:

```ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale, pathnames } from '@/config/routes.mjs';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // ADR-0002: rutas siempre prefijadas
  pathnames,
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

`i18n/request.ts`:

```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: (await import(`@/messages/${locale}.json`)).default };
});
```

`middleware.ts`:

```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Todo excepto api, assets de Next y archivos con extensión (favicon, imágenes…)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

`next.config.ts`:

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [x] **Step 2: Test que falla para `lib/programs.ts`**

`tests/unit/programs.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { programKeyFromSlug, slugFor } from '@/lib/programs';

describe('lib/programs', () => {
  it('resuelve slug localizado → clave interna', () => {
    expect(programKeyFromSlug('es', 'prestamos-fha')).toBe('fha');
    expect(programKeyFromSlug('en', 'fha-loans')).toBe('fha');
  });
  it('devuelve undefined para slug desconocido (→ notFound en la página)', () => {
    expect(programKeyFromSlug('en', 'prestamos-fha')).toBeUndefined();
  });
  it('slugFor es la inversa de programKeyFromSlug', () => {
    expect(slugFor('es', 'refinance')).toBe('refinanciamiento');
    expect(programKeyFromSlug('es', slugFor('es', 'va'))).toBe('va');
  });
});
```

Run: `npm test` — Esperado: FAIL (`lib/programs` no existe).

- [x] **Step 3: Implementar `lib/programs.ts`**

```ts
import { programSlugs } from '@/config/routes.mjs';

export function slugFor(locale: string, key: string): string {
  return programSlugs[key as keyof typeof programSlugs][locale as 'en' | 'es'];
}

export function programKeyFromSlug(locale: string, slug: string): string | undefined {
  return Object.keys(programSlugs).find((key) => slugFor(locale, key) === slug);
}
```

Run: `npm test` — Esperado: PASS.

- [x] **Step 4: Layout raíz y componentes**

`app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, Link } from '@/i18n/routing';
import { LocaleSwitcher } from '@/components/locale-switcher';
import './../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dherreraloans.vercel.app'),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <html lang={locale}>
      <body className="min-h-svh bg-white text-slate-900 antialiased">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
          <Link href="/" className="font-bold">{t('brand')}</Link>
          <nav aria-label={t('nav.home')} className="flex flex-wrap gap-4 text-sm">
            <Link href="/loan-options">{t('nav.loanOptions')}</Link>
            <Link href="/quote">{t('nav.quote')}</Link>
            <Link href="/calculator">{t('nav.calculator')}</Link>
            <Link href="/about">{t('nav.about')}</Link>
            <Link href="/contact">{t('nav.contact')}</Link>
          </nav>
          <NextIntlClientProvider>
            <LocaleSwitcher />
          </NextIntlClientProvider>
        </header>
        <main className="p-4">{children}</main>
        <footer className="border-t border-slate-200 p-4 text-sm text-slate-500">
          <p>{t('footer.tagline')}</p>
          <p>{t('footer.nmls')}</p>
        </footer>
      </body>
    </html>
  );
}
```

`components/locale-switcher.tsx` (client component mínimo — único JS de cliente de la Fase 0):

```tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';

export function LocaleSwitcher() {
  const t = useTranslations('common.localeSwitcher');
  const locale = useLocale();
  const other = locale === 'en' ? 'es' : 'en';
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={t('label')}
      className="rounded border border-slate-300 px-2 py-1 text-sm"
      onClick={() =>
        // pathname es la ruta interna; router la traduce al slug del otro idioma.
        // params conserva [program]; el slug localizado del programa se corrige en Fase 1.
        router.replace({ pathname, params } as never, { locale: other })
      }
    >
      {t(other)}
    </button>
  );
}
```

- [x] **Step 5: Páginas esqueleto (todas con el mismo patrón)**

Patrón — `app/[locale]/about/page.tsx` (idéntico para home (`page.tsx`, namespace `home`), `loan-options` (`loanOptions`), `quote`, `calculator`, `contact`, `privacy` (`legal.privacy`), `accessibility` (`legal.accessibility`), cambiando solo el namespace):

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  return <h1 className="text-2xl font-bold">{t('heading')}</h1>;
}
```

`app/[locale]/loan-options/[program]/page.tsx` (prerenderiza los 5 × 2 idiomas con slug localizado):

```tsx
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { programKeyFromSlug, slugFor } from '@/lib/programs';
import { programSlugs } from '@/config/routes.mjs';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(programSlugs).map((key) => ({ locale, program: slugFor(locale, key) })),
  );
}

export const dynamicParams = false; // slug desconocido → 404, nunca render dinámico

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string; program: string }>;
}) {
  const { locale, program } = await params;
  setRequestLocale(locale);
  const key = programKeyFromSlug(locale, program);
  if (!key) notFound();
  const t = await getTranslations(`programs.${key}`);
  return <h1 className="text-2xl font-bold">{t('heading')}</h1>;
}
```

- [x] **Step 6: Verificar build estático y ambos idiomas**

```bash
npm run build
```

Esperado: build verde; en el output, todas las rutas `[locale]/…` con símbolo `●` (SSG) — ninguna `ƒ`. Arrancar `npm run start` y comprobar a mano: `http://localhost:3000/` → redirige a `/en`; `/es/opciones-de-prestamo/prestamos-fha` → h1 "Préstamos FHA"; el selector de idioma en `/en/loan-options` lleva a `/es/opciones-de-prestamo`.

- [x] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: enrutado bilingüe next-intl con pathnames localizados y páginas esqueleto"
```

---

### Task 4: Metadata (canonical + hreflang), robots y sitemap

**Files:**
- Create: `lib/metadata.ts`, `app/robots.ts`, `app/sitemap.ts`, `.env.example`
- Modify: todas las páginas de Task 3 (añadir `generateMetadata`)
- Test: `tests/unit/metadata.test.ts`, `tests/unit/sitemap.test.ts`

**Interfaces:**
- Consumes: `config/routes.mjs`, `getPathname` de `i18n/routing.ts`, namespaces `*.title` / `*.description` de Task 2.
- Produces: `buildPageMetadata({ locale, namespace, pathname, params? }): Promise<Metadata>` — la Fase 1 la usará en cada página nueva. `SITE_URL` exportada desde `lib/metadata.ts`.

- [x] **Step 1: Tests que fallan**

`tests/unit/metadata.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { hreflangAlternates, SITE_URL } from '@/lib/metadata';

describe('hreflangAlternates', () => {
  it('genera canonical por idioma y x-default → EN (ADR-0002/0003)', () => {
    const alt = hreflangAlternates('/about');
    expect(alt.languages['x-default']).toBe(`${SITE_URL}/en/about`);
    expect(alt.languages.en).toBe(`${SITE_URL}/en/about`);
    expect(alt.languages.es).toBe(`${SITE_URL}/es/sobre-mi`);
  });
  it('soporta rutas con params de programa', () => {
    const alt = hreflangAlternates('/loan-options/[program]', { program: 'fha' });
    expect(alt.languages.en).toBe(`${SITE_URL}/en/loan-options/fha-loans`);
    expect(alt.languages.es).toBe(`${SITE_URL}/es/opciones-de-prestamo/prestamos-fha`);
  });
});
```

`tests/unit/sitemap.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/metadata';

describe('sitemap multiidioma (ADR-0003 §3)', () => {
  const entries = sitemap();
  it('incluye las 13 páginas × 2 idiomas', () => {
    expect(entries).toHaveLength(26); // 8 estáticas + 5 programas, por idioma
  });
  it('cada entrada declara alternates en/es', () => {
    for (const e of entries) {
      expect(e.alternates?.languages?.en).toMatch(new RegExp(`^${SITE_URL}/en`));
      expect(e.alternates?.languages?.es).toMatch(new RegExp(`^${SITE_URL}/es`));
    }
  });
});
```

Run: `npm test` — Esperado: FAIL.

- [x] **Step 2: Implementar `lib/metadata.ts`**

```ts
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname, routing } from '@/i18n/routing';
import { slugFor } from '@/lib/programs';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dherreraloans.vercel.app';

type Params = { program?: string };

function urlFor(locale: string, pathname: string, params?: Params): string {
  const href = params?.program
    ? { pathname, params: { program: slugFor(locale, params.program) } }
    : pathname;
  return SITE_URL + getPathname({ locale, href: href as never });
}

export function hreflangAlternates(pathname: string, params?: Params) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, urlFor(locale, pathname, params)]),
  ) as Record<string, string>;
  languages['x-default'] = urlFor(routing.defaultLocale, pathname, params); // ADR-0002: EN
  return { languages };
}

export async function buildPageMetadata(args: {
  locale: string;
  namespace: string;
  pathname: string;
  params?: Params;
}): Promise<Metadata> {
  const t = await getTranslations({ locale: args.locale, namespace: args.namespace });
  const alternates = hreflangAlternates(args.pathname, args.params);
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: alternates.languages[args.locale], ...alternates },
  };
}
```

En cada página de Task 3, añadir (ejemplo de `about`; en la de programa se pasa `namespace: 'programs.' + key` y `params: { program: key }`):

```tsx
import { buildPageMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'about', pathname: '/about' });
}
```

- [x] **Step 3: Implementar `app/robots.ts` y `app/sitemap.ts`**

`app/robots.ts` (noindex pre-lanzamiento — Global Constraints):

```ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_INDEXABLE !== 'true') {
    return { rules: { userAgent: '*', disallow: '/' } }; // pre-lanzamiento (Fase 4 lo abre)
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import { pathnames, programSlugs, locales } from '@/config/routes.mjs';
import { hreflangAlternates, SITE_URL } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = Object.keys(pathnames).filter((p) => !p.includes('['));
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    const alternates = hreflangAlternates(route);
    for (const locale of locales) {
      entries.push({ url: alternates.languages[locale], alternates });
    }
  }
  for (const key of Object.keys(programSlugs)) {
    const alternates = hreflangAlternates('/loan-options/[program]', { program: key });
    for (const locale of locales) {
      entries.push({ url: alternates.languages[locale], alternates });
    }
  }
  return entries;
}
```

`.env.example`:

```bash
# URL pública del sitio (sin barra final). Provisional hasta enlazar dominio (Fase 4).
NEXT_PUBLIC_SITE_URL=https://dherreraloans.vercel.app
# 'true' SOLO en producción con dominio final (Fase 4). Ausente/otro valor = robots deniega todo.
SITE_INDEXABLE=
```

- [x] **Step 4: Verificar y commit**

Run: `npm test` — Esperado: PASS. `npm run build` verde; `/robots.txt` local muestra `Disallow: /`; `/sitemap.xml` lista 26 URLs con `xhtml:link`.

```bash
git add -A && git commit -m "feat: metadata hreflang/canonical, robots noindex pre-lanzamiento y sitemap multiidioma"
```

---

### Task 5: Gate de páginas estáticas (`check:static`)

**Files:**
- Create: `scripts/check-static.mjs`
- Modify: `package.json` (script `check:static`)

**Interfaces:**
- Consumes: `config/routes.mjs`; `.next/prerender-manifest.json` (existe tras `next build`).
- Produces: `npm run check:static` — exit 0 si TODAS las rutas esperadas están prerenderizadas; exit 1 con listado de faltantes. CI lo ejecuta tras el build (Task 7).

- [x] **Step 1: Implementar el script**

```js
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
    const slug = byLocale[locale];
    expected.push(`/${locale}${slug === '/' ? '' : slug}`);
  }
  const base = pathnames['/loan-options/[program]'][locale].replace('/[program]', '');
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
```

En `package.json`: `"check:static": "node scripts/check-static.mjs"`.

- [x] **Step 2: Verificar en ambos sentidos**

```bash
npm run build && npm run check:static   # Esperado: ✅ 26 rutas
```

Prueba negativa (el gate detecta regresiones): añadir temporalmente `export const dynamic = 'force-dynamic'` a `app/[locale]/about/page.tsx`, rebuild, `npm run check:static` — Esperado: exit 1 listando `/en/about` y `/es/sobre-mi`. **Revertir el cambio** y verificar que vuelve a ✅.

- [x] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: gate check:static — falla si una página de contenido deja de prerenderizarse"
```

---

### Task 6: Playwright — smoke E2E bilingüe

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `package.json` (script `test:e2e`)

**Interfaces:**
- Consumes: build de producción (`npm run build` previo) y los textos de `messages/{en,es}.json`.
- Produces: `npm run test:e2e`. La Fase 2/3 añadirán specs a `tests/e2e/` con esta misma config.

- [x] **Step 1: Instalar y configurar**

```bash
npm i -D @playwright/test && npx playwright install chromium
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }], // mobile-first
  webServer: {
    command: 'npm run start', // requiere `npm run build` previo (CI lo garantiza — Task 7)
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

En `package.json`: `"test:e2e": "playwright test"`.

- [x] **Step 2: Escribir el smoke test (falla si el enrutado miente)**

`tests/e2e/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

test('/ redirige al idioma por defecto (en)', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('h1')).toHaveText(en.home.heading);
});

test('navegador en español → /es', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator('h1')).toHaveText(es.home.heading);
});

test('pathnames localizados: /es/opciones-de-prestamo/prestamos-fha', async ({ page }) => {
  await page.goto('/es/opciones-de-prestamo/prestamos-fha');
  await expect(page.locator('h1')).toHaveText(es.programs.fha.heading);
  expect(page.url()).toContain('/es/opciones-de-prestamo/prestamos-fha');
});

test('el selector de idioma traduce también el pathname', async ({ page }) => {
  await page.goto('/en/loan-options');
  await page.getByRole('button', { name: en.common.localeSwitcher.label }).click();
  await expect(page).toHaveURL(/\/es\/opciones-de-prestamo$/);
  await expect(page.locator('h1')).toHaveText(es.loanOptions.heading);
});

test('slug de programa desconocido → 404', async ({ page }) => {
  const response = await page.goto('/en/loan-options/prestamos-fha'); // slug ES en ruta EN
  expect(response?.status()).toBe(404);
});
```

- [x] **Step 3: Ejecutar y verificar**

```bash
npm run build && npm run test:e2e
```

Esperado: 5 tests PASS. (Si el selector de idioma falla, el bug estará en `router.replace` con `params` — revisar la firma de `createNavigation` de la versión instalada de next-intl antes de tocar el test.)

- [x] **Step 4: Commit**

```bash
git add -A && git commit -m "test: smoke E2E móvil — redirect por idioma, pathnames localizados y 404"
```

---

### Task 7: Workflow de CI (`ci.yml`)

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: scripts npm de Tasks 2–6 (`lint`, `test`, `check:static`, `test:e2e`) y `tsc --noEmit`.
- Produces: check `quality` requerido en PRs. Task 8 añade los checks de deploy/Lighthouse.

- [x] **Step 1: Escribir el workflow**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test            # unit: paridad i18n, rutas, metadata, sitemap, programs
      - run: npm run build       # falla también si una página pierde SSG…
      - run: npm run check:static  # …y este gate lo hace explícito (ADR-0003 §1)
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report, retention-days: 7 }
```

- [x] **Step 2: Verificación local equivalente y commit**

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e
git add .github && git commit -m "ci: pipeline de calidad — lint, tipos, unit, build estático, e2e"
```

(El workflow se verá verde en el PR de la Task 9, que es el primer PR del repo.)

---

### Task 8: Deploys por CLI + Lighthouse CI (preview y producción)

**Files:**
- Create: `.github/workflows/deploy-preview.yml`, `.github/workflows/deploy-production.yml`, `lighthouserc.json`
- Delete: `.env.local` del repo de trabajo si apareciera en `git status` (debe seguir ignorado)

**Interfaces:**
- Consumes: proyecto Vercel `dherreraloans` ya enlazado (org `atep-consultings-projects`); secrets de GitHub `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Produces: en cada PR, deployment de preview + comentario con URL + check de Lighthouse ≥ 95; en cada push a `main`, deploy de producción.

- [x] **Step 1: Configurar secrets (⚠️ incluye un paso manual del usuario)**

```bash
# Los IDs salen del enlace ya hecho con `vercel link`:
VERCEL_ORG_ID=$(node -p "require('./.vercel/project.json').orgId")
VERCEL_PROJECT_ID=$(node -p "require('./.vercel/project.json').projectId")
gh secret set VERCEL_ORG_ID --repo ATEP-Consulting/dherreraloans --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --repo ATEP-Consulting/dherreraloans --body "$VERCEL_PROJECT_ID"
```

**BLOQUEANTE — acción del usuario:** crear un token en https://vercel.com/account/settings/tokens (scope: la cuenta `atepconsulting`, expiración 1 año) y pasárnoslo o ejecutar: `gh secret set VERCEL_TOKEN --repo ATEP-Consulting/dherreraloans --body "<token>"`. Sin este secret, los workflows de deploy fallan con credenciales; el resto del plan no se bloquea (se puede seguir y verificar al final).

- [x] **Step 2: `lighthouserc.json` (el gate contractual)**

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "skipAudits": ["is-crawlable"]
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

`is-crawlable` se omite **a propósito**: los previews llevan noindex (Vercel añade `X-Robots-Tag` y nuestro robots.ts deniega pre-lanzamiento — Global Constraints); sin omitirlo, la categoría SEO nunca podría llegar a 95 en preview. La crawlabilidad real se valida en Fase 4 al abrir la indexación con el dominio. (Lighthouse audita en móvil por defecto — es exactamente la condición contractual.)

- [x] **Step 3: Workflow de preview con Lighthouse**

`.github/workflows/deploy-preview.yml`:

```yaml
name: Deploy Preview + Lighthouse
on: pull_request

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  preview:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npx vercel@latest pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel@latest build --token=${{ secrets.VERCEL_TOKEN }}
      - id: deploy
        run: echo "url=$(npx vercel@latest deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})" >> "$GITHUB_OUTPUT"
      - uses: actions/github-script@v7
        with:
          script: |
            const url = '${{ steps.deploy.outputs.url }}';
            await github.rest.issues.createComment({
              ...context.repo,
              issue_number: context.issue.number,
              body: `🔍 Preview: ${url}\n\n(Lighthouse ≥ 95 ×4 se verifica en este mismo workflow.)`,
            });
      - uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: lighthouserc.json
          uploadArtifacts: true
          urls: |
            ${{ steps.deploy.outputs.url }}/en
            ${{ steps.deploy.outputs.url }}/es
            ${{ steps.deploy.outputs.url }}/en/loan-options/fha-loans
            ${{ steps.deploy.outputs.url }}/es/opciones-de-prestamo/prestamos-fha
            ${{ steps.deploy.outputs.url }}/en/quote
            ${{ steps.deploy.outputs.url }}/es/cotizacion
```

- [x] **Step 4: Workflow de producción**

`.github/workflows/deploy-production.yml`:

```yaml
name: Deploy Production
on:
  push:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npx vercel@latest pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel@latest build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel@latest deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

- [x] **Step 5: Nota de limitación conocida + commit**

GitHub Free para organizaciones **no ofrece branch protection en repos privados**: los checks (quality, preview+Lighthouse) se ven en rojo en el PR pero el merge no queda bloqueado técnicamente. Disciplina de proceso: **no se mergea con checks en rojo**. Si el repo pasara a público o el plan a Team, activar la protección es un paso de 1 minuto (documentado aquí para entonces).

```bash
git add .github lighthouserc.json && git commit -m "ci: deploys por Vercel CLI + gate Lighthouse >=95 en previews (ADR-0008)"
```

---

### Task 9: Cutover — retirar el placeholder y desplegar el esqueleto real

**Files:**
- Delete: `index.html`, `.vercelignore` (con `--prebuilt` solo se sube el build; ya no protegen nada)
- Modify: variables de entorno del proyecto Vercel

**Interfaces:**
- Consumes: todo lo anterior; secrets de Task 8 configurados (incluido `VERCEL_TOKEN`).
- Produces: `https://dherreraloans.vercel.app` sirviendo el esqueleto bilingüe con noindex; pipeline completo verde en el primer PR real del repo.

- [x] **Step 1: Variables de entorno en Vercel**

```bash
printf 'https://dherreraloans.vercel.app' | npx vercel@latest env add NEXT_PUBLIC_SITE_URL production
printf 'https://dherreraloans.vercel.app' | npx vercel@latest env add NEXT_PUBLIC_SITE_URL preview
# SITE_INDEXABLE no se define: robots deniega por defecto (se activará en Fase 4 con el dominio real)
```

- [x] **Step 2: Retirar el placeholder en una rama y abrir el primer PR**

```bash
git checkout -b feat/fase-0-esqueleto
git rm index.html .vercelignore
git commit -m "feat: retirar placeholder — el esqueleto Next.js pasa a ser la web desplegada"
git push -u origin feat/fase-0-esqueleto
gh pr create --repo ATEP-Consulting/dherreraloans \
  --title "Fase 0: fundación — esqueleto bilingüe con gates de CI" \
  --body "Cierra la Fase 0: Next.js + next-intl + tests + CI + Lighthouse gate. Ver docs/superpowers/plans/2026-08-06-fase-0-fundacion.md"
```

- [x] **Step 3: Verificar el pipeline completo en el PR**

Esperado en el PR: check `quality` verde; workflow de preview publica el comentario con la URL; Lighthouse ≥ 95 en las 4 categorías en las 6 URLs. Si Lighthouse falla aquí (con este esqueleto casi vacío), la causa será de infraestructura (headers, fuentes, imágenes del placeholder) — investigarla con la skill de systematic-debugging antes de tocar umbrales: **los umbrales no se bajan**.

- [x] **Step 4: Merge y verificación de producción**

```bash
gh pr merge --repo ATEP-Consulting/dherreraloans --squash --delete-branch
# Tras el workflow de producción:
/usr/bin/curl -s -o /dev/null -w "%{http_code}" https://dherreraloans.vercel.app/en        # 200
/usr/bin/curl -s -o /dev/null -w "%{http_code}" https://dherreraloans.vercel.app/es/cotizacion  # 200
/usr/bin/curl -s https://dherreraloans.vercel.app/robots.txt                                # Disallow: /
/usr/bin/curl -s https://dherreraloans.vercel.app/sitemap.xml | /usr/bin/head -5            # sitemap con xhtml:link
```

- [x] **Step 5: Cierre de fase**

Marcar la Fase 0 como completada en este plan (checkboxes) y commitear. La Fase 1 (contenido + SEO completo) arranca con su propio plan sobre esta base.

```bash
git add docs/superpowers/plans/2026-08-06-fase-0-fundacion.md
git commit -m "docs: Fase 0 completada — plan con checkboxes cerrados"
git push
```

---

## Riesgos conocidos de esta fase

- **`VERCEL_TOKEN` es un paso manual del usuario** (Task 8 Step 1): sin él, Tasks 8–9 no pueden verificarse de punta a punta. Pedirlo al inicio de la ejecución, no al llegar a la Task 8.
- **Versiones**: el plan se escribió contra las APIs estables de next-intl v4 y Next.js App Router. Si la versión instalada difiere en alguna firma (`createNavigation`, `requestLocale`), la referencia es la doc de la versión instalada — adaptar la llamada, no la arquitectura.
- **Selector de idioma con rutas de programa**: `router.replace({pathname, params})` traduce el pathname pero NO el slug del programa (los `params` viajan tal cual). En Fase 0 el selector solo se testea en rutas sin params (smoke test); la traducción de slugs de programa en el switcher se resuelve en Fase 1 (donde la página de programa pasará el slug alternativo explícitamente). Documentado para no confundirlo con un bug.
