import { test, expect } from '@playwright/test';
import en from '../../messages/en.json';

const q = en.quote.quiz;

test('pre-qualify renderiza el envoltorio y el quiz responde', async ({ page }) => {
  await page.goto('/en/pre-qualify');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Paso 1 (goal): clic sobre el TEXTO visible de la opción, no el <input> sr-only — mismo
  // mecanismo de forwarding label→control que usan tests/e2e/quiz.spec.ts y home.spec.ts.
  // `goal: buy` dispara auto-avance (onPointerSelect) a `location`, paso 2 de 15 del flujo de compra.
  await page.locator('fieldset').getByText(q.steps.goal.options.buy, { exact: true }).click();
  const stepTwo = q.progress.label.replace('{current}', '2').replace('{total}', '15');
  // El auto-retry de `expect` absorbe el setTimeout del auto-avance (AUTO_ADVANCE_MS).
  await expect(page.getByText(stepTwo)).toBeVisible();
});

test('la versión en español existe con slug propio', async ({ page }) => {
  await page.goto('/es/precalificacion');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
