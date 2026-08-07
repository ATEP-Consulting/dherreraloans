import { test, expect, type Page } from '@playwright/test';
import en from '../../messages/en.json';
import es from '../../messages/es.json';

const enQ = en.quote.quiz;
const esQ = es.quote.quiz;

async function choose(page: Page, label: string) {
  // El input real es sr-only (WCAG: oculto visualmente, wrapped por <label>); su bounding box de
  // 1x1px queda posicionado justo detrás del <span> visible que muestra el texto de la opción
  // (verificado: mismo punto exacto en todas las ChoiceCard). Un usuario real puede pulsar en
  // cualquier parte del <label> — el navegador reenvía el click al control asociado de forma
  // nativa — pero el hit-test estricto de Playwright exige que el punto resuelto del propio
  // elemento quede libre de cualquier elemento superpuesto, y ahí el <span> lo intercepta. force
  // reproduce fielmente un click real (mismo evento, mismas coordenadas) saltándose solo esa
  // comprobación de "recibe el evento sin nada encima", que no aplica a un click de verdad sobre
  // el <label>.
  // exact: true evita colisiones por subcadena entre opciones del mismo paso, p. ej. "Employed"
  // es subcadena de "Self-employed or business owner" (matching case-insensitive por defecto).
  await page.getByRole('radio', { name: label, exact: true }).click({ force: true }); // auto-avance táctil (~300 ms)
  // El auto-avance (AUTO_ADVANCE_MS en components/quiz/quiz.tsx) dispara el cambio de paso
  // ~300 ms después del click, en un setTimeout — no de forma síncrona. Sin esperar aquí, la
  // siguiente interacción del test puede ejecutarse mientras el paso ANTERIOR sigue montado
  // (varios pasos comparten literal de opción, p. ej. "Yes"/"No"/"Continue"), acertando por
  // error un control del paso viejo en vez del nuevo. Se espera un margen sobre esos 300 ms
  // para que el paso siguiente ya esté montado antes de continuar.
  await page.waitForTimeout(400);
}
async function cont(page: Page, label: string) {
  await page.getByRole('button', { name: label }).click();
}
async function fillContactAndSubmit(page: Page, q: typeof enQ) {
  await page.getByLabel(q.steps.contact.firstName).fill('Ana');
  await page.getByLabel(q.steps.contact.lastName).fill('García');
  await page.getByLabel(q.steps.contact.email).fill('ana@example.com');
  await page.getByLabel(q.steps.contact.phone).fill('305 555 0101');
  await cont(page, q.nav.submit);
}

// Flujos completos parametrizados por idioma — la matriz compra/refi × EN/ES del
// spec §7 (ADR-0010) son 4 tests que reutilizan estos dos walks.
async function runBuyFlow(page: Page, q: typeof enQ, url: string) {
  await page.goto(url);
  await choose(page, q.steps.goal.options.buy);
  await page.getByLabel(q.steps.location.label).fill('Miami 33130');
  await cont(page, q.nav.continue);
  await choose(page, q.steps.propertyType.options.singleFamily);
  await choose(page, q.steps.stage.options.looking);
  await choose(page, q.steps.use.options.primary);
  await choose(page, q.steps.military.options.no);
  await choose(page, q.steps.hasAgent.options.notYet);
  await choose(page, q.steps.firstTime.options.yes);
  await page.getByLabel(q.steps.purchaseNumbers.priceLabel).fill('450000');
  await page.getByLabel(q.steps.purchaseNumbers.downLabel).fill('45000');
  await cont(page, q.nav.continue);
  await choose(page, q.steps.employment.options.employed);
  await choose(page, q.steps.income.options['50to100k']);
  await choose(page, q.steps.credit.options.good);
  await choose(page, q.steps.history.options.none);
  await choose(page, q.steps.status.options.permanentResident);
  await fillContactAndSubmit(page, q);
}

async function runRefiFlow(page: Page, q: typeof enQ, url: string) {
  await page.goto(url);
  await choose(page, q.steps.goal.options.refinance);
  await page.getByLabel(q.steps.location.label).fill('Hialeah');
  await cont(page, q.nav.continue);
  await choose(page, q.steps.propertyType.options.condo);
  await choose(page, q.steps.use.options.primary);
  await choose(page, q.steps.military.options.yes);
  await choose(page, q.steps.militaryBranch.options.navy);
  await page.getByLabel(q.steps.refiNumbers.valueLabel).fill('380000');
  await page.getByLabel(q.steps.refiNumbers.balanceLabel).fill('210000');
  await page.getByLabel(q.steps.refiNumbers.escape).check();
  await cont(page, q.nav.continue);
  await choose(page, q.steps.secondMortgage.options.no);
  await choose(page, q.steps.cashOut.options.unsure);
  await choose(page, q.steps.employment.options.selfEmployed);
  await choose(page, q.steps.income.options.discuss);
  await choose(page, q.steps.credit.options.unknown);
  await choose(page, q.steps.history.options.over4y);
  await choose(page, q.steps.status.options.citizen);
  await fillContactAndSubmit(page, q);
}

test('flujo COMPRA completo en EN hasta la pantalla de gracias', async ({ page }) => {
  await runBuyFlow(page, enQ, '/en/quote');
  await expect(page.getByText('Got it, Ana.')).toBeVisible();
});

test('flujo COMPRA completo en ES hasta gracias', async ({ page }) => {
  await runBuyFlow(page, esQ, '/es/cotizacion');
  await expect(page.getByText('Recibido, Ana.')).toBeVisible();
});

test('flujo REFI completo en EN (militar, escape de tasa) hasta gracias', async ({ page }) => {
  await runRefiFlow(page, enQ, '/en/quote');
  await expect(page.getByText('Got it, Ana.')).toBeVisible();
});

test('flujo REFI completo en ES hasta gracias', async ({ page }) => {
  await runRefiFlow(page, esQ, '/es/cotizacion');
  await expect(page.getByText('Recibido, Ana.')).toBeVisible();
});

test('recargar a mitad retoma en el mismo paso con las respuestas intactas', async ({ page }) => {
  await page.goto('/en/quote');
  await choose(page, enQ.steps.goal.options.buy);
  await page.getByLabel(enQ.steps.location.label).fill('Miami');
  await cont(page, enQ.nav.continue);
  // getByRole('heading', ...) en vez de getByText: el título del paso aparece dos veces en el
  // DOM (el <h2> visible y el <legend class="sr-only"> del fieldset, necesario para asociar el
  // grupo de opciones con su nombre accesible) — getByText sería ambiguo (strict mode).
  await expect(page.getByRole('heading', { name: enQ.steps.propertyType.title })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: enQ.steps.propertyType.title })).toBeVisible();
  await page.getByRole('button', { name: enQ.nav.back }).click();
  await expect(page.getByLabel(enQ.steps.location.label)).toHaveValue('Miami');
});

test('cambiar de idioma a mitad conserva el paso y las respuestas (valores = claves)', async ({ page }) => {
  await page.goto('/en/quote');
  await choose(page, enQ.steps.goal.options.buy);
  await page.getByLabel(enQ.steps.location.label).fill('Miami');
  await cont(page, enQ.nav.continue);
  await page.getByRole('link', { name: 'ES', exact: true }).click();
  await expect(page).toHaveURL(/\/es\/cotizacion$/);
  await expect(page.getByRole('heading', { name: esQ.steps.propertyType.title })).toBeVisible();
});

test('validación: continuar sin responder muestra error localizado y no avanza', async ({ page }) => {
  await page.goto('/en/quote');
  await choose(page, enQ.steps.goal.options.buy);
  await cont(page, enQ.nav.continue); // location vacía
  await expect(page.getByText(enQ.errors.location)).toBeVisible();
  await expect(page.getByLabel(enQ.steps.location.label)).toBeVisible(); // sigue en el paso
});

test('fallo de envío: error visible, reintento disponible y respuestas intactas', async ({ page }) => {
  await page.goto('/en/quote?e2e-fail-submit=1');
  await choose(page, enQ.steps.goal.options.buy);
  await page.getByLabel(enQ.steps.location.label).fill('Miami');
  await cont(page, enQ.nav.continue);
  await choose(page, enQ.steps.propertyType.options.condo);
  await choose(page, enQ.steps.stage.options.research);
  await choose(page, enQ.steps.use.options.primary);
  await choose(page, enQ.steps.military.options.no);
  await choose(page, enQ.steps.hasAgent.options.yes);
  await choose(page, enQ.steps.firstTime.options.no);
  await page.getByLabel(enQ.steps.purchaseNumbers.priceLabel).fill('300000');
  await page.getByLabel(enQ.steps.purchaseNumbers.escape).check();
  await cont(page, enQ.nav.continue);
  await choose(page, enQ.steps.employment.options.employed);
  await choose(page, enQ.steps.income.options.under50k);
  await choose(page, enQ.steps.credit.options.fair);
  await choose(page, enQ.steps.history.options.none);
  await choose(page, enQ.steps.status.options.workVisa);
  await fillContactAndSubmit(page, enQ);
  await expect(page.getByText(enQ.errors.submit)).toBeVisible();
  await expect(page.getByRole('button', { name: enQ.nav.retry })).toBeVisible();
  await expect(page.getByLabel(enQ.steps.contact.email)).toHaveValue('ana@example.com');
});
