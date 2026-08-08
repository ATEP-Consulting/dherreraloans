import { describe, it, expect } from 'vitest';
import { refinanceComparison } from '@/lib/calc/refinance';

describe('refinanceComparison', () => {
  const current = { balance: 250000, annualRatePct: 7, remainingYears: 25 };
  const next = { annualRatePct: 5.5, years: 30, cashOut: 0, costs: 1000, financeCosts: true };
  it('caso con ahorro: cuota 1766.95 → 1425.13, break-even 3 meses, ~18 038 de interés a favor', () => {
    const r = refinanceComparison(current, next)!;
    expect(r.currentMonthly).toBeCloseTo(1766.95, 0);
    expect(r.newLoanAmount).toBe(251000);
    expect(r.newMonthly).toBeCloseTo(1425.13, 0);
    expect(r.monthlySavings).toBeCloseTo(341.8, 0);
    expect(r.breakEvenMonths).toBe(3);                    // ceil(1000 / 341.8)
    expect(r.interestDifference).toBeCloseTo(18038, -2);
  });
  it('sin ahorro mensual → breakEvenMonths null', () => {
    const r = refinanceComparison(current, { ...next, annualRatePct: 9 })!;
    expect(r.monthlySavings).toBeLessThan(0);
    expect(r.breakEvenMonths).toBeNull();
  });
  it('balance 0 → null', () => {
    expect(refinanceComparison({ ...current, balance: 0 }, next)).toBeNull();
  });
});
