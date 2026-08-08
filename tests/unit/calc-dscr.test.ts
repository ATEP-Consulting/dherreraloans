import { describe, it, expect } from 'vitest';
import { dscrMetrics } from '@/lib/calc/dscr';

const input = {
  value: 500000,
  monthlyRents: [2500],
  taxesYearly: 4000,
  insuranceYearly: 3000,
  hoaMonthly: 0,
  vacancyPct: 5,
  repairsYearly: 500,
  utilitiesYearly: 5000,
  ltvPct: 80,
  annualRatePct: 8,
  originationPct: 2,
  closingCosts: 6500,
  years: 30,
};

describe('dscrMetrics', () => {
  it('con los defaults de la referencia: NOI 16 000, cap rate 3.2, DSCR 0.45, cash-on-cash negativo', () => {
    const r = dscrMetrics(input)!;
    expect(r.loanAmount).toBe(400000);
    expect(r.monthlyDebtService).toBeCloseTo(2935.06, 1);
    expect(r.noi).toBeCloseTo(16000, 0); // 30000×0.95 − 12500
    expect(r.capRatePct).toBeCloseTo(3.2, 2);
    expect(r.cashFlow).toBeCloseTo(-19221, 0);
    expect(r.dscr).toBeCloseTo(0.45, 2);
    expect(r.cashNeeded).toBeCloseTo(114500, 0); // down 100000 + closing 6500 + origination 8000
    expect(r.cashOnCashPct).toBeCloseTo(-16.79, 1);
  });
  it('sin rentas → null', () => {
    expect(dscrMetrics({ ...input, monthlyRents: [] })).toBeNull();
  });
});
