import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { APPLY_URL } from '../../lib/site';

test('índice de la home: 5 destacados y enlace al índice completo', async ({ page }) => {
  await page.goto('/en');
  for (const key of ['conventional', 'fha', 'va', 'jumbo', 'investment'] as const) {
    await expect(page.getByRole('link', { name: new RegExp(en.programs[key].indexName) })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: en.home.programsIndex.viewAll })).toBeVisible();
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
  // (vive muy por debajo del fold) — así que este chequeo "on load", hecho ANTES de cualquier
  // scroll deliberado del test, es trivialmente cierto por construcción (nada montó todavía).
  // Se deja igualmente: si algo llegara a montar antes de tiempo, aquí se detectaría.
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // Ahora sí se aproxima el quiz a propósito (dispara el IntersectionObserver de
  // QuizDeferred, monta el Quiz real) y se confirma que la rehidratación ocurrió (retoma en
  // 'propertyType', no en 'goal').
  await page.locator('#quiz').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: en.quote.quiz.steps.propertyType.title })).toBeVisible();
  // ESTE es el aserto que de verdad ejercita el bug original (el de arriba es trivial con el
  // diferido: nada había montado). El montaje + rehidratación de quiz.tsx ocurren justo ahora,
  // detrás del `scrollIntoViewIfNeeded` de este test — `skipFocusRef` debe seguir suprimiendo
  // el `headingRef.current?.focus()` de esa transición, así que no debe robar foco NI disparar
  // un scroll adicional sobre el que provocó deliberadamente el test. Dos RAF dejan asentar el
  // commit/paint del montaje antes de tomar la posición de referencia; una espera adicional
  // detecta cualquier robo de foco/scroll retrasado a un tick posterior.
  const settledScrollY = await page.evaluate(
    () =>
      new Promise<number>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(window.scrollY))),
      ),
  );
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
  const scrollYAfterWait = await page.evaluate(() => window.scrollY);
  expect(Math.abs(scrollYAfterWait - settledScrollY)).toBeLessThanOrEqual(50);
});

test.describe('preview del índice (desktop)', () => {
  // Forzamos viewport desktop: el proyecto e2e por defecto es mobile-chrome (Pixel 7), donde
  // .pindex-preview es `display: none` y la interacción bajo prueba no existe. isMobile/hasTouch
  // fuera para que :hover sea estable (la emulación táctil no lo mantiene).
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('hover en una fila cambia la foto de preview', async ({ page }) => {
    // Excepción justificada al principio de "sin selectores CSS" de este spec: la interacción
    // ES CSS puro (:has(...) + opacity, sin JS ni estado semántico) y no tiene handle accesible
    // — el panel es `aria-hidden` a propósito (es decorativo, la foto ya está en la fila).
    await page.goto('/en');
    const rows = page.locator('.pindex-rows > a');
    const panel = page.locator('.pindex-preview > div');
    // Antes del hover: la primera foto es la visible (regla `:first-child`), la tercera no.
    await expect(panel.nth(2)).toHaveCSS('opacity', '0');
    await rows.nth(2).hover();
    // `expect.poll`-like: el auto-retry de toHaveCSS absorbe la transición de --duration-preview.
    await expect(panel.nth(2)).toHaveCSS('opacity', '1');
  });
});

test.describe('header y motion (desktop)', () => {
  // Viewport desktop + motion real: este bloque verifica precisamente el comportamiento
  // animado, así que anula el reducedMotion:'reduce' global del config. isMobile/hasTouch
  // fuera: el proyecto es Pixel 7 y la emulación táctil no mantiene :hover.
  test.use({
    viewport: { width: 1280, height: 800 },
    isMobile: false,
    hasTouch: false,
    contextOptions: { reducedMotion: 'no-preference' },
  });

  test('el header es transparente en top y sólido al scrollear', async ({ page }) => {
    await page.goto('/en');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/hdr-solid/);
    await page.mouse.wheel(0, 600);
    await expect(html).toHaveClass(/hdr-solid/);
    await page.mouse.wheel(0, -600);
    await expect(html).not.toHaveClass(/hdr-solid/);
  });

  test('mega-menú: hover en Loan Options despliega los 12 programas', async ({ page }) => {
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: en.common.nav.primary });
    const fhaInMega = nav.getByRole('link', { name: new RegExp(en.programs.fha.indexName) });
    await expect(fhaInMega).toBeHidden();
    await nav.getByRole('link', { name: en.common.nav.loanOptions, exact: true }).hover();
    await expect(fhaInMega).toBeVisible();
    await expect(nav.getByRole('link', { name: en.common.megaMenu.viewAll })).toBeVisible();
    await expect(nav.locator('ul a')).toHaveCount(12);
  });

  test('máscaras y cortinas se revelan tras saltar al fondo (regresión clip-path × IO)', async ({ page }) => {
    // Bug histórico: armar con clip-path daba área 0 y el IntersectionObserver jamás
    // veía intersecar al elemento (fotos y titulares invisibles). Armado = opacity;
    // lo saltado por encima lo marca sweepAbove.
    await page.goto('/en');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('.reveal-mask').last()).toHaveClass(/\bin\b/); // titular CTA final
    await expect(page.locator('.reveal-curtain').first()).toHaveClass(/\bin\b/); // interludio (foto)
  });

  test('reveals: animan POR TIEMPO al entrar en viewport (no scrubbed)', async ({ page }) => {
    await page.goto('/en');
    const el = page.locator('.reveal-rise').first(); // cabecera del quiz, bajo el fold en 800px
    await expect(el).toHaveCSS('opacity', '0'); // armado por html.js-reveal, aún sin intersecar
    await el.scrollIntoViewIfNeeded();
    // Con el scroll ya QUIETO, la opacidad debe llegar a 1 por sí sola (animación por tiempo).
    await expect
      .poll(() => el.evaluate((n) => parseFloat(getComputedStyle(n).opacity)), { timeout: 4000 })
      .toBeGreaterThan(0.95);
  });
});
