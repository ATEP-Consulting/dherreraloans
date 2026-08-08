import { describe, it, expect } from 'vitest';
import { vaFundingFeePct, vaFinalLoan } from '@/lib/calc/va';

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
