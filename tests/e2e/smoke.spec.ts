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
