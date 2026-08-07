import { monthlyPayment } from '@/lib/mortgage';

export type CurrentLoan = { balance: number; annualRatePct: number; remainingYears: number };
export type NewLoan = { annualRatePct: number; years: number; cashOut: number; costs: number; financeCosts: boolean };
export type RefinanceResult = {
  currentMonthly: number; newMonthly: number; monthlySavings: number; newLoanAmount: number;
  currentRemainingInterest: number; newTotalInterest: number; interestDifference: number;
  breakEvenMonths: number | null;
};

export function refinanceComparison(current: CurrentLoan, next: NewLoan): RefinanceResult | null {
  if (current.balance <= 0 || current.remainingYears <= 0 || next.years <= 0 || current.annualRatePct < 0 || next.annualRatePct < 0 || next.cashOut < 0 || next.costs < 0) return null;
  const currentMonthly = monthlyPayment(current.balance, current.annualRatePct, current.remainingYears);
  const newLoanAmount = current.balance + next.cashOut + (next.financeCosts ? next.costs : 0);
  const newMonthly = monthlyPayment(newLoanAmount, next.annualRatePct, next.years);
  const monthlySavings = currentMonthly - newMonthly;
  const currentRemainingInterest = currentMonthly * current.remainingYears * 12 - current.balance;
  const newTotalInterest = newMonthly * next.years * 12 - newLoanAmount;
  return {
    currentMonthly, newMonthly, monthlySavings, newLoanAmount,
    currentRemainingInterest, newTotalInterest,
    interestDifference: currentRemainingInterest - newTotalInterest,
    breakEvenMonths: monthlySavings > 0 ? Math.ceil(next.costs / monthlySavings) : null,
  };
}
