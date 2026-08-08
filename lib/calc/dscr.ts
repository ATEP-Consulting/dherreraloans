import { monthlyPayment } from '@/lib/mortgage';

export type DscrInput = {
  value: number;
  monthlyRents: number[];
  taxesYearly: number;
  insuranceYearly: number;
  hoaMonthly: number;
  vacancyPct: number;
  repairsYearly: number;
  utilitiesYearly: number;
  ltvPct: number;
  annualRatePct: number;
  originationPct: number;
  closingCosts: number;
  years: number;
};
export type DscrResult = {
  loanAmount: number;
  downPayment: number;
  monthlyDebtService: number;
  originationFee: number;
  grossRentYearly: number;
  effectiveRentYearly: number;
  operatingExpenses: number;
  noi: number;
  cashFlow: number;
  capRatePct: number;
  cashNeeded: number;
  cashOnCashPct: number | null;
  dscr: number | null;
  pricePerUnit: number;
};

export function dscrMetrics(input: DscrInput): DscrResult | null {
  const { value, monthlyRents, ltvPct, annualRatePct, years } = input;
  if (value <= 0 || monthlyRents.length === 0 || monthlyRents.some((r) => r < 0) || ltvPct < 0 || ltvPct > 100 || years <= 0 || annualRatePct < 0)
    return null;
  const loanAmount = value * (ltvPct / 100);
  const downPayment = value - loanAmount;
  const monthlyDebtService = monthlyPayment(loanAmount, annualRatePct, years);
  const grossRentYearly = monthlyRents.reduce((a, b) => a + b, 0) * 12;
  const effectiveRentYearly = grossRentYearly * (1 - input.vacancyPct / 100);
  const operatingExpenses = input.taxesYearly + input.insuranceYearly + input.hoaMonthly * 12 + input.repairsYearly + input.utilitiesYearly;
  const noi = effectiveRentYearly - operatingExpenses;
  const debtServiceYearly = monthlyDebtService * 12;
  const originationFee = loanAmount * (input.originationPct / 100);
  const cashNeeded = downPayment + input.closingCosts + originationFee;
  const cashFlow = noi - debtServiceYearly;
  return {
    loanAmount,
    downPayment,
    monthlyDebtService,
    originationFee,
    grossRentYearly,
    effectiveRentYearly,
    operatingExpenses,
    noi,
    cashFlow,
    capRatePct: (noi / value) * 100,
    cashNeeded,
    cashOnCashPct: cashNeeded > 0 ? (cashFlow / cashNeeded) * 100 : null,
    dscr: debtServiceYearly > 0 ? noi / debtServiceYearly : null,
    pricePerUnit: value / monthlyRents.length,
  };
}
