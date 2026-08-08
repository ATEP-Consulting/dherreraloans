# Fase 2.5 — Paridad aimsmtg · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Paridad funcional con aimsmtg.com antes del pulido y la demo: envoltorios de conversión (Pre-Qualify, quiz en home y contacto, trío de tarjetas) y suite completa de calculadoras (8 variantes).

**Architecture:** El quiz existente se reutiliza sin forks en 4 envoltorios. Las calculadoras son funciones puras en `lib/calc/` + componentes de variante que comparten los form controls de `components/ui/form/` y un layout común de dos columnas; la página `/calculator` gana pestañas con estado local. Cero dependencias nuevas; gráficos con SVG/divs.

**Tech Stack:** Next.js 16 App Router · next-intl · Tailwind v4 (tokens `@theme`) · Vitest · Playwright. Sin librerías de gráficos ni de formularios.

**Spec:** `docs/superpowers/specs/2026-08-07-fase-2-5-paridad-aimsmtg-design.md`
**Fuente de datos normativa:** `docs/referencia-aimsmtg-desglose-completo.md` (= «§desglose»). Leer AMBOS antes de empezar.

## Global Constraints

- Lighthouse ≥ 95 ×4 en cada PR (gate de CI; `skipAudits` de `lighthouserc.json` no se tocan).
- Presupuesto First Load JS gz (medir con `node scripts/measure-first-load.mjs .next/server/app/en/<ruta>.html` tras `npm run build`): `/quote` ≤ 170 · `/` ≤ 170 · `/contact` ≤ 170 · `/pre-qualify` ≤ 170 · `/calculator` ≤ 175. Resto: baseline (~149-152) intacto.
- Todo texto visible en `messages/{en,es}.json` con paridad de claves (testeada). Redacción PROPIA — nunca copy literal de aimsmtg (los labels funcionales tipo "Interest rate" son genéricos y están bien; el copy editorial se redacta de cero). Todo copy nuevo = borrador YMYL.
- Todo valor de estilo = token `@theme` existente en `app/globals.css`; cero estilos ad hoc (ADR-0010). Esta fase NO añade tokens: usa los existentes (`ink`, `navy`, `paper`, `sand`, `body`, `muted`, `hairline`, escalas `text-*`, `tracking-label`).
- Rutas SOLO desde `config/routes.mjs`. Páginas prerenderizadas (`npm run check:static`).
- Fórmulas puras sin redondeo interno (regla de `lib/mortgage.ts`); el redondeo es de la capa de presentación. Inputs inválidos → `null`.
- Sin dependencias nuevas en `package.json`.
- Commits `tipo: descripción` en español + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Gate local completo antes de cada PR: `npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e`.

## Mapa de archivos

```
PR D (envoltorios):
  Modify: lib/site.ts                          — + APPLY_URL placeholder
  Create: components/ui/action-cards.tsx       — trío de tarjetas CTA (server)
  Create: app/[locale]/pre-qualify/page.tsx    — envoltorio educativo + Quiz
  Modify: app/[locale]/page.tsx                — sección quiz embebido + ActionCards
  Modify: app/[locale]/contact/page.tsx        — Quiz embebido (sustituye quoteNudge)
  Modify: config/routes.mjs                    — ruta /pre-qualify
  Modify: components/layout/nav-links.tsx      — item Pre-Qualify
  Modify: messages/en.json, messages/es.json   — prequalify.*, home.tellUs.*, home.actionCards.*, contact.quizLead
  Modify: tests/unit/{routes,sitemap,metadata-og}.test.ts — contadores 42→44
  Create: tests/e2e/prequalify.spec.ts
  Modify: tests/e2e/home.spec.ts

PR E (calculadoras núcleo):
  Create: lib/calc/constants.ts                — constantes de negocio (única fuente)
  Create: lib/calc/affordability.ts + tests/unit/calc-affordability.test.ts
  Create: lib/calc/purchase.ts     + tests/unit/calc-purchase.test.ts
  Create: lib/calc/refinance.ts    + tests/unit/calc-refinance.test.ts
  Create: lib/calc/rent-vs-buy.ts  + tests/unit/calc-rent-vs-buy.test.ts
  Create: components/calculator/calc-tabs.tsx      — barra de pestañas + estado
  Create: components/calculator/calc-layout.tsx    — layout 2 columnas form/resultados
  Create: components/calculator/calc-donut.tsx     — donut SVG del desglose de pago
  Create: components/calculator/affordability-calc.tsx
  Create: components/calculator/refinance-calc.tsx
  Create: components/calculator/rent-vs-buy-calc.tsx
  Rename: components/calculator/mortgage-calculator.tsx → purchase-calc.tsx (variante Purchase, +extra payment)
  Modify: app/[locale]/calculator/page.tsx
  Modify: messages/{en,es}.json                — calculator.tabs.*, calculator.afford.*, calculator.refi.*, calculator.rentBuy.*, calculator.purchase.*
  Modify: tests/e2e/calculator.spec.ts

PR F (VA + inversor):
  Create: lib/calc/va.ts   + tests/unit/calc-va.test.ts
  Create: lib/calc/dscr.ts + tests/unit/calc-dscr.test.ts
  Create: lib/calc/flip.ts + tests/unit/calc-flip.test.ts
  Create: components/calculator/va-purchase-calc.tsx
  Create: components/calculator/va-refinance-calc.tsx
  Create: components/calculator/dscr-calc.tsx
  Create: components/calculator/flip-calc.tsx
  Modify: components/calculator/calc-tabs.tsx, app/[locale]/calculator/page.tsx
  Modify: messages/{en,es}.json                — calculator.vaPurchase.*, calculator.vaRefi.*, calculator.dscr.*, calculator.flip.*
  Modify: tests/e2e/calculator.spec.ts
```

---

# PR D — Envoltorios de conversión (`feat/fase-2-5-envoltorios`)

### Task 1: `APPLY_URL` + componente `ActionCards` + integración en home

**Files:**
- Modify: `lib/site.ts`
- Create: `components/ui/action-cards.tsx`
- Modify: `app/[locale]/page.tsx`
- Modify: `messages/en.json`, `messages/es.json` (namespace `home.actionCards`)

**Interfaces:**
- Produces: `APPLY_URL: string` exportada de `lib/site.ts`; `<ActionCards />` server component sin props (lee `home.actionCards` de next-intl).

- [x] **Step 1: Crear rama**

```bash
git checkout main && git pull && git checkout -b feat/fase-2-5-envoltorios
```

- [x] **Step 2: Añadir `APPLY_URL` a `lib/site.ts`** (junto a los placeholders de teléfono/email existentes):

```ts
// Solicitud 1003 online (POS externo). PLACEHOLDER OBVIO hasta que David confirme su
// enlace real (en aimsmtg era aimsmtg.my1003app.com/1459301/register — sin confirmar).
export const APPLY_URL = 'https://example.com/solicitud-online-PENDIENTE';
```

- [x] **Step 3: Crear `components/ui/action-cards.tsx`** — server component, tres tarjetas equivalentes al trío de cierre de aimsmtg (§desglose «Flujo 4», punto 4): quote interno, apply externo, calculadora. Grid 1→3 columnas, borde `hairline`, patrón visual de `IndexRow`/cards Fachada (borde 1px, radius 0, sin sombras):

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { APPLY_URL } from '@/lib/site';
import { Container } from '@/components/ui/container';

const CARDS = [
  { key: 'quote', href: '/quote' as const, external: false },
  { key: 'apply', href: APPLY_URL, external: true },
  { key: 'calculator', href: '/calculator' as const, external: false },
] as const;

export async function ActionCards() {
  const t = await getTranslations('home.actionCards');
  return (
    <section>
      <Container className="grid gap-px border-y border-hairline bg-hairline px-0 lg:grid-cols-3">
        {CARDS.map(({ key, href, external }) => {
          const inner = (
            <span className="flex h-full flex-col gap-3 bg-paper px-5 py-8 transition-colors hover:bg-sand lg:px-8 lg:py-10">
              <span className="font-sans text-micro font-medium uppercase tracking-label text-muted">{t(`${key}.eyebrow`)}</span>
              <span className="font-display text-h3 font-light text-ink">{t(`${key}.title`)}</span>
              <span className="font-sans text-sm text-body">{t(`${key}.body`)}</span>
            </span>
          );
          return external ? (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
          ) : (
            <Link key={key} href={href}>{inner}</Link>
          );
        })}
      </Container>
    </section>
  );
}
```

Nota: si `text-h3` no existe como token, usar el token de heading intermedio que exista en `globals.css` (comprobar antes; no crear tokens nuevos).

- [x] **Step 4: Messages.** En `messages/en.json`, dentro de `home`, añadir:

```json
"actionCards": {
  "quote":      { "eyebrow": "Quote",      "title": "See your loan scenarios", "body": "Answer a few questions and let's talk numbers — no commitment." },
  "apply":      { "eyebrow": "Apply",      "title": "Start your application",  "body": "Ready to move? Begin the secure online application." },
  "calculator": { "eyebrow": "Calculator", "title": "Run your own numbers",    "body": "Compare payments, programs and scenarios on your terms." }
}
```

En `messages/es.json` (mismas claves exactas):

```json
"actionCards": {
  "quote":      { "eyebrow": "Cotización",  "title": "Mira tus escenarios de préstamo", "body": "Responde unas preguntas y hablamos de números — sin compromiso." },
  "apply":      { "eyebrow": "Solicitud",   "title": "Comienza tu solicitud",           "body": "¿Todo listo? Empieza la solicitud online segura." },
  "calculator": { "eyebrow": "Calculadora", "title": "Haz tus propios números",         "body": "Compara pagos, programas y escenarios a tu ritmo." }
}
```

- [x] **Step 5: Integrar en `app/[locale]/page.tsx`**: importar `ActionCards` y renderizarla entre el `<Band>` de about y `<CtaBand />`.

- [x] **Step 6: Verificar y commit**

```bash
npm run lint && npx tsc --noEmit && npm test
git add -A && git commit -m "feat: trío de tarjetas de acción en home y APPLY_URL placeholder"
```

Expected: paridad i18n en verde (claves EN=ES).

### Task 2: Quiz embebido en home («Cuéntanos tu caso»)

**Files:**
- Modify: `app/[locale]/page.tsx`
- Modify: `messages/en.json`, `messages/es.json` (namespace `home.tellUs`)
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `<Quiz locale texts thanksCtas />` de `components/quiz/quiz.tsx` (props exactas: ver `app/[locale]/quote/page.tsx`), `QuizTexts` de `lib/quiz/texts.ts`.

- [x] **Step 1: Sección en home.** En `app/[locale]/page.tsx`, entre `<CitiesStrip>` y la sección del índice de programas (patrón aimsmtg §desglose «Flujo 4»: el funnel va en el primer tercio), añadir — reutilizando los textos del quiz del namespace `quote` para no duplicar el árbol `quiz` en messages:

```tsx
// imports nuevos:
import { Quiz } from '@/components/quiz/quiz';
import type { QuizTexts } from '@/lib/quiz/texts';
// en el cuerpo, tras obtener t/tc:
const tq = await getTranslations('quote');
const quizTexts = tq.raw('quiz') as QuizTexts;
// JSX:
<section id="quiz">
  <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-16">
    <SectionHeading eyebrow={t('tellUs.eyebrow')} title={t('tellUs.title')} helper={t('tellUs.helper')} />
    <Quiz locale={locale} texts={quizTexts} thanksCtas={/* mismo bloque de CTAs que /quote */} />
  </Container>
</section>
```

- [x] **Step 2: Messages `home.tellUs`.** EN: `{ "eyebrow": "Your story", "title": "Tell me where you are — I'll map the way.", "helper": "A few questions, zero commitment. Your answers stay on this device until you hit send." }` · ES (mismas claves): `{ "eyebrow": "Tu historia", "title": "Cuéntame en qué punto estás — yo trazo el camino.", "helper": "Unas pocas preguntas, cero compromiso. Tus respuestas se quedan en este dispositivo hasta que pulses enviar." }`

- [x] **Step 3: e2e.** Añadir a `tests/e2e/home.spec.ts` (estilo de los specs existentes — mirar `quiz.spec.ts` para los selectores del quiz):

```ts
test('el quiz embebido en home avanza y comparte progreso con /quote', async ({ page }) => {
  await page.goto('/');
  const quiz = page.locator('#quiz');
  await quiz.getByRole('radio').first().check(); // paso 1: purchase → auto-avance
  await expect(quiz.getByText(/2/)).toBeVisible(); // barra de progreso en paso 2
  await page.goto('/quote');
  await expect(page.getByText(/2/)).toBeVisible(); // sessionStorage compartido: retoma en paso 2
});
```

Ajustar los selectores a los reales de `quiz.spec.ts` (roles/nombres accesibles del quiz) — el contrato es: avanzar en home Y retomar en /quote.

- [x] **Step 4: Presupuesto JS de home**

```bash
npm run build && node scripts/measure-first-load.mjs .next/server/app/en.html
```

Expected: TOTAL ≤ 170 KB gz (home paga ahora el chunk del quiz). Si el archivo del HTML de home tiene otro nombre en `.next/server/app/`, localizarlo con `ls .next/server/app/*.html`.

- [x] **Step 5: e2e + commit**

```bash
npm run test:e2e -- home && git add -A && git commit -m "feat: cuestionario embebido en la home con progreso compartido"
```

### Task 3: Ruta `/pre-qualify` (envoltorio educativo + quiz)

**Files:**
- Modify: `config/routes.mjs`
- Create: `app/[locale]/pre-qualify/page.tsx`
- Modify: `components/layout/nav-links.tsx`
- Modify: `messages/en.json`, `messages/es.json` (namespace nuevo `prequalify`)
- Modify: `tests/unit/routes.test.ts`, `tests/unit/sitemap.test.ts`, `tests/unit/metadata-og.test.ts`

**Interfaces:**
- Produces: pathname interno `'/pre-qualify'` (slug es `'/precalificacion'`) disponible para `Link`/nav.

- [x] **Step 1: Ruta.** En `config/routes.mjs` añadir a `pathnames`:

```js
'/pre-qualify': { en: '/pre-qualify', es: '/precalificacion' },
```

- [x] **Step 2: Namespace `prequalify` en messages.** Estructura calcada del namespace `quote` (title, description, heading, heroTitle, heroSub) + secciones educativas propias. El contenido educativo se basa en §desglose «Flujo 2 — /mortgage-prequalified/» (precualificación te hace comprador serio; qué mira un prestamista: historial de pago, ingresos, deudas; consejo de revisar tu crédito) con redacción PROPIA. EN:

```json
"prequalify": {
  "title": "Pre-Qualify",
  "description": "Find out what you may qualify for before you start house hunting. A pre-qualification makes you a stronger buyer.",
  "heading": "Pre-Qualify",
  "heroTitle": "Walk into every showing as a serious buyer.",
  "heroSub": "Many agents ask for a pre-qualification before the first visit. Get yours sorted in minutes.",
  "why": {
    "eyebrow": "Why it matters",
    "title": "A pre-qualification tells sellers you're for real.",
    "body": "Before you fall in love with a home, let's estimate what you may be approved for. With that letter in hand, agents and sellers take your offer seriously — and you shop with a clear budget instead of a guess."
  },
  "credit": {
    "eyebrow": "Your credit",
    "title": "Know how your credit looks first.",
    "body": "Lenders weigh your payment history, income and current debts. Reviewing your credit report before applying lets you fix surprises early — and if your score is lower than you'd like, we can talk about a plan to get it ready."
  },
  "start": { "eyebrow": "Get started", "title": "Answer a few questions to begin.", "helper": "It takes a few minutes and nothing is shared until you hit send." }
}
```

ES (mismas claves exactas):

```json
"prequalify": {
  "title": "Precalificación",
  "description": "Descubre a cuánto podrías optar antes de empezar a buscar casa. Una precalificación te hace un comprador más fuerte.",
  "heading": "Precalificación",
  "heroTitle": "Llega a cada visita como un comprador serio.",
  "heroSub": "Muchos agentes piden una precalificación antes de la primera visita. Resuelve la tuya en minutos.",
  "why": {
    "eyebrow": "Por qué importa",
    "title": "Una precalificación le dice al vendedor que vas en serio.",
    "body": "Antes de enamorarte de una casa, estimemos cuánto podrían aprobarte. Con esa carta en la mano, agentes y vendedores toman tu oferta en serio — y buscas con un presupuesto claro en vez de una suposición."
  },
  "credit": {
    "eyebrow": "Tu crédito",
    "title": "Conoce primero cómo está tu crédito.",
    "body": "Los prestamistas miran tu historial de pagos, tus ingresos y tus deudas actuales. Revisar tu reporte de crédito antes de aplicar te permite corregir sorpresas a tiempo — y si tu puntaje está más bajo de lo que quisieras, armamos un plan para prepararlo."
  },
  "start": { "eyebrow": "Empieza", "title": "Responde unas preguntas para comenzar.", "helper": "Toma unos minutos y no se comparte nada hasta que pulses enviar." }
}
```

- [x] **Step 3: Página.** Crear `app/[locale]/pre-qualify/page.tsx` clonando la estructura de `app/[locale]/quote/page.tsx` (mismo `generateStaticParams`/`generateMetadata` con `namespace: 'prequalify'`, `pathname: '/pre-qualify'`, mismo `PageHero` + imagen existente de assets) y añadiendo entre el hero y el quiz dos bloques editoriales con `SectionHeading` (`why`, `credit`) dentro de `Container`, y un tercer `SectionHeading` (`start`) inmediatamente antes de `<Quiz …>` (mismas props/thanksCtas que en /quote).

- [x] **Step 4: Nav.** En `components/layout/nav-links.tsx` añadir el item Pre-Qualify (leer el patrón del archivo: los items usan claves de `common.nav.*` — añadir `"prequalify": "Pre-Qualify"` / `"prequalify": "Precalificación"` en `common.nav` de ambos messages y colocarlo entre Quote/Calculator siguiendo el orden del menú aimsmtg §desglose «Header/nav»). Comprobar `components/layout/mobile-nav.tsx` por si duplica la lista.

- [x] **Step 5: Tests de contadores.** `npm test` — los tests de rutas/sitemap/OG fallarán con los contadores viejos: actualizar en `tests/unit/routes.test.ts`, `tests/unit/sitemap.test.ts` y `tests/unit/metadata-og.test.ts` las aserciones de total de rutas estáticas/OG de 42 a 44 (una ruta nueva × 2 locales). Si algún test deriva el contador de `config/routes.mjs` automáticamente, no tocarlo.

- [x] **Step 6: Verificar estático + commit**

```bash
npm run build && npm run check:static && node scripts/measure-first-load.mjs .next/server/app/en/pre-qualify.html
git add -A && git commit -m "feat: página Pre-Qualify — envoltorio educativo del cuestionario"
```

Expected: check:static en verde con 44 rutas; presupuesto ≤ 170.

### Task 4: Quiz en `/contact`, e2e de pre-qualify y PR D

**Files:**
- Modify: `app/[locale]/contact/page.tsx`
- Modify: `messages/en.json`, `messages/es.json` (clave `contact.quizLead`; eliminar `contact.quoteNudge`)
- Create: `tests/e2e/prequalify.spec.ts`

- [x] **Step 1: Contacto.** En `app/[locale]/contact/page.tsx`: sustituir el bloque `quoteNudge` por una sección con `SectionHeading` (usa `contact.quizLead`) + `<Quiz>` (mismas props que /quote). Añadir `"quizLead": { "eyebrow": "Or start here", "title": "Prefer to skip the phone tag? Tell me your situation." }` / ES `{ "eyebrow": "O empieza aquí", "title": "¿Prefieres saltarte el teléfono? Cuéntame tu situación." }` y borrar `quoteNudge` de AMBOS locales (paridad).

- [x] **Step 2: e2e nuevo** `tests/e2e/prequalify.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('pre-qualify renderiza el envoltorio y el quiz responde', async ({ page }) => {
  await page.goto('/pre-qualify');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('radio').first().check();
  await expect(page.getByText(/2/)).toBeVisible();
});

test('la versión en español existe con slug propio', async ({ page }) => {
  await page.goto('/es/precalificacion');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

(Selector del radio: igualar al usado en `quiz.spec.ts`.)

- [x] **Step 3: Presupuestos de las 4 rutas con quiz**

```bash
npm run build
for r in en.html en/quote.html en/contact.html en/pre-qualify.html; do node scripts/measure-first-load.mjs .next/server/app/$r; done
```

Expected: todas ≤ 170 KB gz. Si `/quote` supera 170 por arrastre de imports nuevos, revisar que home/contact/pre-qualify no hayan metido imports en módulos compartidos con el quiz.

- [x] **Step 4: Gate completo + PR D**

```bash
npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e
git add -A && git commit -m "feat: cuestionario embebido en contacto y e2e de precalificación"
git push -u origin feat/fase-2-5-envoltorios
gh pr create --title "Fase 2.5 · PR D: envoltorios de conversión — Pre-Qualify, quiz en home y contacto, tarjetas de acción" --body "..."
```

Expected: checks verdes (quality + preview Lighthouse) → squash merge antes de empezar PR E.

---

# PR E — Calculadoras núcleo (`feat/fase-2-5-calculadoras-nucleo`)

### Task 5: `lib/calc/constants.ts` + `lib/calc/affordability.ts` (TDD)

**Files:**
- Create: `lib/calc/constants.ts`, `lib/calc/affordability.ts`
- Test: `tests/unit/calc-affordability.test.ts`

**Interfaces:**
- Consumes: `monthlyPayment(principal, annualRatePct, years)` de `lib/mortgage.ts`.
- Produces: `affordability(input: AffordabilityInput, program: Program): AffordabilityResult | null`; constantes `DEFAULTS`, `PMI_FACTOR_BY_SCORE`, `DTI_LIMITS`, `FHA_MIP`, `USDA_FEE`, `VA_FUNDING_FEE`, `CREDIT_BANDS`.

- [x] **Step 1: Rama** — `git checkout main && git pull && git checkout -b feat/fase-2-5-calculadoras-nucleo`

- [x] **Step 2: Constantes.** Crear `lib/calc/constants.ts` — ÚNICA fuente de la configuración de negocio (valores de §desglose «Proveedor/tecnología → Config inyectada» y «Variantes → Affordability»; los marcados ⚠︎ son estándar de mercado o configuración del broker de referencia — **validar con David antes de Fase 4**):

```ts
// Configuración de negocio de las calculadoras. ⚠︎ = copiado de la referencia o
// estándar de mercado — pendiente de validación de David (YMYL).
export const DEFAULTS = {
  price: 200000, ratePct: 5, years: 30, propertyTaxPct: 0.6, insuranceYearly: 1200,
  monthlyIncome: 5000, monthlyDebts: 1500,
} as const;

export const CREDIT_BANDS = ['620-639', '640-659', '660-679', '680-699', '700-719', '720-739', '740-759', '760+'] as const;
export type CreditBand = (typeof CREDIT_BANDS)[number];

// ⚠︎ % anual de PMI sobre el préstamo, por tramo de credit score (conventional/jumbo).
export const PMI_FACTOR_BY_SCORE: Record<CreditBand, number> = {
  '620-639': 1.5, '640-659': 1.31, '660-679': 1.23, '680-699': 0.98,
  '700-719': 0.79, '720-739': 0.7, '740-759': 0.58, '760+': 0.46,
};

// ⚠︎ Ratios DTI (front/back, %) permitidos por programa.
export const DTI_LIMITS = {
  conventional: { front: 50, back: 50 }, fha: { front: 50, back: 50 },
  va: { front: 65, back: 65 }, usda: { front: 29, back: 41 }, jumbo: { front: 50, back: 50 },
} as const;
export type Program = keyof typeof DTI_LIMITS;

export const FHA_MIP = { upfrontPct: 1.75, annualPct: 0.55 } as const; // ⚠︎ estándar mercado
export const USDA_FEE = { upfrontPct: 1.0, annualPct: 0.35 } as const; // ⚠︎ estándar mercado

// Tabla VA por tramos de entrada (§desglose, tabla VA funding fee).
export const VA_FUNDING_FEE = {
  purchase: {
    first: [{ minDownPct: 10, pct: 1.25 }, { minDownPct: 5, pct: 1.5 }, { minDownPct: 0, pct: 2.15 }],
    subsequent: [{ minDownPct: 10, pct: 1.25 }, { minDownPct: 5, pct: 1.5 }, { minDownPct: 0, pct: 3.3 }],
  },
  cashOut: { first: 2.15, subsequent: 3.3 },
  irrrl: 0.5,
} as const;
```

- [x] **Step 3: Test que falla.** `tests/unit/calc-affordability.test.ts` (estilo de `tests/unit/mortgage.test.ts`; casos calculados a mano):

```ts
import { describe, it, expect } from 'vitest';
import { affordability } from '@/lib/calc/affordability';

const base = {
  monthlyIncome: 5000, monthlyDebts: 1500, price: 200000, downPayment: 0,
  annualRatePct: 5, years: 30, propertyTaxPct: 0.6, insuranceYearly: 1200,
  hoaMonthly: 0, creditBand: '760+' as const,
};

describe('affordability', () => {
  it('conventional: P&I 1073.64 + tax 100 + ins 100 + PMI 76.67 y DTI 27/57 sobre límite 50/50', () => {
    const r = affordability(base, 'conventional')!;
    expect(r.monthlyPI).toBeCloseTo(1073.64, 1);
    expect(r.monthlyFee).toBeCloseTo(76.67, 1);          // 200000 × 0.46% / 12
    expect(r.totalMonthly).toBeCloseTo(1350.31, 1);
    expect(r.frontDti).toBeCloseTo(27.01, 1);
    expect(r.backDti).toBeCloseTo(57.01, 1);
    expect(r.limits).toEqual({ front: 50, back: 50 });
    expect(r.withinLimits).toBe(false);                   // 57 > 50
  });
  it('conventional sin PMI con 20% de entrada', () => {
    const r = affordability({ ...base, downPayment: 40000 }, 'conventional')!;
    expect(r.monthlyFee).toBe(0);
  });
  it('fha: upfront MIP financiado y MIP mensual sobre el préstamo base', () => {
    const r = affordability({ ...base, downPayment: 7000 }, 'fha')!;   // 3.5%
    expect(r.loanAmount).toBeCloseTo(196377.5, 0);        // 193000 × 1.0175
    expect(r.monthlyPI).toBeCloseTo(1054.2, 1);
    expect(r.monthlyFee).toBeCloseTo(88.46, 1);           // 193000 × 0.55% / 12
    expect(r.totalMonthly).toBeCloseTo(1342.66, 1);
  });
  it('usda: límites 29/41', () => {
    expect(affordability(base, 'usda')!.limits).toEqual({ front: 29, back: 41 });
  });
  it('inputs inválidos → null', () => {
    expect(affordability({ ...base, monthlyIncome: 0 }, 'conventional')).toBeNull();
    expect(affordability({ ...base, downPayment: 200000 }, 'conventional')).toBeNull();
  });
});
```

- [x] **Step 4: Ver el fallo** — `npm test -- calc-affordability` → FAIL (módulo no existe).

- [x] **Step 5: Implementar** `lib/calc/affordability.ts`:

```ts
import { monthlyPayment } from '@/lib/mortgage';
import { DTI_LIMITS, PMI_FACTOR_BY_SCORE, FHA_MIP, USDA_FEE, type Program, type CreditBand } from './constants';

export type AffordabilityInput = {
  monthlyIncome: number; monthlyDebts: number; price: number; downPayment: number;
  annualRatePct: number; years: number; propertyTaxPct: number; insuranceYearly: number;
  hoaMonthly: number; creditBand: CreditBand;
};
export type AffordabilityResult = {
  loanAmount: number; monthlyPI: number; monthlyTax: number; monthlyInsurance: number;
  monthlyHoa: number; monthlyFee: number; upfrontFee: number; totalMonthly: number;
  frontDti: number; backDti: number; limits: { front: number; back: number }; withinLimits: boolean;
};

// Simplificaciones (documentadas en la spec §3.4): FHA/USDA financian el upfront fee en el
// préstamo; el fee mensual (PMI/MIP/anual USDA) se calcula sobre el préstamo BASE; VA no
// lleva fee mensual (el funding fee se trata en lib/calc/va.ts, PR F).
export function affordability(input: AffordabilityInput, program: Program): AffordabilityResult | null {
  const { monthlyIncome, monthlyDebts, price, downPayment, annualRatePct, years } = input;
  if (monthlyIncome <= 0 || monthlyDebts < 0 || price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || annualRatePct < 0) return null;
  const base = price - downPayment;
  const downPct = (downPayment / price) * 100;
  const upfrontPct = program === 'fha' ? FHA_MIP.upfrontPct : program === 'usda' ? USDA_FEE.upfrontPct : 0;
  const upfrontFee = base * (upfrontPct / 100);
  const loanAmount = base + upfrontFee;
  const monthlyPI = monthlyPayment(loanAmount, annualRatePct, years);
  const feeYearlyPct =
    program === 'fha' ? FHA_MIP.annualPct :
    program === 'usda' ? USDA_FEE.annualPct :
    program === 'va' ? 0 :
    downPct < 20 ? PMI_FACTOR_BY_SCORE[input.creditBand] : 0;
  const monthlyFee = (base * (feeYearlyPct / 100)) / 12;
  const monthlyTax = (price * (input.propertyTaxPct / 100)) / 12;
  const monthlyInsurance = input.insuranceYearly / 12;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + input.hoaMonthly + monthlyFee;
  const frontDti = (totalMonthly / monthlyIncome) * 100;
  const backDti = ((totalMonthly + monthlyDebts) / monthlyIncome) * 100;
  const limits = DTI_LIMITS[program];
  return {
    loanAmount, monthlyPI, monthlyTax, monthlyInsurance, monthlyHoa: input.hoaMonthly,
    monthlyFee, upfrontFee, totalMonthly, frontDti, backDti,
    limits: { front: limits.front, back: limits.back },
    withinLimits: frontDti <= limits.front && backDti <= limits.back,
  };
}
```

- [x] **Step 6: Verde + commit** — `npm test -- calc-affordability` → PASS · `git add -A && git commit -m "feat: constantes de negocio y motor affordability con DTI por programa"`

### Task 6: `lib/calc/purchase.ts` (TDD) — PITI + amortización anticipada

**Files:** Create `lib/calc/purchase.ts` · Test `tests/unit/calc-purchase.test.ts`

**Interfaces:**
- Produces: `purchaseBreakdown(input: PurchaseInput): PurchaseResult | null` con `PurchaseResult = { principal, monthlyPI, breakdown: { pi, tax, insurance, hoa, pmi, extra }, totalMonthly, totalInterest, totalCost, payoffMonths, monthsSaved, interestSaved }`.

- [x] **Step 1: Test que falla:**

```ts
import { describe, it, expect } from 'vitest';
import { purchaseBreakdown } from '@/lib/calc/purchase';

const base = { price: 200000, downPayment: 0, annualRatePct: 5, years: 30, pmiYearly: 0, propertyTaxPct: 0.6, insuranceYearly: 1200, hoaMonthly: 0, extraMonthly: 0 };

describe('purchaseBreakdown', () => {
  it('sin extra: P&I 1073.64, total 1273.64, interés total 186 511', () => {
    const r = purchaseBreakdown(base)!;
    expect(r.monthlyPI).toBeCloseTo(1073.64, 1);
    expect(r.totalMonthly).toBeCloseTo(1273.64, 1);       // + tax 100 + ins 100
    expect(r.totalInterest).toBeCloseTo(186512, 0);
    expect(r.payoffMonths).toBe(360);
    expect(r.monthsSaved).toBe(0);
  });
  it('con 200 extra/mes: liquida en 256 meses (ahorra 104) y ~61 100 de interés', () => {
    const r = purchaseBreakdown({ ...base, extraMonthly: 200 })!;
    expect(r.payoffMonths).toBe(256);
    expect(r.monthsSaved).toBe(104);
    expect(r.interestSaved).toBeCloseTo(61100, -3);       // ±500
  });
  it('entrada ≥ precio → null', () => {
    expect(purchaseBreakdown({ ...base, downPayment: 200000 })).toBeNull();
  });
});
```

- [x] **Step 2: FAIL** — `npm test -- calc-purchase`.

- [x] **Step 3: Implementar** `lib/calc/purchase.ts`:

```ts
import { monthlyPayment } from '@/lib/mortgage';

export type PurchaseInput = {
  price: number; downPayment: number; annualRatePct: number; years: number;
  pmiYearly: number; propertyTaxPct: number; insuranceYearly: number; hoaMonthly: number; extraMonthly: number;
};
export type PurchaseResult = {
  principal: number; monthlyPI: number;
  breakdown: { pi: number; tax: number; insurance: number; hoa: number; pmi: number; extra: number };
  totalMonthly: number; totalInterest: number; totalCost: number;
  payoffMonths: number; monthsSaved: number; interestSaved: number;
};

// La liquidación anticipada se SIMULA mes a mes (pura, ≤ years×12 iteraciones): el último
// mes paga solo el balance restante + su interés.
function simulate(principal: number, annualRatePct: number, payment: number, maxMonths: number) {
  const r = annualRatePct / 100 / 12;
  let balance = principal, interest = 0, months = 0;
  while (balance > 0 && months < maxMonths) {
    const i = balance * r;
    interest += i;
    balance = Math.max(0, balance + i - payment);
    months += 1;
  }
  return { months, interest };
}

export function purchaseBreakdown(input: PurchaseInput): PurchaseResult | null {
  const { price, downPayment, annualRatePct, years, extraMonthly } = input;
  if (price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || annualRatePct < 0 || extraMonthly < 0) return null;
  const principal = price - downPayment;
  const n = years * 12;
  const monthlyPI = monthlyPayment(principal, annualRatePct, years);
  const baseInterest = monthlyPI * n - principal;
  const withExtra = extraMonthly > 0 ? simulate(principal, annualRatePct, monthlyPI + extraMonthly, n) : { months: n, interest: baseInterest };
  const breakdown = {
    pi: monthlyPI,
    tax: (price * (input.propertyTaxPct / 100)) / 12,
    insurance: input.insuranceYearly / 12,
    hoa: input.hoaMonthly,
    pmi: input.pmiYearly / 12,
    extra: extraMonthly,
  };
  const totalMonthly = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return {
    principal, monthlyPI, breakdown, totalMonthly,
    totalInterest: baseInterest, totalCost: principal + baseInterest,
    payoffMonths: withExtra.months, monthsSaved: n - withExtra.months,
    interestSaved: baseInterest - withExtra.interest,
  };
}
```

- [x] **Step 4: PASS + commit** — `git add -A && git commit -m "feat: motor purchase con PITI y simulación de amortización anticipada"`

### Task 7: `lib/calc/refinance.ts` (TDD)

**Files:** Create `lib/calc/refinance.ts` · Test `tests/unit/calc-refinance.test.ts`

**Interfaces:**
- Produces: `refinanceComparison(current: CurrentLoan, next: NewLoan): RefinanceResult | null` con `CurrentLoan = { balance, annualRatePct, remainingYears }`, `NewLoan = { annualRatePct, years, cashOut, costs, financeCosts }`, `RefinanceResult = { currentMonthly, newMonthly, monthlySavings, newLoanAmount, currentRemainingInterest, newTotalInterest, interestDifference, breakEvenMonths }` (`breakEvenMonths: number | null` — null si no hay ahorro mensual).

- [x] **Step 1: Test que falla:**

```ts
import { describe, it, expect } from 'vitest';
import { refinanceComparison } from '@/lib/calc/refinance';

describe('refinanceComparison', () => {
  const current = { balance: 250000, annualRatePct: 7, remainingYears: 25 };
  const next = { annualRatePct: 5.5, years: 30, cashOut: 0, costs: 1000, financeCosts: true };
  it('caso con ahorro: cuota 1766.95 → 1425.13, break-even 3 meses, ~18 038 de interés a favor', () => {
    const r = refinanceComparison(current, next)!;
    expect(r.currentMonthly).toBeCloseTo(1766.95, 0);
    expect(r.newLoanAmount).toBe(251000);
    expect(r.newMonthly).toBeCloseTo(1425.13, 0);
    expect(r.monthlySavings).toBeCloseTo(341.8, 0);
    expect(r.breakEvenMonths).toBe(3);                    // ceil(1000 / 341.8)
    expect(r.interestDifference).toBeCloseTo(18038, -2);
  });
  it('sin ahorro mensual → breakEvenMonths null', () => {
    const r = refinanceComparison(current, { ...next, annualRatePct: 9 })!;
    expect(r.monthlySavings).toBeLessThan(0);
    expect(r.breakEvenMonths).toBeNull();
  });
  it('balance 0 → null', () => {
    expect(refinanceComparison({ ...current, balance: 0 }, next)).toBeNull();
  });
});
```

- [x] **Step 2: FAIL · Step 3: Implementar:**

```ts
import { monthlyPayment } from '@/lib/mortgage';

export type CurrentLoan = { balance: number; annualRatePct: number; remainingYears: number };
export type NewLoan = { annualRatePct: number; years: number; cashOut: number; costs: number; financeCosts: boolean };
export type RefinanceResult = {
  currentMonthly: number; newMonthly: number; monthlySavings: number; newLoanAmount: number;
  currentRemainingInterest: number; newTotalInterest: number; interestDifference: number;
  breakEvenMonths: number | null;
};

export function refinanceComparison(current: CurrentLoan, next: NewLoan): RefinanceResult | null {
  if (current.balance <= 0 || current.remainingYears <= 0 || next.years <= 0 || current.annualRatePct < 0 || next.annualRatePct < 0 || next.cashOut < 0 || next.costs < 0) return null;
  const currentMonthly = monthlyPayment(current.balance, current.annualRatePct, current.remainingYears);
  const newLoanAmount = current.balance + next.cashOut + (next.financeCosts ? next.costs : 0);
  const newMonthly = monthlyPayment(newLoanAmount, next.annualRatePct, next.years);
  const monthlySavings = currentMonthly - newMonthly;
  const currentRemainingInterest = currentMonthly * current.remainingYears * 12 - current.balance;
  const newTotalInterest = newMonthly * next.years * 12 - newLoanAmount;
  return {
    currentMonthly, newMonthly, monthlySavings, newLoanAmount,
    currentRemainingInterest, newTotalInterest,
    interestDifference: currentRemainingInterest - newTotalInterest,
    breakEvenMonths: monthlySavings > 0 ? Math.ceil(next.costs / monthlySavings) : null,
  };
}
```

- [x] **Step 4: PASS + commit** — `git add -A && git commit -m "feat: motor refinance con comparativa de cuota, interés y break-even"`

### Task 8: `lib/calc/rent-vs-buy.ts` (TDD)

**Files:** Create `lib/calc/rent-vs-buy.ts` · Test `tests/unit/calc-rent-vs-buy.test.ts`

**Interfaces:**
- Produces: `rentVsBuy(input: RentVsBuyInput, horizonYears: number): RentVsBuyResult | null` con serie anual `years: { year, buyNetCost, rentCost, equity, gain }[]` y `crossoverYear: number | null` (primer año con `gain > 0`).

- [x] **Step 1: Test que falla:**

```ts
import { describe, it, expect } from 'vitest';
import { rentVsBuy } from '@/lib/calc/rent-vs-buy';

const input = {
  price: 300000, downPayment: 60000, annualRatePct: 6, years: 30,
  taxYearly: 3600, insuranceYearly: 1200, hoaMonthly: 0, annualCostsPct: 0,
  sellingCostsPct: 6, appreciationPct: 3, monthlyRent: 2000, rentersInsuranceYearly: 0, rentAppreciationPct: 2,
};

describe('rentVsBuy', () => {
  it('año 5: coste neto de comprar ~66 750, alquilar ~124 897, equity ~124 452', () => {
    const r = rentVsBuy(input, 15)!;
    const y5 = r.years[4];
    expect(y5.buyNetCost).toBeCloseTo(66750, -2);
    expect(y5.rentCost).toBeCloseTo(124897, -2);
    expect(y5.equity).toBeCloseTo(124452, -2);
    expect(y5.gain).toBeCloseTo(124897 - 66750, -2);
  });
  it('el cruce llega en el año 2 con estos números', () => {
    expect(rentVsBuy(input, 15)!.crossoverYear).toBe(2);
  });
  it('precio 0 → null', () => {
    expect(rentVsBuy({ ...input, price: 0 }, 15)).toBeNull();
  });
});
```

- [x] **Step 2: FAIL · Step 3: Implementar:**

```ts
import { monthlyPayment } from '@/lib/mortgage';

export type RentVsBuyInput = {
  price: number; downPayment: number; annualRatePct: number; years: number;
  taxYearly: number; insuranceYearly: number; hoaMonthly: number; annualCostsPct: number;
  sellingCostsPct: number; appreciationPct: number;
  monthlyRent: number; rentersInsuranceYearly: number; rentAppreciationPct: number;
};
export type RentVsBuyYear = { year: number; buyNetCost: number; rentCost: number; equity: number; gain: number };
export type RentVsBuyResult = { years: RentVsBuyYear[]; crossoverYear: number | null };

// Modelo (spec §4): comprar = entrada + pagos acumulados − (equity − costes de venta);
// alquilar = renta acumulada con apreciación anual + seguro de inquilino.
export function rentVsBuy(input: RentVsBuyInput, horizonYears: number): RentVsBuyResult | null {
  const { price, downPayment, annualRatePct, years } = input;
  if (price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || horizonYears <= 0) return null;
  const principal = price - downPayment;
  const r = annualRatePct / 100 / 12;
  const pi = monthlyPayment(principal, annualRatePct, years);
  const monthlyOwn = pi + input.taxYearly / 12 + input.insuranceYearly / 12 + input.hoaMonthly + (price * (input.annualCostsPct / 100)) / 12;
  const out: RentVsBuyYear[] = [];
  let rentCost = 0, crossoverYear: number | null = null;
  for (let y = 1; y <= horizonYears; y++) {
    const m = y * 12;
    const factor = (1 + r) ** m;
    const balance = r === 0 ? principal - pi * m : principal * factor - pi * ((factor - 1) / r);
    const value = price * (1 + input.appreciationPct / 100) ** y;
    const equity = value - Math.max(0, balance);
    const saleProceeds = equity - value * (input.sellingCostsPct / 100);
    const buyNetCost = downPayment + monthlyOwn * m - saleProceeds;
    rentCost += input.monthlyRent * 12 * (1 + input.rentAppreciationPct / 100) ** (y - 1) + input.rentersInsuranceYearly;
    const gain = rentCost - buyNetCost;
    if (gain > 0 && crossoverYear === null) crossoverYear = y;
    out.push({ year: y, buyNetCost, rentCost, equity, gain });
  }
  return { years: out, crossoverYear };
}
```

- [x] **Step 4: PASS + commit** — `git add -A && git commit -m "feat: motor rent vs buy con proyección anual y año de cruce"`

### Task 9: Infraestructura UI — pestañas, layout, donut; la calculadora actual pasa a variante Purchase

**Files:**
- Create: `components/calculator/calc-tabs.tsx`, `components/calculator/calc-layout.tsx`, `components/calculator/calc-donut.tsx`
- Modify: `components/calculator/mortgage-calculator.tsx` (se convierte en `purchase-calc.tsx` — renombrar), `app/[locale]/calculator/page.tsx`, `messages/{en,es}.json`

**Interfaces:**
- Produces: `CalcTabs({ locale, texts })` client component — único punto de entrada de la página; `CalcLayout({ form, results })`; `CalcDonut({ segments, centerLabel, centerValue })` con `segments: { label: string; value: number; swatchClass: string }[]`.
- Consumes: `Field`, `MoneyInput`, `PercentInput`, `SelectField` de `components/ui/form/`; `formatMoney` de `lib/format.ts`.

- [x] **Step 1: `calc-layout.tsx`** — extraer el layout dos-columnas ya existente en `mortgage-calculator.tsx` (grid `lg:grid-cols-2`, panel de resultados con `aria-live="polite"`, borde `ink`, disclaimer al pie):

```tsx
'use client';
import type { ReactNode } from 'react';

export function CalcLayout({ form, results, disclaimer }: { form: ReactNode; results: ReactNode; disclaimer: string }) {
  return (
    <div className="grid max-w-[880px] gap-8 lg:grid-cols-2 lg:gap-12">
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>{form}</form>
      <div aria-live="polite" className="flex flex-col gap-5 border border-ink p-6 lg:p-8">
        {results}
        <p className="border-t border-hairline pt-4 font-sans text-fine italic text-muted">{disclaimer}</p>
      </div>
    </div>
  );
}
```

- [x] **Step 2: `calc-donut.tsx`** — donut SVG puro (paridad con el «Payment Breakdown» de aimsmtg, sin Chart.js). Colores con tokens existentes vía clases (`text-navy`, `text-sand`, `text-ink`, `text-muted` … como `stroke-current`):

```tsx
'use client';

type Segment = { label: string; value: number; swatchClass: string };

export function CalcDonut({ segments, centerLabel, centerValue }: { segments: Segment[]; centerLabel: string; centerValue: string }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const R = 15.9155; // circunferencia 100 → los dasharray son porcentajes
  let offset = 25;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 42 42" className="size-32 shrink-0" role="img" aria-label={`${centerLabel} ${centerValue}`}>
        {total > 0 && segments.filter((s) => s.value > 0).map((s) => {
          const pct = (s.value / total) * 100;
          const el = (
            <circle key={s.label} cx="21" cy="21" r={R} fill="none" strokeWidth="4"
              className={`stroke-current ${s.swatchClass}`}
              strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={offset} />
          );
          offset -= pct;
          return el;
        })}
        <text x="21" y="20" textAnchor="middle" className="fill-current font-sans text-[5px] text-ink">{centerValue}</text>
        <text x="21" y="26" textAnchor="middle" className="fill-current font-sans text-[3px] text-muted">{centerLabel}</text>
      </svg>
      <ul className="flex flex-col gap-1 font-sans text-sm text-body">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span aria-hidden className={`inline-block size-2 border border-hairline bg-current ${s.swatchClass}`} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [x] **Step 3: Renombrar** `mortgage-calculator.tsx` → `purchase-calc.tsx` (export `PurchaseCalc`, tipo `PurchaseCalcTexts`), migrarlo a `CalcLayout` + `CalcDonut` y ampliarlo con los campos de la variante Purchase de §desglose «Variantes → 2»: PMI anual, tax, insurance, HOA, extra mensual (todos `MoneyInput`/`PercentInput` con defaults de `DEFAULTS`) llamando a `purchaseBreakdown`. Resultados: total mensual grande + donut (segmentos P&I/tax/seguro/HOA/PMI/extra) + bloque «Early payoff»: si `extraMonthly > 0`, mostrar `monthsSaved` e `interestSaved` formateados.

- [x] **Step 4: `calc-tabs.tsx`** — client component con las pestañas (PR E: 4; PR F añade 4):

```tsx
'use client';
import { useState } from 'react';
import { PurchaseCalc, type PurchaseCalcTexts } from './purchase-calc';
import { AffordabilityCalc, type AffordabilityCalcTexts } from './affordability-calc';
import { RefinanceCalc, type RefinanceCalcTexts } from './refinance-calc';
import { RentVsBuyCalc, type RentVsBuyCalcTexts } from './rent-vs-buy-calc';

export type CalcSuiteTexts = {
  tabs: Record<string, string>;
  purchase: PurchaseCalcTexts; afford: AffordabilityCalcTexts;
  refi: RefinanceCalcTexts; rentBuy: RentVsBuyCalcTexts;
};
const TAB_IDS = ['afford', 'purchase', 'refi', 'rentBuy'] as const;

export function CalcTabs({ locale, texts }: { locale: string; texts: CalcSuiteTexts }) {
  const [active, setActive] = useState<(typeof TAB_IDS)[number]>('afford');
  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" className="flex flex-wrap gap-px border border-hairline bg-hairline">
        {TAB_IDS.map((id) => (
          <button key={id} role="tab" aria-selected={active === id} onClick={() => setActive(id)}
            className={`px-4 py-3 font-sans text-micro font-medium uppercase tracking-label ${active === id ? 'bg-navy text-paper' : 'bg-paper text-body hover:bg-sand'}`}>
            {texts.tabs[id]}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {active === 'afford' && <AffordabilityCalc locale={locale} texts={texts.afford} />}
        {active === 'purchase' && <PurchaseCalc locale={locale} texts={texts.purchase} />}
        {active === 'refi' && <RefinanceCalc locale={locale} texts={texts.refi} />}
        {active === 'rentBuy' && <RentVsBuyCalc locale={locale} texts={texts.rentBuy} />}
      </div>
    </div>
  );
}
```

- [x] **Step 5: Página.** `app/[locale]/calculator/page.tsx` pasa a montar `<CalcTabs locale={locale} texts={t.raw('calc') as CalcSuiteTexts} />` (patrón `t.raw` idéntico al quiz). Reestructurar el namespace `calculator.calc` de messages: `tabs { afford, purchase, refi, rentBuy }` + subárboles por variante (los de purchase ya existen: moverlos bajo `calc.purchase`).

- [x] **Step 6: Messages de pestañas.** EN `"tabs": { "afford": "Affordability", "purchase": "Purchase", "refi": "Refinance", "rentBuy": "Rent vs. buy" }` · ES `"tabs": { "afford": "Capacidad de compra", "purchase": "Compra", "refi": "Refinanciamiento", "rentBuy": "Rentar vs. comprar" }`.

- [x] **Step 7: Verificar + commit.** `npm run lint && npx tsc --noEmit && npm test` (los componentes Affordability/Refinance/RentVsBuy aún no existen: crear en este paso stubs mínimos que rendericen `null` para que compile, se implementan en Tasks 10-11). `git add -A && git commit -m "feat: pestañas de calculadora, layout común y donut SVG; purchase con amortización anticipada"`

### Task 10: Variante Affordability (5 subprogramas)

**Files:** Create `components/calculator/affordability-calc.tsx` · Modify `messages/{en,es}.json`

**Interfaces:**
- Consumes: `affordability`, `DEFAULTS`, `CREDIT_BANDS`, `DTI_LIMITS` (Task 5); `CalcLayout`, `CalcDonut` (Task 9).
- Produces: `AffordabilityCalc({ locale, texts })` + tipo `AffordabilityCalcTexts`.

- [x] **Step 1: Componente.** Sub-pestañas de programa (radio-group estilizado con los 5 programas, mismo patrón de botones que `CalcTabs`), formulario con los campos comunes de §desglose «Affordability → Inputs comunes» (ingreso mensual, deudas mensuales con hint explicativo, precio, entrada, tipo, plazo, tax %, seguro anual, HOA) usando `MoneyInput`/`PercentInput`/`SelectField` con `DEFAULTS`; select de credit score solo para conventional/jumbo (opciones `CREDIT_BANDS`). Estado con `useState` por campo (patrón exacto de `purchase-calc`). Resultados: total mensual + donut (P&I/tax/seguro/HOA/fee del programa) + bloque DTI: «tu DTI X% / Y%» vs «máximo del programa» con `withinLimits` marcando el estado (texto, no solo color) + resumen en prosa (patrón del summary de aimsmtg, redacción propia) + aviso «confirma estos números conmigo» (YMYL).
- [x] **Step 2: Messages `calculator.calc.afford`** — claves: `programs { conventional, fha, va, usda, jumbo }`, labels de los 9 campos, `debtsHint`, `dtiYours`, `dtiAllowed`, `dtiOk`, `dtiOver`, `feeLabel { pmi, mip, usda, none }`, `upfrontLabel`, `summary` (con placeholders `{total}`, `{program}`, `{front}`, `{back}`, `{maxFront}`, `{maxBack}`), `confirm`. Redactar EN/ES propios (paridad exacta de claves; el hint de deudas explica qué incluir/excluir como el tooltip de la referencia, con palabras nuestras).
- [x] **Step 3: Verificar + commit** — `npm run lint && npx tsc --noEmit && npm test && git add -A && git commit -m "feat: calculadora affordability con 5 programas y veredicto DTI"`

### Task 11: Variantes Refinance y Rent vs Buy

**Files:** Create `components/calculator/refinance-calc.tsx`, `components/calculator/rent-vs-buy-calc.tsx` · Modify `messages/{en,es}.json`

- [x] **Step 1: `RefinanceCalc`.** Dos grupos de campos («Tu préstamo actual»: balance, tipo, años restantes · «El nuevo préstamo»: tipo, plazo, cash out, costes, radio financiar-costes/pagar-aparte — §desglose «Variantes → 3») con defaults del test de Task 7 (250000 · 7 % · 25 · 5.5 % · 30 · 0 · 1000 · financiados). Resultados: dos KPIs grandes (ahorro mensual y diferencia de interés total, en negativo mostrar aviso de que sube), comparativa cuota actual/nueva, break-even en meses (o texto «no se recupera» si null).
- [x] **Step 2: `RentVsBuyCalc`.** Campos en 3 grupos (hipoteca / supuestos de compra / supuestos de alquiler, §desglose «Variantes → 4») + `SelectField` de horizonte (1-15 años). Resultados: tabla comparativa del año elegido (coste comprar vs alquilar, equity, ganancia) + frase de veredicto con el año de cruce («a partir del año N, comprar gana») o su ausencia.
- [x] **Step 3: Messages** `calculator.calc.refi` y `calculator.calc.rentBuy` (labels de todos los campos + KPIs + veredictos, EN/ES paridad).
- [x] **Step 4: Verificar + commit** — `git add -A && git commit -m "feat: calculadoras refinance y rent vs buy"`

### Task 12: e2e de la suite, presupuesto y PR E

**Files:** Modify `tests/e2e/calculator.spec.ts`

- [x] **Step 1: e2e.** Añadir a `calculator.spec.ts`:

```ts
test('las pestañas cambian de variante y affordability calcula con defaults', async ({ page }) => {
  await page.goto('/calculator');
  await expect(page.getByRole('tab', { name: /affordability/i })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('$1,350')).toBeVisible();          // total con defaults (1350.31)
  await page.getByRole('tab', { name: /refinance/i }).click();
  await expect(page.getByText('$342')).toBeVisible();            // ahorro mensual con defaults (341.8)
  await page.getByRole('tab', { name: /rent/i }).click();
  await expect(page.getByRole('tabpanel')).toBeVisible();
});
```

(Redondeos: usar los formatos reales que emita `formatMoney` — ajustar el texto esperado tras el primer run visual, manteniendo la aserción numérica.)

- [x] **Step 2: Presupuesto** — `npm run build && node scripts/measure-first-load.mjs .next/server/app/en/calculator.html` → Expected ≤ 175 KB gz. Si excede: mover `AffordabilityCalc`… a `next/dynamic` por pestaña ANTES de tocar nada más, y re-medir.
- [x] **Step 3: Gate completo + PR E** — gate de Global Constraints, `git push -u origin feat/fase-2-5-calculadoras-nucleo`, `gh pr create --title "Fase 2.5 · PR E: suite de calculadoras — affordability, purchase, refinance y rent vs buy"`. Squash merge antes de PR F.

---

# PR F — Calculadoras VA e inversor (`feat/fase-2-5-calculadoras-avanzadas`)

### Task 13: `lib/calc/va.ts` (TDD) — funding fee por tramos

**Files:** Create `lib/calc/va.ts` · Test `tests/unit/calc-va.test.ts`

**Interfaces:**
- Consumes: `VA_FUNDING_FEE` de `lib/calc/constants.ts` (Task 5).
- Produces: `vaFundingFeePct(use: VaUse, downPct: number, purpose: VaPurpose): number` con `VaUse = 'first' | 'subsequent' | 'exempt'`, `VaPurpose = 'purchase' | 'cashOut' | 'irrrl'`; `vaFinalLoan(base: number, feePct: number): number`.

- [x] **Step 1: Rama** — `git checkout main && git pull && git checkout -b feat/fase-2-5-calculadoras-avanzadas`

- [x] **Step 2: Test que falla** (tabla completa de §desglose «tabla VA funding fee»):

```ts
import { describe, it, expect } from 'vitest';
import { vaFundingFeePct, vaFinalLoan } from '@/lib/calc/va';

describe('vaFundingFeePct', () => {
  it('compra, primer uso: 2.15 / 1.5 / 1.25 según entrada', () => {
    expect(vaFundingFeePct('first', 0, 'purchase')).toBe(2.15);
    expect(vaFundingFeePct('first', 5, 'purchase')).toBe(1.5);
    expect(vaFundingFeePct('first', 10, 'purchase')).toBe(1.25);
  });
  it('compra, uso posterior: 3.3 con <5% de entrada', () => {
    expect(vaFundingFeePct('subsequent', 0, 'purchase')).toBe(3.3);
    expect(vaFundingFeePct('subsequent', 5, 'purchase')).toBe(1.5);
  });
  it('cash-out: 2.15 primer uso / 3.3 posterior; IRRRL: 0.5; exento: 0 siempre', () => {
    expect(vaFundingFeePct('first', 0, 'cashOut')).toBe(2.15);
    expect(vaFundingFeePct('subsequent', 0, 'cashOut')).toBe(3.3);
    expect(vaFundingFeePct('first', 0, 'irrrl')).toBe(0.5);
    expect(vaFundingFeePct('exempt', 0, 'purchase')).toBe(0);
    expect(vaFundingFeePct('exempt', 0, 'irrrl')).toBe(0);
  });
});

describe('vaFinalLoan', () => {
  it('financia el fee sobre el préstamo base: 200000 × 1.0215', () => {
    expect(vaFinalLoan(200000, 2.15)).toBeCloseTo(204300, 0);
  });
});
```

- [x] **Step 3: FAIL · Step 4: Implementar:**

```ts
import { VA_FUNDING_FEE } from './constants';

export type VaUse = 'first' | 'subsequent' | 'exempt';
export type VaPurpose = 'purchase' | 'cashOut' | 'irrrl';

export function vaFundingFeePct(use: VaUse, downPct: number, purpose: VaPurpose): number {
  if (use === 'exempt') return 0;
  if (purpose === 'irrrl') return VA_FUNDING_FEE.irrrl;
  if (purpose === 'cashOut') return VA_FUNDING_FEE.cashOut[use];
  const tiers = VA_FUNDING_FEE.purchase[use];
  return tiers.find((t) => downPct >= t.minDownPct)!.pct;
}

export function vaFinalLoan(base: number, feePct: number): number {
  return base * (1 + feePct / 100);
}
```

- [x] **Step 5: PASS + commit** — `git add -A && git commit -m "feat: funding fee VA por tramos y préstamo final financiado"`

### Task 14: Variantes VA Purchase y VA Refinance

**Files:**
- Create: `components/calculator/va-purchase-calc.tsx`, `components/calculator/va-refinance-calc.tsx`
- Modify: `components/calculator/calc-tabs.tsx`, `messages/{en,es}.json`

**Interfaces:**
- Consumes: `purchaseBreakdown` (Task 6), `refinanceComparison` (Task 7), `vaFundingFeePct`/`vaFinalLoan` (Task 13), `CalcLayout`/`CalcDonut` (Task 9).
- Produces: `VaPurchaseCalc({ locale, texts })`, `VaRefinanceCalc({ locale, texts })` + sus tipos de texts; `CalcSuiteTexts` y `TAB_IDS` de `calc-tabs.tsx` ampliados con `vaPurchase | vaRefi | dscr | flip` (los componentes DSCR/Flip entran como stubs `null` hasta la Task 16, para que compile).

- [x] **Step 1: `VaPurchaseCalc`** — como `PurchaseCalc` (§desglose «Variantes → 5») con: select «Uso del beneficio VA» (`first`/`subsequent`/`exempt`), SIN campo PMI, fee calculado con `vaFundingFeePct(use, downPct, 'purchase')`, línea readonly «Funding fee (X %): $Y» y «Préstamo final: $Z» (`vaFinalLoan`); el desglose llama a `purchaseBreakdown` con `price` ajustado para que el principal sea el préstamo final y `pmiYearly: 0`.
- [x] **Step 2: `VaRefinanceCalc`** — como `RefinanceCalc` (§desglose «Variantes → 6») con: select «Propósito» (`cashOut`/`irrrl` — con IRRRL el campo cash-out se oculta y fuerza 0) + select de uso VA; el fee se financia: `newLoanAmount` pasa a `vaFinalLoan(balance + cashOut + costes financiados, fee)` — implementar componiendo `refinanceComparison` con el balance ya inflado y mostrando el fee como línea propia.
- [x] **Step 3: Pestañas y messages.** `TAB_IDS = ['afford', 'purchase', 'refi', 'rentBuy', 'vaPurchase', 'vaRefi', 'dscr', 'flip']`; messages `calculator.calc.tabs` añade EN `"vaPurchase": "VA purchase", "vaRefi": "VA refinance", "dscr": "Rental (DSCR)", "flip": "Fix & flip"` · ES `"vaPurchase": "Compra VA", "vaRefi": "Refinanciamiento VA", "dscr": "Renta (DSCR)", "flip": "Comprar y remodelar"`; subárboles `vaPurchase.*` y `vaRefi.*` con los labels nuevos (uso VA, propósito, fee, préstamo final) EN/ES.
- [x] **Step 4: Verificar + commit** — `npm run lint && npx tsc --noEmit && npm test && git add -A && git commit -m "feat: calculadoras VA purchase y VA refinance con funding fee financiado"`

### Task 15: `lib/calc/dscr.ts` y `lib/calc/flip.ts` (TDD)

**Files:** Create `lib/calc/dscr.ts`, `lib/calc/flip.ts` · Tests `tests/unit/calc-dscr.test.ts`, `tests/unit/calc-flip.test.ts`

**Interfaces:**
- Produces: `dscrMetrics(input: DscrInput): DscrResult | null` y `flipMetrics(input: FlipInput): FlipResult | null` (tipos completos en los pasos).

- [x] **Step 1: Test DSCR que falla** (caso = defaults de §desglose «Variantes → 7», verificado a mano):

```ts
import { describe, it, expect } from 'vitest';
import { dscrMetrics } from '@/lib/calc/dscr';

const input = {
  value: 500000, monthlyRents: [2500], taxesYearly: 4000, insuranceYearly: 3000,
  hoaMonthly: 0, vacancyPct: 5, repairsYearly: 500, utilitiesYearly: 5000,
  ltvPct: 80, annualRatePct: 8, originationPct: 2, closingCosts: 6500, years: 30,
};

describe('dscrMetrics', () => {
  it('con los defaults de la referencia: NOI 16 000, cap rate 3.2, DSCR 0.45, cash-on-cash negativo', () => {
    const r = dscrMetrics(input)!;
    expect(r.loanAmount).toBe(400000);
    expect(r.monthlyDebtService).toBeCloseTo(2935.06, 1);
    expect(r.noi).toBeCloseTo(16000, 0);            // 30000×0.95 − 12500
    expect(r.capRatePct).toBeCloseTo(3.2, 2);
    expect(r.cashFlow).toBeCloseTo(-19221, 0);
    expect(r.dscr).toBeCloseTo(0.45, 2);
    expect(r.cashNeeded).toBeCloseTo(114500, 0);    // down 100000 + closing 6500 + origination 8000
    expect(r.cashOnCashPct).toBeCloseTo(-16.79, 1);
  });
  it('sin rentas → null', () => {
    expect(dscrMetrics({ ...input, monthlyRents: [] })).toBeNull();
  });
});
```

- [x] **Step 2: FAIL · Step 3: Implementar `dscr.ts`:**

```ts
import { monthlyPayment } from '@/lib/mortgage';

export type DscrInput = {
  value: number; monthlyRents: number[]; taxesYearly: number; insuranceYearly: number;
  hoaMonthly: number; vacancyPct: number; repairsYearly: number; utilitiesYearly: number;
  ltvPct: number; annualRatePct: number; originationPct: number; closingCosts: number; years: number;
};
export type DscrResult = {
  loanAmount: number; downPayment: number; monthlyDebtService: number; originationFee: number;
  grossRentYearly: number; effectiveRentYearly: number; operatingExpenses: number; noi: number;
  cashFlow: number; capRatePct: number; cashNeeded: number; cashOnCashPct: number; dscr: number;
  pricePerUnit: number;
};

export function dscrMetrics(input: DscrInput): DscrResult | null {
  const { value, monthlyRents, ltvPct, annualRatePct, years } = input;
  if (value <= 0 || monthlyRents.length === 0 || monthlyRents.some((r) => r < 0) || ltvPct < 0 || ltvPct > 100 || years <= 0) return null;
  const loanAmount = value * (ltvPct / 100);
  const downPayment = value - loanAmount;
  const monthlyDebtService = monthlyPayment(loanAmount, annualRatePct, years);
  const grossRentYearly = monthlyRents.reduce((a, b) => a + b, 0) * 12;
  const effectiveRentYearly = grossRentYearly * (1 - input.vacancyPct / 100);
  const operatingExpenses = input.taxesYearly + input.insuranceYearly + input.hoaMonthly * 12 + input.repairsYearly + input.utilitiesYearly;
  const noi = effectiveRentYearly - operatingExpenses;
  const debtServiceYearly = monthlyDebtService * 12;
  const originationFee = loanAmount * (input.originationPct / 100);
  const cashNeeded = downPayment + input.closingCosts + originationFee;
  const cashFlow = noi - debtServiceYearly;
  return {
    loanAmount, downPayment, monthlyDebtService, originationFee,
    grossRentYearly, effectiveRentYearly, operatingExpenses, noi, cashFlow,
    capRatePct: (noi / value) * 100,
    cashNeeded, cashOnCashPct: (cashFlow / cashNeeded) * 100,
    dscr: noi / debtServiceYearly,
    pricePerUnit: value / monthlyRents.length,
  };
}
```

- [x] **Step 4: Test Flip que falla** (caso = defaults de §desglose «Variantes → 8», interés simple sobre el préstamo, impuestos/seguro prorrateados al plazo):

```ts
import { describe, it, expect } from 'vitest';
import { flipMetrics } from '@/lib/calc/flip';

const input = {
  purchasePrice: 500000, renovationCost: 75000, arv: 750000, months: 9,
  taxesYearly: 4000, insuranceYearly: 3000, ltvPct: 80, annualRatePct: 10,
  originationPct: 2, otherClosingPct: 3, costToSellPct: 5,
};

describe('flipMetrics', () => {
  it('con los defaults de la referencia: beneficio 79 250, ROI ~34 %, LTARV 53.3 %', () => {
    const r = flipMetrics(input)!;
    expect(r.loanAmount).toBe(400000);
    expect(r.monthlyInterest).toBeCloseTo(3333.33, 1);
    expect(r.totalInterest).toBeCloseTo(30000, 0);
    expect(r.carryingCosts).toBeCloseTo(5250, 0);        // (4000+3000) × 9/12
    expect(r.costToSell).toBeCloseTo(37500, 0);          // 5% del ARV
    expect(r.cashInDeal).toBeCloseTo(233250, 0);
    expect(r.netProfit).toBeCloseTo(79250, 0);
    expect(r.roiPct).toBeCloseTo(33.98, 1);
    expect(r.ltarvPct).toBeCloseTo(53.33, 1);
  });
  it('ARV 0 → null', () => {
    expect(flipMetrics({ ...input, arv: 0 })).toBeNull();
  });
});
```

- [x] **Step 5: Implementar `flip.ts`:**

```ts
export type FlipInput = {
  purchasePrice: number; renovationCost: number; arv: number; months: number;
  taxesYearly: number; insuranceYearly: number; ltvPct: number; annualRatePct: number;
  originationPct: number; otherClosingPct: number; costToSellPct: number;
};
export type FlipResult = {
  loanAmount: number; downPayment: number; monthlyInterest: number; totalInterest: number;
  originationFee: number; otherClosing: number; carryingCosts: number; costToSell: number;
  equityNeeded: number; cashInDeal: number; netProfit: number; roiPct: number; ltarvPct: number;
};

// Préstamo interest-only al LTV del precio de compra; la renovación la financia el
// comprador (modelo de la referencia: Borrower Equity Needed la incluye).
export function flipMetrics(input: FlipInput): FlipResult | null {
  const { purchasePrice, renovationCost, arv, months, ltvPct, annualRatePct } = input;
  if (purchasePrice <= 0 || arv <= 0 || months <= 0 || renovationCost < 0 || ltvPct < 0 || ltvPct > 100) return null;
  const loanAmount = purchasePrice * (ltvPct / 100);
  const downPayment = purchasePrice - loanAmount;
  const monthlyInterest = (loanAmount * (annualRatePct / 100)) / 12;
  const totalInterest = monthlyInterest * months;
  const originationFee = loanAmount * (input.originationPct / 100);
  const otherClosing = purchasePrice * (input.otherClosingPct / 100);
  const carryingCosts = (input.taxesYearly + input.insuranceYearly) * (months / 12);
  const costToSell = arv * (input.costToSellPct / 100);
  const equityNeeded = downPayment + renovationCost + originationFee + otherClosing;
  const cashInDeal = equityNeeded + carryingCosts + totalInterest;
  const netProfit = arv - purchasePrice - renovationCost - totalInterest - originationFee - otherClosing - carryingCosts - costToSell;
  return {
    loanAmount, downPayment, monthlyInterest, totalInterest, originationFee, otherClosing,
    carryingCosts, costToSell, equityNeeded, cashInDeal, netProfit,
    roiPct: (netProfit / cashInDeal) * 100,
    ltarvPct: (loanAmount / arv) * 100,
  };
}
```

- [x] **Step 6: PASS ×2 + commit** — `npm test -- calc-dscr calc-flip` → PASS · `git add -A && git commit -m "feat: motores DSCR y fix & flip con métricas de inversión"`

### Task 16: Variantes DSCR y Fix & Flip (UI)

**Files:** Create `components/calculator/dscr-calc.tsx`, `components/calculator/flip-calc.tsx` · Modify `components/calculator/calc-tabs.tsx`, `messages/{en,es}.json`

**Interfaces:**
- Consumes: `dscrMetrics`, `flipMetrics` (Task 15); `CalcLayout` (Task 9); `SelectField`/`MoneyInput`/`PercentInput`.

- [x] **Step 1: `DscrCalc`.** Campos según §desglose «Variantes → 7»: select nº de unidades (1-4; renderiza un `MoneyInput` de renta por unidad), radio compra/refi (solo etiqueta el resumen), valor, impuestos, seguro, HOA, selects de vacancia (3-20 %), reparaciones anuales ($300-$1000), utilities, LTV (0-80 en pasos de 5), tipo (6-9 % en pasos de 0.125), origination (0-3 % en pasos de 0.25), closing costs. Resultados: 4 KPIs (cash flow, cap rate, cash-on-cash, DSCR) + listas «desglose del préstamo» y «métricas» + las definiciones didácticas de cada métrica (redacción PROPIA de las definiciones de la referencia; la de DSCR debe explicar el umbral 1.0).
- [x] **Step 2: `FlipCalc`.** Campos según §desglose «Variantes → 8»: precio, coste de renovación, ARV, select plazo (1-18 meses), impuestos, seguro, selects LTV (65-90), tipo (9-12), origination (2-3), otros costes de cierre (2-4), coste de venta (1-7). Resultados: 4 KPIs (equity necesaria, beneficio neto, ROI, LTARV) + desglose. Sustituir los stubs de la Task 14 por los componentes reales en `calc-tabs.tsx`.
- [x] **Step 3: Messages** `calculator.calc.dscr.*` y `calculator.calc.flip.*` (labels + KPIs + definiciones, EN/ES paridad de claves).
- [x] **Step 4: Verificar + commit** — `git add -A && git commit -m "feat: calculadoras DSCR y fix & flip"`

### Task 17: e2e final, presupuesto y PR F

**Files:** Modify `tests/e2e/calculator.spec.ts`

- [x] **Step 1: e2e.** Añadir:

```ts
test('las 8 pestañas responden y las variantes VA/inversor calculan', async ({ page }) => {
  await page.goto('/calculator');
  for (const name of [/va purchase|compra va/i, /va refinance|refinanciamiento va/i, /dscr/i, /flip|remodelar/i]) {
    await page.getByRole('tab', { name }).click();
    await expect(page.getByRole('tabpanel')).toBeVisible();
  }
  await page.getByRole('tab', { name: /dscr/i }).click();
  await expect(page.getByText('0.45')).toBeVisible();     // DSCR con defaults
});
```

- [x] **Step 2: Presupuesto** — `npm run build && node scripts/measure-first-load.mjs .next/server/app/en/calculator.html` → ≤ 175 KB gz; si excede, `next/dynamic` para las 4 variantes de este PR y re-medir.
- [x] **Step 3: Gate completo + PR F** — gate de Global Constraints, push, `gh pr create --title "Fase 2.5 · PR F: calculadoras VA, DSCR y fix & flip — suite completa"`. Squash merge.
- [x] **Step 4: Cierre de fase** — marcar los checkboxes de este plan, commit `docs: Fase 2.5 completada — plan con checkboxes cerrados`. La fase siguiente es el pulido de diseño previo a la demo (fuera de este plan).

---

## Checks finales de la fase (después del merge de PR F)

- [x] `npm run check:static` → 44 rutas, todas prerenderizadas.
- [x] Presupuestos: `/` ≤ 170 · `/quote` ≤ 170 · `/contact` ≤ 170 · `/pre-qualify` ≤ 170 · `/calculator` ≤ 175 (KB gz, medidos y anotados en el PR).
- [x] Paridad funcional contra §desglose: 4 envoltorios del quiz (quote, pre-qualify, home, contact) · 8 variantes de calculadora (5 subprogramas en affordability) · 12 programas · trío de tarjetas · callout global. Excluido y documentado: Reviews (falta dato de David), Blog/Learning ampliado, staff.
- [x] Todas las constantes ⚠︎ de `lib/calc/constants.ts` en la lista de preguntas para la demo con David (spec §8).
