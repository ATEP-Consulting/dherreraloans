import { describe, it, expect } from 'vitest';
import { flipMetrics } from '@/lib/calc/flip';

const input = {
  purchasePrice: 500000,
  renovationCost: 75000,
  arv: 750000,
  months: 9,
  taxesYearly: 4000,
  insuranceYearly: 3000,
  ltvPct: 80,
  annualRatePct: 10,
  originationPct: 2,
  otherClosingPct: 3,
  costToSellPct: 5,
};

describe('flipMetrics', () => {
  it('con los defaults de la referencia: beneficio 79 250, ROI ~34 %, LTARV 53.3 %', () => {
    const r = flipMetrics(input)!;
    expect(r.loanAmount).toBe(400000);
    expect(r.monthlyInterest).toBeCloseTo(3333.33, 1);
    expect(r.totalInterest).toBeCloseTo(30000, 0);
    expect(r.carryingCosts).toBeCloseTo(5250, 0); // (4000+3000) × 9/12
    expect(r.costToSell).toBeCloseTo(37500, 0); // 5% del ARV
    expect(r.cashInDeal).toBeCloseTo(233250, 0);
    expect(r.netProfit).toBeCloseTo(79250, 0);
    expect(r.roiPct).toBeCloseTo(33.98, 1);
    expect(r.ltarvPct).toBeCloseTo(53.33, 1);
  });
  it('ARV 0 → null', () => {
    expect(flipMetrics({ ...input, arv: 0 })).toBeNull();
  });
});
