import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

test('calcula la cuota canónica $100k/6%/30a ≈ 599.55 (variante Purchase)', async ({ page }) => {
  await page.goto('/en/calculator');
  await page.getByRole('tab', { name: en.calculator.calc.tabs.purchase, exact: true }).click();
  await page.getByLabel(en.calculator.calc.purchase.priceLabel).fill('125000');
  await page.getByLabel(en.calculator.calc.purchase.downLabel).fill('25000');
  await page.getByLabel(en.calculator.calc.purchase.rateLabel).fill('6');
  const result = page.locator('div[aria-live="polite"]'); // div = panel de resultado (los errores de Field son <p aria-live>)
  await expect(result).toContainText('599.55'); // P&I dentro del desglose del donut
  await expect(result).toContainText('762.05'); // total mensual (P&I + tax + seguro por defecto)
  await expect(result).toContainText(en.calculator.calc.purchase.disclaimer);
});

test('entrada ≥ precio muestra error y no calcula', async ({ page }) => {
  await page.goto('/en/calculator');
  await page.getByRole('tab', { name: en.calculator.calc.tabs.purchase, exact: true }).click();
  await page.getByLabel(en.calculator.calc.purchase.priceLabel).fill('100000');
  await page.getByLabel(en.calculator.calc.purchase.downLabel).fill('100000');
  await expect(page.locator('div[aria-live="polite"]')).toContainText(en.calculator.calc.purchase.errorDown);
});

test('funciona en ES con su copy', async ({ page }) => {
  await page.goto('/es/calculadora');
  await page.getByRole('tab', { name: es.calculator.calc.tabs.purchase, exact: true }).click();
  await page.getByLabel(es.calculator.calc.purchase.priceLabel).fill('125000');
  await page.getByLabel(es.calculator.calc.purchase.downLabel).fill('25000');
  await page.getByLabel(es.calculator.calc.purchase.rateLabel).fill('6');
  await expect(page.locator('div[aria-live="polite"]')).toContainText('599');
  await expect(page.locator('div[aria-live="polite"]')).toContainText(es.calculator.calc.purchase.disclaimer);
});
