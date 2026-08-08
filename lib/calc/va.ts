import { VA_FUNDING_FEE } from './constants';

export type VaUse = 'first' | 'subsequent' | 'exempt';
export type VaPurpose = 'purchase' | 'cashOut' | 'irrrl';

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
