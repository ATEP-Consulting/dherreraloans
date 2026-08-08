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

test('las pestañas cambian de variante y affordability calcula con defaults', async ({ page }) => {
  await page.goto('/en/calculator');
  // affordability es la pestaña por defecto y calcula de entrada con sus valores DEFAULTS
  await expect(page.getByRole('tab', { name: en.calculator.calc.tabs.afford, exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  // total mensual con defaults (price 200k/0% down/5%/30a + tax/seguro/PMI) = 1350.31
  // (el importe se repite en el <p> del resultado y en el centro del donut SVG, de ahí toContainText sobre el panel)
  await expect(page.locator('div[aria-live="polite"]')).toContainText('$1,350.31');

  await page.getByRole('tab', { name: en.calculator.calc.tabs.refi, exact: true }).click();
  await expect(page.getByRole('tab', { name: en.calculator.calc.tabs.refi, exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  // ahorro mensual con defaults (250k/7%/25a restantes → 5.5%/30a) = 341.80
  await expect(page.locator('div[aria-live="polite"]')).toContainText('$341.80');

  await page.getByRole('tab', { name: en.calculator.calc.tabs.rentBuy, exact: true }).click();
  await expect(page.getByRole('tab', { name: en.calculator.calc.tabs.rentBuy, exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tabpanel')).toBeVisible();
  await expect(page.getByText(en.calculator.calc.rentBuy.comparisonTitle.replace('{years}', '5'))).toBeVisible();
});

test('VA purchase: funding fee financiado y P&I sobre el préstamo final, tax sobre el valor real', async ({ page }) => {
  await page.goto('/en/calculator');
  await page.getByRole('tab', { name: en.calculator.calc.tabs.vaPurchase, exact: true }).click();
  const result = page.locator('div[aria-live="polite"]');
  const vaPurchase = en.calculator.calc.vaPurchase;
  // Defaults: price 200000, down 0, rate 5%, 30a, first-use → fee 2.15%, final loan 204300.
  await expect(result).toContainText(vaPurchase.feeLabel.replace('{pct}', '2.15'));
  await expect(result).toContainText('$4,300');
  await expect(result).toContainText('$204,300'); // finalLoanLabel
  // Total mensual CORREGIDO: P&I sobre 204300 (1096.73, no 1073.64 sobre el préstamo base) +
  // tax sobre el precio REAL de 200000 (100.00, no sobre 204300) + seguro (100.00) = 1296.73.
  await expect(result).toContainText('$1,296.73');
});

test('VA refinance: IRRRL oculta el cash-out y usa fee 0.50%', async ({ page }) => {
  await page.goto('/en/calculator');
  await page.getByRole('tab', { name: en.calculator.calc.tabs.vaRefi, exact: true }).click();
  const vaRefi = en.calculator.calc.vaRefi;
  await expect(page.getByLabel(vaRefi.cashOutLabel)).toBeVisible();

  await page.getByLabel(vaRefi.purposeLabel).selectOption('irrrl');
  await expect(page.getByLabel(vaRefi.cashOutLabel)).toHaveCount(0);
  await expect(page.locator('div[aria-live="polite"]')).toContainText(vaRefi.feeLabel.replace('{pct}', '0.50'));
});

test('las 8 pestañas responden y DSCR calcula 0.45 con los defaults', async ({ page }) => {
  await page.goto('/en/calculator');
  const tabs = en.calculator.calc.tabs;
  for (const id of Object.keys(tabs) as (keyof typeof tabs)[]) {
    await page.getByRole('tab', { name: tabs[id], exact: true }).click();
    await expect(page.getByRole('tab', { name: tabs[id], exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toBeVisible();
    if (id === 'dscr') {
      // NOI 16,000 (28,500 renta efectiva - 12,500 gastos) / deuda anual ≈35,225 (400k@8%/30a) ≈ 0.45.
      await expect(page.getByText('0.45')).toBeVisible();
    }
  }
});
