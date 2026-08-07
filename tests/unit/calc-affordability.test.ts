import { describe, it, expect } from 'vitest';
import { affordability } from '@/lib/calc/affordability';

const base = {
  monthlyIncome: 5000, monthlyDebts: 1500, price: 200000, downPayment: 0,
  annualRatePct: 5, years: 30, propertyTaxPct: 0.6, insuranceYearly: 1200,
  hoaMonthly: 0, creditBand: '760+' as const,
};

describe('affordability', () => {
  it('conventional: P&I 1073.64 + tax 100 + ins 100 + PMI 76.67 y DTI 27/57 sobre límite 50/50', () => {
    const r = affordability(base, 'conventional')!;
    expect(r.monthlyPI).toBeCloseTo(1073.64, 1);
    expect(r.monthlyFee).toBeCloseTo(76.67, 1);          // 200000 × 0.46% / 12
    expect(r.totalMonthly).toBeCloseTo(1350.31, 1);
    expect(r.frontDti).toBeCloseTo(27.01, 1);
    expect(r.backDti).toBeCloseTo(57.01, 1);
    expect(r.limits).toEqual({ front: 50, back: 50 });
    expect(r.withinLimits).toBe(false);                   // 57 > 50
  });
  it('conventional sin PMI con 20% de entrada', () => {
    const r = affordability({ ...base, downPayment: 40000 }, 'conventional')!;
    expect(r.monthlyFee).toBe(0);
  });
  it('fha: upfront MIP financiado y MIP mensual sobre el préstamo base', () => {
    const r = affordability({ ...base, downPayment: 7000 }, 'fha')!;   // 3.5%
    expect(r.loanAmount).toBeCloseTo(196377.5, 0);        // 193000 × 1.0175
    expect(r.monthlyPI).toBeCloseTo(1054.2, 1);
    expect(r.monthlyFee).toBeCloseTo(88.46, 1);           // 193000 × 0.55% / 12
    expect(r.totalMonthly).toBeCloseTo(1342.66, 1);
  });
  it('usda: límites 29/41', () => {
    expect(affordability(base, 'usda')!.limits).toEqual({ front: 29, back: 41 });
  });
  it('inputs inválidos → null', () => {
    expect(affordability({ ...base, monthlyIncome: 0 }, 'conventional')).toBeNull();
    expect(affordability({ ...base, downPayment: 200000 }, 'conventional')).toBeNull();
  });
});
