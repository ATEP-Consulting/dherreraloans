import { VA_FUNDING_FEE } from './constants';
import { purchaseBreakdown, type PurchaseResult } from './purchase';

export type VaUse = 'first' | 'subsequent' | 'exempt';
export type VaPurpose = 'purchase' | 'cashOut' | 'irrrl';

export const VA_USES: VaUse[] = ['first', 'subsequent', 'exempt'];

export function vaFundingFeePct(use: VaUse, downPct: number, purpose: VaPurpose): number {
  if (use === 'exempt') return 0;
  if (purpose === 'irrrl') return VA_FUNDING_FEE.irrrl;
  if (purpose === 'cashOut') return VA_FUNDING_FEE.cashOut[use];
  const tiers = VA_FUNDING_FEE.purchase[use];
  return tiers.find((t) => downPct >= t.minDownPct)!.pct;
}

export function vaFinalLoan(base: number, feePct: number): number {
  return base * (1 + feePct / 100);
}

export type VaPurchaseInput = {
  price: number; downPayment: number; annualRatePct: number; years: number; vaUse: VaUse;
  propertyTaxPct: number; insuranceYearly: number; hoaMonthly: number; extraMonthly: number;
};
export type VaPurchaseResult = PurchaseResult & { feePct: number; feeAmount: number; finalLoan: number };

// Compone purchaseBreakdown para VA Purchase: el funding fee se financia en el préstamo, así que
// P&I/interés total/estrategia de amortización anticipada deben calcularse sobre el PRÉSTAMO
// FINAL (base + fee), no sobre el préstamo base. Truco: le pedimos a purchaseBreakdown un "price"
// ficticio (finalLoan + downPayment) para que su principal (price − downPayment) sea el préstamo
// final — eso deja el resto de la simulación (PI, interés, payoff) correcta. Pero property tax SÍ
// debe calcularse sobre el valor REAL de la vivienda (no sobre el préstamo inflado), así que se
// corrige esa única línea después: como purchaseBreakdown no usa tax para nada más (ni en el
// interés ni en el payoff), la corrección es exacta, no una aproximación.
export function vaPurchaseBreakdown(input: VaPurchaseInput): VaPurchaseResult | null {
  const { price, downPayment, annualRatePct, years, vaUse, propertyTaxPct, insuranceYearly, hoaMonthly, extraMonthly } = input;
  if (price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || annualRatePct < 0 || extraMonthly < 0) return null;
  const base = price - downPayment;
  const downPct = (downPayment / price) * 100;
  const feePct = vaFundingFeePct(vaUse, downPct, 'purchase');
  const finalLoan = vaFinalLoan(base, feePct);
  const raw = purchaseBreakdown({
    price: finalLoan + downPayment,
    downPayment,
    annualRatePct,
    years,
    pmiYearly: 0,
    propertyTaxPct,
    insuranceYearly,
    hoaMonthly,
    extraMonthly,
  });
  if (!raw) return null;
  const tax = (price * (propertyTaxPct / 100)) / 12;
  const breakdown = { ...raw.breakdown, tax };
  const totalMonthly = raw.totalMonthly - raw.breakdown.tax + tax;
  return { ...raw, breakdown, totalMonthly, feePct, feeAmount: finalLoan - base, finalLoan };
}
