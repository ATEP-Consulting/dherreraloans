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
  // Paso 1 (goal): clic sobre el TEXTO visible de la opción, no el <input> sr-only — mismo
  // mecanismo de forwarding label→control que usa tests/e2e/quiz.spec.ts. `goal: buy` dispara
  // auto-avance (onPointerSelect) a `location`, paso 2 de 15 en el flujo de compra.
  await page.goto('/en');
  const quiz = page.locator('#quiz');
  await quiz.locator('fieldset').getByText(q.steps.goal.options.buy, { exact: true }).click();
  const stepTwo = q.progress.label.replace('{current}', '2').replace('{total}', '15');
  // El auto-retry de `expect` absorbe el setTimeout del auto-avance (ver AUTO_ADVANCE_MS).
  await expect(quiz.getByText(stepTwo)).toBeVisible();
  // sessionStorage (dhl-quiz-v1) es compartido entre home y /quote en el mismo origen:
  // /quote debe retomar en el mismo paso 2 de 15 sin repetir el paso 1.
  await page.goto('/en/quote');
  await expect(page.getByText(stepTwo)).toBeVisible();
});
