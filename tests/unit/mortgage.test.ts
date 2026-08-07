import { describe, it, expect } from 'vitest';
import { monthlyPayment, mortgageBreakdown } from '@/lib/mortgage';

describe('monthlyPayment (valores canónicos)', () => {
  it('$100,000 al 6% a 30 años ≈ $599.55', () => {
    expect(monthlyPayment(100000, 6, 30)).toBeCloseTo(599.55, 2);
  });
  it('$200,000 al 5% a 30 años ≈ $1,073.64', () => {
    expect(monthlyPayment(200000, 5, 30)).toBeCloseTo(1073.64, 2);
  });
  it('tasa 0 degenera a reparto lineal sin dividir por cero', () => {
    expect(monthlyPayment(120000, 0, 30)).toBeCloseTo(333.33, 2);
  });
});

describe('mortgageBreakdown', () => {
  const input = { price: 125000, downPayment: 25000, annualRatePct: 6, years: 30 };
  it('desglosa principal, primer pago y totales de forma coherente', () => {
    const b = mortgageBreakdown(input)!;
    expect(b.principal).toBe(100000);
    expect(b.monthly).toBeCloseTo(599.55, 2);
    expect(b.firstInterest).toBeCloseTo(500, 2); // 100000 × 0.06/12
    expect(b.firstPrincipal).toBeCloseTo(b.monthly - b.firstInterest, 10);
    expect(b.totalInterest).toBeCloseTo(b.monthly * 360 - 100000, 6);
    expect(b.totalCost).toBeCloseTo(b.principal + b.totalInterest, 6);
  });
  it('inválido → null (entrada ≥ precio, precio 0, años 0, tasa negativa)', () => {
    expect(mortgageBreakdown({ ...input, downPayment: 125000 })).toBeNull();
    expect(mortgageBreakdown({ ...input, price: 0 })).toBeNull();
    expect(mortgageBreakdown({ ...input, years: 0 })).toBeNull();
    expect(mortgageBreakdown({ ...input, annualRatePct: -1 })).toBeNull();
  });
});
