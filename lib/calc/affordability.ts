import { monthlyPayment } from '@/lib/mortgage';
import { DTI_LIMITS, PMI_FACTOR_BY_SCORE, FHA_MIP, USDA_FEE, type Program, type CreditBand } from './constants';

export type AffordabilityInput = {
  monthlyIncome: number; monthlyDebts: number; price: number; downPayment: number;
  annualRatePct: number; years: number; propertyTaxPct: number; insuranceYearly: number;
  hoaMonthly: number; creditBand: CreditBand;
};
export type AffordabilityResult = {
  loanAmount: number; monthlyPI: number; monthlyTax: number; monthlyInsurance: number;
  monthlyHoa: number; monthlyFee: number; upfrontFee: number; totalMonthly: number;
  frontDti: number; backDti: number; limits: { front: number; back: number }; withinLimits: boolean;
};

// Simplificaciones (documentadas en la spec §3.4): FHA/USDA financian el upfront fee en el
// préstamo; el fee mensual (PMI/MIP/anual USDA) se calcula sobre el préstamo BASE; VA no
// lleva fee mensual (el funding fee se trata en lib/calc/va.ts, PR F).
export function affordability(input: AffordabilityInput, program: Program): AffordabilityResult | null {
  const { monthlyIncome, monthlyDebts, price, downPayment, annualRatePct, years } = input;
  if (monthlyIncome <= 0 || monthlyDebts < 0 || price <= 0 || downPayment < 0 || downPayment >= price || years <= 0 || annualRatePct < 0) return null;
  const base = price - downPayment;
  const downPct = (downPayment / price) * 100;
  const upfrontPct = program === 'fha' ? FHA_MIP.upfrontPct : program === 'usda' ? USDA_FEE.upfrontPct : 0;
  const upfrontFee = base * (upfrontPct / 100);
  const loanAmount = base + upfrontFee;
  const monthlyPI = monthlyPayment(loanAmount, annualRatePct, years);
  const feeYearlyPct =
    program === 'fha' ? FHA_MIP.annualPct :
    program === 'usda' ? USDA_FEE.annualPct :
    program === 'va' ? 0 :
    downPct < 20 ? PMI_FACTOR_BY_SCORE[input.creditBand] : 0;
  const monthlyFee = (base * (feeYearlyPct / 100)) / 12;
  const monthlyTax = (price * (input.propertyTaxPct / 100)) / 12;
  const monthlyInsurance = input.insuranceYearly / 12;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + input.hoaMonthly + monthlyFee;
  const frontDti = (totalMonthly / monthlyIncome) * 100;
  const backDti = ((totalMonthly + monthlyDebts) / monthlyIncome) * 100;
  const limits = DTI_LIMITS[program];
  return {
    loanAmount, monthlyPI, monthlyTax, monthlyInsurance, monthlyHoa: input.hoaMonthly,
    monthlyFee, upfrontFee, totalMonthly, frontDti, backDti,
    limits: { front: limits.front, back: limits.back },
    withinLimits: frontDti <= limits.front && backDti <= limits.back,
  };
}
