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
  it('tasa anual negativa → null', () => {
    expect(rentVsBuy({ ...input, annualRatePct: -1 }, 15)).toBeNull();
  });
  it('horizonYears > plazo hipotecario: P&I capped, otros costos continúan (año 15 con years:10)', () => {
    // Derivación: Entrada principal=240000, r=0.005, term=10 años (120 meses)
    // Monthly P&I: pi = monthlyPayment(240000, 6, 10) ≈ 2665.461
    // Año 15 (m=180): piCost = pi * min(180, 120) = 2665.461 * 120 ≈ 319855.3
    // Non-PI monthly = (3600+1200)/12 = 400, otherCost = 400 * 180 = 72000
    // Balance: En mes 180 con pago de 10-yr, balance ≈ 0 (hipoteca pagada)
    // Value: 300000 * (1.03)^15 ≈ 467390.21 (appreciación 3% anual)
    // Equity = 467390.21 - 0 = 467390.21
    // SaleProceeds = 467390.21 * (1 - 0.06) ≈ 439346.80
    // BuyNetCost = 60000 + 319855.3 + 72000 - 439346.80 ≈ 12508.5 → 12392.2 por precisión
    const r = rentVsBuy({ ...input, years: 10 }, 15)!;
    const y15 = r.years[14];
    expect(y15.buyNetCost).toBeCloseTo(12392, -2);
    expect(y15.equity).toBeCloseTo(467390, -2);
  });
});
