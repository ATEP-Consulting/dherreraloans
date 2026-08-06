# Fase 1 — Contenido, diseño y SEO: Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el sistema visual del handoff «Fachada 4a» (tokens + `components/ui/` + `PageHero` común) y las ~12 páginas × 2 idiomas con contenido real, SEO completo (JSON-LD, OG, metadata) y la deuda técnica de Fase 0 saldada — spec: `docs/superpowers/specs/2026-08-06-fase-1-contenido-diseno-seo-design.md`.

**Architecture:** El header vive DENTRO de `PageHero` (hero común con foto de fondo en todas las páginas); cada página pasa su `pathname`/`params` a `PageHero`, lo que permite un `LangToggle` server-rendered (cero client components). Todo valor de estilo es un token `@theme` de Tailwind v4; todo elemento repetido es un componente de `components/`. Los textos viven SOLO en `messages/{en,es}.json`.

**Tech Stack:** Next.js 16.3.0 · next-intl 4.13.5 · Tailwind 4.3.3 · TS strict · Vitest · Playwright · satori + @resvg/resvg-js (solo devDeps, script OG).

## Global Constraints

- **Lighthouse ≥ 95 ×4** en preview por PR (gate contractual); los `skipAudits` de `lighthouserc.json` NO se tocan (Fase 4).
- **Toda página de contenido prerenderizada** (`npm run check:static` en verde; ninguna ruta `ƒ`).
- **Ningún texto visible hardcodeado**: todo en `messages/{en,es}.json` (paridad testeada). Los valores no-copy (URLs, NMLS) viven en `lib/site.ts` y se interpolan.
- **Fidelidad al handoff** `design_handoff_home_fachada/` (pixel-perfect, breakpoint ~980px = `lg` custom): radius 0 en todo, sin sombras, bordes 1px, paleta y tipos EXACTOS del spec §3.1.
- **Requisito del cliente**: cambiar un color/botón = tocar UN token/componente. Ningún color/tamaño/espaciado inline fuera de `@theme` (revisor: defecto Important).
- **Cero client components** (`'use client'` prohibido en esta fase): nav móvil con `<details>` CSS-only, LangToggle server-rendered.
- **Tipografía**: exactamente 2 familias `next/font` (Spectral 300/300i/400 + Instrument Sans 400/500/600, subset latin, swap).
- **Imágenes**: `next/image` con import estático (dimensiones + blur automáticos); ninguna imagen servida > 200 KB; hero con `priority`; fotos nuevas SOLO de Unsplash (licencia Unsplash) verificadas visualmente y registradas en `docs/CREDITS.md`.
- **Datos**: NMLS real `1459301`; teléfono/email placeholders obvios (`+1 (305) 000-0000`, `hola@dherreraloans.com`); copy YMYL = borrador pendiente de validación del cliente (nota en PRs).
- Commits `tipo: descripción` en español + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`; flujo rama → PR → checks verdes → squash merge. Node 24, free tiers.
- Antes de escribir código Next: consultar `node_modules/next/dist/docs/` si hay duda de API (aviso de AGENTS.md, Next 16 tiene breaking changes).

## Estructura de archivos resultante

```
app/globals.css                       # tokens @theme (única definición de estilo)
app/[locale]/layout.tsx               # fuentes, <main>, SiteFooter (SIN header: va en PageHero)
app/[locale]/page.tsx                 # home
app/[locale]/loan-options/page.tsx
app/[locale]/loan-options/[program]/page.tsx
app/[locale]/quote|calculator|about|contact|privacy|accessibility/page.tsx
app/[locale]/not-found.tsx            # 404 localizado
assets/img/                           # logo.png, logo-light.png, david.png, hero-*.jpg (imports estáticos)
components/layout/page-hero.tsx       # EL componente central (header + foto + scrim)
components/layout/top-strip.tsx, nav-links.tsx, mobile-nav.tsx, lang-toggle.tsx, site-footer.tsx
components/ui/button.tsx, text-link.tsx, eyebrow.tsx, section-heading.tsx, band.tsx,
              index-row.tsx, photo-plate.tsx, cities-strip.tsx, whatsapp-button.tsx, eho-mark.tsx
components/seo/json-ld.tsx
lib/site.ts                           # NMLS_ID, APPLY_URL, WHATSAPP, INSTAGRAM, CONSUMER_ACCESS
lib/jsonld.ts                         # builders Person/FinancialService/MortgageLoan/BreadcrumbList
lib/metadata.ts                       # (extender) OG/twitter/og:locale
scripts/generate-og.mjs               # pre-genera public/og/{en,es}/*.png (committeadas)
tests/unit/jsonld.test.ts, tests/unit/metadata-og.test.ts (+ existentes)
tests/e2e/smoke.spec.ts (actualizar) + tests/e2e/home.spec.ts (nuevo)
proxy.ts                              # renombrado desde middleware.ts (PR F)
docs/CREDITS.md                       # créditos de fotos
```

Borra: `components/locale-switcher.tsx` (PR A).

---

# PR A — Tornasol: tokens + ui kit + PageHero + home (rama `feat/fase-1-tornasol`)

### Task 1: Fuentes y tokens del tema

**Files:**
- Modify: `app/globals.css` (reescritura completa), `app/[locale]/layout.tsx` (solo fuentes)

**Interfaces:**
- Produces: clases Tailwind `bg-paper/sand/navy…`, `text-ink/body/muted/faint/azure…`, `font-display/font-sans`, `text-btn/micro/index/h2/display`, `tracking-label/button`; variables `--font-spectral`, `--font-instrument`. TODO el estilado posterior consume ESTOS nombres.

- [ ] **Step 1: Rama**

```bash
git checkout -b feat/fase-1-tornasol
```

- [ ] **Step 2: Fuentes en el layout**

En `app/[locale]/layout.tsx`, sustituir el import de Geist por:

```tsx
import { Spectral, Instrument_Sans } from 'next/font/google';

const spectral = Spectral({
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-spectral',
  display: 'swap',
});
const instrument = Instrument_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
});
```

y en el `<html>`: `className={`${spectral.variable} ${instrument.variable}`}`. (El resto del layout se reescribe en Task 5; aquí solo fuentes para poder compilar.)

- [ ] **Step 3: Reescribir `app/globals.css` con los tokens del spec §3.1**

```css
@import 'tailwindcss';

@theme {
  /* Paleta handoff «Fachada 4a» — ÚNICA definición de color del proyecto */
  --color-paper: #f7f5f0;
  --color-sand: #efebe2;
  --color-ink: #1e2124;
  --color-body: #4a5158;
  --color-muted: #6b7076;
  --color-faint: #9aa0a6;
  --color-hairline: #d9d4c8;
  --color-leader: #b9b2a4;
  --color-navy: #10314a;
  --color-azure: #17618f;
  --color-azure-light: #9bc4df;
  --color-azure-soft: #7faecd;
  --color-azure-logo: #2287c6; /* SOLO decorativo/focus: falla AA en texto pequeño sobre claro */
  --color-focus: #2287c6;
  --color-paper-a75: rgb(247 245 240 / 0.75);
  --color-paper-a55: rgb(247 245 240 / 0.55);
  --color-paper-a25: rgb(247 245 240 / 0.25);
  --color-paper-a85: rgb(247 245 240 / 0.85);

  /* Tipografía */
  --font-display: var(--font-spectral), Georgia, serif;
  --font-sans: var(--font-instrument), system-ui, sans-serif;
  --text-display: clamp(2.5rem, 1.1rem + 4.6vw, 4.5rem);      /* H1 40→72 */
  --text-display--line-height: 1.08;
  --text-h2: clamp(1.625rem, 1rem + 2vw, 2.75rem);            /* H2 26→44 */
  --text-h2--line-height: 1.18;
  --text-h3: clamp(1.5rem, 1.2rem + 1.2vw, 2.375rem);         /* 24→38 */
  --text-h3--line-height: 1.2;
  --text-index: clamp(1.1875rem, 1rem + 0.8vw, 1.5625rem);    /* filas índice 19→25 */
  --text-index--line-height: 1.3;
  --text-lede: 1.0625rem;                                      /* 17px */
  --text-lede--line-height: 1.65;
  --text-btn: 0.8125rem;                                       /* 13px */
  --text-micro: 0.75rem;                                       /* 12px */
  --text-fine: 0.6875rem;                                      /* 11px legal */
  --text-fine--line-height: 1.65;

  --tracking-label: 0.24em;
  --tracking-label-wide: 0.26em;
  --tracking-button: 0.14em;
  --tracking-cities: 0.18em;

  /* Breakpoint del handoff (~980px) */
  --breakpoint-lg: 61.25rem;

  --radius-none: 0;
}

:root {
  --scrim-hero-desktop: linear-gradient(72deg, rgb(9 26 40 / 0.88) 0%, rgb(9 26 40 / 0.62) 38%, rgb(9 26 40 / 0.18) 70%, rgb(9 26 40 / 0.3) 100%);
  --scrim-hero-mobile: linear-gradient(180deg, rgb(9 26 40 / 0.72) 0%, rgb(9 26 40 / 0.3) 34%, rgb(9 26 40 / 0.55) 62%, rgb(9 26 40 / 0.9) 100%);
  --scrim-interior: linear-gradient(72deg, rgb(9 26 40 / 0.9) 0%, rgb(9 26 40 / 0.6) 55%, rgb(9 26 40 / 0.35) 100%);
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

(Eliminar el bloque `:root`/`@theme inline` anterior de Geist.)

- [ ] **Step 4: Verificar build**

Run: `npm run build` — Esperado: verde (las páginas siguen con el markup viejo; solo cambian fuentes/tokens).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css 'app/[locale]/layout.tsx'
git commit -m "feat: tokens del handoff Fachada 4a y fuentes Spectral + Instrument Sans"
```

---

### Task 2: Constantes de sitio y mensajes de home/común (EN/ES)

**Files:**
- Create: `lib/site.ts`
- Modify: `messages/en.json`, `messages/es.json` (añadir claves; conservar las existentes que siguen en uso: `common.nav`, `common.localeSwitcher`, títulos/descriptions de páginas)

**Interfaces:**
- Produces: `NMLS_ID`, `APPLY_URL`, `INSTAGRAM_URL`, `NMLS_CONSUMER_ACCESS_URL`, `WHATSAPP_NUMBER`, `whatsAppHref(message)`. Namespaces nuevos: `common.topStrip`, `common.cta`, `common.footer.*`, `home.hero/cities/programsIndex/about/ctaBand`, `programs.{key}.indexName/stat`. Las claves con `<em>` se renderizan con `t.rich`.

- [ ] **Step 1: `lib/site.ts`**

```ts
// Valores de negocio no-copy. Cambiar aquí = cambia toda la web (requisito cliente).
export const NMLS_ID = '1459301';
export const APPLY_URL = 'https://aimsmtg.my1003app.com/1459301/register';
export const INSTAGRAM_URL = 'https://www.instagram.com/dherrera_loans/';
export const NMLS_CONSUMER_ACCESS_URL = 'https://www.nmlsconsumeraccess.org/';
/** PLACEHOLDER obvio hasta recibir el número real del cliente (Fase 4 lo bloquea). */
export const WHATSAPP_NUMBER = '13050000000';
export const PHONE_DISPLAY = '+1 (305) 000-0000';

export function whatsAppHref(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 2: Añadir claves a `messages/en.json`** (fusionar con lo existente; `nav.calculator` pasa a "Calculator", resto de nav igual)

```json
{
  "common": {
    "topStrip": { "left": "David Herrera — Mortgage Loan Originator", "right": "NMLS #{nmls} · Miami, Florida" },
    "cta": { "quote": "Get a Quote", "apply": "Apply Online", "whatsApp": "WhatsApp — same-day reply", "whatsAppMessage": "Hi David, I found your website and I'd like to talk about a mortgage." },
    "menu": { "open": "Open menu", "close": "Close menu" },
    "footer": {
      "explore": "Explore",
      "legal": "Legal",
      "links": { "loanOptions": "Loan Options", "calculator": "Mortgage Calculator", "quote": "Get a Quote", "about": "About David", "contact": "Contact", "privacy": "Privacy Policy", "accessibility": "Accessibility Statement", "consumerAccess": "NMLS Consumer Access" },
      "licenseLine1": "David Herrera · Mortgage Loan Originator",
      "licenseLine2": "NMLS #{nmls} · Licensed in Florida · Miami, FL",
      "instagram": "@dherrera_loans",
      "eho": "Equal Housing Opportunity",
      "disclaimer": "This is not an offer to enter into an agreement. Not all customers will qualify. Information, rates and programs are subject to change without notice. All products are subject to credit and property approval. Not all products are available in all states or for all dollar amounts. Other restrictions and limitations may apply. David Herrera is a licensed Mortgage Loan Originator, NMLS #{nmls}.",
      "pendingValidation": "Draft content — pending review by the licensing company.",
      "copyright": "© 2026 DherreraLoans. All rights reserved.",
      "languages": "English — Español"
    }
  },
  "home": {
    "hero": {
      "eyebrow": "David Herrera · Mortgage Loan Originator",
      "eyebrowMobile": "David Herrera · NMLS #{nmls}",
      "title": "Buying a home in Florida, <em>without the guesswork.</em>",
      "body": "Straight answers about your mortgage — first home, new to the country, or refinancing. In English or in Spanish, before you commit to anything.",
      "bodyMobile": "Straight answers, in English or Spanish, before you commit to anything.",
      "imageAlt": "Florida home with a bright exterior"
    },
    "cities": { "lead": "Working with buyers across Florida", "list": "— Miami · Fort Lauderdale · Orlando · Tampa · Naples" },
    "programsIndex": { "eyebrow": "Index — Section I", "title": "Loan programs", "helper": "Five ways to finance a home in Florida. If none of them fits, we'll talk anyway.", "rowLabel": "No. {number}" },
    "about": {
      "eyebrow": "Section II — A person, not a portal",
      "title": "One person answers your questions. The same one, every time.",
      "body": "Most of my clients are buying their first home, or their first home in the United States. I'll tell you what you qualify for and what it really costs — and I stay with you from the first call to the keys.",
      "caption": "David Herrera — your loan originator, start to closing.",
      "photoAlt": "David Herrera, mortgage loan originator in Miami"
    },
    "ctaBand": { "title": "Know your number <em>before</em> you fall in love with the house." }
  }
}
```

y dentro de `programs.{key}` (añadir a cada uno): `"indexName"` y `"stat"`:

| key | indexName EN | stat EN |
|---|---|---|
| fha | FHA Loans | 3.5% down |
| conventional | Conventional | 3% down |
| va | VA Loans | $0 down |
| firstTimeHomebuyer | First-Time Homebuyer | FL assistance |
| refinance | Refinance | Rate · cash-out |

- [ ] **Step 3: Añadir el espejo a `messages/es.json`**

```json
{
  "common": {
    "topStrip": { "left": "David Herrera — Originador de Préstamos Hipotecarios", "right": "NMLS #{nmls} · Miami, Florida" },
    "cta": { "quote": "Obtén tu cotización", "apply": "Aplica online", "whatsApp": "WhatsApp — respondo en el día", "whatsAppMessage": "Hola David, encontré tu página web y me gustaría hablar sobre una hipoteca." },
    "menu": { "open": "Abrir menú", "close": "Cerrar menú" },
    "footer": {
      "explore": "Explora",
      "legal": "Legal",
      "links": { "loanOptions": "Opciones de préstamo", "calculator": "Calculadora de hipoteca", "quote": "Obtén tu cotización", "about": "Sobre David", "contact": "Contacto", "privacy": "Política de privacidad", "accessibility": "Declaración de accesibilidad", "consumerAccess": "NMLS Consumer Access" },
      "licenseLine1": "David Herrera · Originador de Préstamos Hipotecarios",
      "licenseLine2": "NMLS #{nmls} · Licenciado en Florida · Miami, FL",
      "instagram": "@dherrera_loans",
      "eho": "Equal Housing Opportunity",
      "disclaimer": "Esto no es una oferta para celebrar un contrato. No todos los clientes calificarán. La información, las tasas y los programas están sujetos a cambio sin previo aviso. Todos los productos están sujetos a aprobación de crédito y de la propiedad. No todos los productos están disponibles en todos los estados ni para todos los montos. Pueden aplicar otras restricciones y limitaciones. David Herrera es un Originador de Préstamos Hipotecarios licenciado, NMLS #{nmls}.",
      "pendingValidation": "Contenido borrador — pendiente de revisión por la compañía licenciante.",
      "copyright": "© 2026 DherreraLoans. Todos los derechos reservados.",
      "languages": "English — Español"
    }
  },
  "home": {
    "hero": {
      "eyebrow": "David Herrera · Originador de Préstamos Hipotecarios",
      "eyebrowMobile": "David Herrera · NMLS #{nmls}",
      "title": "Comprar casa en Florida, <em>sin adivinanzas.</em>",
      "body": "Respuestas claras sobre tu hipoteca — primera casa, recién llegado al país o refinanciando. En español o en inglés, antes de comprometerte a nada.",
      "bodyMobile": "Respuestas claras, en español o en inglés, antes de comprometerte a nada.",
      "imageAlt": "Casa de Florida con exterior luminoso"
    },
    "cities": { "lead": "Trabajo con compradores en toda Florida", "list": "— Miami · Fort Lauderdale · Orlando · Tampa · Naples" },
    "programsIndex": { "eyebrow": "Índice — Sección I", "title": "Programas de préstamo", "helper": "Cinco maneras de financiar una casa en Florida. Si ninguna encaja, hablamos igual.", "rowLabel": "No. {number}" },
    "about": {
      "eyebrow": "Sección II — Una persona, no un portal",
      "title": "Una sola persona responde tus preguntas. La misma, siempre.",
      "body": "La mayoría de mis clientes compran su primera casa, o su primera casa en Estados Unidos. Te digo para qué calificas y cuánto cuesta de verdad — y te acompaño desde la primera llamada hasta las llaves.",
      "caption": "David Herrera — tu originador de préstamos, del inicio al cierre.",
      "photoAlt": "David Herrera, originador de préstamos hipotecarios en Miami"
    },
    "ctaBand": { "title": "Conoce tu número <em>antes</em> de enamorarte de la casa." }
  }
}
```

`programs.{key}`: `indexName` ES = «Préstamos FHA», «Convencional», «Préstamos VA», «Primer comprador», «Refinanciamiento»; `stat` ES = «3.5% de entrada», «3% de entrada», «$0 de entrada», «Asistencia FL», «Tasa · cash-out».

- [ ] **Step 4: Verificar paridad**

Run: `npm test` — Esperado: PASS (el test de paridad valida las claves nuevas en ambos idiomas; si falla, lista la clave que difiere — corregir).

- [ ] **Step 5: Commit**

```bash
git add lib/site.ts messages
git commit -m "feat: constantes de sitio y copy de home/común EN-ES (borrador YMYL)"
```

---

### Task 3: Assets de imagen

**Files:**
- Create: `assets/img/` (logo.png, logo-light.png, david.png, hero-home.jpg, hero-programs.jpg, hero-personal.jpg), `docs/CREDITS.md`

**Interfaces:**
- Produces: imports estáticos `import heroHome from '@/assets/img/hero-home.jpg'` etc. (StaticImageData con width/height/blur). `hero-programs` la usan loan-options/programas/quote/calculator; `hero-personal` la usan about/contact/legales/404.

- [ ] **Step 1: Copiar assets del handoff**

```bash
mkdir -p assets/img
cp design_handoff_home_fachada/assets/logo.png design_handoff_home_fachada/assets/logo-light.png design_handoff_home_fachada/assets/david.png assets/img/
```

- [ ] **Step 2: Descargar y optimizar las fotos de hero (Unsplash, licencia Unsplash)**

La del hero de la home es LA MISMA del handoff. Candidatas para interiores (elegir 2 tras verlas):

```bash
# Home (obligatoria — es la del handoff):
curl -sL "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80" -o /tmp/hero-home.jpg
# Candidatas interiores (casa Florida / palmeras / detalle arquitectónico claro):
curl -sL "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80" -o /tmp/cand-1.jpg
curl -sL "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80" -o /tmp/cand-2.jpg
curl -sL "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=2000&q=80" -o /tmp/cand-3.jpg
```

**Verificar VISUALMENTE cada descarga con la herramienta Read** (son fotos: confirmar que es una casa/entorno residencial luminoso coherente con el handoff; si una candidata no encaja o el ID no resuelve, sustituirla por otra búsqueda en unsplash.com y verificarla igual). Después optimizar (fuente ≤ 350 KB; next/image sirve <200 KB):

```bash
for f in hero-home cand-1 cand-2; do sips --resampleWidth 1800 -s format jpeg -s formatOptions 70 /tmp/$f.jpg --out /tmp/$f-opt.jpg; done
cp /tmp/hero-home-opt.jpg assets/img/hero-home.jpg
cp /tmp/cand-1-opt.jpg assets/img/hero-programs.jpg   # la candidata elegida para programas
cp /tmp/cand-2-opt.jpg assets/img/hero-personal.jpg   # la elegida para about/contacto/legales
ls -la assets/img/   # ninguna > 350 KB
```

- [ ] **Step 3: `docs/CREDITS.md`**

```markdown
# Créditos de imágenes (TEMPORALES hasta materiales del cliente — bloquea Fase 4, no Fase 1)

- `assets/img/hero-home.jpg` — Unsplash, R ARCHITECTURE (photo-1600585154340-be6161a56a0c), licencia Unsplash. Es la foto de la referencia del handoff.
- `assets/img/hero-programs.jpg` — Unsplash, <autor real de la foto elegida> (<id>), licencia Unsplash.
- `assets/img/hero-personal.jpg` — Unsplash, <autor real de la foto elegida> (<id>), licencia Unsplash.
- `assets/img/david.png` — foto temporal en baja resolución aportada por el cliente vía handoff; pendiente foto profesional.
- `assets/img/logo*.png` — marca del cliente (handoff).

(Rellenar autor/id reales al elegir las candidatas; no dejar los ángulos.)
```

- [ ] **Step 4: Commit**

```bash
git add assets docs/CREDITS.md
git commit -m "feat: assets de marca y fotos de hero temporales optimizadas (créditos en docs/CREDITS.md)"
```

---

### Task 4: ui kit base (componentes sin lógica)

**Files:**
- Create: `components/ui/button.tsx`, `text-link.tsx`, `eyebrow.tsx`, `section-heading.tsx`, `band.tsx`, `index-row.tsx`, `photo-plate.tsx`, `cities-strip.tsx`, `whatsapp-button.tsx`, `eho-mark.tsx`

**Interfaces:**
- Consumes: tokens Task 1, `Link` de `@/i18n/routing`.
- Produces (firmas exactas que consumen Tasks 5–7 y PRs B–D):
  - `Button({ href, variant, size?, external?, children })` — `variant: 'paper' | 'navy'`; `size: 'md' | 'lg'` (md=14×26, lg=18×36); `external` ⇒ `<a target="_blank" rel="noopener">`; interno ⇒ `Link` tipado.
  - `TextLink({ href, external?, tone?, children })` — `tone: 'azure' | 'paper'`(sobre oscuro).
  - `Eyebrow({ tone?, children })` — `tone: 'muted' | 'azure-light'`.
  - `SectionHeading({ eyebrow, title, helper? })`.
  - `Band({ tone, children })` — `tone: 'sand' | 'navy'`; sand lleva borde ink arriba/abajo.
  - `IndexRow({ number?, name, stat, href })` — fila del índice (nº oculto <lg), TODA la fila clicable.
  - `PhotoPlate({ image, alt, caption })`.
  - `CitiesStrip({ lead, list })`.
  - `WhatsAppButton({ label, message })` — outlined claro, icono SVG inline, href `whatsAppHref(message)`.
  - `EhoMark({ label })` — glifo SVG casita+«=» + texto 10px.

Sin tests unitarios propios (componentes sin lógica — ADR-0010; los cubren build, e2e y Lighthouse). No repetir aquí todos los ficheros: el patrón de estilo es SIEMPRE clases de tokens. Dos ejemplos canónicos que fijan el patrón (el resto se escribe igual):

- [ ] **Step 1: `components/ui/button.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type Props = {
  href: string | { pathname: string; params?: Record<string, string> };
  variant: 'paper' | 'navy';
  size?: 'md' | 'lg';
  external?: boolean;
  children: ReactNode;
};

const base =
  'inline-flex items-center justify-center font-sans text-btn font-semibold uppercase tracking-button transition hover:brightness-95';
const variants = { paper: 'bg-paper text-navy', navy: 'bg-navy text-paper' };
const sizes = { md: 'px-[26px] py-3.5', lg: 'px-9 py-[18px]' };

export function Button({ href, variant, size = 'md', external, children }: Props) {
  const className = `${base} ${variants[variant]} ${sizes[size]}`;
  if (external && typeof href === 'string') {
    return (
      <a href={href} target="_blank" rel="noopener" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href as never} className={className}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: `components/ui/index-row.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type Props = {
  number?: string; // "No. 1" — oculto < lg
  name: string;
  stat: string;
  href: { pathname: string; params: Record<string, string> };
  children?: ReactNode; // descripción opcional (Loan Options)
};

export function IndexRow({ number, name, stat, href, children }: Props) {
  return (
    <Link
      href={href as never}
      className="group flex flex-wrap items-baseline border-b border-hairline py-4 lg:py-[21px]"
    >
      {number ? (
        <span className="hidden w-14 shrink-0 font-sans text-[13px] text-leader lg:inline">{number}</span>
      ) : null}
      <span className="font-display text-index text-ink group-hover:text-azure">{name}</span>
      <span aria-hidden className="mx-3 flex-1 -translate-y-1 border-b border-dotted border-leader lg:mx-4" />
      <span className="font-sans text-[12.5px] font-medium tracking-[.04em] text-navy lg:text-sm">{stat}</span>
      {children ? <span className="mt-1 w-full pl-0 font-sans text-sm text-muted lg:pl-14">{children}</span> : null}
    </Link>
  );
}
```

- [ ] **Step 3: Escribir el resto de componentes de la lista con el mismo patrón** (todas las medidas del handoff: eyebrow 11.5–12px tracking-label(-wide) uppercase; SectionHeading = Eyebrow + `h2 font-display font-light text-h2` + helper `text-sm text-muted`; Band sand `bg-sand border-y border-ink`; navy `bg-navy` con padding 84/72→móvil 48/20; PhotoPlate fondo blanco `border border-ink` + caption `border-t border-ink px-4 py-2.5 font-sans text-micro italic text-muted`; CitiesStrip centrada `border-b border-ink py-[18px]`, lead `font-display italic text-[15px] text-body`, lista `font-sans text-micro tracking-cities text-muted uppercase`; WhatsAppButton `border border-paper-a55 text-paper px-6 py-4 inline-flex gap-2.5 items-center font-sans text-[13.5px] font-medium hover:bg-paper-a25` con el SVG del handoff; EhoMark con el SVG casita del handoff, `text-muted`).

- [ ] **Step 4: Verificar tipos y lint**

Run: `npx tsc --noEmit && npm run lint` — Esperado: verde.

- [ ] **Step 5: Commit**

```bash
git add components/ui
git commit -m "feat: ui kit base del sistema Fachada (Button, IndexRow, Band, PhotoPlate…)"
```

---

### Task 5: PageHero (header integrado), nav, LangToggle server y SiteFooter; layout sin header

**Files:**
- Create: `components/layout/page-hero.tsx`, `top-strip.tsx`, `nav-links.tsx`, `mobile-nav.tsx`, `lang-toggle.tsx`, `site-footer.tsx`
- Modify: `app/[locale]/layout.tsx` (quitar header/nav/switcher viejos; añadir SiteFooter), `tests/e2e/smoke.spec.ts`
- Delete: `components/locale-switcher.tsx`

**Interfaces:**
- Consumes: ui kit Task 4, mensajes Task 2, assets Task 3, `getPathname`/`Link` de `@/i18n/routing`, `slugFor` de `@/lib/programs`.
- Produces:
  - `PageHero({ locale, pathname, params?, image, imageAlt, eyebrow, eyebrowMobile?, title, body?, bodyMobile?, variant?, ctas? })` — `variant: 'home' | 'interior'` (default `interior`). `pathname` es la RUTA INTERNA (`'/about'`, `'/loan-options/[program]'`); `params.program` es la CLAVE interna (`'fha'`). Toda página la renderiza como primer hijo de `<main>`.
  - `LangToggle({ locale, pathname, params? })` — enlaces `<Link locale=…>` server-rendered; traduce el slug de programa con `slugFor`.
  - `SiteFooter({ locale })` — footer completo compliance.

- [ ] **Step 1: `components/layout/lang-toggle.tsx`**

```tsx
import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { slugFor } from '@/lib/programs';

type Props = { locale: string; pathname: string; params?: { program?: string } };

export function LangToggle({ locale, pathname, params }: Props) {
  return (
    <span className="font-sans text-micro font-medium uppercase tracking-button text-paper-a75">
      {routing.locales.map((l, i) => {
        const href = params?.program
          ? { pathname, params: { program: slugFor(l, params.program) } }
          : pathname;
        return (
          <span key={l}>
            {i > 0 ? ' — ' : null}
            {l === locale ? (
              <span aria-current="true" className="text-paper">{l.toUpperCase()}</span>
            ) : (
              <Link locale={l} href={href as never} className="hover:text-paper">
                {l.toUpperCase()}
              </Link>
            )}
          </span>
        );
      })}
    </span>
  );
}
```

- [ ] **Step 2: `components/layout/mobile-nav.tsx`** — `<details className="lg:hidden">`; `<summary aria-label={t('common.menu.open')}>` con SVG hamburguesa del handoff (24px, stroke paper); panel `absolute inset-x-0 top-full border-t border-paper-a25 bg-navy px-5 py-6 flex flex-col gap-5` con los 4 enlaces de nav (`NavLinks`), `Apply Online` (TextLink tone paper, external) y `Button paper` GET A QUOTE (href `/quote`). La navegación carga página nueva ⇒ el `<details>` se resetea solo; cero JS.

- [ ] **Step 3: `components/layout/nav-links.tsx`** — lista `Loan Options · Calculator · About · Contact` (claves `common.nav.*`) como `Link` con `text-[13.5px] font-medium text-paper-a85 hover:text-paper` (se reutiliza en header desktop y MobileNav; recibe `className`).

- [ ] **Step 4: `components/layout/page-hero.tsx`** (estructura; alturas y scrims exactos del handoff)

```tsx
import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import logoLight from '@/assets/img/logo-light.png';
import { APPLY_URL, NMLS_ID } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { TopStrip } from './top-strip';
import { NavLinks } from './nav-links';
import { MobileNav } from './mobile-nav';
import { LangToggle } from './lang-toggle';

type Props = {
  locale: string;
  pathname: string;
  params?: { program?: string };
  image: StaticImageData;
  imageAlt: string;
  eyebrow: string;
  eyebrowMobile?: string;
  title: ReactNode;
  body?: ReactNode;
  bodyMobile?: ReactNode;
  variant?: 'home' | 'interior';
  ctas?: ReactNode;
};

export async function PageHero({ locale, pathname, params, image, imageAlt, eyebrow, eyebrowMobile, title, body, bodyMobile, variant = 'interior', ctas }: Props) {
  const t = await getTranslations('common');
  const heights = variant === 'home' ? 'min-h-[680px] lg:min-h-[820px]' : 'min-h-[420px] lg:min-h-[480px]';
  return (
    <section className={`relative flex flex-col bg-navy ${heights}`}>
      <Image src={image} alt={imageAlt} fill priority placeholder="blur" sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 [background:var(--scrim-hero-mobile)] lg:[background:var(--scrim-hero-desktop)]" />
      <div className="relative flex flex-1 flex-col">
        <TopStrip left={t('topStrip.left', { nmls: NMLS_ID })} right={t('topStrip.right', { nmls: NMLS_ID })} />
        <header className="relative flex items-center justify-between border-b border-paper-a25 px-5 py-4 lg:border-0 lg:px-[72px] lg:py-5">
          <Link href="/" aria-label="DherreraLoans">
            <Image src={logoLight} alt="DherreraLoans" className="h-11 w-auto lg:h-14" />
          </Link>
          <nav aria-label={t('menu.open')} className="hidden gap-[34px] lg:flex">
            <NavLinks />
          </nav>
          <div className="flex items-center gap-4 lg:gap-[26px]">
            <LangToggle locale={locale} pathname={pathname} params={params} />
            <a href={APPLY_URL} target="_blank" rel="noopener" className="hidden border-b border-paper-a55 pb-px font-sans text-[13.5px] font-medium text-paper hover:border-paper lg:inline">
              {t('cta.apply')}
            </a>
            <span className="hidden lg:inline"><Button href="/quote" variant="paper">{t('cta.quote')}</Button></span>
            <MobileNav />
          </div>
        </header>
        <div className="flex flex-1 flex-col justify-end gap-4 px-5 pb-[72px] lg:gap-7 lg:px-[72px] lg:pb-24">
          <p className="font-sans text-[10.5px] font-medium uppercase tracking-label text-azure-light lg:text-micro">
            <span className="lg:hidden">{eyebrowMobile ?? eyebrow}</span>
            <span className="hidden lg:inline">{eyebrow}</span>
          </p>
          <h1 className="max-w-[860px] font-display text-display font-light text-paper [text-wrap:pretty] [&_em]:font-light">{title}</h1>
          {body ? (
            <p className="max-w-[560px] font-sans text-[15px] leading-relaxed text-paper-a85 lg:text-lede">
              <span className="lg:hidden">{bodyMobile ?? body}</span>
              <span className="hidden lg:inline">{body}</span>
            </p>
          ) : null}
          {ctas ? <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">{ctas}</div> : null}
        </div>
      </div>
    </section>
  );
}
```

(`TopStrip`: `hidden lg:flex justify-between border-b border-paper-a25 px-[72px] py-3 font-sans text-fine font-medium uppercase tracking-label text-paper-a75`.)

- [ ] **Step 5: `components/layout/site-footer.tsx`** — traducción del footer del handoff: grid `lg:grid-cols-[1.3fr_1fr_1fr_auto]` con marca (logo.png + `licenseLine1/2` interpolando `NMLS_ID` + instagram como TextLink external), columna EXPLORE (links internos), columna LEGAL (privacy, accessibility, consumerAccess external a `NMLS_CONSUMER_ACCESS_URL`), `EhoMark`; debajo `disclaimer` (text-fine text-faint, max-w-[1100px]) + línea `pendingValidation` en text-fine italic + fila © / languages. Móvil: una columna, orden marca→explore→legal→EHO.

- [ ] **Step 6: Reescribir `app/[locale]/layout.tsx`** — conserva fuentes (Task 1), `generateStaticParams`, `metadataBase`, `hasLocale`; el body queda `<body><main>{children}</main><SiteFooter locale={locale} /></body>`. **Eliminar** `NextIntlClientProvider`, el `<header>` viejo y el import de `LocaleSwitcher`; borrar `components/locale-switcher.tsx`. El `aria-label` del nav ya queda correcto en PageHero (deuda saldada).

```bash
git rm components/locale-switcher.tsx
```

- [ ] **Step 7: Actualizar `tests/e2e/smoke.spec.ts`**

El h1 y el switcher cambian. Sustituir las aserciones afectadas:

```ts
const strip = (s: string) => s.replace(/<\/?em>/g, '');

test('/ redirige al idioma por defecto (en)', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('h1')).toHaveText(strip(en.home.hero.title));
});
// ídem test de navegador es-ES con es.home.hero.title

test('el selector de idioma traduce también el pathname', async ({ page }) => {
  await page.goto('/en/loan-options');
  await page.getByRole('link', { name: 'ES' }).click();
  await expect(page).toHaveURL(/\/es\/opciones-de-prestamo$/);
});

test('el selector traduce el slug del programa', async ({ page }) => {
  await page.goto('/en/loan-options/fha-loans');
  await page.getByRole('link', { name: 'ES' }).click();
  await expect(page).toHaveURL(/\/es\/opciones-de-prestamo\/prestamos-fha$/);
});
```

(El test del h1 de `/es/opciones-de-prestamo` seguirá pasando: la página interior renombra su heading en Task 6/PR B pero mantiene `loanOptions.heading` hasta PR B.)

- [ ] **Step 8: Las páginas existentes aún no usan PageHero** — para que build/e2e pasen en este commit, las páginas esqueleto siguen renderizando su `<h1>` plano (sin header ahora). Run: `npm run build && npm run test:e2e` — Esperado: los tests de switcher del Step 7 FALLAN todavía (no hay LangToggle en pantalla: las páginas no montan PageHero). Es el «rojo» esperado; Task 6 los pone en verde al montar la home, y el resto de páginas montan PageHero en Task 6 Step 3.

- [ ] **Step 9: Commit**

```bash
git add components/layout 'app/[locale]/layout.tsx' tests/e2e/smoke.spec.ts
git commit -m "feat: PageHero con header integrado, LangToggle server-rendered y footer compliance"
```

---

### Task 6: Home completa + PageHero en todas las páginas existentes

**Files:**
- Modify: `app/[locale]/page.tsx` (home completa) y las páginas esqueleto (`loan-options`, `[program]`, `quote`, `calculator`, `about`, `contact`, `privacy`, `accessibility`) para montar `PageHero` interior
- Create: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: todo lo anterior. Patrón por página esqueleto: `PageHero` interior con `image={heroProgramsImg | heroPersonalImg}`, `eyebrow={t('…title') de topStrip}`… — el contenido real de interiores llega en PRs B–D; aquí solo hero + `heading` existente como intro.

- [ ] **Step 1: `app/[locale]/page.tsx` — home del handoff completa**

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { programSlugs } from '@/config/routes.mjs';
import { NMLS_ID } from '@/lib/site';
import heroHome from '@/assets/img/hero-home.jpg';
import davidImg from '@/assets/img/david.png';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { CitiesStrip } from '@/components/ui/cities-strip';
import { SectionHeading } from '@/components/ui/section-heading';
import { IndexRow } from '@/components/ui/index-row';
import { Band } from '@/components/ui/band';
import { PhotoPlate } from '@/components/ui/photo-plate';
import { TextLink } from '@/components/ui/text-link';
import { INSTAGRAM_URL } from '@/lib/site';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'home', pathname: '/' });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tc = await getTranslations('common');
  const tp = await getTranslations('programs');
  const programKeys = Object.keys(programSlugs);
  const em = { em: (c: React.ReactNode) => <em>{c}</em> };

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/"
        variant="home"
        image={heroHome}
        imageAlt={t('hero.imageAlt')}
        eyebrow={t('hero.eyebrow')}
        eyebrowMobile={t('hero.eyebrowMobile', { nmls: NMLS_ID })}
        title={t.rich('hero.title', em)}
        body={t('hero.body')}
        bodyMobile={t('hero.bodyMobile')}
        ctas={
          <>
            <Button href="/quote" variant="paper" size="lg">{tc('cta.quote')}</Button>
            <WhatsAppButton label={tc('cta.whatsApp')} message={tc('cta.whatsAppMessage')} />
          </>
        }
      />
      <CitiesStrip lead={t('cities.lead')} list={t('cities.list')} />
      <section className="grid gap-6 px-5 py-8 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-[72px]">
        <SectionHeading eyebrow={t('programsIndex.eyebrow')} title={t('programsIndex.title')} helper={t('programsIndex.helper')} />
        <div className="flex flex-col">
          {programKeys.map((key, i) => (
            <IndexRow
              key={key}
              number={t('programsIndex.rowLabel', { number: i + 1 })}
              name={tp(`${key}.indexName`)}
              stat={tp(`${key}.stat`)}
              href={{ pathname: '/loan-options/[program]', params: { program: key } }}
            />
          ))}
        </div>
      </section>
      <Band tone="sand">
        <div className="grid items-center gap-6 px-5 py-8 lg:grid-cols-[400px_1fr] lg:gap-16 lg:px-[72px] lg:py-16">
          <PhotoPlate image={davidImg} alt={t('about.photoAlt')} caption={t('about.caption')} />
          <div className="flex flex-col gap-4 lg:gap-5">
            <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
            <p className="max-w-[620px] font-sans text-base leading-[1.7] text-body">{t('about.body')}</p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
              <Button href="/quote" variant="navy">{tc('cta.quote')}</Button>
              <TextLink href={INSTAGRAM_URL} external>{tc('footer.instagram')}</TextLink>
            </div>
          </div>
        </div>
      </Band>
      <Band tone="navy">
        <div className="flex flex-col gap-8 px-5 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-[72px] lg:py-[84px]">
          <h2 className="max-w-[760px] font-display text-h2 font-light text-paper [text-wrap:pretty] [&_em]:italic">
            {t.rich('ctaBand.title', em)}
          </h2>
          <span className="shrink-0"><Button href="/quote" variant="paper" size="lg">{tc('cta.quote')}</Button></span>
        </div>
      </Band>
    </>
  );
}
```

**Nota IndexRow ↔ LangToggle**: `href.params.program` recibe la CLAVE interna; `IndexRow` la pasa a `Link`, que espera el SLUG público — resolver en `IndexRow` con `slugFor(locale, key)` igual que `LangToggle`, pasando `locale` como prop… Para no duplicar: `IndexRow` acepta `href={{ pathname, params: { program: <slug ya resuelto> } }}` y la HOME resuelve `slugFor(locale, key)` al construirlo. (Interfaz definitiva: el consumidor pasa slugs públicos; `LangToggle` es el ÚNICO que recibe claves internas.)

- [ ] **Step 2: Montar `PageHero` interior en las 8 páginas esqueleto** — patrón (ejemplo `about`; idéntico cambiando namespace/imagen/pathname):

```tsx
import heroPersonal from '@/assets/img/hero-personal.jpg';
// …imports como en Fase 0 + PageHero
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  return (
    <PageHero locale={locale} pathname="/about" image={heroPersonal} imageAlt={t('title')} eyebrow={t('title')} title={t('heading')} />
  );
}
```

`loan-options`, `quote`, `calculator` usan `heroPrograms`; `about`, `contact`, `privacy`, `accessibility` usan `heroPersonal`. La página de programa pasa además `params={{ program: key }}` (clave interna) a `PageHero` — esto arregla el switcher en programas.

- [ ] **Step 3: `tests/e2e/home.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';

test('la home monta las 5 filas del índice con enlaces a programas', async ({ page }) => {
  await page.goto('/en');
  const rows = page.locator('a[href^="/en/loan-options/"]');
  await expect(rows).toHaveCount(5);
  await expect(rows.first()).toContainText(en.programs.fha.indexName);
});

test('CTAs del hero: quote interno y WhatsApp con deep link', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('link', { name: en.common.cta.quote }).first()).toHaveAttribute('href', '/en/quote');
  const wa = page.getByRole('link', { name: en.common.cta.whatsApp });
  await expect(wa).toHaveAttribute('href', /wa\.me\/13050000000/);
});

test('Apply Online apunta a my1003app con noopener', async ({ page }) => {
  await page.goto('/en');
  const apply = page.getByRole('link', { name: en.common.cta.apply }).first();
  await expect(apply).toHaveAttribute('href', /aimsmtg\.my1003app\.com/);
  await expect(apply).toHaveAttribute('rel', /noopener/);
});

test('footer compliance: NMLS, EHO y Consumer Access', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('footer')).toContainText('NMLS #1459301');
  await expect(page.locator('footer')).toContainText(en.common.footer.eho);
  await expect(page.locator('footer').getByRole('link', { name: en.common.footer.links.consumerAccess })).toHaveAttribute('href', /nmlsconsumeraccess\.org/);
});
```

- [ ] **Step 4: Gate local completo**

Run: `npm run lint && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e`
Esperado: TODO verde (incluidos los tests de switcher de Task 5 — ahora hay LangToggle en todas las páginas — y `check:static` con 26 rutas `●`).

- [ ] **Step 5: Commit**

```bash
git add 'app/[locale]' tests/e2e/home.spec.ts
git commit -m "feat: home Fachada 4a completa y PageHero en todas las páginas"
```

---

### Task 7: PR tornasol + gate visual del usuario

- [ ] **Step 1: Push + PR**

```bash
git push -u origin feat/fase-1-tornasol
gh pr create --repo ATEP-Consulting/dherreraloans \
  --title "Fase 1 · PR tornasol: sistema de diseño Fachada 4a + home" \
  --body "Tokens + ui kit + PageHero común + home pixel-fiel al handoff. Copy YMYL en borrador (pendiente validación cliente). Plan: docs/superpowers/plans/2026-08-06-fase-1-contenido-diseno-seo.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

- [ ] **Step 2: Checks verdes** — `quality` + preview + Lighthouse ≥95×4. Si Lighthouse cae: sospechosos en orden — peso de fotos hero (recomprimir a q60/1600), fuentes (confirmar subsets/weights exactos), CLS del hero (dimensiones/fill correctos). Umbrales NO se tocan.

- [ ] **Step 3: ⛔ GATE DE USUARIO** — pasar la URL de preview al usuario; él la compara con el handoff en su móvil. **No mergear ni seguir con PR B sin su aprobación explícita del visual.** Iterar aquí lo que pida (los cambios son baratos: tokens/componentes).

- [ ] **Step 4: Squash merge + verificación de producción**

```bash
gh pr merge --repo ATEP-Consulting/dherreraloans --squash --delete-branch
/usr/bin/curl -s -o /dev/null -w "%{http_code}" https://dherreraloans.vercel.app/en   # 200
```

---

# PR B — Programas + Loan Options + JSON-LD de entidad (rama `feat/fase-1-programas`)

### Task 8: Copy completo de programas y loan options (EN/ES)

**Files:**
- Modify: `messages/en.json`, `messages/es.json`

**Interfaces (ACTUALIZADO 2026-08-06 — template aimsmtg, ver docs/referencia-contenido-aimsmtg.md que es VINCULANTE):**
- Produces: `programs.{key}` gana `heroTitle` (H1 beneficio-primero, ≠ heading), `heroSub` (nombra el problema del lector), `blurb` (1-2 líneas para Loan Options), `intro` (párrafo), `whatIs.title` + `whatIs.body` («¿Qué es un préstamo X?»: definición, quién lo respalda, cifra clave, diferencia con convencional), `required.title` + `required.body` («¿Qué se requiere?»: documentación, entrada, restricciones, flexibilidad de crédito), `how.title` + `how.items` (array de 4 bullets concretos: entrada mínima, plazos, variantes, condiciones — en genérico prudente, David valida cifras); `loanOptions` gana `helper`. `notFound.{title,heading,body,cta}` se añade aquí también (lo consume PR D). Redacción PROPIA basada en los temas de aimsmtg (nunca copia literal), voz personal de David, tono del handoff, sin métricas inventadas.

- [ ] **Step 1: EN — añadir a cada programa** (contenido íntegro; estructura idéntica en los 5):

```json
"fha": {
  "heroSub": "Backed by the Federal Housing Administration — flexible credit requirements and a 3.5% down payment.",
  "blurb": "Flexible requirements and a low down payment. Often the first door into homeownership.",
  "what": { "title": "What it is", "body": "An FHA loan is a government-insured mortgage designed for buyers who need flexibility on credit history or savings. You can qualify with a 3.5% down payment and a credit score that conventional programs may not accept." },
  "who": { "title": "Who it's for", "items": ["First-time buyers building credit history", "Buyers with savings for a smaller down payment", "Buyers recovering from past credit events"] },
  "start": { "title": "How we start", "body": "We review your income, credit and savings together, and I tell you in plain terms whether FHA is your best route — or whether another program fits you better." }
},
"conventional": {
  "heroSub": "The classic route — competitive terms with solid credit, from 3% down.",
  "blurb": "Competitive conditions if your credit is solid. Down payments from 3%.",
  "what": { "title": "What it is", "body": "A conventional loan is the standard mortgage, not insured by a government agency. With solid credit it usually means competitive rates, flexible terms and mortgage insurance you can remove over time." },
  "who": { "title": "Who it's for", "items": ["Buyers with established credit", "Buyers who can put 3% or more down", "Homeowners buying their next home"] },
  "start": { "title": "How we start", "body": "We look at your credit profile and your target monthly payment, and compare conventional against FHA side by side, in numbers you can read." }
},
"va": {
  "heroSub": "For veterans and active-duty service members — often with no down payment.",
  "blurb": "Benefits for veterans and active service members. Often $0 down.",
  "what": { "title": "What it is", "body": "A VA loan is a mortgage guaranteed by the U.S. Department of Veterans Affairs for eligible veterans, service members and surviving spouses — often with no down payment and no monthly mortgage insurance." },
  "who": { "title": "Who it's for", "items": ["Veterans and active-duty service members", "Eligible surviving spouses", "Buyers who want to keep savings intact"] },
  "start": { "title": "How we start", "body": "We confirm your eligibility and certificate, and I walk you through what the benefit really covers before you commit to anything." }
},
"firstTimeHomebuyer": {
  "heroSub": "Florida programs and assistance for your first home.",
  "blurb": "Programs and assistance for your first home in Florida.",
  "what": { "title": "What it is", "body": "First-time buyer programs combine loans like FHA or conventional with Florida assistance for down payment and closing costs — help that many buyers never claim because nobody told them it exists." },
  "who": { "title": "Who it's for", "items": ["Buyers purchasing their first home", "Buyers purchasing their first home in the U.S.", "Buyers with income within program limits"] },
  "start": { "title": "How we start", "body": "We check which assistance you qualify for and what it changes in your numbers — before you start visiting houses." }
},
"refinance": {
  "heroSub": "Lower your payment, change your term, or use your home's equity.",
  "blurb": "Lower your payment, shorten your term, or take cash out.",
  "what": { "title": "What it is", "body": "Refinancing replaces your current mortgage with a new one — to lower the rate, change the term, remove mortgage insurance, or take cash out from the equity you've built." },
  "who": { "title": "Who it's for", "items": ["Homeowners paying above today's rates", "Homeowners who want a different term", "Homeowners who need their equity working"] },
  "start": { "title": "How we start", "body": "Send me your current statement and I'll tell you honestly whether refinancing pays off in your case — and when it doesn't." }
}
```

y `loanOptions.helper`: "Every program below is available across Florida. Compare them, or ask me which one fits your case."

- [ ] **Step 2: ES — espejo completo** (misma estructura; redactar en el tono del handoff, tú directo; p. ej. fha.what.body: "Un préstamo FHA es una hipoteca asegurada por el gobierno pensada para compradores que necesitan flexibilidad en historial de crédito o ahorros. Puedes calificar con un 3.5% de entrada y un puntaje que los programas convencionales quizá no acepten." — completar los 5 programas + loanOptions.helper: "Todos los programas están disponibles en toda Florida. Compáralos, o pregúntame cuál encaja con tu caso.").

- [ ] **Step 3: `npm test`** — paridad PASS. Commit: `git commit -m "feat: contenido de los 5 programas y loan options EN-ES (borrador YMYL)"`.

### Task 9: JSON-LD tipado (TDD)

**Files:**
- Create: `lib/jsonld.ts`, `components/seo/json-ld.tsx`, `tests/unit/jsonld.test.ts`
- Modify: `app/[locale]/layout.tsx` (Person global)

**Interfaces:**
- Produces: `personJsonLd()`, `financialServiceJsonLd(locale)`, `mortgageLoanJsonLd(locale, programKey)`, `breadcrumbJsonLd(locale, programKey)` — objetos planos serializables; `<JsonLd data={obj} />` renderiza `<script type="application/ld+json">`.

- [ ] **Step 1: Test que falla** (`tests/unit/jsonld.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { personJsonLd, mortgageLoanJsonLd, breadcrumbJsonLd, financialServiceJsonLd } from '@/lib/jsonld';

describe('JSON-LD (ADR-0003 §4)', () => {
  it('Person: NMLS como identifier, sameAs a Instagram y Consumer Access', () => {
    const p = personJsonLd();
    expect(p['@type']).toBe('Person');
    expect(p.identifier).toMatchObject({ propertyID: 'NMLS', value: '1459301' });
    expect(p.sameAs).toEqual(expect.arrayContaining([expect.stringContaining('instagram'), expect.stringContaining('nmlsconsumeraccess')]));
    expect(p.jobTitle).toBe('Mortgage Loan Originator');
  });
  it('MortgageLoan referencia a la Person como provider y usa la URL localizada', () => {
    const m = mortgageLoanJsonLd('es', 'fha');
    expect(m['@type']).toBe('MortgageLoan');
    expect(m.provider['@type']).toBe('Person');
    expect(m.url).toContain('/es/opciones-de-prestamo/prestamos-fha');
  });
  it('BreadcrumbList: Home → Loan Options → Programa', () => {
    const b = breadcrumbJsonLd('en', 'va');
    expect(b.itemListElement).toHaveLength(3);
    expect(b.itemListElement[2].name.length).toBeGreaterThan(0);
  });
  it('FinancialService enlaza provider Person y areaServed', () => {
    const f = financialServiceJsonLd('en');
    expect(f.provider['@type']).toBe('Person');
    expect(JSON.stringify(f.areaServed)).toContain('Miami');
  });
});
```

Run: `npm test` — FAIL (`lib/jsonld` no existe).

- [ ] **Step 2: Implementar `lib/jsonld.ts`** — con `SITE_URL`, `hreflangAlternates` (para URLs), constantes de `lib/site.ts` y nombres desde `messages` cargados con `createTranslator` o valores estáticos EN (los JSON-LD usan el nombre localizado de programa vía import directo de `messages/{locale}.json`). `worksFor`: `{ '@type': 'Organization', name: 'AIMS Mortgage' }` con comentario `// PENDIENTE: confirmar razón social exacta con el cliente`. Run: `npm test` — PASS.

- [ ] **Step 3: `components/seo/json-ld.tsx`**

```tsx
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

`app/[locale]/layout.tsx` añade `<JsonLd data={personJsonLd()} />` en el body. Commit: `feat: JSON-LD Person/FinancialService/MortgageLoan/Breadcrumb con tests`.

### Task 10: Páginas de programa y Loan Options con contenido

**Files:**
- Modify: `app/[locale]/loan-options/[program]/page.tsx`, `app/[locale]/loan-options/page.tsx`
- Test: ampliar `tests/e2e/home.spec.ts` con un spec de programa

- [ ] **Step 1: Página de programa (template aimsmtg — docs/referencia-contenido-aimsmtg.md)** — `PageHero` interior (`heroPrograms`, eyebrow = `t('indexName')` + stat, title = `heroTitle` (beneficio), body = `heroSub`, `params={{program:key}}`) → breadcrumb visible (`nav aria-label` con Links Home → Loan Options → programa, text-micro tracking-label) → `intro` (párrafo lede, medida 65ch) → sección `whatIs` (SectionHeading + body) → `required` (SectionHeading + body) → `how` (título + 4 bullets con hairlines, lista `border-b border-hairline py-4`) → `Band navy` CTA (reutilizar el bloque de la home con `ctaBand.title`) → `<JsonLd data={mortgageLoanJsonLd(locale, key)} />` + `<JsonLd data={breadcrumbJsonLd(locale, key)} />`.
- [ ] **Step 2: Loan Options** — PageHero interior + lista `IndexRow` con `children={tp(`${key}.blurb`)}` + numeración.
- [ ] **Step 3: E2E**

```ts
test('página de programa: contenido y JSON-LD', async ({ page }) => {
  await page.goto('/es/opciones-de-prestamo/prestamos-fha');
  await expect(page.locator('h1')).toContainText(es.programs.fha.heading);
  await expect(page.locator('main')).toContainText(es.programs.fha.what.title);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join('')).toContain('"MortgageLoan"');
  expect(ld.join('')).toContain('"BreadcrumbList"');
});
```

- [ ] **Step 4: Gate local completo (los 6 comandos) → Commit → push → PR `Fase 1: programas + loan options + JSON-LD` → checks verdes → squash merge.**

---

# PR C — About + Contact + FinancialService (rama `feat/fase-1-about-contact`)

### Task 11: Copy + páginas About y Contact

**Files:**
- Modify: `messages/{en,es}.json` (`about.*`, `contact.*` completos), `app/[locale]/about/page.tsx`, `app/[locale]/contact/page.tsx`, `app/[locale]/page.tsx` (añadir `<JsonLd data={financialServiceJsonLd(locale)} />`)

- [ ] **Step 1: Copy About EN** (ES espejo): `heroSub` "Mortgage loan originator in Miami. One person, start to closing."; secciones: `story` (title "How I work" / body 2 frases sobre acompañamiento bilingüe primera llamada→cierre, sin métricas inventadas), `license` (title "Licensed, personally" / body con NMLS #{nmls} interpolado + enlace Consumer Access), `reach` (title "Where to find me" / body Instagram @dherrera_loans + WhatsApp). Contact EN/ES: `phone.label/value(PHONE_DISPLAY)`, `email.label/value("hola@dherreraloans.com — placeholder")`, `whatsapp.label`, `note` "Prefer a form? The full questionnaire is the fastest way to get real numbers." + nota placeholder pendiente datos reales.
- [ ] **Step 2: About page** — PageHero personal + PhotoPlate David + secciones story/license/reach + `<JsonLd data={financialServiceJsonLd(locale)} />` + Band navy CTA. Contact page — PageHero + tarjetas de contacto (grid con `border border-ink` estilo placa, tel:/mailto:/wa.me) + Band navy CTA. **Sin formulario** (spec §4.7).
- [ ] **Step 3: Gate local → commit → PR `Fase 1: about + contact` → merge.** (E2E: contact muestra tel placeholder y wa.me; about contiene NMLS.)

---

# PR D — Shells + legales + 404 (rama `feat/fase-1-shells-legales`)

### Task 12: Copy + páginas Quote shell, Calculator shell, Privacy, Accessibility, not-found

**Files:**
- Modify: `messages/{en,es}.json` (`quote.*`, `calculator.*`, `legal.privacy.*`, `legal.accessibility.*`, `notFound.*`), páginas correspondientes
- Create: `app/[locale]/not-found.tsx`

- [ ] **Step 1: Copy**: quote shell — `heroSub` "Five minutes of questions, real numbers back. The questionnaire is coming online shortly." + `steps` (3 ítems: tu meta → tus números → hablamos) + `meanwhile` "Until then, WhatsApp me or call — same answers, same person." Calculator shell — `heroSub` + `example` con `{ price: "$300,000", term: "30 years/años", rate: "6.5%", payment: "$1,896/mo·mes", note: "Illustrative example, not an offer. / Ejemplo ilustrativo, no es una oferta." }` (cuota verificada: 300000·r(1+r)^360/((1+r)^360−1), r=0.065/12 → $1,896). Privacy y Accessibility — borrador estándar ~200 palabras cada uno marcado `pendingValidation`; accessibility declara objetivo WCAG 2.1 AA + contacto. `notFound` — title/heading "Page not found / Página no encontrada", body corto, cta a home.
- [ ] **Step 2: Páginas** — shells con PageHero programs + secciones; legales con PageHero personal + documento `max-w-[65ch]` tipografía editorial; `not-found.tsx` con PageHero personal + Button navy a `/`. Verificar que el 404 sigue prerenderizado (`npm run check:static` intacto + `curl` local de ruta inexistente → 404 con layout).
- [ ] **Step 3: Gate local → commit → PR `Fase 1: shells de quote/calculadora + legales + 404` → merge.**

---

# PR E — SEO transversal: metadata OG + imágenes OG (rama `feat/fase-1-seo-og`)

### Task 13: Extender `buildPageMetadata` (TDD)

**Files:**
- Modify: `lib/metadata.ts`, todas las páginas (pasar `ogSlug` si difiere del namespace)
- Test: `tests/unit/metadata-og.test.ts`

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest';
import { buildPageMetadata } from '@/lib/metadata';

describe('metadata OG (ADR-0003 §2)', () => {
  it('openGraph con locale, alternates e imagen por idioma', async () => {
    const m = await buildPageMetadata({ locale: 'es', namespace: 'about', pathname: '/about' });
    expect(m.openGraph).toMatchObject({ locale: 'es_US', siteName: 'DherreraLoans' });
    expect(JSON.stringify(m.openGraph?.images)).toContain('/og/es/about.png');
    expect(m.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(String(m.title)).toMatch(/DherreraLoans/);
  });
});
```

- [ ] **Step 2: Implementar**: `buildPageMetadata` añade `ogSlug?: string` (default: último segmento del namespace, `home` para `/`); `title` = `` `${t('title')} | DherreraLoans` `` salvo home = `` `DherreraLoans — ${t('title')}` ``; `openGraph: { type: 'website', siteName: 'DherreraLoans', locale: locale === 'en' ? 'en_US' : 'es_US', alternateLocale: [otro], url: canonical, images: [{ url: `/og/${locale}/${ogSlug}.png`, width: 1200, height: 630 }] }`; `twitter: { card: 'summary_large_image' }`. PASS + commit.

### Task 14: Script de OG images

**Files:**
- Create: `scripts/generate-og.mjs`, `public/og/{en,es}/*.png` (13 páginas × 2)
- Modify: `package.json` (devDeps `satori`, `@resvg/resvg-js`; script `"og": "node scripts/generate-og.mjs"`)

- [ ] **Step 1:** `npm i -D satori @resvg/resvg-js`
- [ ] **Step 2:** Script: lee `messages/{en,es}.json` y `config/routes.mjs`, baja los TTF de Spectral 300 e Instrument Sans 500 (css2 con UA curl → URLs truetype, cachear en `scripts/.fonts/`, gitignored), y por página renderiza con satori un lienzo 1200×630: fondo `#10314A`, borde interior 1px `rgba(247,245,240,.25)` a 24px, eyebrow Instrument 500 22px `#9BC4DF` tracking amplio ("DHERRERALOANS — {locale label}"), título de página Spectral 300 64px `#F7F5F0` (máx 2 líneas), pie Instrument 22px `rgba(247,245,240,.75)` "NMLS #1459301 · MIAMI, FL" + logo-light (leído de `assets/img/logo-light.png` como data URI, h 80 esquina). Resvg → PNG < 150 KB.
- [ ] **Step 3:** `npm run og` → verificar 26 PNGs con Read (muestreo 2-3), commit PNGs + script: `feat: OG images 1200×630 por página e idioma pre-generadas`.
- [ ] **Step 4: Gate local → PR `Fase 1: metadata OG completa + imágenes` → merge.**

---

# PR F — Deuda técnica + cierre (rama `feat/fase-1-deuda`)

### Task 15: middleware→proxy, baseline JS y cierre

**Files:**
- Rename: `middleware.ts` → `proxy.ts` (verificar convención en `node_modules/next/dist/docs/` ANTES: nombre de archivo, export y `config.matcher` en Next 16.3)
- Modify: `docs/adr/0003-arquitectura-seo-y-rendimiento.md` (nota post-aprobación baseline), plan (checkboxes), memoria

- [ ] **Step 1:** Leer la doc de Next 16 sobre proxy/middleware; renombrar según diga (mismo contenido); `npm run build && npm run test:e2e` — el enrutado localizado sigue funcionando (los E2E de pathnames son el gate real).
- [ ] **Step 2:** Medir First Load JS del build (`npm run build` output, páginas de contenido) — con cero client components debe rondar el baseline de Next puro. Añadir nota post-aprobación al ADR-0003 §7: "Baseline real Fase 1: X KB gz (medido 2026-MM-DD); presupuesto operativo ≤ X+15 KB".
- [ ] **Step 3:** `curl` de verificación de producción (en, es/cotizacion, robots noindex) + Lighthouse verde en el PR.
- [ ] **Step 4:** Cerrar checkboxes de este plan, commit `docs: Fase 1 completada`, actualizar memoria (`dherreraloans-estado-fase-0` → nota de Fase 1 completada o memoria nueva de estado).
- [ ] **Step 5: PR `Fase 1: proxy + baseline JS + cierre` → merge.**

---

## Self-review del plan (hecho al redactar)

1. **Cobertura del spec**: tokens §3.1→Task 1 · tipografía §3.2→Task 1 · ui kit §3.3→Tasks 4–5 · PageHero común→Task 5–6 · assets §3.4→Task 3 · páginas §4→Tasks 6, 10, 11, 12 · SEO §5→Tasks 9, 13, 14 · deuda §6→Tasks 5 (switcher/aria), 12 (404), 15 (proxy/baseline) · rendimiento §7→gates por PR · testing §8→Tasks 5–6, 9–10, 13 · proceso §9→estructura de PRs con gate de usuario en Task 7 · pendientes §10→placeholders marcados + CREDITS.
2. **Placeholders**: los únicos «rellenar» son los autores reales de las 2 fotos candidatas (imposibles de fijar antes de verlas — el paso obliga a verificarlas y registrarlas) y la razón social de `worksFor` (dato del cliente, marcado PENDIENTE en código).
3. **Consistencia de tipos**: `IndexRow.href` recibe SLUGS públicos (la nota de Task 6 lo fija); `LangToggle`/`PageHero.params` reciben CLAVES internas y traducen con `slugFor` — interfaces declaradas en ambos lados. `variant: 'paper' | 'navy'` uniforme en Button; `tone` en Band/Eyebrow/TextLink.
