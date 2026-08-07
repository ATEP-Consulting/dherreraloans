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
