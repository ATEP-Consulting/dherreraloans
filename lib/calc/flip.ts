export type FlipInput = {
  purchasePrice: number;
  renovationCost: number;
  arv: number;
  months: number;
  taxesYearly: number;
  insuranceYearly: number;
  ltvPct: number;
  annualRatePct: number;
  originationPct: number;
  otherClosingPct: number;
  costToSellPct: number;
};
export type FlipResult = {
  loanAmount: number;
  downPayment: number;
  monthlyInterest: number;
  totalInterest: number;
  originationFee: number;
  otherClosing: number;
  carryingCosts: number;
  costToSell: number;
  equityNeeded: number;
  cashInDeal: number;
  netProfit: number;
  roiPct: number;
  ltarvPct: number;
};

// Préstamo interest-only al LTV del precio de compra; la renovación la financia el
// comprador (modelo de la referencia: Borrower Equity Needed la incluye).
export function flipMetrics(input: FlipInput): FlipResult | null {
  const { purchasePrice, renovationCost, arv, months, ltvPct, annualRatePct } = input;
  if (purchasePrice <= 0 || arv <= 0 || months <= 0 || renovationCost < 0 || ltvPct < 0 || ltvPct > 100) return null;
  const loanAmount = purchasePrice * (ltvPct / 100);
  const downPayment = purchasePrice - loanAmount;
  const monthlyInterest = (loanAmount * (annualRatePct / 100)) / 12;
  const totalInterest = monthlyInterest * months;
  const originationFee = loanAmount * (input.originationPct / 100);
  const otherClosing = purchasePrice * (input.otherClosingPct / 100);
  const carryingCosts = (input.taxesYearly + input.insuranceYearly) * (months / 12);
  const costToSell = arv * (input.costToSellPct / 100);
  const equityNeeded = downPayment + renovationCost + originationFee + otherClosing;
  const cashInDeal = equityNeeded + carryingCosts + totalInterest;
  const netProfit = arv - purchasePrice - renovationCost - totalInterest - originationFee - otherClosing - carryingCosts - costToSell;
  return {
    loanAmount,
    downPayment,
    monthlyInterest,
    totalInterest,
    originationFee,
    otherClosing,
    carryingCosts,
    costToSell,
    equityNeeded,
    cashInDeal,
    netProfit,
    roiPct: (netProfit / cashInDeal) * 100,
    ltarvPct: (loanAmount / arv) * 100,
  };
}
