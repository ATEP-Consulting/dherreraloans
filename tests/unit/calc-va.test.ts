import { describe, it, expect } from 'vitest';
import { vaFundingFeePct, vaFinalLoan, vaPurchaseBreakdown } from '@/lib/calc/va';

describe('vaFundingFeePct', () => {
  it('compra, primer uso: 2.15 / 1.5 / 1.25 según entrada', () => {
    expect(vaFundingFeePct('first', 0, 'purchase')).toBe(2.15);
    expect(vaFundingFeePct('first', 5, 'purchase')).toBe(1.5);
    expect(vaFundingFeePct('first', 10, 'purchase')).toBe(1.25);
  });
  it('compra, uso posterior: 3.3 con <5% de entrada', () => {
    expect(vaFundingFeePct('subsequent', 0, 'purchase')).toBe(3.3);
    expect(vaFundingFeePct('subsequent', 5, 'purchase')).toBe(1.5);
  });
  it('cash-out: 2.15 primer uso / 3.3 posterior; IRRRL: 0.5; exento: 0 siempre', () => {
    expect(vaFundingFeePct('first', 0, 'cashOut')).toBe(2.15);
    expect(vaFundingFeePct('subsequent', 0, 'cashOut')).toBe(3.3);
    expect(vaFundingFeePct('first', 0, 'irrrl')).toBe(0.5);
    expect(vaFundingFeePct('exempt', 0, 'purchase')).toBe(0);
    expect(vaFundingFeePct('exempt', 0, 'irrrl')).toBe(0);
  });
});

describe('vaFinalLoan', () => {
  it('financia el fee sobre el préstamo base: 200000 × 1.0215', () => {
    expect(vaFinalLoan(200000, 2.15)).toBeCloseTo(204300, 0);
  });
});

const vaPurchaseBase = {
  price: 200000, downPayment: 0, annualRatePct: 5, years: 30, vaUse: 'first' as const,
  propertyTaxPct: 0.6, insuranceYearly: 1200, hoaMonthly: 0, extraMonthly: 0,
};

describe('vaPurchaseBreakdown', () => {
  it('financia el fee (P&I sobre el préstamo final) pero calcula property tax sobre el valor real de la vivienda', () => {
    const r = vaPurchaseBreakdown(vaPurchaseBase)!;
    expect(r.feePct).toBe(2.15);
    expect(r.finalLoan).toBeCloseTo(204300, 0);           // 200000 × 1.0215
    expect(r.feeAmount).toBeCloseTo(4300, 0);
    expect(r.breakdown.pi).toBeCloseTo(1096.73, 1);        // P&I sobre 204300, no sobre 200000
    expect(r.breakdown.tax).toBeCloseTo(100, 1);           // 200000 × 0.6% / 12 — precio REAL, no 204300
    expect(r.totalMonthly).toBeCloseTo(1296.73, 1);        // 1096.73 + 100 (tax) + 100 (seguro)
    expect(r.breakdown.pmi).toBe(0);
  });
  it('exento: sin funding fee, el préstamo final es el base', () => {
    const r = vaPurchaseBreakdown({ ...vaPurchaseBase, vaUse: 'exempt' })!;
    expect(r.feePct).toBe(0);
    expect(r.feeAmount).toBe(0);
    expect(r.finalLoan).toBeCloseTo(200000, 0);
  });
  it('entrada ≥ precio → null', () => {
    expect(vaPurchaseBreakdown({ ...vaPurchaseBase, downPayment: 200000 })).toBeNull();
  });
});
