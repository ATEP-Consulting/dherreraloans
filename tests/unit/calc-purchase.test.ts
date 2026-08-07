import { describe, it, expect } from 'vitest';
import { purchaseBreakdown } from '@/lib/calc/purchase';

const base = { price: 200000, downPayment: 0, annualRatePct: 5, years: 30, pmiYearly: 0, propertyTaxPct: 0.6, insuranceYearly: 1200, hoaMonthly: 0, extraMonthly: 0 };

describe('purchaseBreakdown', () => {
  it('sin extra: P&I 1073.64, total 1273.64, interés total 186 511', () => {
    const r = purchaseBreakdown(base)!;
    expect(r.monthlyPI).toBeCloseTo(1073.64, 1);
    expect(r.totalMonthly).toBeCloseTo(1273.64, 1);       // + tax 100 + ins 100
    expect(r.totalInterest).toBeCloseTo(186512, 0);
    expect(r.payoffMonths).toBe(360);
    expect(r.monthsSaved).toBe(0);
  });
  it('con 200 extra/mes: liquida en 256 meses (ahorra 104) y ~61 100 de interés', () => {
    const r = purchaseBreakdown({ ...base, extraMonthly: 200 })!;
    expect(r.payoffMonths).toBe(256);
    expect(r.monthsSaved).toBe(104);
    expect(r.interestSaved).toBeCloseTo(61100, -3);       // ±500
  });
  it('entrada ≥ precio → null', () => {
    expect(purchaseBreakdown({ ...base, downPayment: 200000 })).toBeNull();
  });
});
