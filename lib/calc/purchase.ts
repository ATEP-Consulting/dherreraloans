import { monthlyPayment } from '@/lib/mortgage';

export type PurchaseInput = {
  price: number; downPayment: number; annualRatePct: number; years: number;
  pmiYearly: number; propertyTaxPct: number; insuranceYearly: number; hoaMonthly: number; extraMonthly: number;
};
export type PurchaseResult = {
  principal: number; monthlyPI: number;
  breakdown: { pi: number; tax: number; insurance: number; hoa: number; pmi: number; extra: number };
  totalMonthly: number; totalInterest: number; totalCost: number;
  payoffMonths: number; monthsSaved: number; interestSaved: number;
};

// La liquidación anticipada se SIMULA mes a mes (pura, ≤ years×12 iteraciones): el último
// mes paga solo el balance restante + su interés.
function simulate(principal: number, annualRatePct: number, payment: number, maxMonths: number) {
  const r = annualRatePct / 100 / 12;
  let balance = principal, interest = 0, months = 0;
  while (balance > 0 && months < maxMonths) {
    const i = balance * r;
    interest += i;
    balance = Math.max(0, balance + i - payment);
    months += 1;
  }
  return { months, interest };
}

export function purchaseBreakdown(input: PurchaseInput): PurchaseResult | null {
  const { price, downPayment, annualRatePct, years, extraMonthly } = input;
  if (price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || annualRatePct < 0 || extraMonthly < 0) return null;
  const principal = price - downPayment;
  const n = years * 12;
  const monthlyPI = monthlyPayment(principal, annualRatePct, years);
  const baseInterest = monthlyPI * n - principal;
  const withExtra = extraMonthly > 0 ? simulate(principal, annualRatePct, monthlyPI + extraMonthly, n) : { months: n, interest: baseInterest };
  const breakdown = {
    pi: monthlyPI,
    tax: (price * (input.propertyTaxPct / 100)) / 12,
    insurance: input.insuranceYearly / 12,
    hoa: input.hoaMonthly,
    pmi: input.pmiYearly / 12,
    extra: extraMonthly,
  };
  const totalMonthly = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return {
    principal, monthlyPI, breakdown, totalMonthly,
    totalInterest: baseInterest, totalCost: principal + baseInterest,
    payoffMonths: withExtra.months, monthsSaved: n - withExtra.months,
    interestSaved: baseInterest - withExtra.interest,
  };
}
