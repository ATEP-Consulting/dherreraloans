# Fase 2 — Cuestionario, calculadora y paridad de contenido · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cuestionario Get a Quote real (18 pasos declarativos, submit simulado del estado final), calculadora de hipoteca funcional, y paridad de contenido con aimsmtg (5 programas nuevos + página Learn/FAQ).

**Architecture:** Motor declarativo + `useReducer` con Zod compartido y `sessionStorage` (ADR-0007); un client component por herramienta con textos inyectados como props desde Server Components (los messages NO entran al bundle JS); contenido nuevo derivado de la fuente única `config/routes.mjs`.

**Tech Stack:** Next.js 16 App Router · next-intl 4 · Tailwind v4 · TS strict · Zod (única dependencia nueva, solo PR B) · Vitest · Playwright.

**Spec:** `docs/superpowers/specs/2026-08-07-fase-2-cuestionario-calculadora-paridad-design.md` (copy EN/ES de cada paso en §3.1 — VINCULANTE).

## Global Constraints

- **Lighthouse ≥ 95 ×4 en cada PR** (gate CI contra preview de Vercel); `skipAudits` de `lighthouserc.json` NO se tocan.
- **Presupuesto JS** (ADR-0003 §7 + nota): `/quote` ≤ 170 KB gz First Load; `/calculator` y resto dentro del baseline operativo ≤ 164 KB (actual 149 KB). Se mide con `scripts/measure-first-load.mjs` (Task 6).
- **Componentización total** (ADR-0010): todo valor de estilo = token `@theme` en `app/globals.css`; todo control repetible en `components/ui/`; estilos ad hoc = defecto Important en review.
- **Todo texto visible en `messages/{en,es}.json`** (paridad exacta de claves testeada, arrays incluidos: mismo número de items EN/ES). Valores de respuestas = claves enum, nunca textos.
- **Todas las páginas prerenderizadas** (`npm run check:static`); rutas solo desde `config/routes.mjs`.
- **Cero client components salvo** `components/quiz/quiz.tsx`, `components/calculator/mortgage-calculator.tsx` y los form controls con estado que estos consumen. Animaciones CSS only, con `motion-safe`/`prefers-reduced-motion`.
- **Fachada 4a**: radius 0, bordes 1px, sin sombras, Spectral display / Instrument Sans UI. No inventar estética: usar tokens existentes (`ink`, `body`, `hairline`, `navy`, `sand`, `paper`…).
- **Next 16**: `params` es `Promise` en pages/layouts; consultar `node_modules/next/dist/docs/` ante cualquier duda de API (AGENTS.md). En CI, `tsc` requiere `npx next typegen` previo.
- **Copy**: redacción SIEMPRE propia (nunca copiar de aimsmtg — en Fase 1 el review cazó una casi-copia), voz personal de David, tuteo en ES, cifras en genérico prudente, todo borrador YMYL.
- **Git**: 3 PRs SECUENCIALES contra main (nunca apilados). Commits `tipo: descripción` en español + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **Gate local completo** (antes de cada PR): `npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e`.

## Mapa de archivos

| Archivo | Responsabilidad | PR |
|---|---|---|
| `app/globals.css` | + token `--color-error`, keyframes `quiz-step-in` | A |
| `components/ui/form/field.tsx` | Wrapper label+hint+error accesible | A |
| `components/ui/form/text-input.tsx` / `select-field.tsx` | Controles nativos estilizados sin estado | A |
| `components/ui/form/money-input.tsx` / `percent-input.tsx` | Inputs numéricos formateados (client) | A |
| `components/ui/form/choice-card.tsx` | Radio-tarjeta nativa Fachada | A |
| `components/ui/form/check-escape.tsx` | Checkbox «Aún no lo sé» | A |
| `lib/format.ts` | parse/format de dinero y tasa por locale | A |
| `lib/mortgage.ts` | Fórmula P&I pura + desglose | A |
| `components/calculator/mortgage-calculator.tsx` | Client component calculadora | A |
| `app/[locale]/calculator/page.tsx` | Integra calculadora, textos por props | A |
| `scripts/measure-first-load.mjs` | Medición First Load JS gz (metodología ADR-0003) | A |
| `lib/quiz/schema.ts` | Zod por paso + payload (fuente única validación) | B |
| `lib/quiz/steps.ts` | Definición declarativa de pasos + `visibleSteps()` | B |
| `lib/quiz/engine.ts` | Reducer puro + persistencia sessionStorage | B |
| `lib/quiz/submit.ts` | `submitLead` con transporte inyectable (stub Fase 2) | B |
| `lib/quiz/texts.ts` | Tipo `QuizTexts` (contrato server→client) | B |
| `components/quiz/quiz.tsx` | ÚNICO client component del cuestionario | B |
| `app/[locale]/quote/page.tsx` | PageHero + quiz; sustituye shell | B |
| `messages/{en,es}.json` | `calculator.*` (A), `quote.*` (B), `programs.*` +5, `learn.*`, `common.nav.learn`, `common.footer.links.learn` (C) | A/B/C |
| `config/routes.mjs` | +5 `programSlugs`, +`/learn` | C |
| `app/[locale]/learn/page.tsx` | Página Learn/FAQ | C |
| `lib/jsonld.ts` | + `faqPageJsonLd(locale)` | C |
| `components/layout/nav-links.tsx` | + enlace Learn | C |
| `components/layout/site-footer.tsx` | + enlace Learn | C |
| `scripts/generate-og.mjs` | + namespace `learn` (programas: automático) | C |
| Tests | `tests/unit/{format,mortgage,quiz-schema,quiz-steps,quiz-engine,quiz-submit}.test.ts`, `tests/e2e/{calculator,quiz}.spec.ts` + updates de los existentes | A/B/C |

---

# PR A — Form controls + calculadora (`feat/fase-2-controles-calculadora`)

### Task 1: Rama, tokens y controles sin estado (Field, TextInput, SelectField)

**Files:**
- Modify: `app/globals.css` (bloque `@theme` líneas 3-55 y final del archivo)
- Create: `components/ui/form/field.tsx`, `components/ui/form/text-input.tsx`, `components/ui/form/select-field.tsx`

**Interfaces:**
- Produces: `Field({ label, htmlFor, hint?, error?, children })`, `TextInput(props de <input> + { invalid?: boolean })`, `SelectField(props de <select> + { options: { value: string; label: string }[] })`. Estilo base de control exportado como constante `controlClass` desde `text-input.tsx` (lo reutilizan money/percent).

- [ ] **Step 1: Crear rama**

```bash
git checkout main && git pull && git checkout -b feat/fase-2-controles-calculadora
```

- [ ] **Step 2: Añadir tokens al `@theme` de `app/globals.css`**

Dentro del bloque `@theme`, tras `--color-focus`:

```css
  --color-error: #a03d2e; /* rojo ladrillo Fachada — AA sobre paper (ver verificación) */
```

Al final del archivo (fuera de `@theme`):

```css
@keyframes quiz-step-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
```

- [ ] **Step 3: Verificar contraste AA del token de error sobre paper**

```bash
node -e "
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
const r=(L('#f7f5f0')+0.05)/(L('#a03d2e')+0.05);console.log(r.toFixed(2))"
```

Expected: ≥ 4.5. Si no llega, oscurecer el rojo hasta cumplir y anotar el valor final.

- [ ] **Step 4: Crear `components/ui/form/text-input.tsx`**

```tsx
import type { ComponentPropsWithoutRef } from 'react';

export const controlClass =
  'w-full border bg-plate px-4 py-3.5 font-sans text-base text-ink placeholder:text-faint disabled:bg-sand disabled:text-muted';

type Props = ComponentPropsWithoutRef<'input'> & { invalid?: boolean };

export function TextInput({ invalid, className, ...props }: Props) {
  const border = invalid ? 'border-error' : 'border-leader';
  return <input {...props} aria-invalid={invalid || undefined} className={`${controlClass} ${border} ${className ?? ''}`} />;
}
```

- [ ] **Step 5: Crear `components/ui/form/field.tsx`**

```tsx
import type { ReactNode } from 'react';

type Props = { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode };

export function Field({ label, htmlFor, hint, error, children }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-sans text-micro font-medium uppercase tracking-label text-muted">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="font-sans text-fine text-muted">{hint}</p> : null}
      {error ? (
        <p aria-live="polite" className="font-sans text-fine font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Crear `components/ui/form/select-field.tsx`**

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import { controlClass } from './text-input';

type Props = ComponentPropsWithoutRef<'select'> & { options: { value: string; label: string }[] };

export function SelectField({ options, className, ...props }: Props) {
  return (
    <select {...props} className={`${controlClass} appearance-none border-leader ${className ?? ''}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 7: Verificar lint+tipos y commit**

```bash
npm run lint && npx tsc --noEmit
git add app/globals.css components/ui/form/
git commit -m "feat: tokens de formulario y controles base del ui kit (Field, TextInput, SelectField)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `lib/format.ts` (TDD)

**Files:**
- Create: `lib/format.ts`
- Test: `tests/unit/format.test.ts`

**Interfaces:**
- Produces: `formatMoney(value: number, locale: string, decimals?: number): string` (USD, por defecto 0 decimales) · `parseMoney(raw: string): number | null` (ignora todo lo no-dígito; `''`/sin dígitos → null) · `parseRate(raw: string): number | null` (acepta coma o punto decimal; `''` → null; negativo → null).

- [ ] **Step 1: Escribir el test que falla**

`tests/unit/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatMoney, parseMoney, parseRate } from '@/lib/format';

describe('formatMoney', () => {
  it('USD sin decimales por defecto', () => {
    expect(formatMoney(450000, 'en')).toBe('$450,000');
    expect(formatMoney(599.55, 'en', 2)).toBe('$599.55');
  });
  it('respeta el locale es', () => {
    expect(formatMoney(450000, 'es')).toMatch(/450/); // separadores según ICU, no se fija el literal exacto
  });
});

describe('parseMoney', () => {
  it('extrae dígitos de entrada sucia', () => {
    expect(parseMoney('$450,000')).toBe(450000);
    expect(parseMoney('45 000')).toBe(45000);
  });
  it('vacío o sin dígitos → null', () => {
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('abc')).toBeNull();
  });
});

describe('parseRate', () => {
  it('acepta punto y coma decimal', () => {
    expect(parseRate('6.5')).toBe(6.5);
    expect(parseRate('6,5')).toBe(6.5);
  });
  it('vacío o negativo → null', () => {
    expect(parseRate('')).toBeNull();
    expect(parseRate('-1')).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `npx vitest run tests/unit/format.test.ts`
Expected: FAIL — `Cannot find module '@/lib/format'`.

- [ ] **Step 3: Implementar `lib/format.ts`**

```ts
// Formateo/parseo de inputs numéricos (calculadora y cuestionario). Locale 'en'|'es' → en-US/es-US.
const intlLocale = (locale: string) => (locale === 'es' ? 'es-US' : 'en-US');

export function formatMoney(value: number, locale: string, decimals = 0): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function parseMoney(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? null : Number(digits);
}

export function parseRate(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '') return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
```

- [ ] **Step 4: Ejecutar y ver verde**

Run: `npx vitest run tests/unit/format.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/format.ts tests/unit/format.test.ts
git commit -m "feat: helpers de formateo y parseo numérico por locale

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Controles con estado (MoneyInput, PercentInput, ChoiceCard, CheckEscape)

**Files:**
- Create: `components/ui/form/money-input.tsx`, `components/ui/form/percent-input.tsx`, `components/ui/form/choice-card.tsx`, `components/ui/form/check-escape.tsx`

**Interfaces:**
- Consumes: `controlClass` (Task 1), `formatMoney`, `parseMoney`, `parseRate` (Task 2).
- Produces:
  - `MoneyInput({ id, value: number | null, onValueChange(v: number | null): void, locale: string, invalid?, disabled? })` — muestra dígitos agrupados (`1,000` en, `1.000` es) sin símbolo, `inputmode="numeric"`.
  - `PercentInput({ id, value: number | null, onValueChange(v: number | null): void, invalid? })` — texto libre validado con `parseRate`, `inputmode="decimal"`.
  - `ChoiceCard({ name, value, label, checked, onSelect(value: string): void, onPointerSelect?(value: string): void })` — radio nativo + tarjeta; `onPointerSelect` se dispara SOLO en interacción de puntero (base del auto-avance).
  - `CheckEscape({ id, label, checked, onChange(checked: boolean): void })`.

- [ ] **Step 1: Crear `components/ui/form/money-input.tsx`**

```tsx
'use client';
import { parseMoney } from '@/lib/format';
import { controlClass } from './text-input';

type Props = {
  id: string;
  value: number | null;
  onValueChange: (v: number | null) => void;
  locale: string;
  invalid?: boolean;
  disabled?: boolean;
};

export function MoneyInput({ id, value, onValueChange, locale, invalid, disabled }: Props) {
  const display =
    value === null ? '' : new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US').format(value);
  const border = invalid ? 'border-error' : 'border-leader';
  return (
    <div className={`flex items-center border bg-plate ${border} ${disabled ? 'bg-sand' : ''}`}>
      <span aria-hidden className="pl-4 font-sans text-base text-muted">$</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(e) => onValueChange(parseMoney(e.target.value))}
        className={`${controlClass} border-0 bg-transparent pl-1.5`}
      />
    </div>
  );
}
```

- [ ] **Step 2: Crear `components/ui/form/percent-input.tsx`**

Igual patrón, sufijo `%`; mantiene el texto crudo en un estado local para permitir teclear `6,` sin saltos y notifica `parseRate(raw)`:

```tsx
'use client';
import { useState } from 'react';
import { parseRate } from '@/lib/format';
import { controlClass } from './text-input';

type Props = { id: string; value: number | null; onValueChange: (v: number | null) => void; invalid?: boolean; disabled?: boolean };

export function PercentInput({ id, value, onValueChange, invalid, disabled }: Props) {
  const [raw, setRaw] = useState(value === null ? '' : String(value));
  const border = invalid ? 'border-error' : 'border-leader';
  return (
    <div className={`flex items-center border bg-plate ${border} ${disabled ? 'bg-sand' : ''}`}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={raw}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setRaw(e.target.value);
          onValueChange(parseRate(e.target.value));
        }}
        className={`${controlClass} border-0 bg-transparent pr-1.5`}
      />
      <span aria-hidden className="pr-4 font-sans text-base text-muted">%</span>
    </div>
  );
}
```

- [ ] **Step 3: Crear `components/ui/form/choice-card.tsx`**

Radio NATIVO (ADR-0007 §7) oculto visualmente pero enfocable; la tarjeta es el `<label>`. `onPointerSelect` solo desde puntero: se marca con `onPointerDown` en el label y se consume en `onChange`.

```tsx
'use client';
import { useRef } from 'react';

type Props = {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: (value: string) => void;
  onPointerSelect?: (value: string) => void;
};

export function ChoiceCard({ name, value, label, checked, onSelect, onPointerSelect }: Props) {
  const viaPointer = useRef(false);
  return (
    <label
      onPointerDown={() => (viaPointer.current = true)}
      className={`flex cursor-pointer items-center justify-between border px-5 py-4 font-sans text-base transition ${
        checked ? 'border-navy bg-sand text-ink' : 'border-leader bg-plate text-body hover:border-navy'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => {
          onSelect(value);
          if (viaPointer.current) onPointerSelect?.(value);
          viaPointer.current = false;
        }}
        className="sr-only"
      />
      <span>{label}</span>
      <span aria-hidden className={`ml-4 h-2.5 w-2.5 shrink-0 border ${checked ? 'border-navy bg-navy' : 'border-leader'}`} />
    </label>
  );
}
```

Nota a11y: `sr-only` mantiene el radio enfocable y operable con flechas; el estado visible lo da la tarjeta. El anillo de foco del sistema (`:focus-visible` global) no aplica a `sr-only` → añadir al label `has-focus-visible:outline-2 has-focus-visible:outline-focus` (variante `has-*` de Tailwind v4 sobre `:has(:focus-visible)`).

- [ ] **Step 4: Crear `components/ui/form/check-escape.tsx`**

```tsx
'use client';

type Props = { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void };

export function CheckEscape({ id, label, checked, onChange }: Props) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 font-sans text-sm text-body">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 appearance-none border border-leader bg-plate checked:border-navy checked:bg-navy"
      />
      {label}
    </label>
  );
}
```

- [ ] **Step 5: Verificar y commit**

```bash
npm run lint && npx tsc --noEmit
git add components/ui/form/
git commit -m "feat: controles de formulario con estado (MoneyInput, PercentInput, ChoiceCard, CheckEscape)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `lib/mortgage.ts` (TDD)

**Files:**
- Create: `lib/mortgage.ts`
- Test: `tests/unit/mortgage.test.ts`

**Interfaces:**
- Produces:

```ts
export type MortgageInput = { price: number; downPayment: number; annualRatePct: number; years: number };
export type MortgageBreakdown = {
  principal: number; monthly: number;
  firstInterest: number; firstPrincipal: number;
  totalInterest: number; totalCost: number; // totalCost = principal + totalInterest
};
export function monthlyPayment(principal: number, annualRatePct: number, years: number): number;
export function mortgageBreakdown(input: MortgageInput): MortgageBreakdown | null; // null si inválido
```

- [ ] **Step 1: Escribir el test que falla**

`tests/unit/mortgage.test.ts` — valores canónicos de amortización (verificables en cualquier tabla estándar):

```ts
import { describe, it, expect } from 'vitest';
import { monthlyPayment, mortgageBreakdown } from '@/lib/mortgage';

describe('monthlyPayment (valores canónicos)', () => {
  it('$100,000 al 6% a 30 años ≈ $599.55', () => {
    expect(monthlyPayment(100000, 6, 30)).toBeCloseTo(599.55, 2);
  });
  it('$200,000 al 5% a 30 años ≈ $1,073.64', () => {
    expect(monthlyPayment(200000, 5, 30)).toBeCloseTo(1073.64, 2);
  });
  it('tasa 0 degenera a reparto lineal sin dividir por cero', () => {
    expect(monthlyPayment(120000, 0, 30)).toBeCloseTo(333.33, 2);
  });
});

describe('mortgageBreakdown', () => {
  const input = { price: 125000, downPayment: 25000, annualRatePct: 6, years: 30 };
  it('desglosa principal, primer pago y totales de forma coherente', () => {
    const b = mortgageBreakdown(input)!;
    expect(b.principal).toBe(100000);
    expect(b.monthly).toBeCloseTo(599.55, 2);
    expect(b.firstInterest).toBeCloseTo(500, 2); // 100000 × 0.06/12
    expect(b.firstPrincipal).toBeCloseTo(b.monthly - b.firstInterest, 10);
    expect(b.totalInterest).toBeCloseTo(b.monthly * 360 - 100000, 6);
    expect(b.totalCost).toBeCloseTo(b.principal + b.totalInterest, 6);
  });
  it('inválido → null (entrada ≥ precio, precio 0, años 0, tasa negativa)', () => {
    expect(mortgageBreakdown({ ...input, downPayment: 125000 })).toBeNull();
    expect(mortgageBreakdown({ ...input, price: 0 })).toBeNull();
    expect(mortgageBreakdown({ ...input, years: 0 })).toBeNull();
    expect(mortgageBreakdown({ ...input, annualRatePct: -1 })).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `npx vitest run tests/unit/mortgage.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `lib/mortgage.ts`**

```ts
// Fórmula P&I estándar: M = P·r / (1 − (1+r)^−n), r mensual, n meses. Pura y sin
// redondeos internos: el redondeo es responsabilidad de la capa de presentación.
export type MortgageInput = { price: number; downPayment: number; annualRatePct: number; years: number };
export type MortgageBreakdown = {
  principal: number;
  monthly: number;
  firstInterest: number;
  firstPrincipal: number;
  totalInterest: number;
  totalCost: number;
};

export function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  const n = years * 12;
  if (annualRatePct === 0) return principal / n;
  const r = annualRatePct / 100 / 12;
  return (principal * r) / (1 - (1 + r) ** -n);
}

export function mortgageBreakdown(input: MortgageInput): MortgageBreakdown | null {
  const { price, downPayment, annualRatePct, years } = input;
  if (price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || annualRatePct < 0) return null;
  const principal = price - downPayment;
  const monthly = monthlyPayment(principal, annualRatePct, years);
  const firstInterest = principal * (annualRatePct / 100 / 12);
  return {
    principal,
    monthly,
    firstInterest,
    firstPrincipal: monthly - firstInterest,
    totalInterest: monthly * years * 12 - principal,
    totalCost: principal + (monthly * years * 12 - principal),
  };
}
```

- [ ] **Step 4: Ejecutar y ver verde**

Run: `npx vitest run tests/unit/mortgage.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/mortgage.ts tests/unit/mortgage.test.ts
git commit -m "feat: fórmula de hipoteca P&I con desglose y casos borde testeados

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Calculadora — messages, componente y página

**Files:**
- Modify: `messages/en.json` y `messages/es.json` (namespace `calculator`: sustituir `example` y `comingSoon` por `calc`)
- Create: `components/calculator/mortgage-calculator.tsx`
- Modify: `app/[locale]/calculator/page.tsx`

**Interfaces:**
- Consumes: `mortgageBreakdown` (Task 4), `formatMoney` (Task 2), `Field`, `MoneyInput`, `PercentInput`, `SelectField` (Tasks 1/3).
- Produces: `MortgageCalculator({ texts: CalculatorTexts; locale: string })` donde `CalculatorTexts` es el subtree `calculator.calc` de messages (tipo local del componente, derivado con `typeof`).

- [ ] **Step 1: Reescribir el namespace `calculator` en `messages/en.json`**

Conservar `title`, `description`, `heading`, `heroTitle`, `heroSub`, `explain` tal como están. ELIMINAR `example` y `comingSoon`. Añadir:

```json
"calc": {
  "sectionTitle": "Run your numbers",
  "priceLabel": "Home price",
  "downLabel": "Down payment",
  "downPct": "{pct} of the price",
  "rateLabel": "Interest rate",
  "termLabel": "Loan term",
  "termOption": "{years} years",
  "resultLabel": "Monthly payment (P&I)",
  "resultEmpty": "Fill in the numbers above to see your payment.",
  "firstSplitLabel": "Your first payment",
  "interestLabel": "Interest",
  "principalLabel": "Principal",
  "totalInterestLabel": "Total interest over the life of the loan",
  "totalCostLabel": "Total cost (principal + interest)",
  "errorDown": "The down payment must be smaller than the home price.",
  "disclaimer": "Estimate for educational purposes only. Principal & interest — excludes taxes, insurance, and HOA. Not a loan offer or a pre-qualification."
}
```

- [ ] **Step 2: Reescribir el namespace `calculator` en `messages/es.json`** (mismas claves exactas — la paridad se testea):

```json
"calc": {
  "sectionTitle": "Haz tus números",
  "priceLabel": "Precio de la casa",
  "downLabel": "Entrada",
  "downPct": "{pct} del precio",
  "rateLabel": "Tasa de interés",
  "termLabel": "Plazo",
  "termOption": "{years} años",
  "resultLabel": "Cuota mensual (P&I)",
  "resultEmpty": "Completa los números de arriba para ver tu cuota.",
  "firstSplitLabel": "Tu primer pago",
  "interestLabel": "Intereses",
  "principalLabel": "Capital",
  "totalInterestLabel": "Total de intereses en la vida del préstamo",
  "totalCostLabel": "Coste total (capital + intereses)",
  "errorDown": "La entrada debe ser menor que el precio de la casa.",
  "disclaimer": "Estimación educativa. Solo capital e intereses — no incluye taxes, seguro ni HOA. No es una oferta de préstamo ni una precalificación."
}
```

- [ ] **Step 3: Crear `components/calculator/mortgage-calculator.tsx`**

Client component. Estado local: `price: number | null` (inicial 400000), `down: number | null` (inicial 40000), `rate: number | null` (inicial 6.5), `years: 30 | 20 | 15` (inicial 30). Derivar `breakdown = price && rate !== null ? mortgageBreakdown({ price, downPayment: down ?? 0, annualRatePct: rate, years }) : null`. Textos por interpolación manual (`texts.downPct.replace('{pct}', …)`) — el componente NO usa next-intl.

```tsx
'use client';
import { useState } from 'react';
import { mortgageBreakdown } from '@/lib/mortgage';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { SelectField } from '@/components/ui/form/select-field';

export type CalculatorTexts = {
  sectionTitle: string; priceLabel: string; downLabel: string; downPct: string;
  rateLabel: string; termLabel: string; termOption: string;
  resultLabel: string; resultEmpty: string; firstSplitLabel: string; interestLabel: string;
  principalLabel: string; totalInterestLabel: string; totalCostLabel: string;
  errorDown: string; disclaimer: string;
};

const TERMS = [30, 20, 15] as const;

export function MortgageCalculator({ texts, locale }: { texts: CalculatorTexts; locale: string }) {
  const [price, setPrice] = useState<number | null>(400000);
  const [down, setDown] = useState<number | null>(40000);
  const [rate, setRate] = useState<number | null>(6.5);
  const [years, setYears] = useState<(typeof TERMS)[number]>(30);

  const downError = price !== null && down !== null && down >= price;
  const breakdown =
    price !== null && rate !== null && !downError
      ? mortgageBreakdown({ price, downPayment: down ?? 0, annualRatePct: rate, years })
      : null;
  const pct = price && down ? `${((down / price) * 100).toFixed(1)}%` : null;
  const money = (v: number, d = 0) => formatMoney(v, locale, d);
  const interestShare = breakdown ? (breakdown.firstInterest / breakdown.monthly) * 100 : 0;

  return (
    <div className="grid max-w-[880px] gap-8 lg:grid-cols-2 lg:gap-12">
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <Field label={texts.priceLabel} htmlFor="calc-price">
          <MoneyInput id="calc-price" value={price} onValueChange={setPrice} locale={locale} />
        </Field>
        <Field
          label={texts.downLabel}
          htmlFor="calc-down"
          hint={pct ? texts.downPct.replace('{pct}', pct) : undefined}
          error={downError ? texts.errorDown : undefined}
        >
          <MoneyInput id="calc-down" value={down} onValueChange={setDown} locale={locale} invalid={downError} />
        </Field>
        <Field label={texts.rateLabel} htmlFor="calc-rate">
          <PercentInput id="calc-rate" value={rate} onValueChange={setRate} />
        </Field>
        <Field label={texts.termLabel} htmlFor="calc-term">
          <SelectField
            id="calc-term"
            value={String(years)}
            onChange={(e) => setYears(Number(e.target.value) as (typeof TERMS)[number])}
            options={TERMS.map((y) => ({ value: String(y), label: texts.termOption.replace('{years}', String(y)) }))}
          />
        </Field>
      </form>
      <div aria-live="polite" className="flex flex-col gap-5 border border-ink p-6 lg:p-8">
        <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">{texts.resultLabel}</p>
        {breakdown ? (
          <>
            <p className="font-display text-h2 font-light tabular-nums text-ink">{money(breakdown.monthly, 2)}</p>
            <div>
              <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">{texts.firstSplitLabel}</p>
              <div aria-hidden className="mt-2 flex h-2 w-full border border-hairline">
                <span className="bg-navy" style={{ width: `${interestShare}%` }} />
                <span className="bg-sand" style={{ width: `${100 - interestShare}%` }} />
              </div>
              <p className="mt-2 font-sans text-sm tabular-nums text-body">
                {texts.interestLabel} {money(breakdown.firstInterest, 2)} · {texts.principalLabel} {money(breakdown.firstPrincipal, 2)}
              </p>
            </div>
            <dl className="flex flex-col gap-2 border-t border-hairline pt-4 font-sans text-sm text-body">
              <div className="flex justify-between gap-4"><dt>{texts.totalInterestLabel}</dt><dd className="tabular-nums">{money(breakdown.totalInterest)}</dd></div>
              <div className="flex justify-between gap-4"><dt>{texts.totalCostLabel}</dt><dd className="tabular-nums">{money(breakdown.totalCost)}</dd></div>
            </dl>
          </>
        ) : (
          <p className="font-sans text-base text-body">{downError ? texts.errorDown : texts.resultEmpty}</p>
        )}
        <p className="border-t border-hairline pt-4 font-sans text-fine italic text-muted">{texts.disclaimer}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Integrar en `app/[locale]/calculator/page.tsx`**

Sustituir las secciones `example` y `comingSoon` por la calculadora (conservar PageHero, sección `explain` y `CtaBand`):

```tsx
import { MortgageCalculator, type CalculatorTexts } from '@/components/calculator/mortgage-calculator';
// … dentro del JSX, tras la sección explain:
<section className="border-t border-hairline">
  <Container className="px-5 py-10 lg:px-[72px] lg:py-14">
    <SectionHeading eyebrow={t('title')} title={t('calc.sectionTitle')} />
    <div className="mt-8">
      <MortgageCalculator texts={t.raw('calc') as CalculatorTexts} locale={locale} />
    </div>
  </Container>
</section>
```

- [ ] **Step 5: Verificación completa del task**

```bash
npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static
```

Expected: todo verde; en el build, `/[locale]/calculator` sigue apareciendo prerenderizada (`●`/`○`, nunca `ƒ`).

- [ ] **Step 6: Commit**

```bash
git add messages/ components/calculator/ app/\[locale\]/calculator/page.tsx
git commit -m "feat: calculadora de hipoteca funcional con desglose en vivo

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Medición JS, e2e de calculadora, gate y PR A

**Files:**
- Create: `scripts/measure-first-load.mjs`
- Test: `tests/e2e/calculator.spec.ts`

**Interfaces:**
- Produces: `node scripts/measure-first-load.mjs <ruta-html>` — imprime KB gz por chunk y total First Load (excluye polyfills `noModule`), metodología de la nota del ADR-0003. Lo reutiliza la Task 13.

- [ ] **Step 1: Crear `scripts/measure-first-load.mjs`**

```js
// First Load JS gz de una página prerenderizada (metodología ADR-0003, nota 2026-08-07):
// suma el gzip de los chunks <script src> del HTML, excluyendo el polyfill noModule.
// Uso: node scripts/measure-first-load.mjs .next/server/app/en/quote.html
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('Uso: node scripts/measure-first-load.mjs <ruta .next/server/app/**.html>');
  process.exit(1);
}
const html = readFileSync(htmlPath, 'utf8');
const tags = [...html.matchAll(/<script[^>]*src="(\/_next\/static\/[^"]+\.js)"[^>]*>/g)];
let total = 0;
for (const [tag, src] of tags) {
  if (/nomodule/i.test(tag)) continue; // polyfills: solo navegadores legacy
  const bytes = gzipSync(readFileSync(src.replace('/_next/', '.next/'))).length;
  total += bytes;
  console.log(`${(bytes / 1024).toFixed(1).padStart(7)} KB gz  ${src}`);
}
console.log(`\nTOTAL First Load: ${(total / 1024).toFixed(1)} KB gz`);
```

- [ ] **Step 2: Medir `/calculator` y `/` tras el build de la Task 5**

```bash
node scripts/measure-first-load.mjs .next/server/app/en/calculator.html
node scripts/measure-first-load.mjs .next/server/app/en.html
```

Expected: calculator ≤ 164 KB (presupuesto operativo); home sin cambios (~149 KB). Anotar ambos números en la descripción del PR. Si calculator > 164: investigar el chunk nuevo antes de continuar (no debería — sin dependencias).

- [ ] **Step 3: Escribir `tests/e2e/calculator.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

test('calcula la cuota canónica $100k/6%/30a ≈ 599.55', async ({ page }) => {
  await page.goto('/en/calculator');
  await page.getByLabel(en.calculator.calc.priceLabel).fill('125000');
  await page.getByLabel(en.calculator.calc.downLabel).fill('25000');
  await page.getByLabel(en.calculator.calc.rateLabel).fill('6');
  const result = page.locator('div[aria-live="polite"]'); // div = panel de resultado (los errores de Field son <p aria-live>)
  await expect(result).toContainText('599.55');
  await expect(result).toContainText(en.calculator.calc.disclaimer);
});

test('entrada ≥ precio muestra error y no calcula', async ({ page }) => {
  await page.goto('/en/calculator');
  await page.getByLabel(en.calculator.calc.priceLabel).fill('100000');
  await page.getByLabel(en.calculator.calc.downLabel).fill('100000');
  await expect(page.locator('div[aria-live="polite"]')).toContainText(en.calculator.calc.errorDown);
});

test('funciona en ES con su copy', async ({ page }) => {
  await page.goto('/es/calculadora');
  await page.getByLabel(es.calculator.calc.priceLabel).fill('125000');
  await page.getByLabel(es.calculator.calc.downLabel).fill('25000');
  await page.getByLabel(es.calculator.calc.rateLabel).fill('6');
  await expect(page.locator('div[aria-live="polite"]')).toContainText('599');
});
```

- [ ] **Step 4: Ejecutar e2e**

Run: `npm run build && npm run test:e2e`
Expected: PASS los 3 nuevos + los 14 existentes.

- [ ] **Step 5: Gate local completo**

```bash
npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e
```

Expected: todo verde. NO afirmar éxito sin ver la salida.

- [ ] **Step 6: Commit, push y PR A**

```bash
git add scripts/measure-first-load.mjs tests/e2e/calculator.spec.ts
git commit -m "test: e2e de calculadora y script de medición First Load JS

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push -u origin feat/fase-2-controles-calculadora
gh pr create --title "Fase 2 · PR A: form controls del ui kit + calculadora funcional" --body "$(cat <<'EOF'
## Qué incluye
- Primeros form controls Fachada (`components/ui/form/`): Field, TextInput, SelectField, MoneyInput, PercentInput, ChoiceCard, CheckEscape + token `--color-error`.
- `lib/mortgage.ts` (P&I + desglose, unit tests canónicos) y `lib/format.ts`.
- Calculadora funcional en `/calculator` (client component, textos por props — messages fuera del bundle).
- `scripts/measure-first-load.mjs` (metodología ADR-0003).

## Medición First Load JS
- /calculator: XXX KB gz (presupuesto ≤ 164) · home sin cambios: XXX KB gz
(sustituir XXX por los valores medidos en la Task 6 Step 2)

## Checks
- Gate local completo verde. Lighthouse ≥95×4 en preview (gate CI).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Tras checks verdes: **revisión visual del responsable** (primeros controles del kit) y squash merge antes de empezar PR B.

---

# PR B — Cuestionario (`feat/fase-2-cuestionario`)

### Task 7: Zod + `lib/quiz/schema.ts` (TDD)

**Files:**
- Create: `lib/quiz/schema.ts`
- Test: `tests/unit/quiz-schema.test.ts`

**Interfaces:**
- Produces:

```ts
export const fieldSchemas: { /* un schema Zod REQUERIDO por campo de respuesta */ };
export const stepSchemas: Record<StepId, ZodObject>; // valida SOLO los campos de ese paso
export const payloadSchema: ZodType<QuizPayload>;    // payload completo con condicionales por flujo
export type Answers = Partial<QuizPayload>;
export type QuizPayload = z.infer<typeof payloadSchema>;
```

Campos y valores (claves enum EXACTAS — las consumen steps, textos y tests):
`goal: 'buy'|'refinance'` · `location: string 2..80` · `propertyType: 'singleFamily'|'townhouse'|'condo'|'multiUnit'|'other'` · `stage: 'research'|'looking'|'offerAccepted'|'underContract'` · `use: 'primary'|'second'|'investment'` · `military: 'yes'|'no'` · `militaryBranch: 'army'|'navy'|'airForce'|'marines'|'coastGuard'|'guardReserves'` · `hasAgent: 'yes'|'notYet'` · `firstTime: 'yes'|'no'` · `purchasePrice: number entero 1..50_000_000` · `downPayment: number entero 0..50_000_000 | 'unsure'` · `propertyValue`/`currentBalance`: como purchasePrice · `currentRate: number 0..25 | 'unsure'` · `secondMortgage: 'yes'|'no'` · `cashOut: 'yes'|'no'|'unsure'` · `employment: 'employed'|'selfEmployed'|'retired'|'other'` · `income: 'under50k'|'50to100k'|'100to150k'|'over150k'|'discuss'` · `credit: 'excellent'|'good'|'fair'|'needsWork'|'unknown'` · `history: 'none'|'over4y'|'within4y'` · `status: 'citizen'|'permanentResident'|'workVisa'|'otherStatus'|'discuss'` · `firstName`/`lastName: string 1..60 trim` · `email: z.email() máx 120` · `phone: regex /^[+()\d\s.-]{7,20}$/`.

- [ ] **Step 1: Crear rama e instalar Zod**

```bash
git checkout main && git pull && git checkout -b feat/fase-2-cuestionario
npm install zod
```

- [ ] **Step 2: Escribir el test que falla**

`tests/unit/quiz-schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { stepSchemas, payloadSchema } from '@/lib/quiz/schema';

const buyPayload = {
  goal: 'buy', location: 'Miami 33130', propertyType: 'singleFamily', stage: 'looking',
  use: 'primary', military: 'no', hasAgent: 'notYet', firstTime: 'yes',
  purchasePrice: 450000, downPayment: 45000, employment: 'employed', income: '50to100k',
  credit: 'good', history: 'none', status: 'permanentResident',
  firstName: 'Ana', lastName: 'García', email: 'ana@example.com', phone: '+1 305 555 0101',
};
const refiPayload = {
  goal: 'refinance', location: 'Hialeah', propertyType: 'condo', use: 'primary',
  military: 'yes', militaryBranch: 'navy', propertyValue: 380000, currentBalance: 210000,
  currentRate: 'unsure', secondMortgage: 'no', cashOut: 'unsure', employment: 'selfEmployed',
  income: 'discuss', credit: 'unknown', history: 'over4y', status: 'citizen',
  firstName: 'Luis', lastName: 'Pérez', email: 'luis@example.com', phone: '(305) 555-0102',
};

describe('stepSchemas', () => {
  it('valida un paso aislado', () => {
    expect(stepSchemas.goal.safeParse({ goal: 'buy' }).success).toBe(true);
    expect(stepSchemas.goal.safeParse({ goal: 'other' }).success).toBe(false);
    expect(stepSchemas.purchaseNumbers.safeParse({ purchasePrice: 450000, downPayment: 'unsure' }).success).toBe(true);
    expect(stepSchemas.purchaseNumbers.safeParse({ purchasePrice: 450000 }).success).toBe(false);
    expect(stepSchemas.contact.safeParse({ firstName: 'A', lastName: 'B', email: 'no-es-email', phone: '3055550101' }).success).toBe(false);
  });
});

describe('payloadSchema', () => {
  it('acepta los payloads completos de ambos flujos', () => {
    expect(payloadSchema.safeParse(buyPayload).success).toBe(true);
    expect(payloadSchema.safeParse(refiPayload).success).toBe(true);
  });
  it('rechaza compra sin sus campos condicionales', () => {
    const { purchasePrice, ...sinPrecio } = buyPayload;
    expect(payloadSchema.safeParse(sinPrecio).success).toBe(false);
  });
  it('rechaza refi sin sus campos condicionales', () => {
    const { cashOut, ...sinCashOut } = refiPayload;
    expect(payloadSchema.safeParse(sinCashOut).success).toBe(false);
  });
  it('rechaza militar=yes sin rama', () => {
    expect(payloadSchema.safeParse({ ...buyPayload, military: 'yes' }).success).toBe(false);
  });
  it('malicioso: tipos cambiados y strings gigantes → rechazo', () => {
    expect(payloadSchema.safeParse({ ...buyPayload, purchasePrice: 'DROP TABLE' }).success).toBe(false);
    expect(payloadSchema.safeParse({ ...buyPayload, location: 'x'.repeat(5000) }).success).toBe(false);
  });
});
```

- [ ] **Step 3: Ejecutar y ver el fallo**

Run: `npx vitest run tests/unit/quiz-schema.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 4: Implementar `lib/quiz/schema.ts`**

Estructura (fuente única `fieldSchemas`; payload = todos los campos, condicionales `optional()` + `superRefine` que exige por flujo; los `stepSchemas` usan las versiones requeridas):

```ts
import { z } from 'zod';

const money = z.number().int().min(0).max(50_000_000);
const moneyOrUnsure = z.union([money, z.literal('unsure')]);

export const fieldSchemas = {
  goal: z.enum(['buy', 'refinance']),
  location: z.string().trim().min(2).max(80),
  propertyType: z.enum(['singleFamily', 'townhouse', 'condo', 'multiUnit', 'other']),
  stage: z.enum(['research', 'looking', 'offerAccepted', 'underContract']),
  use: z.enum(['primary', 'second', 'investment']),
  military: z.enum(['yes', 'no']),
  militaryBranch: z.enum(['army', 'navy', 'airForce', 'marines', 'coastGuard', 'guardReserves']),
  hasAgent: z.enum(['yes', 'notYet']),
  firstTime: z.enum(['yes', 'no']),
  purchasePrice: money.min(1),
  downPayment: moneyOrUnsure,
  propertyValue: money.min(1),
  currentBalance: money.min(1),
  currentRate: z.union([z.number().min(0).max(25), z.literal('unsure')]),
  secondMortgage: z.enum(['yes', 'no']),
  cashOut: z.enum(['yes', 'no', 'unsure']),
  employment: z.enum(['employed', 'selfEmployed', 'retired', 'other']),
  income: z.enum(['under50k', '50to100k', '100to150k', 'over150k', 'discuss']),
  credit: z.enum(['excellent', 'good', 'fair', 'needsWork', 'unknown']),
  history: z.enum(['none', 'over4y', 'within4y']),
  status: z.enum(['citizen', 'permanentResident', 'workVisa', 'otherStatus', 'discuss']),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.email().max(120),
  phone: z.string().trim().regex(/^[+()\d\s.-]{7,20}$/),
} as const;

export const stepSchemas = {
  goal: z.object({ goal: fieldSchemas.goal }),
  location: z.object({ location: fieldSchemas.location }),
  propertyType: z.object({ propertyType: fieldSchemas.propertyType }),
  stage: z.object({ stage: fieldSchemas.stage }),
  use: z.object({ use: fieldSchemas.use }),
  military: z.object({ military: fieldSchemas.military }),
  militaryBranch: z.object({ militaryBranch: fieldSchemas.militaryBranch }),
  hasAgent: z.object({ hasAgent: fieldSchemas.hasAgent }),
  firstTime: z.object({ firstTime: fieldSchemas.firstTime }),
  purchaseNumbers: z.object({ purchasePrice: fieldSchemas.purchasePrice, downPayment: fieldSchemas.downPayment }),
  refiNumbers: z.object({
    propertyValue: fieldSchemas.propertyValue,
    currentBalance: fieldSchemas.currentBalance,
    currentRate: fieldSchemas.currentRate,
  }),
  secondMortgage: z.object({ secondMortgage: fieldSchemas.secondMortgage }),
  cashOut: z.object({ cashOut: fieldSchemas.cashOut }),
  employment: z.object({ employment: fieldSchemas.employment }),
  income: z.object({ income: fieldSchemas.income }),
  credit: z.object({ credit: fieldSchemas.credit }),
  history: z.object({ history: fieldSchemas.history }),
  status: z.object({ status: fieldSchemas.status }),
  contact: z.object({
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    email: fieldSchemas.email,
    phone: fieldSchemas.phone,
  }),
} as const;

const CONDITIONAL: Record<'buy' | 'refinance', (keyof typeof fieldSchemas)[]> = {
  buy: ['stage', 'hasAgent', 'firstTime', 'purchasePrice', 'downPayment'],
  refinance: ['propertyValue', 'currentBalance', 'currentRate', 'secondMortgage', 'cashOut'],
};

export const payloadSchema = z
  .object({
    ...Object.fromEntries(Object.entries(fieldSchemas).map(([k, s]) => [k, s.optional()])),
    // los siempre-requeridos, sin optional:
    goal: fieldSchemas.goal,
    location: fieldSchemas.location,
    propertyType: fieldSchemas.propertyType,
    use: fieldSchemas.use,
    military: fieldSchemas.military,
    employment: fieldSchemas.employment,
    income: fieldSchemas.income,
    credit: fieldSchemas.credit,
    history: fieldSchemas.history,
    status: fieldSchemas.status,
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    email: fieldSchemas.email,
    phone: fieldSchemas.phone,
  })
  .superRefine((data, ctx) => {
    for (const key of CONDITIONAL[data.goal]) {
      if (data[key] === undefined) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'required' });
      }
    }
    if (data.military === 'yes' && data.militaryBranch === undefined) {
      ctx.addIssue({ code: 'custom', path: ['militaryBranch'], message: 'required' });
    }
  });

export type QuizPayload = z.infer<typeof payloadSchema>;
export type Answers = Partial<QuizPayload>;
export type StepId = keyof typeof stepSchemas;
```

- [ ] **Step 5: Ejecutar y ver verde**

Run: `npx vitest run tests/unit/quiz-schema.test.ts`
Expected: PASS (7 tests). Ejecutar también `npx tsc --noEmit`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/quiz/schema.ts tests/unit/quiz-schema.test.ts
git commit -m "feat: schemas Zod del cuestionario — por paso y payload con condicionales por flujo

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: `lib/quiz/steps.ts` (TDD)

**Files:**
- Create: `lib/quiz/steps.ts`
- Test: `tests/unit/quiz-steps.test.ts`

**Interfaces:**
- Consumes: `Answers`, `StepId`, `stepSchemas` (Task 7).
- Produces:

```ts
export type StepKind = 'choice' | 'text' | 'fields' | 'contact';
export type StepDef = {
  id: StepId;
  kind: StepKind;
  fieldKeys: (keyof Answers)[];      // qué respuestas posee este paso (poda + validación)
  options?: readonly string[];       // valores enum en orden de UI (solo kind 'choice')
  escapeKey?: keyof Answers;         // campo con CheckEscape (purchaseNumbers→downPayment, refiNumbers→currentRate)
  visible?: (a: Answers) => boolean; // ausente = siempre visible
};
export const steps: readonly StepDef[]; // ORDEN = orden de pantalla (spec §3.1)
export function visibleSteps(answers: Answers): StepDef[];
```

- [ ] **Step 1: Escribir el test que falla**

`tests/unit/quiz-steps.test.ts` — invariantes del spec:

```ts
import { describe, it, expect } from 'vitest';
import { steps, visibleSteps } from '@/lib/quiz/steps';
import { stepSchemas } from '@/lib/quiz/schema';

describe('definición de pasos', () => {
  it('ids únicos y todos con schema', () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(stepSchemas[id], `sin schema: ${id}`).toBeDefined();
  });
  it('contacto es SIEMPRE el último paso visible en ambos flujos', () => {
    expect(visibleSteps({ goal: 'buy' }).at(-1)?.id).toBe('contact');
    expect(visibleSteps({ goal: 'refinance' }).at(-1)?.id).toBe('contact');
  });
  it('flujo compra: 15 pasos (16 con militar=sí), sin pasos de refi', () => {
    const buy = visibleSteps({ goal: 'buy' }).map((s) => s.id);
    expect(buy).toHaveLength(15);
    expect(buy).toContain('stage');
    expect(buy).not.toContain('refiNumbers');
    expect(visibleSteps({ goal: 'buy', military: 'yes' })).toHaveLength(16);
  });
  it('flujo refi: 14 pasos (15 con militar=sí), sin pasos de compra', () => {
    const refi = visibleSteps({ goal: 'refinance' }).map((s) => s.id);
    expect(refi).toHaveLength(14);
    expect(refi).toContain('cashOut');
    expect(refi).not.toContain('purchaseNumbers');
    expect(refi).not.toContain('firstTime');
  });
  it('sin objetivo aún: solo los pasos comunes hasta decidir flujo', () => {
    expect(visibleSteps({})[0]?.id).toBe('goal');
  });
});
```

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `npx vitest run tests/unit/quiz-steps.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `lib/quiz/steps.ts`**

```ts
// Definición DECLARATIVA del flujo (ADR-0007): ajustar preguntas = editar este array.
// Los ids son estables: serán la serie histórica de GA4 (Fase 4). Orden = spec §3.1.
import type { Answers, StepId } from './schema';

export type StepKind = 'choice' | 'text' | 'fields' | 'contact';
export type StepDef = {
  id: StepId;
  kind: StepKind;
  fieldKeys: (keyof Answers)[];
  options?: readonly string[];
  escapeKey?: keyof Answers;
  visible?: (a: Answers) => boolean;
};

const buy = (a: Answers) => a.goal === 'buy';
const refi = (a: Answers) => a.goal === 'refinance';

export const steps: readonly StepDef[] = [
  { id: 'goal', kind: 'choice', fieldKeys: ['goal'], options: ['buy', 'refinance'] },
  { id: 'location', kind: 'text', fieldKeys: ['location'] },
  { id: 'propertyType', kind: 'choice', fieldKeys: ['propertyType'], options: ['singleFamily', 'townhouse', 'condo', 'multiUnit', 'other'] },
  { id: 'stage', kind: 'choice', fieldKeys: ['stage'], options: ['research', 'looking', 'offerAccepted', 'underContract'], visible: buy },
  { id: 'use', kind: 'choice', fieldKeys: ['use'], options: ['primary', 'second', 'investment'] },
  { id: 'military', kind: 'choice', fieldKeys: ['military'], options: ['yes', 'no'] },
  { id: 'militaryBranch', kind: 'choice', fieldKeys: ['militaryBranch'], options: ['army', 'navy', 'airForce', 'marines', 'coastGuard', 'guardReserves'], visible: (a) => a.military === 'yes' },
  { id: 'hasAgent', kind: 'choice', fieldKeys: ['hasAgent'], options: ['yes', 'notYet'], visible: buy },
  { id: 'firstTime', kind: 'choice', fieldKeys: ['firstTime'], options: ['yes', 'no'], visible: buy },
  { id: 'purchaseNumbers', kind: 'fields', fieldKeys: ['purchasePrice', 'downPayment'], escapeKey: 'downPayment', visible: buy },
  { id: 'refiNumbers', kind: 'fields', fieldKeys: ['propertyValue', 'currentBalance', 'currentRate'], escapeKey: 'currentRate', visible: refi },
  { id: 'secondMortgage', kind: 'choice', fieldKeys: ['secondMortgage'], options: ['yes', 'no'], visible: refi },
  { id: 'cashOut', kind: 'choice', fieldKeys: ['cashOut'], options: ['yes', 'no', 'unsure'], visible: refi },
  { id: 'employment', kind: 'choice', fieldKeys: ['employment'], options: ['employed', 'selfEmployed', 'retired', 'other'] },
  { id: 'income', kind: 'choice', fieldKeys: ['income'], options: ['under50k', '50to100k', '100to150k', 'over150k', 'discuss'] },
  { id: 'credit', kind: 'choice', fieldKeys: ['credit'], options: ['excellent', 'good', 'fair', 'needsWork', 'unknown'] },
  { id: 'history', kind: 'choice', fieldKeys: ['history'], options: ['none', 'over4y', 'within4y'] },
  { id: 'status', kind: 'choice', fieldKeys: ['status'], options: ['citizen', 'permanentResident', 'workVisa', 'otherStatus', 'discuss'] },
  { id: 'contact', kind: 'contact', fieldKeys: ['firstName', 'lastName', 'email', 'phone'] },
];

export function visibleSteps(answers: Answers): StepDef[] {
  return steps.filter((s) => (s.visible ? s.visible(answers) : true));
}
```

Nota: sin `goal`, los pasos condicionales de ambos flujos quedan ocultos (`visible` devuelve false) — el primer paso visible es `goal` y el total de progreso crece al elegir flujo (recalculado, ADR-0007 §5).

- [ ] **Step 4: Ejecutar y ver verde**

Run: `npx vitest run tests/unit/quiz-steps.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/quiz/steps.ts tests/unit/quiz-steps.test.ts
git commit -m "feat: definición declarativa de pasos del cuestionario con visibilidad por flujo

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: `lib/quiz/engine.ts` (TDD)

**Files:**
- Create: `lib/quiz/engine.ts`
- Test: `tests/unit/quiz-engine.test.ts`

**Interfaces:**
- Consumes: `Answers` (Task 7), `visibleSteps`, `steps` (Task 8).
- Produces:

```ts
export const STORAGE_KEY = 'dhl-quiz-v1';
export type QuizStatus = 'idle' | 'submitting' | 'error' | 'done';
export type QuizState = { answers: Answers; stepId: StepId; status: QuizStatus };
export type QuizAction =
  | { type: 'answer'; patch: Partial<Answers> }   // NO avanza; poda respuestas huérfanas
  | { type: 'next' } | { type: 'back' }
  | { type: 'rehydrate'; state: QuizState }       // reemplaza el estado (post-montaje, evita hydration mismatch)
  | { type: 'submitStart' } | { type: 'submitError' } | { type: 'submitDone' };
export function initialState(): QuizState;                 // { answers: {}, stepId: 'goal', status: 'idle' }
export function quizReducer(state: QuizState, action: QuizAction): QuizState;
export function progressOf(state: QuizState): { current: number; total: number };
export function saveState(state: QuizState): void;         // try/catch silencioso (modo privado)
export function loadState(): QuizState | null;             // null si no hay, corrupto o inválido
```

- [ ] **Step 1: Escribir el test que falla**

`tests/unit/quiz-engine.test.ts` (jsdom no es necesario: Vitest en node — stub de sessionStorage con `vi.stubGlobal`):

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initialState, quizReducer, progressOf, saveState, loadState, STORAGE_KEY } from '@/lib/quiz/engine';

function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() { return map.size; },
  } as Storage;
}

beforeEach(() => vi.stubGlobal('sessionStorage', makeStorage()));

describe('quizReducer', () => {
  it('answer registra sin avanzar; next/back navegan por pasos visibles', () => {
    let s = initialState();
    s = quizReducer(s, { type: 'answer', patch: { goal: 'buy' } });
    expect(s.stepId).toBe('goal');
    s = quizReducer(s, { type: 'next' });
    expect(s.stepId).toBe('location');
    s = quizReducer(s, { type: 'back' });
    expect(s.stepId).toBe('goal');
    expect(quizReducer(s, { type: 'back' }).stepId).toBe('goal'); // no sale por abajo
  });
  it('cambiar de flujo poda las respuestas del flujo abandonado', () => {
    let s = initialState();
    s = quizReducer(s, { type: 'answer', patch: { goal: 'buy' } });
    s = quizReducer(s, { type: 'answer', patch: { stage: 'looking', purchasePrice: 450000 } });
    s = quizReducer(s, { type: 'answer', patch: { goal: 'refinance' } });
    expect(s.answers.stage).toBeUndefined();
    expect(s.answers.purchasePrice).toBeUndefined();
    expect(s.answers.goal).toBe('refinance');
  });
  it('militar no→sí añade el paso de rama al total', () => {
    let s = initialState();
    s = quizReducer(s, { type: 'answer', patch: { goal: 'buy' } });
    const before = progressOf(s).total;
    s = quizReducer(s, { type: 'answer', patch: { military: 'yes' } });
    expect(progressOf(s).total).toBe(before + 1);
  });
  it('progressOf: goal es 1/N', () => {
    const p = progressOf(initialState());
    expect(p.current).toBe(1);
    expect(p.total).toBeGreaterThan(1);
  });
});

describe('persistencia', () => {
  it('save→load redondo', () => {
    let s = initialState();
    s = quizReducer(s, { type: 'answer', patch: { goal: 'refinance' } });
    s = quizReducer(s, { type: 'next' });
    saveState(s);
    expect(loadState()).toEqual({ ...s, status: 'idle' });
  });
  it('JSON corrupto → null', () => {
    sessionStorage.setItem(STORAGE_KEY, '{no es json');
    expect(loadState()).toBeNull();
  });
  it('stepId desconocido o answers no-objeto → null', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: {}, stepId: 'hackeado', status: 'idle' }));
    expect(loadState()).toBeNull();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: 'x', stepId: 'goal', status: 'idle' }));
    expect(loadState()).toBeNull();
  });
  it('sessionStorage que lanza (modo privado) → save silencioso y load null', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
    } as unknown as Storage);
    expect(() => saveState(initialState())).not.toThrow();
    expect(loadState()).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `npx vitest run tests/unit/quiz-engine.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `lib/quiz/engine.ts`**

```ts
// Motor puro del cuestionario (ADR-0007): reducer sin efectos + persistencia aparte.
// La validación por paso NO vive aquí (la hace el componente con stepSchemas antes de 'next').
import type { Answers, StepId } from './schema';
import { steps, visibleSteps } from './steps';

export const STORAGE_KEY = 'dhl-quiz-v1';

export type QuizStatus = 'idle' | 'submitting' | 'error' | 'done';
export type QuizState = { answers: Answers; stepId: StepId; status: QuizStatus };
export type QuizAction =
  | { type: 'answer'; patch: Partial<Answers> }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'rehydrate'; state: QuizState }
  | { type: 'submitStart' }
  | { type: 'submitError' }
  | { type: 'submitDone' };

export function initialState(): QuizState {
  return { answers: {}, stepId: 'goal', status: 'idle' };
}

function indexOf(stepId: StepId, answers: Answers): number {
  return visibleSteps(answers).findIndex((s) => s.id === stepId);
}

/** Elimina respuestas cuyos pasos ya no son visibles (p. ej. al cambiar de flujo). */
function prune(answers: Answers): Answers {
  const visibleKeys = new Set(visibleSteps(answers).flatMap((s) => s.fieldKeys));
  const pruned: Answers = {};
  for (const [key, value] of Object.entries(answers)) {
    if (visibleKeys.has(key as keyof Answers)) (pruned as Record<string, unknown>)[key] = value;
  }
  return pruned;
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'answer': {
      const answers = prune({ ...state.answers, ...action.patch });
      return { ...state, answers };
    }
    case 'next': {
      const visible = visibleSteps(state.answers);
      const i = indexOf(state.stepId, state.answers);
      const nextStep = visible[Math.min(i + 1, visible.length - 1)];
      return { ...state, stepId: nextStep.id };
    }
    case 'back': {
      const visible = visibleSteps(state.answers);
      const i = indexOf(state.stepId, state.answers);
      return { ...state, stepId: visible[Math.max(i - 1, 0)].id, status: 'idle' };
    }
    case 'rehydrate':
      return action.state;
    case 'submitStart':
      return { ...state, status: 'submitting' };
    case 'submitError':
      return { ...state, status: 'error' };
    case 'submitDone':
      return { ...state, status: 'done' };
  }
}

export function progressOf(state: QuizState): { current: number; total: number } {
  const visible = visibleSteps(state.answers);
  return { current: Math.max(indexOf(state.stepId, state.answers), 0) + 1, total: visible.length };
}

export function saveState(state: QuizState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, status: 'idle' }));
  } catch {
    /* modo privado / storage lleno: el quiz sigue en memoria */
  }
}

export function loadState(): QuizState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizState;
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof parsed.answers !== 'object' || parsed.answers === null) return null;
    if (!steps.some((s) => s.id === parsed.stepId)) return null;
    return { answers: parsed.answers, stepId: parsed.stepId, status: 'idle' };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Ejecutar y ver verde**

Run: `npx vitest run tests/unit/quiz-engine.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/quiz/engine.ts tests/unit/quiz-engine.test.ts
git commit -m "feat: motor del cuestionario — reducer puro, poda por flujo y persistencia resiliente

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: `lib/quiz/submit.ts` (TDD)

**Files:**
- Create: `lib/quiz/submit.ts`
- Test: `tests/unit/quiz-submit.test.ts`

**Interfaces:**
- Consumes: `payloadSchema`, `QuizPayload` (Task 7).
- Produces:

```ts
export const SUBMIT_TIMEOUT_MS = 25_000; // ADR-0007 §5 (> peor caso servidor ADR-0004)
export type Transport = (payload: QuizPayload) => Promise<void>;
export async function submitLead(raw: unknown, transport?: Transport): Promise<QuizPayload>;
// 1) valida raw con payloadSchema (throw si inválido — nunca "enviar" datos malos)
// 2) Promise.race(transport, timeout) — rechaza con Error('timeout') si vence
// 3) Fase 3: sustituir SOLO simulatedTransport por el POST real. La UI no cambia.
```

- [ ] **Step 1: Escribir el test que falla**

`tests/unit/quiz-submit.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { submitLead, SUBMIT_TIMEOUT_MS } from '@/lib/quiz/submit';

const valid = {
  goal: 'buy', location: 'Miami', propertyType: 'condo', stage: 'research', use: 'primary',
  military: 'no', hasAgent: 'yes', firstTime: 'no', purchasePrice: 300000, downPayment: 'unsure',
  employment: 'employed', income: 'under50k', credit: 'fair', history: 'none', status: 'workVisa',
  firstName: 'Ana', lastName: 'García', email: 'ana@example.com', phone: '3055550101',
};

afterEach(() => vi.useRealTimers());

describe('submitLead', () => {
  it('payload inválido → rechaza SIN llamar al transporte', async () => {
    const transport = vi.fn();
    await expect(submitLead({ goal: 'buy' }, transport)).rejects.toThrow();
    expect(transport).not.toHaveBeenCalled();
  });
  it('payload válido → llama al transporte con el payload parseado y resuelve', async () => {
    const transport = vi.fn().mockResolvedValue(undefined);
    const result = await submitLead(valid, transport);
    expect(transport).toHaveBeenCalledOnce();
    expect(result.email).toBe('ana@example.com');
  });
  it('error del transporte se propaga', async () => {
    await expect(submitLead(valid, () => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
  });
  it('transporte colgado → rechaza al vencer el timeout', async () => {
    vi.useFakeTimers();
    const hanging = () => new Promise<void>(() => {});
    const promise = submitLead(valid, hanging);
    const assertion = expect(promise).rejects.toThrow('timeout');
    await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS + 1);
    await assertion;
  });
});
```

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `npx vitest run tests/unit/quiz-submit.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `lib/quiz/submit.ts`**

```ts
// Envío del lead. FASE 2: transporte SIMULADO — el submit valida y resuelve como lo hará
// el pipeline real, pero NO persiste en ningún sitio (decisión de spec §2.6: demo del
// estado final para el cliente; producción sigue noindex). FASE 3: sustituir
// simulatedTransport por el POST a /api/lead. Nada más cambia.
import { payloadSchema, type QuizPayload } from './schema';

export const SUBMIT_TIMEOUT_MS = 25_000;

export type Transport = (payload: QuizPayload) => Promise<void>;

const simulatedTransport: Transport = async () => {
  // Gancho e2e para el camino de error (se elimina junto con el stub en Fase 3):
  if (typeof location !== 'undefined' && location.search.includes('e2e-fail-submit')) {
    await new Promise((r) => setTimeout(r, 300));
    throw new Error('simulated failure');
  }
  await new Promise((r) => setTimeout(r, 600));
};

export async function submitLead(raw: unknown, transport: Transport = simulatedTransport): Promise<QuizPayload> {
  const payload = payloadSchema.parse(raw);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), SUBMIT_TIMEOUT_MS);
  });
  try {
    await Promise.race([transport(payload), timeout]);
    return payload;
  } finally {
    clearTimeout(timer);
  }
}
```

- [ ] **Step 4: Ejecutar y ver verde**

Run: `npx vitest run tests/unit/quiz-submit.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/quiz/submit.ts tests/unit/quiz-submit.test.ts
git commit -m "feat: submitLead con transporte inyectable, timeout y stub simulado de Fase 2

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Messages del cuestionario (`quote.*`) + tipo `QuizTexts`

**Files:**
- Modify: `messages/en.json`, `messages/es.json` (namespace `quote`: conservar `title`/`description`/`heading`/`heroTitle`; actualizar `heroSub`; ELIMINAR `steps` y `meanwhile`; añadir subtree `quiz`)
- Create: `lib/quiz/texts.ts`

**Interfaces:**
- Consumes: `StepId` (Task 7).
- Produces: `QuizTexts` — contrato server→client. La página hará `t.raw('quiz') as QuizTexts`.

- [ ] **Step 1: `lib/quiz/texts.ts`**

```ts
import type { StepId } from './schema';

export type StepTexts = {
  title?: string;
  titleBuy?: string;   // location varía por flujo
  titleRefi?: string;
  helper?: string;
  options?: Record<string, string>; // clave = valor enum del schema
  label?: string;
  placeholder?: string;
  priceLabel?: string;
  downLabel?: string;
  valueLabel?: string;
  balanceLabel?: string;
  rateLabel?: string;
  escape?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  consent?: string;
};

export type QuizTexts = {
  progress: { label: string }; // «Step {current} of {total}»
  nav: { back: string; continue: string; submit: string; sending: string; retry: string };
  errors: Record<'choice' | 'location' | 'money' | 'rate' | 'firstName' | 'lastName' | 'email' | 'phone' | 'submit', string>;
  steps: Record<StepId, StepTexts>;
  thanks: { title: string; body: string; noWait: string; explore: string };
};
```

- [ ] **Step 2: `messages/en.json` — namespace `quote`**

`heroSub` nuevo (cubre Pre-Qualify, spec §6.2): `"This is my pre-qualification questionnaire: a few minutes of questions, real numbers back — no commitment and no credit pull."`

Subtree `quiz` (títulos, helpers y opciones EXACTOS del spec §3.1, columna EN):

```json
"quiz": {
  "progress": { "label": "Step {current} of {total}" },
  "nav": { "back": "Back", "continue": "Continue", "submit": "Send my request", "sending": "Sending…", "retry": "Try again" },
  "errors": {
    "choice": "Select an option to continue.",
    "location": "Enter your city or ZIP code.",
    "money": "Enter a valid amount.",
    "rate": "Enter a valid rate.",
    "firstName": "Enter your first name.",
    "lastName": "Enter your last name.",
    "email": "Enter a valid email.",
    "phone": "Enter a valid phone number.",
    "submit": "Something went wrong sending your request. Your answers are safe — try again."
  },
  "steps": {
    "goal": { "title": "What brings you here today?", "options": { "buy": "Buy a home", "refinance": "Refinance my home" } },
    "location": { "titleBuy": "Where in Florida are you looking to buy?", "titleRefi": "Where's the property?", "label": "City or ZIP code", "placeholder": "Miami or 33130" },
    "propertyType": { "title": "What type of property?", "options": { "singleFamily": "Single-family home", "townhouse": "Townhouse", "condo": "Condo", "multiUnit": "Multi-unit (2–4)", "other": "Other" } },
    "stage": { "title": "Where are you in the process?", "options": { "research": "Just starting to research", "looking": "Actively looking at homes", "offerAccepted": "Offer accepted", "underContract": "Under contract" } },
    "use": { "title": "How will you use this property?", "options": { "primary": "Primary residence", "second": "Second home", "investment": "Investment" } },
    "military": { "title": "Have you or your spouse served in the U.S. military?", "helper": "It can unlock VA loan benefits.", "options": { "yes": "Yes", "no": "No" } },
    "militaryBranch": { "title": "Which branch?", "options": { "army": "Army", "navy": "Navy", "airForce": "Air Force", "marines": "Marines", "coastGuard": "Coast Guard", "guardReserves": "National Guard or Reserves" } },
    "hasAgent": { "title": "Are you working with a real estate agent?", "options": { "yes": "Yes", "notYet": "Not yet" } },
    "firstTime": { "title": "Is this your first home purchase?", "helper": "There are programs specifically for first-time buyers.", "options": { "yes": "Yes", "no": "No" } },
    "purchaseNumbers": { "title": "Your purchase numbers", "priceLabel": "Estimated price", "downLabel": "Down payment available", "escape": "I'm not sure yet" },
    "refiNumbers": { "title": "Your current mortgage", "valueLabel": "Estimated property value", "balanceLabel": "Current loan balance", "rateLabel": "Current interest rate", "escape": "I don't remember" },
    "secondMortgage": { "title": "Do you have a second mortgage on the property?", "options": { "yes": "Yes", "no": "No" } },
    "cashOut": { "title": "Are you looking to take cash out?", "helper": "Cash-out uses your equity for renovations, debt, or other goals.", "options": { "yes": "Yes", "no": "No", "unsure": "Not sure yet" } },
    "employment": { "title": "What's your employment situation?", "options": { "employed": "Employed", "selfEmployed": "Self-employed or business owner", "retired": "Retired", "other": "Other" } },
    "income": { "title": "What's your annual household income?", "helper": "A range is enough.", "options": { "under50k": "Under $50,000", "50to100k": "$50,000–$100,000", "100to150k": "$100,000–$150,000", "over150k": "Over $150,000", "discuss": "I'd rather discuss it with you" } },
    "credit": { "title": "How's your credit?", "helper": "An estimate is fine — nothing is checked here.", "options": { "excellent": "Excellent (740+)", "good": "Good (680–739)", "fair": "Fair (620–679)", "needsWork": "Needs work (below 620)", "unknown": "I don't know" } },
    "history": { "title": "Any bankruptcy or foreclosure in your past?", "helper": "It doesn't disqualify you — it just changes which programs fit.", "options": { "none": "No", "over4y": "Yes, more than 4 years ago", "within4y": "Yes, within the last 4 years" } },
    "status": { "title": "Which best describes your status in the U.S.?", "helper": "This helps me match you with the right programs — there are options with ITIN and for foreign buyers.", "options": { "citizen": "U.S. citizen", "permanentResident": "Permanent resident", "workVisa": "Work visa or permit", "otherStatus": "Other status (ITIN / foreign national)", "discuss": "I'd rather discuss it with you" } },
    "contact": { "title": "Last step — where do I send your numbers?", "firstName": "First name", "lastName": "Last name", "email": "Email", "phone": "Phone", "consent": "By sending, you agree that David Herrera may contact you about your request by phone, text, or email." }
  },
  "thanks": { "title": "Got it, {name}.", "body": "Your request is in — I'll review your numbers and reach out shortly, usually the same day.", "noWait": "If you'd rather not wait:", "explore": "Explore loan options" }
}
```

- [ ] **Step 3: `messages/es.json` — namespace `quote`**

Mismas claves EXACTAS (paridad testeada). Títulos, helpers y opciones de paso: los textos ES del spec §3.1 al pie de la letra. Estructurales:

```json
"quiz": {
  "progress": { "label": "Paso {current} de {total}" },
  "nav": { "back": "Atrás", "continue": "Continuar", "submit": "Enviar mi solicitud", "sending": "Enviando…", "retry": "Reintentar" },
  "errors": {
    "choice": "Selecciona una opción para continuar.",
    "location": "Escribe tu ciudad o código ZIP.",
    "money": "Escribe una cantidad válida.",
    "rate": "Escribe una tasa válida.",
    "firstName": "Escribe tu nombre.",
    "lastName": "Escribe tu apellido.",
    "email": "Escribe un email válido.",
    "phone": "Escribe un teléfono válido.",
    "submit": "Algo falló al enviar tu solicitud. Tus respuestas están a salvo — inténtalo otra vez."
  },
  "thanks": { "title": "Recibido, {name}.", "body": "Tu solicitud está dentro — reviso tus números y te contacto en breve, normalmente el mismo día.", "noWait": "Si prefieres no esperar:", "explore": "Explora los programas" }
}
```

`heroSub` ES: `"Este es mi cuestionario de precalificación: unos minutos de preguntas y vuelves con números reales — sin compromiso y sin consultar tu crédito."`

- [ ] **Step 4: Verificar paridad y tipos**

Run: `npx vitest run tests/unit/i18n-parity.test.ts && npx tsc --noEmit`
Expected: PASS — si falla la paridad, la salida dice exactamente qué clave difiere.

- [ ] **Step 5: Commit**

```bash
git add messages/ lib/quiz/texts.ts
git commit -m "feat: copy EN/ES completo del cuestionario y contrato QuizTexts

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Client component del quiz + página `/quote`

**Files:**
- Create: `components/quiz/quiz.tsx`
- Modify: `app/[locale]/quote/page.tsx` (reescritura: fuera secciones shell, dentro el quiz)

**Interfaces:**
- Consumes: TODO lo de Tasks 7-11 + `Field`, `TextInput`, `MoneyInput`, `PercentInput`, `ChoiceCard`, `CheckEscape` (PR A) + `Button` no (los botones del quiz son `<button>`, no links — se estilizan con las MISMAS clases vía constante local que replica `variants.navy`/`paper` de `components/ui/button.tsx`; si se prefiere, extraer esas clases a una constante exportada `buttonClass(variant,size)` en `button.tsx` — decisión del implementador, sin duplicar valores de tokens).
- Produces: `Quiz({ texts, locale, thanksCtas }: { texts: QuizTexts; locale: string; thanksCtas: ReactNode })`.

- [ ] **Step 1: Crear `components/quiz/quiz.tsx`**

Estructura completa (el ÚNICO client component del cuestionario — subcomponentes internos en el mismo archivo):

```tsx
'use client';
import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { stepSchemas, type Answers, type StepId } from '@/lib/quiz/schema';
import { visibleSteps, type StepDef } from '@/lib/quiz/steps';
import { initialState, loadState, progressOf, quizReducer, saveState, STORAGE_KEY } from '@/lib/quiz/engine';
import { submitLead } from '@/lib/quiz/submit';
import type { QuizTexts } from '@/lib/quiz/texts';
import { Field } from '@/components/ui/form/field';
import { TextInput } from '@/components/ui/form/text-input';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { ChoiceCard } from '@/components/ui/form/choice-card';
import { CheckEscape } from '@/components/ui/form/check-escape';

const AUTO_ADVANCE_MS = 300;
const interpolate = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

// fieldKey → clave de texto de error (errors del QuizTexts)
const ERROR_KEY: Partial<Record<keyof Answers, keyof QuizTexts['errors']>> = {
  location: 'location',
  purchasePrice: 'money', downPayment: 'money',
  propertyValue: 'money', currentBalance: 'money', currentRate: 'rate',
  firstName: 'firstName', lastName: 'lastName', email: 'email', phone: 'phone',
};

export function Quiz({ texts, locale, thanksCtas }: { texts: QuizTexts; locale: string; thanksCtas: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, undefined, initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof Answers, string>>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Rehidratación post-montaje (evita hydration mismatch) y persistencia por cambio.
  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: 'rehydrate', state: saved });
    mounted.current = true;
  }, []);
  useEffect(() => {
    if (mounted.current && state.status !== 'done') saveState(state);
  }, [state]);
  // Foco al heading en cada cambio de paso (ADR-0007 §7); no en el montaje inicial.
  useEffect(() => {
    if (mounted.current) headingRef.current?.focus();
  }, [state.stepId, state.status === 'done']);
  useEffect(() => () => clearTimeout(autoTimer.current), []);

  const step = visibleSteps(state.answers).find((s) => s.id === state.stepId)
    ?? visibleSteps(state.answers)[0];
  const { current, total } = progressOf(state);

  const answer = (patch: Partial<Answers>) => {
    setErrors({});
    dispatch({ type: 'answer', patch });
  };
  const validateAndNext = () => {
    const result = stepSchemas[step.id].safeParse(
      Object.fromEntries(step.fieldKeys.map((k) => [k, state.answers[k]])),
    );
    if (!result.success) {
      const map: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Answers;
        map[key] = texts.errors[ERROR_KEY[key] ?? 'choice'];
      }
      // Paso choice sin respuesta: el issue llega sin path útil → error genérico en el primer campo
      if (Object.keys(map).length === 0) map[step.fieldKeys[0]] = texts.errors.choice;
      setErrors(map);
      return;
    }
    if (step.id === 'contact') {
      dispatch({ type: 'submitStart' });
      submitLead(state.answers)
        .then(() => {
          try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* modo privado */ }
          dispatch({ type: 'submitDone' });
        })
        .catch(() => dispatch({ type: 'submitError' }));
      return;
    }
    dispatch({ type: 'next' });
  };
  const autoAdvance = () => {
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => dispatch({ type: 'next' }), AUTO_ADVANCE_MS);
  };

  if (state.status === 'done') {
    return (
      <div className="flex max-w-[640px] flex-col gap-5 motion-safe:animate-[quiz-step-in_200ms_ease-out]">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-h2 font-light text-ink outline-none">
          {interpolate(texts.thanks.title, { name: state.answers.firstName ?? '' })}
        </h2>
        <p className="font-sans text-lede leading-[1.65] text-body">{texts.thanks.body}</p>
        <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">{texts.thanks.noWait}</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">{thanksCtas}</div>
      </div>
    );
  }

  const st = texts.steps[step.id];
  const title = step.id === 'location'
    ? (state.answers.goal === 'refinance' ? st.titleRefi : st.titleBuy) ?? ''
    : st.title ?? '';

  return (
    <div className="max-w-[640px]">
      <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">
        {interpolate(texts.progress.label, { current, total })}
      </p>
      <div aria-hidden className="mt-3 h-0.5 w-full bg-hairline">
        <div className="h-full bg-navy transition-[width] duration-300" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <div key={step.id} className="mt-8 flex flex-col gap-6 motion-safe:animate-[quiz-step-in_200ms_ease-out]">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-h3 font-light text-ink outline-none">{title}</h2>
        {st.helper ? <p className="-mt-3 font-sans text-base leading-[1.7] text-body">{st.helper}</p> : null}
        <StepBody step={step} st={st} texts={texts} locale={locale} answers={state.answers} errors={errors} onAnswer={answer} onAutoAdvance={autoAdvance} />
        {state.status === 'error' ? (
          <p aria-live="assertive" className="border border-error p-4 font-sans text-sm font-medium text-error">{texts.errors.submit}</p>
        ) : null}
        <div className="flex items-center gap-4">
          {step.id !== 'goal' ? (
            <button type="button" onClick={() => dispatch({ type: 'back' })} className="font-sans text-btn font-semibold uppercase tracking-button text-body hover:text-ink">
              {texts.nav.back}
            </button>
          ) : null}
          <button
            type="button"
            onClick={validateAndNext}
            disabled={state.status === 'submitting'}
            className="inline-flex items-center justify-center bg-navy px-[26px] py-3.5 font-sans text-btn font-semibold uppercase tracking-button text-paper transition hover:brightness-95 disabled:opacity-60"
          >
            {step.id === 'contact'
              ? state.status === 'submitting' ? texts.nav.sending : state.status === 'error' ? texts.nav.retry : texts.nav.submit
              : texts.nav.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
```

`StepBody` (mismo archivo) por `step.kind`:

```tsx
function StepBody({ step, st, texts, locale, answers, errors, onAnswer, onAutoAdvance }: {
  step: StepDef; st: QuizTexts['steps'][StepId]; texts: QuizTexts; locale: string;
  answers: Answers; errors: Partial<Record<keyof Answers, string>>;
  onAnswer: (patch: Partial<Answers>) => void; onAutoAdvance: () => void;
}) {
  if (step.kind === 'choice') {
    const key = step.fieldKeys[0];
    return (
      <fieldset className="flex flex-col gap-2.5">
        <legend className="sr-only">{st.title}</legend>
        {step.options!.map((value) => (
          <ChoiceCard
            key={value}
            name={step.id}
            value={value}
            label={st.options?.[value] ?? value}
            checked={answers[key] === value}
            onSelect={(v) => onAnswer({ [key]: v })}
            onPointerSelect={() => onAutoAdvance()}
          />
        ))}
        {errors[key] ? <p aria-live="polite" className="font-sans text-fine font-medium text-error">{errors[key]}</p> : null}
      </fieldset>
    );
  }
  if (step.kind === 'text') {
    return (
      <Field label={st.label ?? ''} htmlFor="quiz-location" error={errors.location}>
        <TextInput
          id="quiz-location"
          value={answers.location ?? ''}
          placeholder={st.placeholder}
          invalid={Boolean(errors.location)}
          onChange={(e) => onAnswer({ location: e.target.value })}
        />
      </Field>
    );
  }
  if (step.kind === 'fields' && step.id === 'purchaseNumbers') {
    const unsure = answers.downPayment === 'unsure';
    return (
      <div className="flex flex-col gap-5">
        <Field label={st.priceLabel ?? ''} htmlFor="quiz-price" error={errors.purchasePrice}>
          <MoneyInput id="quiz-price" locale={locale} invalid={Boolean(errors.purchasePrice)}
            value={typeof answers.purchasePrice === 'number' ? answers.purchasePrice : null}
            onValueChange={(v) => onAnswer({ purchasePrice: v ?? undefined })} />
        </Field>
        <Field label={st.downLabel ?? ''} htmlFor="quiz-down" error={errors.downPayment}>
          <MoneyInput id="quiz-down" locale={locale} disabled={unsure} invalid={Boolean(errors.downPayment)}
            value={typeof answers.downPayment === 'number' ? answers.downPayment : null}
            onValueChange={(v) => onAnswer({ downPayment: v ?? undefined })} />
        </Field>
        <CheckEscape id="quiz-down-unsure" label={st.escape ?? ''} checked={unsure}
          onChange={(c) => onAnswer({ downPayment: c ? 'unsure' : undefined })} />
      </div>
    );
  }
  if (step.kind === 'fields') { // refiNumbers
    const unsure = answers.currentRate === 'unsure';
    return (
      <div className="flex flex-col gap-5">
        <Field label={st.valueLabel ?? ''} htmlFor="quiz-value" error={errors.propertyValue}>
          <MoneyInput id="quiz-value" locale={locale} invalid={Boolean(errors.propertyValue)}
            value={typeof answers.propertyValue === 'number' ? answers.propertyValue : null}
            onValueChange={(v) => onAnswer({ propertyValue: v ?? undefined })} />
        </Field>
        <Field label={st.balanceLabel ?? ''} htmlFor="quiz-balance" error={errors.currentBalance}>
          <MoneyInput id="quiz-balance" locale={locale} invalid={Boolean(errors.currentBalance)}
            value={typeof answers.currentBalance === 'number' ? answers.currentBalance : null}
            onValueChange={(v) => onAnswer({ currentBalance: v ?? undefined })} />
        </Field>
        <Field label={st.rateLabel ?? ''} htmlFor="quiz-rate" error={errors.currentRate}>
          <PercentInput id="quiz-rate" disabled={unsure} invalid={Boolean(errors.currentRate)}
            value={typeof answers.currentRate === 'number' ? answers.currentRate : null}
            onValueChange={(v) => onAnswer({ currentRate: v ?? undefined })} />
        </Field>
        <CheckEscape id="quiz-rate-unsure" label={st.escape ?? ''} checked={unsure}
          onChange={(c) => onAnswer({ currentRate: c ? 'unsure' : undefined })} />
      </div>
    );
  }
  // contact
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label={st.firstName ?? ''} htmlFor="quiz-firstname" error={errors.firstName}>
          <TextInput id="quiz-firstname" autoComplete="given-name" value={answers.firstName ?? ''} invalid={Boolean(errors.firstName)}
            onChange={(e) => onAnswer({ firstName: e.target.value })} />
        </Field>
        <Field label={st.lastName ?? ''} htmlFor="quiz-lastname" error={errors.lastName}>
          <TextInput id="quiz-lastname" autoComplete="family-name" value={answers.lastName ?? ''} invalid={Boolean(errors.lastName)}
            onChange={(e) => onAnswer({ lastName: e.target.value })} />
        </Field>
      </div>
      <Field label={st.email ?? ''} htmlFor="quiz-email" error={errors.email}>
        <TextInput id="quiz-email" type="email" inputMode="email" autoComplete="email" value={answers.email ?? ''} invalid={Boolean(errors.email)}
          onChange={(e) => onAnswer({ email: e.target.value })} />
      </Field>
      <Field label={st.phone ?? ''} htmlFor="quiz-phone" error={errors.phone}>
        <TextInput id="quiz-phone" type="tel" inputMode="tel" autoComplete="tel" value={answers.phone ?? ''} invalid={Boolean(errors.phone)}
          onChange={(e) => onAnswer({ phone: e.target.value })} />
      </Field>
      <p className="font-sans text-fine leading-[1.65] text-muted">{st.consent}</p>
    </div>
  );
}
```

(Ajustar imports/tipos hasta que `tsc` quede limpio; NO cambiar el contrato de props ni los ids `quiz-*`, que usan los e2e.)

- [ ] **Step 2: Reescribir `app/[locale]/quote/page.tsx`**

Conservar `generateStaticParams`, `generateMetadata` y `PageHero` (hero copy actualizado vía messages). Sustituir las secciones shell:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/site';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { TextLink } from '@/components/ui/text-link';
import { Quiz } from '@/components/quiz/quiz';
import type { QuizTexts } from '@/lib/quiz/texts';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'quote', pathname: '/quote' });
}

export default async function QuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('quote');
  const tc = await getTranslations('common');
  const texts = t.raw('quiz') as QuizTexts;

  return (
    <>
      <PageHero locale={locale} pathname="/quote" image={heroPrograms} imageAlt={t('title')} eyebrow={t('title')} title={t('heroTitle')} body={t('heroSub')} />
      <section>
        <Container className="px-5 py-10 lg:px-[72px] lg:py-16">
          <Quiz
            locale={locale}
            texts={texts}
            thanksCtas={
              <>
                <WhatsAppButton label={tc('cta.whatsApp')} message={tc('cta.whatsAppMessage')} />
                <TextLink href={`tel:${PHONE_TEL}`} external>{PHONE_DISPLAY}</TextLink>
              </>
            }
          />
        </Container>
      </section>
    </>
  );
}
```

Nota: comprobar la firma real de `TextLink`/`WhatsAppButton` antes de usarlas (están en `components/ui/`) y ajustar props sin cambiar su API pública.

- [ ] **Step 3: Verificación completa**

```bash
npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static
```

Expected: verde; `/quote` sigue prerenderizada. Probar a mano en `npm run dev`: flujo compra completo, auto-avance con clic, Atrás, cambio de idioma a mitad conserva respuestas.

- [ ] **Step 4: Commit**

```bash
git add components/quiz/ app/\[locale\]/quote/page.tsx
git commit -m "feat: cuestionario Get a Quote — UI multi-paso con auto-avance, submit simulado y gracias

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: E2E del cuestionario, presupuesto JS y PR B

**Files:**
- Test: `tests/e2e/quiz.spec.ts`

- [ ] **Step 1: Escribir `tests/e2e/quiz.spec.ts`**

```ts
import { test, expect, type Page } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

const enQ = en.quote.quiz;
const esQ = es.quote.quiz;

async function choose(page: Page, label: string) {
  await page.getByRole('radio', { name: label }).click(); // auto-avance táctil (~300 ms)
}
async function cont(page: Page, label: string) {
  await page.getByRole('button', { name: label }).click();
}
async function fillContactAndSubmit(page: Page, q: typeof enQ) {
  await page.getByLabel(q.steps.contact.firstName).fill('Ana');
  await page.getByLabel(q.steps.contact.lastName).fill('García');
  await page.getByLabel(q.steps.contact.email).fill('ana@example.com');
  await page.getByLabel(q.steps.contact.phone).fill('305 555 0101');
  await cont(page, q.nav.submit);
}

// Flujos completos parametrizados por idioma — la matriz compra/refi × EN/ES del
// spec §7 (ADR-0010) son 4 tests que reutilizan estos dos walks.
async function runBuyFlow(page: Page, q: typeof enQ, url: string) {
  await page.goto(url);
  await choose(page, q.steps.goal.options.buy);
  await page.getByLabel(q.steps.location.label).fill('Miami 33130');
  await cont(page, q.nav.continue);
  await choose(page, q.steps.propertyType.options.singleFamily);
  await choose(page, q.steps.stage.options.looking);
  await choose(page, q.steps.use.options.primary);
  await choose(page, q.steps.military.options.no);
  await choose(page, q.steps.hasAgent.options.notYet);
  await choose(page, q.steps.firstTime.options.yes);
  await page.getByLabel(q.steps.purchaseNumbers.priceLabel).fill('450000');
  await page.getByLabel(q.steps.purchaseNumbers.downLabel).fill('45000');
  await cont(page, q.nav.continue);
  await choose(page, q.steps.employment.options.employed);
  await choose(page, q.steps.income.options['50to100k']);
  await choose(page, q.steps.credit.options.good);
  await choose(page, q.steps.history.options.none);
  await choose(page, q.steps.status.options.permanentResident);
  await fillContactAndSubmit(page, q);
}

async function runRefiFlow(page: Page, q: typeof enQ, url: string) {
  await page.goto(url);
  await choose(page, q.steps.goal.options.refinance);
  await page.getByLabel(q.steps.location.label).fill('Hialeah');
  await cont(page, q.nav.continue);
  await choose(page, q.steps.propertyType.options.condo);
  await choose(page, q.steps.use.options.primary);
  await choose(page, q.steps.military.options.yes);
  await choose(page, q.steps.militaryBranch.options.navy);
  await page.getByLabel(q.steps.refiNumbers.valueLabel).fill('380000');
  await page.getByLabel(q.steps.refiNumbers.balanceLabel).fill('210000');
  await page.getByLabel(q.steps.refiNumbers.escape).check();
  await cont(page, q.nav.continue);
  await choose(page, q.steps.secondMortgage.options.no);
  await choose(page, q.steps.cashOut.options.unsure);
  await choose(page, q.steps.employment.options.selfEmployed);
  await choose(page, q.steps.income.options.discuss);
  await choose(page, q.steps.credit.options.unknown);
  await choose(page, q.steps.history.options.over4y);
  await choose(page, q.steps.status.options.citizen);
  await fillContactAndSubmit(page, q);
}

test('flujo COMPRA completo en EN hasta la pantalla de gracias', async ({ page }) => {
  await runBuyFlow(page, enQ, '/en/quote');
  await expect(page.getByText('Got it, Ana.')).toBeVisible();
});

test('flujo COMPRA completo en ES hasta gracias', async ({ page }) => {
  await runBuyFlow(page, esQ, '/es/cotizacion');
  await expect(page.getByText('Recibido, Ana.')).toBeVisible();
});

test('flujo REFI completo en EN (militar, escape de tasa) hasta gracias', async ({ page }) => {
  await runRefiFlow(page, enQ, '/en/quote');
  await expect(page.getByText('Got it, Ana.')).toBeVisible();
});

test('flujo REFI completo en ES hasta gracias', async ({ page }) => {
  await runRefiFlow(page, esQ, '/es/cotizacion');
  await expect(page.getByText('Recibido, Ana.')).toBeVisible();
});

test('recargar a mitad retoma en el mismo paso con las respuestas intactas', async ({ page }) => {
  await page.goto('/en/quote');
  await choose(page, enQ.steps.goal.options.buy);
  await page.getByLabel(enQ.steps.location.label).fill('Miami');
  await cont(page, enQ.nav.continue);
  await expect(page.getByText(enQ.steps.propertyType.title)).toBeVisible();
  await page.reload();
  await expect(page.getByText(enQ.steps.propertyType.title)).toBeVisible();
  await page.getByRole('button', { name: enQ.nav.back }).click();
  await expect(page.getByLabel(enQ.steps.location.label)).toHaveValue('Miami');
});

test('cambiar de idioma a mitad conserva el paso y las respuestas (valores = claves)', async ({ page }) => {
  await page.goto('/en/quote');
  await choose(page, enQ.steps.goal.options.buy);
  await page.getByLabel(enQ.steps.location.label).fill('Miami');
  await cont(page, enQ.nav.continue);
  await page.getByRole('link', { name: 'ES', exact: true }).click();
  await expect(page).toHaveURL(/\/es\/cotizacion$/);
  await expect(page.getByText(esQ.steps.propertyType.title)).toBeVisible();
});

test('validación: continuar sin responder muestra error localizado y no avanza', async ({ page }) => {
  await page.goto('/en/quote');
  await choose(page, enQ.steps.goal.options.buy);
  await cont(page, enQ.nav.continue); // location vacía
  await expect(page.getByText(enQ.errors.location)).toBeVisible();
  await expect(page.getByLabel(enQ.steps.location.label)).toBeVisible(); // sigue en el paso
});

test('fallo de envío: error visible, reintento disponible y respuestas intactas', async ({ page }) => {
  await page.goto('/en/quote?e2e-fail-submit=1');
  await choose(page, enQ.steps.goal.options.buy);
  await page.getByLabel(enQ.steps.location.label).fill('Miami');
  await cont(page, enQ.nav.continue);
  await choose(page, enQ.steps.propertyType.options.condo);
  await choose(page, enQ.steps.stage.options.research);
  await choose(page, enQ.steps.use.options.primary);
  await choose(page, enQ.steps.military.options.no);
  await choose(page, enQ.steps.hasAgent.options.yes);
  await choose(page, enQ.steps.firstTime.options.no);
  await page.getByLabel(enQ.steps.purchaseNumbers.priceLabel).fill('300000');
  await page.getByLabel(enQ.steps.purchaseNumbers.escape).check();
  await cont(page, enQ.nav.continue);
  await choose(page, enQ.steps.employment.options.employed);
  await choose(page, enQ.steps.income.options.under50k);
  await choose(page, enQ.steps.credit.options.fair);
  await choose(page, enQ.steps.history.options.none);
  await choose(page, enQ.steps.status.options.workVisa);
  await fillContactAndSubmit(page, enQ);
  await expect(page.getByText(enQ.errors.submit)).toBeVisible();
  await expect(page.getByRole('button', { name: enQ.nav.retry })).toBeVisible();
  await expect(page.getByLabel(enQ.steps.contact.email)).toHaveValue('ana@example.com');
});
```

- [ ] **Step 2: Ejecutar e2e**

Run: `npm run build && npm run test:e2e`
Expected: PASS todos (17 previos + 8 nuevos). Si `choose()` falla por el auto-avance, subir el timeout de expect, no quitar el auto-avance.

- [ ] **Step 3: Medir presupuesto de `/quote`**

```bash
node scripts/measure-first-load.mjs .next/server/app/en/quote.html
```

Expected: **≤ 170 KB gz** (estimado 163-169). Si excede: 1º cambiar imports de `zod` a `zod/mini` en `lib/quiz/schema.ts` (ver su doc de migración; el servidor de Fase 3 podrá seguir con zod completo), re-medir; 2º si aún excede, sustituir Zod en cliente por validadores propios con la MISMA interfaz `safeParse` por paso. Anotar el número final en el PR.

- [ ] **Step 4: Gate local completo**

```bash
npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e
```

- [ ] **Step 5: Commit, push y PR B**

```bash
git add tests/e2e/quiz.spec.ts
git commit -m "test: e2e del cuestionario — 2 flujos completos, recarga, idioma, validación y fallo de envío

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push -u origin feat/fase-2-cuestionario
gh pr create --title "Fase 2 · PR B: cuestionario Get a Quote real" --body "$(cat <<'EOF'
## Qué incluye
- Motor declarativo ADR-0007: 19 pasos, flujos compra/refi por `visible()`, reducer puro + sessionStorage `dhl-quiz-v1`, poda al cambiar de flujo.
- Zod compartido (única dependencia nueva): schemas por paso + payload con condicionales — el mismo que usará el servidor en Fase 3.
- UI Fachada: auto-avance táctil (teclado/SR con Continuar), progreso texto+barra, escapes honestos, estatus migratorio con framing por programas, contacto final con consentimiento (borrador legal).
- Submit SIMULADO (decisión de spec §2.6): valida y muestra la pantalla de gracias definitiva; los leads NO persisten hasta Fase 3. UI de error+reintento ya construida y testeada.
- First Load JS de /quote: XXX KB gz (presupuesto ≤ 170) — sustituir XXX por la medición del Step 3.

## Checks
- Gate local completo verde (unit + e2e, incl. matriz compra/refi × EN/ES); Lighthouse ≥95×4 en preview (gate CI).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Tras checks verdes: **revisión visual del responsable** (es EL componente del proyecto) y squash merge antes del PR C.

---

# PR C — Paridad de contenido (`feat/fase-2-paridad-contenido`)

### Task 14: Programa `fixedRate` completo (modelo) + tests derivados de la fuente única

**Files:**
- Modify: `config/routes.mjs` (programSlugs), `messages/en.json`, `messages/es.json` (namespace `programs.fixedRate`), `tests/unit/routes.test.ts`, `tests/unit/sitemap.test.ts`, `tests/unit/metadata-og.test.ts`, `tests/e2e/home.spec.ts`
- Regenera: `public/og/{en,es}/fixedRate.png` (`npm run og`)

**Interfaces:**
- Produces: patrón EXACTO que la Task 15 repite para los otros 4 programas. El template de página y el JSON-LD NO se tocan (derivan todo de `programSlugs` + messages).

- [ ] **Step 1: Crear rama**

```bash
git checkout main && git pull && git checkout -b feat/fase-2-paridad-contenido
```

- [ ] **Step 2: Añadir el slug en `config/routes.mjs`**

```js
export const programSlugs = {
  fha: { en: 'fha-loans', es: 'prestamos-fha' },
  conventional: { en: 'conventional-loans', es: 'prestamos-convencionales' },
  va: { en: 'va-loans', es: 'prestamos-va' },
  firstTimeHomebuyer: { en: 'first-time-homebuyer', es: 'primer-comprador' },
  refinance: { en: 'refinance', es: 'refinanciamiento' },
  fixedRate: { en: 'fixed-rate-mortgage', es: 'hipoteca-tasa-fija' },
};
```

- [ ] **Step 3: Messages `programs.fixedRate` — EN completo**

Mismo esquema de claves que `programs.fha` (title, description, heading, indexName, stat, heroTitle, heroSub, blurb, intro, whatIs{title,body}, required{title,body}, how{title,items[4]}):

```json
"fixedRate": {
  "title": "Fixed Rate Mortgage",
  "description": "One rate and one payment for the life of your loan.",
  "heading": "Fixed Rate Mortgage",
  "indexName": "Fixed Rate Mortgage",
  "stat": "30 · 20 · 15 yrs",
  "heroTitle": "One payment that never surprises you",
  "heroSub": "Lock your rate once and your principal-and-interest payment stays the same until the loan is paid off.",
  "blurb": "The most predictable way to borrow: rate and payment locked from day one, whether you choose 15, 20, or 30 years.",
  "intro": "A fixed rate mortgage is less a program than a promise: the rate you close with is the rate you keep. Most of the loans I write — FHA, conventional, VA — can be structured this way. If you plan to stay in your home and want a housing cost you can build a budget around, this is the default I start from.",
  "whatIs": {
    "title": "What is a fixed rate mortgage?",
    "body": "It's a loan where the interest rate is set at closing and never changes, so the principal-and-interest portion of your payment is identical in month one and in the final month. The alternative — an adjustable rate — starts lower but can move with the market after the initial period. Fixed means you trade a slightly higher starting rate for certainty that no rate hike can touch your payment."
  },
  "required": {
    "title": "What do you need for a fixed rate mortgage?",
    "body": "The same fundamentals as the underlying program you qualify for: verifiable income, a manageable debt load, and a credit profile that fits the loan type — flexible with FHA, stricter with conventional. There's no extra requirement for choosing fixed over adjustable. What matters is picking the term: a shorter term costs more per month and far less in total interest, and I'll show you both numbers before you decide."
  },
  "how": {
    "title": "How a fixed rate mortgage works",
    "items": [
      "Your rate is locked at closing and never changes with the market.",
      "Terms commonly available in 30, 20, or 15 years — shorter term, less total interest.",
      "Early payments are mostly interest; over time more of each payment builds equity.",
      "No penalty for paying it off early with the programs I work with."
    ]
  }
}
```

- [ ] **Step 4: Messages `programs.fixedRate` — ES completo**

```json
"fixedRate": {
  "title": "Hipoteca de Tasa Fija",
  "description": "Una sola tasa y una sola cuota durante toda la vida del préstamo.",
  "heading": "Hipoteca de Tasa Fija",
  "indexName": "Hipoteca de Tasa Fija",
  "stat": "30 · 20 · 15 años",
  "heroTitle": "Una cuota que nunca te sorprende",
  "heroSub": "Fijas tu tasa una vez y tu pago de capital e intereses no cambia hasta terminar de pagar la casa.",
  "blurb": "La forma más predecible de financiar: tasa y cuota fijadas desde el primer día, elijas 15, 20 o 30 años.",
  "intro": "Una hipoteca de tasa fija es menos un programa que una promesa: la tasa con la que cierras es la tasa que conservas. La mayoría de los préstamos que trabajo — FHA, convencional, VA — pueden estructurarse así. Si piensas quedarte en tu casa y quieres un costo de vivienda con el que puedas armar un presupuesto, este es el punto de partida que uso por defecto.",
  "whatIs": {
    "title": "¿Qué es una hipoteca de tasa fija?",
    "body": "Es un préstamo donde la tasa de interés se fija al cierre y no cambia jamás, así que la parte de capital e intereses de tu cuota es idéntica el primer mes y el último. La alternativa — una tasa ajustable — arranca más baja pero puede moverse con el mercado después del periodo inicial. Fija significa aceptar una tasa de salida algo mayor a cambio de la certeza de que ninguna subida de tasas tocará tu pago."
  },
  "required": {
    "title": "¿Qué necesitas para una hipoteca de tasa fija?",
    "body": "Lo mismo que pide el programa base con el que califiques: ingresos verificables, deudas manejables y un perfil de crédito acorde al tipo de préstamo — flexible con FHA, más exigente con convencional. Elegir tasa fija no añade requisitos extra. Lo importante es escoger el plazo: uno más corto cuesta más al mes y mucho menos en intereses totales, y te enseño ambos números antes de decidir."
  },
  "how": {
    "title": "Cómo funciona una hipoteca de tasa fija",
    "items": [
      "Tu tasa queda fijada al cierre y no cambia con el mercado.",
      "Plazos habituales de 30, 20 o 15 años — a plazo más corto, menos intereses totales.",
      "Las primeras cuotas son sobre todo intereses; con el tiempo cada pago construye más plusvalía.",
      "Sin penalización por pagar antes de tiempo en los programas con los que trabajo."
    ]
  }
}
```

- [ ] **Step 5: Actualizar los tests con expectativas hardcodeadas (una sola vez, derivándolas)**

`tests/unit/sitemap.test.ts` — derivar el conteo de la fuente única (deja de romperse con cada página nueva):

```ts
import { locales, pathnames, programSlugs } from '@/config/routes.mjs';
// …
it('una entrada por página estática y programa, por idioma', () => {
  const staticRoutes = Object.keys(pathnames).filter((r) => !r.includes('[')).length;
  expect(entries).toHaveLength((staticRoutes + Object.keys(programSlugs).length) * locales.length);
});
```

`tests/e2e/home.spec.ts` — derivar el conteo de filas de los messages ya importados:

```ts
test('la home monta las filas del índice con enlaces a programas', async ({ page }) => {
  await page.goto('/en');
  const rows = page.locator('a[href^="/en/loan-options/"]');
  await expect(rows).toHaveCount(Object.keys(en.programs).length);
  await expect(rows.first()).toContainText(en.programs.fha.indexName);
});
```

`tests/unit/routes.test.ts` — lista exacta con el programa nuevo:

```ts
expect(Object.keys(programSlugs).sort()).toEqual(
  ['conventional', 'fha', 'firstTimeHomebuyer', 'fixedRate', 'refinance', 'va'],
);
```

`tests/unit/metadata-og.test.ts` — añadir `'programs.fixedRate'` a la lista `namespaces`.

- [ ] **Step 6: Regenerar OG y verificar**

```bash
npm run og
npx vitest run
npm run build && npm run check:static
```

Expected: 28 PNGs generados (los programas se derivan de `programSlugs` en `scripts/generate-og.mjs` — sin tocar el script); unit verde; 28 rutas prerenderizadas.

- [ ] **Step 7: Commit**

```bash
git add config/routes.mjs messages/ public/og/ tests/
git commit -m "feat: programa Fixed Rate Mortgage (EN/ES) y tests derivados de la fuente única de rutas

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 15: Programas `usda`, `jumbo`, `lowDownPayment`, `investment`

**Files:**
- Modify: `config/routes.mjs`, `messages/en.json`, `messages/es.json`, `tests/unit/routes.test.ts` (lista exacta → 10), `tests/unit/metadata-og.test.ts` (+4 namespaces)
- Regenera: `public/og/{en,es}/{usda,jumbo,lowDownPayment,investment}.png`

**Interfaces:**
- Consumes: patrón de la Task 14 (mismo esquema de claves EXACTO que `programs.fixedRate`/`programs.fha`).

- [ ] **Step 1: Slugs en `config/routes.mjs`**

```js
  usda: { en: 'usda-loans', es: 'prestamos-usda' },
  jumbo: { en: 'jumbo-loans', es: 'prestamos-jumbo' },
  lowDownPayment: { en: 'low-down-payment', es: 'entrada-baja' },
  investment: { en: 'investment-property-loans', es: 'prestamos-de-inversion' },
```

- [ ] **Step 2: Redactar los 4 namespaces en `messages/en.json` y `messages/es.json`**

Mismo esquema de claves que `fixedRate` (Task 14). Campos cortos EXACTOS y hechos que las secciones largas (`intro`, `whatIs.body`, `required.body`, `how.items[4]`) deben cubrir — prosa propia en la voz de David, longitud y tono calcados de `fha`/`fixedRate`, cifras en genérico prudente, PROHIBIDO parafrasear aimsmtg:

**`usda`** — stat: `0% down` / `0% entrada` · indexName: `USDA Loans` / `Préstamos USDA` · heroTitle: `Own a home with no down payment at all` / `Ten casa propia sin entrada` · heroSub: `In USDA-eligible areas outside the urban core, you can finance 100% of the purchase.` / `En zonas elegibles USDA fuera del núcleo urbano puedes financiar el 100% de la compra.` · blurb: `Backed by the U.S. Department of Agriculture: 0% down in eligible rural and suburban areas.` / `Respaldado por el Departamento de Agricultura: 0% de entrada en zonas rurales y suburbanas elegibles.`
Hechos: respaldo del USDA; elegibilidad DOBLE (ubicación del inmueble en zona elegible + límites de ingreso del hogar); 0% de entrada; residencia principal; guarantee fee en lugar del mortgage insurance típico; en Florida hay más zonas elegibles de las que la gente cree — David verifica la dirección.

**`jumbo`** — stat: `High amounts` / `Montos altos` · indexName: `Jumbo Loans` / `Préstamos Jumbo` · heroTitle: `Financing beyond the standard limit` / `Financiamiento más allá del límite estándar` · heroSub: `For homes priced above the conforming loan limit, a jumbo loan takes over where standard programs stop.` / `Para casas por encima del límite conforme, el préstamo jumbo continúa donde los programas estándar se detienen.` · blurb: `For amounts above the conforming limit — common in Miami's market — with competitive rates for strong profiles.` / `Para montos sobre el límite conforme — habitual en el mercado de Miami — con tasas competitivas para perfiles sólidos.`
Hechos: supera el límite conforme de Fannie/Freddie (el límite exacto cambia por año y condado — genérico prudente); requisitos más exigentes (crédito, reservas, entrada típica mayor); habitual en Miami por precios; sin cifras concretas de límite.

**`lowDownPayment`** — stat: `From 3% down` / `Desde 3% de entrada` · indexName: `Low Down Payment Options` / `Opciones de Entrada Baja` · heroTitle: `The down payment is smaller than you think` / `La entrada es más pequeña de lo que crees` · heroSub: `Between FHA, conventional 3% programs, VA and USDA, saving 20% is optional — not a requirement.` / `Entre FHA, programas convencionales al 3%, VA y USDA, ahorrar el 20% es opcional — no un requisito.` · blurb: `A map of every path to buying with little money upfront: which program fits depends on your profile, and comparing them is my job.` / `Un mapa de todos los caminos para comprar con poco dinero inicial: cuál encaja depende de tu perfil, y compararlos es mi trabajo.`
Hechos: página-paraguas que compara caminos (FHA 3.5%, convencional desde 3%, VA/USDA 0%); el mito del 20%; trade-offs honestos (mortgage insurance, sellers en mercados competitivos); programas de asistencia existen y se evalúan caso a caso; enlazar conceptualmente con el cuestionario como siguiente paso.

**`investment`** — stat: `For investors` / `Para inversores` · indexName: `Investment Property Loans` / `Préstamos para Inversión` · heroTitle: `Make the property pay for itself` / `Haz que la propiedad se pague sola` · heroSub: `Financing built for rentals: programs where the property's income matters as much as yours.` / `Financiamiento pensado para rentas: programas donde el ingreso de la propiedad pesa tanto como el tuyo.` · blurb: `For buying rental property: conventional investor loans and programs that qualify by the property's rental income.` / `Para comprar propiedad de renta: préstamos convencionales de inversor y programas que califican por el ingreso de renta de la propiedad.`
Hechos: entrada típica mayor y tasa algo más alta que residencia principal (genérico); existen programas que califican por el flujo de renta de la propiedad (tipo DSCR) además del ingreso personal; sirve para primera inversión o para crecer cartera; Miami como mercado de renta; sin promesas de retorno (YMYL).

- [ ] **Step 3: Actualizar tests**

`tests/unit/routes.test.ts`:

```ts
expect(Object.keys(programSlugs).sort()).toEqual(
  ['conventional', 'fha', 'firstTimeHomebuyer', 'fixedRate', 'investment', 'jumbo', 'lowDownPayment', 'refinance', 'usda', 'va'],
);
```

`tests/unit/metadata-og.test.ts`: añadir `'programs.usda'`, `'programs.jumbo'`, `'programs.lowDownPayment'`, `'programs.investment'`.

- [ ] **Step 4: Regenerar OG y verificar todo**

```bash
npm run og
npx vitest run && npm run build && npm run check:static
```

Expected: 36 PNGs; 36 rutas prerenderizadas; parity EN/ES verde (misma estructura de claves y mismo número de items en arrays).

- [ ] **Step 5: Commit**

```bash
git add config/routes.mjs messages/ public/og/ tests/
git commit -m "feat: programas USDA, Jumbo, Entrada Baja e Inversión (EN/ES) — paridad de loan options con aimsmtg

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 16: Página Learn/FAQ + JSON-LD FAQPage + navegación

**Files:**
- Modify: `config/routes.mjs` (pathname `/learn`), `messages/en.json`, `messages/es.json` (namespace `learn` + `common.nav.learn` + `common.footer.links.learn`), `lib/jsonld.ts`, `components/layout/nav-links.tsx`, `components/layout/site-footer.tsx`, `scripts/generate-og.mjs` (+`'learn'` en `namespaces`), `tests/unit/metadata-og.test.ts` (+`'learn'`), `tests/unit/jsonld.test.ts`
- Create: `app/[locale]/learn/page.tsx`
- Regenera: `public/og/{en,es}/learn.png`

**Interfaces:**
- Produces: `faqPageJsonLd(locale: string)` en `lib/jsonld.ts` (builder puro síncrono como los existentes).

- [ ] **Step 1: Ruta en `config/routes.mjs`**

```js
  '/learn': { en: '/learn', es: '/aprende' },
```

- [ ] **Step 2: Messages `learn` (EN y ES, mismas claves)**

Estructura: `title` (`Learn` / `Aprende`), `description`, `heading`, `heroTitle` (`Questions I answer every week` / `Las preguntas que respondo cada semana`), `heroSub`, `items` — array de 7 `{ "q": …, "a": … }`. Preguntas EXACTAS (spec §6.2); cada respuesta: 60-110 palabras propias, voz de David, cierre práctico, sin cifras comprometidas:

| # | q (EN) | q (ES) | La respuesta debe cubrir |
|---|--------|--------|--------------------------|
| 1 | How does buying a home actually work, start to finish? | ¿Cómo funciona comprar casa, de principio a fin? | Etapas: números→precalificación→búsqueda→oferta→underwriting→cierre; cuándo entra David (al principio, no al final) |
| 2 | What's the difference between pre-qualified and pre-approved? | ¿Qué diferencia hay entre precalificado y preaprobado? | Precalificación = estimación con datos declarados (el cuestionario); preaprobación = documentos verificados, pesa en ofertas |
| 3 | What does a lender look at in my credit? | ¿Qué mira un lender en mi crédito? | Score como rango no barrera; historial de pagos y deuda activa; mínimos varían por programa; no consultar aquí |
| 4 | How much down payment do I really need? | ¿Cuánta entrada necesito de verdad? | El mito del 20%; rangos por programa (3%–3.5%–0%); la entrada no es el único costo inicial (closing costs) |
| 5 | Can I buy with an ITIN or as a foreign national? | ¿Puedo comprar con ITIN o siendo extranjero? | Sí, existen programas; condiciones distintas (entrada/documentación); es la especialidad de la pregunta de estatus del cuestionario |
| 6 | When does refinancing make sense? | ¿Cuándo tiene sentido refinanciar? | Bajar tasa/cuota, quitar seguro hipotecario, cash-out; el número que importa es el punto de equilibrio vs costos de cierre |
| 7 | What are closing costs? | ¿Qué son los costos de cierre? | Qué incluyen (tasación, título, originación, prepagados); orden de magnitud en % genérico prudente; se detallan en el Loan Estimate |

`common.nav.learn`: `Learn` / `Aprende` · `common.footer.links.learn`: `Learn` / `Aprende`.

- [ ] **Step 3: Crear `app/[locale]/learn/page.tsx`**

Patrón de página de contenido de Fase 1 (cero client components):

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { faqPageJsonLd } from '@/lib/jsonld';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { CtaBand } from '@/components/ui/cta-band';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'learn', pathname: '/learn' });
}

type Item = { q: string; a: string };

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('learn');
  const items = t.raw('items') as Item[];

  return (
    <>
      <PageHero locale={locale} pathname="/learn" image={heroPrograms} imageAlt={t('title')} eyebrow={t('title')} title={t('heroTitle')} body={t('heroSub')} />
      {items.map((item, i) => (
        <section key={item.q} className={i > 0 ? 'border-t border-hairline' : undefined}>
          <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
            <SectionHeading eyebrow={t('title')} title={item.q} />
            <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{item.a}</p>
          </Container>
        </section>
      ))}
      <CtaBand />
      <JsonLd data={faqPageJsonLd(locale)} />
    </>
  );
}
```

(Comprobar la firma de `SectionHeading` para títulos largos; si el grid 280px queda estrecho para preguntas, usar `h2` directo con `font-display text-h3` como en la sección `how` del template de programa.)

- [ ] **Step 4: `faqPageJsonLd` en `lib/jsonld.ts` + test**

```ts
export function faqPageJsonLd(locale: string) {
  const t = messagesFor(locale);
  const items = (t as { learn: { items: { q: string; a: string }[] } }).learn.items;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
```

En `tests/unit/jsonld.test.ts` añadir:

```ts
import { faqPageJsonLd } from '@/lib/jsonld';

it('FAQPage: 7 preguntas con respuesta en ambos idiomas', () => {
  for (const locale of ['en', 'es']) {
    const ld = faqPageJsonLd(locale) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(ld.mainEntity).toHaveLength(7);
    for (const q of ld.mainEntity) {
      expect(q.name.length).toBeGreaterThan(0);
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
    }
  }
});
```

- [ ] **Step 5: Navegación**

`components/layout/nav-links.tsx` — añadir tras loanOptions:

```ts
    { href: '/learn', label: t('learn') },
```

`components/layout/site-footer.tsx` — añadir el enlace `learn` en el bloque de links donde están loanOptions/calculator (usar `common.footer.links.learn`, mismo patrón del resto).

- [ ] **Step 6: OG + tests de sincronía**

En `scripts/generate-og.mjs`, añadir `'learn'` al array `namespaces` (tras `'loanOptions'`). En `tests/unit/metadata-og.test.ts`, añadir `'learn'` a su lista. Regenerar:

```bash
npm run og
```

Expected: 38 PNGs, incluidos `public/og/{en,es}/learn.png`.

- [ ] **Step 7: Verificación completa y commit**

```bash
npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e
```

Expected: 38 rutas prerenderizadas; e2e verdes (el conteo de filas de home ya es derivado).

```bash
git add config/routes.mjs messages/ app/\[locale\]/learn/ lib/jsonld.ts components/layout/ scripts/generate-og.mjs public/og/ tests/
git commit -m "feat: página Learn/FAQ con 7 guías propias, FAQPage JSON-LD y enlace en navegación

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 17: Gate final y PR C

- [ ] **Step 1: Gate local completo**

```bash
npm run lint && npx next typegen && npx tsc --noEmit && npm test && npm run build && npm run check:static && npm run test:e2e
```

- [ ] **Step 2: Verificar presupuesto intacto de páginas de contenido**

```bash
node scripts/measure-first-load.mjs .next/server/app/en/learn.html
node scripts/measure-first-load.mjs .next/server/app/en/loan-options/fixed-rate-mortgage.html
```

Expected: ambas ≈ baseline (~149 KB, cero client components nuevos).

- [ ] **Step 3: Push y PR C**

```bash
git push -u origin feat/fase-2-paridad-contenido
gh pr create --title "Fase 2 · PR C: paridad de contenido — 10 loan options + Learn/FAQ" --body "$(cat <<'EOF'
## Qué incluye
- 5 programas nuevos (Fixed Rate, USDA, Jumbo, Low Down Payment, Investment) con el template existente — redacción propia EN/ES, cifras en genérico prudente. Home/índice/sitemap/JSON-LD/OG derivan de la fuente única.
- Página Learn (`/learn` · `/aprende`): 7 guías FAQ propias + FAQPage JSON-LD + enlace en nav y footer.
- Tests de sitemap y home derivan ahora sus conteos de config/messages (adiós números mágicos).
- 38 rutas prerenderizadas · 38 OG PNGs · paridad EN/ES verde.

## Nota YMYL
Todo el copy nuevo es borrador para validación de David (igual que Fase 1).

## Checks
- Gate local completo verde. Lighthouse ≥95×4 en preview (gate CI).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Tras checks verdes: squash merge. **Cierre de fase**: review final de rama sobre el conjunto (proceso Fase 1), actualizar memoria del proyecto y marcar checkboxes de este plan.

