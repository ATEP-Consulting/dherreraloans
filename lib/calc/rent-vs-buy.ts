import { monthlyPayment } from '@/lib/mortgage';

export type RentVsBuyInput = {
  price: number; downPayment: number; annualRatePct: number; years: number;
  taxYearly: number; insuranceYearly: number; hoaMonthly: number; annualCostsPct: number;
  sellingCostsPct: number; appreciationPct: number;
  monthlyRent: number; rentersInsuranceYearly: number; rentAppreciationPct: number;
};
export type RentVsBuyYear = { year: number; buyNetCost: number; rentCost: number; equity: number; gain: number };
export type RentVsBuyResult = { years: RentVsBuyYear[]; crossoverYear: number | null };

// Modelo (spec §4): comprar = entrada + pagos acumulados − (equity − costes de venta);
// alquilar = renta acumulada con apreciación anual + seguro de inquilino.
export function rentVsBuy(input: RentVsBuyInput, horizonYears: number): RentVsBuyResult | null {
  const { price, downPayment, annualRatePct, years } = input;
  if (price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || horizonYears <= 0) return null;
  const principal = price - downPayment;
  const r = annualRatePct / 100 / 12;
  const pi = monthlyPayment(principal, annualRatePct, years);
  const monthlyOwn = pi + input.taxYearly / 12 + input.insuranceYearly / 12 + input.hoaMonthly + (price * (input.annualCostsPct / 100)) / 12;
  const out: RentVsBuyYear[] = [];
  let rentCost = 0, crossoverYear: number | null = null;
  for (let y = 1; y <= horizonYears; y++) {
    const m = y * 12;
    const factor = (1 + r) ** m;
    const balance = r === 0 ? principal - pi * m : principal * factor - pi * ((factor - 1) / r);
    const value = price * (1 + input.appreciationPct / 100) ** y;
    const equity = value - Math.max(0, balance);
    const saleProceeds = equity - value * (input.sellingCostsPct / 100);
    const buyNetCost = downPayment + monthlyOwn * m - saleProceeds;
    rentCost += input.monthlyRent * 12 * (1 + input.rentAppreciationPct / 100) ** (y - 1) + input.rentersInsuranceYearly;
    const gain = rentCost - buyNetCost;
    if (gain > 0 && crossoverYear === null) crossoverYear = y;
    out.push({ year: y, buyNetCost, rentCost, equity, gain });
  }
  return { years: out, crossoverYear };
}
