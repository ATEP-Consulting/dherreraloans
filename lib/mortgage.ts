// Fórmula P&I estándar: M = P·r / (1 − (1+r)^−n), r mensual, n meses. Pura y sin
// redondeos internos: el redondeo es responsabilidad de la capa de presentación.
export type MortgageInput = { price: number; downPayment: number; annualRatePct: number; years: number };
export type MortgageBreakdown = {
  principal: number;
  monthly: number;
  firstInterest: number;
  firstPrincipal: number;
  totalInterest: number;
  totalCost: number;
};

export function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  const n = years * 12;
  if (annualRatePct === 0) return principal / n;
  const r = annualRatePct / 100 / 12;
  return (principal * r) / (1 - (1 + r) ** -n);
}

export function mortgageBreakdown(input: MortgageInput): MortgageBreakdown | null {
  const { price, downPayment, annualRatePct, years } = input;
  if (price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || annualRatePct < 0) return null;
  const principal = price - downPayment;
  const monthly = monthlyPayment(principal, annualRatePct, years);
  const firstInterest = principal * (annualRatePct / 100 / 12);
  return {
    principal,
    monthly,
    firstInterest,
    firstPrincipal: monthly - firstInterest,
    totalInterest: monthly * years * 12 - principal,
    totalCost: principal + (monthly * years * 12 - principal),
  };
}
