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
