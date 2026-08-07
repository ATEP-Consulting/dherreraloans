import { describe, it, expect } from 'vitest';
import { rentVsBuy } from '@/lib/calc/rent-vs-buy';

const input = {
  price: 300000, downPayment: 60000, annualRatePct: 6, years: 30,
  taxYearly: 3600, insuranceYearly: 1200, hoaMonthly: 0, annualCostsPct: 0,
  sellingCostsPct: 6, appreciationPct: 3, monthlyRent: 2000, rentersInsuranceYearly: 0, rentAppreciationPct: 2,
};

describe('rentVsBuy', () => {
  it('año 5: coste neto de comprar ~66 750, alquilar ~124 897, equity ~124 452', () => {
    const r = rentVsBuy(input, 15)!;
    const y5 = r.years[4];
    expect(y5.buyNetCost).toBeCloseTo(66750, -2);
    expect(y5.rentCost).toBeCloseTo(124897, -2);
    expect(y5.equity).toBeCloseTo(124452, -2);
    expect(y5.gain).toBeCloseTo(124897 - 66750, -2);
  });
  it('el cruce llega en el año 2 con estos números', () => {
    expect(rentVsBuy(input, 15)!.crossoverYear).toBe(2);
  });
  it('precio 0 → null', () => {
    expect(rentVsBuy({ ...input, price: 0 }, 15)).toBeNull();
  });
});
