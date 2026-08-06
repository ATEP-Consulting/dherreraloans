import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

const strip = (s: string) => s.replace(/<\/?em>/g, '');

test('/ redirige al idioma por defecto (en)', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('h1')).toHaveText(strip(en.home.hero.title));
});

test('navegador en español → /es', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator('h1')).toHaveText(strip(es.home.hero.title));
});

test('pathnames localizados: /es/opciones-de-prestamo/prestamos-fha', async ({ page }) => {
  await page.goto('/es/opciones-de-prestamo/prestamos-fha');
  await expect(page.locator('h1')).toHaveText(es.programs.fha.heading);
  expect(page.url()).toContain('/es/opciones-de-prestamo/prestamos-fha');
});

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

test('slug de programa desconocido → 404', async ({ page }) => {
  const response = await page.goto('/en/loan-options/prestamos-fha'); // slug ES en ruta EN
  expect(response?.status()).toBe(404);
});
