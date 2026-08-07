import { z } from 'zod';

const money = z.number().int().min(0).max(50_000_000);
const moneyOrUnsure = z.union([money, z.literal('unsure')]);

export const fieldSchemas = {
  goal: z.enum(['buy', 'refinance']),
  location: z.string().trim().min(2).max(80),
  propertyType: z.enum(['singleFamily', 'townhouse', 'condo', 'multiUnit', 'other']),
  stage: z.enum(['research', 'looking', 'offerAccepted', 'underContract']),
  use: z.enum(['primary', 'second', 'investment']),
  military: z.enum(['yes', 'no']),
  militaryBranch: z.enum(['army', 'navy', 'airForce', 'marines', 'coastGuard', 'guardReserves']),
  hasAgent: z.enum(['yes', 'notYet']),
  firstTime: z.enum(['yes', 'no']),
  purchasePrice: money.min(1),
  downPayment: moneyOrUnsure,
  propertyValue: money.min(1),
  currentBalance: money.min(1),
  currentRate: z.union([z.number().min(0).max(25), z.literal('unsure')]),
  secondMortgage: z.enum(['yes', 'no']),
  cashOut: z.enum(['yes', 'no', 'unsure']),
  employment: z.enum(['employed', 'selfEmployed', 'retired', 'other']),
  income: z.enum(['under50k', '50to100k', '100to150k', 'over150k', 'discuss']),
  credit: z.enum(['excellent', 'good', 'fair', 'needsWork', 'unknown']),
  history: z.enum(['none', 'over4y', 'within4y']),
  status: z.enum(['citizen', 'permanentResident', 'workVisa', 'otherStatus', 'discuss']),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.email().max(120),
  phone: z.string().trim().regex(/^[+()\d\s.-]{7,20}$/),
} as const;

export const stepSchemas = {
  goal: z.object({ goal: fieldSchemas.goal }),
  location: z.object({ location: fieldSchemas.location }),
  propertyType: z.object({ propertyType: fieldSchemas.propertyType }),
  stage: z.object({ stage: fieldSchemas.stage }),
  use: z.object({ use: fieldSchemas.use }),
  military: z.object({ military: fieldSchemas.military }),
  militaryBranch: z.object({ militaryBranch: fieldSchemas.militaryBranch }),
  hasAgent: z.object({ hasAgent: fieldSchemas.hasAgent }),
  firstTime: z.object({ firstTime: fieldSchemas.firstTime }),
  purchaseNumbers: z.object({ purchasePrice: fieldSchemas.purchasePrice, downPayment: fieldSchemas.downPayment }),
  refiNumbers: z.object({
    propertyValue: fieldSchemas.propertyValue,
    currentBalance: fieldSchemas.currentBalance,
    currentRate: fieldSchemas.currentRate,
  }),
  secondMortgage: z.object({ secondMortgage: fieldSchemas.secondMortgage }),
  cashOut: z.object({ cashOut: fieldSchemas.cashOut }),
  employment: z.object({ employment: fieldSchemas.employment }),
  income: z.object({ income: fieldSchemas.income }),
  credit: z.object({ credit: fieldSchemas.credit }),
  history: z.object({ history: fieldSchemas.history }),
  status: z.object({ status: fieldSchemas.status }),
  contact: z.object({
    firstName: fieldSchemas.firstName,
    lastName: fieldSchemas.lastName,
    email: fieldSchemas.email,
    phone: fieldSchemas.phone,
  }),
} as const;

const CONDITIONAL: Record<'buy' | 'refinance', (keyof typeof fieldSchemas)[]> = {
  buy: ['stage', 'hasAgent', 'firstTime', 'purchasePrice', 'downPayment'],
  refinance: ['propertyValue', 'currentBalance', 'currentRate', 'secondMortgage', 'cashOut'],
};

export const payloadSchema = z
  .object(fieldSchemas)
  .partial({
    stage: true,
    hasAgent: true,
    firstTime: true,
    purchasePrice: true,
    downPayment: true,
    propertyValue: true,
    currentBalance: true,
    currentRate: true,
    secondMortgage: true,
    cashOut: true,
    militaryBranch: true,
  })
  .superRefine((data, ctx) => {
    for (const key of CONDITIONAL[data.goal]) {
      if (data[key] === undefined) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'required' });
      }
    }
    if (data.military === 'yes' && data.militaryBranch === undefined) {
      ctx.addIssue({ code: 'custom', path: ['militaryBranch'], message: 'required' });
    }
  });

export type QuizPayload = z.infer<typeof payloadSchema>;
export type Answers = Partial<QuizPayload>;
export type StepId = keyof typeof stepSchemas;
