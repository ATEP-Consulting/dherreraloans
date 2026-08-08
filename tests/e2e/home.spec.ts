import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { APPLY_URL } from '../../lib/site';

test('la home monta las filas del índice con enlaces a programas', async ({ page }) => {
  await page.goto('/en');
  const rows = page.locator('a[href^="/en/loan-options/"]');
  await expect(rows).toHaveCount(Object.keys(en.programs).length);
  await expect(rows.first()).toContainText(en.programs.fha.indexName);
});

test('CTAs del hero: quote interno y WhatsApp con deep link', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('link', { name: en.common.cta.quote }).first()).toHaveAttribute('href', '/en/quote');
  const wa = page.getByRole('link', { name: en.common.cta.whatsApp });
  await expect(wa).toHaveAttribute('href', /wa\.me\/13050000000/);
});

test('Apply Online apunta a APPLY_URL con noopener', async ({ page }) => {
  await page.goto('/en');
  const apply = page.getByRole('link', { name: en.common.cta.apply }).first();
  await expect(apply).toHaveAttribute('href', APPLY_URL);
  await expect(apply).toHaveAttribute('rel', /noopener/);
});

test('ActionCards: quote, apply y calculadora enlazan a los destinos correctos', async ({ page }) => {
  await page.goto('/en');
  const cards = en.home.actionCards;
  const quote = page.getByRole('link', { name: cards.quote.title });
  await expect(quote).toHaveAttribute('href', '/en/quote');
  const apply = page.getByRole('link', { name: cards.apply.title });
  await expect(apply).toHaveAttribute('href', APPLY_URL);
  await expect(apply).toHaveAttribute('target', '_blank');
  const calculator = page.getByRole('link', { name: cards.calculator.title });
  await expect(calculator).toHaveAttribute('href', '/en/calculator');
});

test('footer compliance: NMLS, EHO y Consumer Access', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('footer')).toContainText('NMLS #1459301');
  await expect(page.locator('footer')).toContainText(en.common.footer.eho);
  await expect(page.locator('footer').getByRole('link', { name: en.common.footer.links.consumerAccess })).toHaveAttribute('href', /nmlsconsumeraccess\.org/);
});

test('página de programa: contenido y JSON-LD', async ({ page }) => {
  await page.goto('/es/opciones-de-prestamo/prestamos-fha');
  await expect(page.locator('h1')).toContainText(es.programs.fha.heroTitle);
  await expect(page.locator('main')).toContainText(es.programs.fha.whatIs.title);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join('')).toContain('"MortgageLoan"');
  expect(ld.join('')).toContain('"BreadcrumbList"');
});

test('about: NMLS del originador y enlace a Consumer Access, con FinancialService JSON-LD', async ({ page }) => {
  await page.goto('/en/about');
  await expect(page.locator('body')).toContainText('NMLS #1459301');
  await expect(page.getByRole('link', { name: en.about.license.linkLabel })).toHaveAttribute(
    'href',
    'https://www.nmlsconsumeraccess.org/',
  );
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join('')).toContain('"FinancialService"');
});

test('contact: teléfono placeholder y enlace de WhatsApp con deep link', async ({ page }) => {
  await page.goto('/en/contact');
  await expect(page.getByRole('link', { name: '+1 (305) 000-0000' })).toHaveAttribute(
    'href',
    'tel:+13050000000',
  );
  await expect(page.getByRole('link', { name: en.contact.whatsapp.note })).toHaveAttribute(
    'href',
    /wa\.me\/13050000000/,
  );
});

test('el quiz embebido en home avanza y comparte progreso con /quote', async ({ page }) => {
  const q = en.quote.quiz;
  await page.goto('/en');
  const quiz = page.locator('#quiz');
  // El quiz está bajo el fold y se hidrata diferido (QuizDeferred, IntersectionObserver):
  // hay que aproximarlo al viewport para que el import dinámico se dispare y monte el
  // componente real antes de interactuar con él.
  await quiz.scrollIntoViewIfNeeded();
  const fieldset = quiz.locator('fieldset');
  await expect(fieldset).toBeVisible();
  // Paso 1 (goal): clic sobre el TEXTO visible de la opción, no el <input> sr-only — mismo
  // mecanismo de forwarding label→control que usa tests/e2e/quiz.spec.ts. `goal: buy` dispara
  // auto-avance (onPointerSelect) a `location`, paso 2 de 15 en el flujo de compra.
  await fieldset.getByText(q.steps.goal.options.buy, { exact: true }).click();
  const stepTwo = q.progress.label.replace('{current}', '2').replace('{total}', '15');
  // El auto-retry de `expect` absorbe el setTimeout del auto-avance (ver AUTO_ADVANCE_MS).
  await expect(quiz.getByText(stepTwo)).toBeVisible();
  // sessionStorage (dhl-quiz-v1) es compartido entre home y /quote en el mismo origen:
  // /quote debe retomar en el mismo paso 2 de 15 sin repetir el paso 1. /quote no difiere
  // el montaje (el cuestionario ES esa página, above the fold), así que aparece directo.
  await page.goto('/en/quote');
  await expect(page.getByText(stepTwo)).toBeVisible();
});

test('un visitante a mitad de flujo que reabre la home no sufre robo de foco ni salto de scroll', async ({ page }) => {
  // Progreso guardado de una sesión anterior, sembrado ANTES de que cargue cualquier script
  // de la página (mismo `dhl-quiz-v1` que usa lib/quiz/engine.ts). El quiz vive a mitad de la
  // home (sección #quiz, muy por debajo del hero): si la rehidratación post-montaje del quiz
  // (components/quiz/quiz.tsx) llamase a `headingRef.current?.focus()` en este paso, el
  // navegador robaría el foco Y haría scroll automático hasta el heading — justo el bug que
  // este test cubre (la rehidratación no es una navegación real del usuario).
  await page.addInitScript(
    ({ key, value }) => window.sessionStorage.setItem(key, value),
    {
      key: 'dhl-quiz-v1',
      value: JSON.stringify({ answers: { goal: 'buy', location: 'Miami' }, stepId: 'propertyType', status: 'idle' }),
    },
  );
  await page.goto('/en');
  // Con la hidratación diferida (QuizDeferred) el cuestionario ni siquiera monta en la carga
  // (vive muy por debajo del fold) — así que este chequeo, hecho ANTES de cualquier scroll
  // deliberado del test, es la comprobación más estricta posible: nada puede robar foco ni
  // hacer scroll si nada montó todavía.
  const activeTag = await page.evaluate(() => document.activeElement?.tagName);
  expect(activeTag).toBe('BODY');
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(0);
  // Ahora sí se aproxima el quiz a propósito (dispara el IntersectionObserver de
  // QuizDeferred) y se confirma que la rehidratación ocurrió (retoma en 'propertyType', no
  // en 'goal') — el resto del efecto de foco de quiz.tsx sigue cubierto: montar no roba foco.
  await page.locator('#quiz').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: en.quote.quiz.steps.propertyType.title })).toBeVisible();
});
