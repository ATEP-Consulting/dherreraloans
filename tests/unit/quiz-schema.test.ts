import { describe, it, expect, expectTypeOf } from 'vitest';
import { stepSchemas, payloadSchema, type QuizPayload } from '@/lib/quiz/schema';

const buyPayload = {
  goal: 'buy', location: 'Miami 33130', propertyType: 'singleFamily', stage: 'looking',
  use: 'primary', military: 'no', hasAgent: 'notYet', firstTime: 'yes',
  purchasePrice: 450000, downPayment: 45000, employment: 'employed', income: '50to100k',
  credit: 'good', history: 'none', status: 'permanentResident',
  firstName: 'Ana', lastName: 'García', email: 'ana@example.com', phone: '+1 305 555 0101',
};
const refiPayload = {
  goal: 'refinance', location: 'Hialeah', propertyType: 'condo', use: 'primary',
  military: 'yes', militaryBranch: 'navy', propertyValue: 380000, currentBalance: 210000,
  currentRate: 'unsure', secondMortgage: 'no', cashOut: 'unsure', employment: 'selfEmployed',
  income: 'discuss', credit: 'unknown', history: 'over4y', status: 'citizen',
  firstName: 'Luis', lastName: 'Pérez', email: 'luis@example.com', phone: '(305) 555-0102',
};

describe('stepSchemas', () => {
  it('valida un paso aislado', () => {
    expect(stepSchemas.goal.safeParse({ goal: 'buy' }).success).toBe(true);
    expect(stepSchemas.goal.safeParse({ goal: 'other' }).success).toBe(false);
    expect(stepSchemas.purchaseNumbers.safeParse({ purchasePrice: 450000, downPayment: 'unsure' }).success).toBe(true);
    expect(stepSchemas.purchaseNumbers.safeParse({ purchasePrice: 450000 }).success).toBe(false);
    expect(stepSchemas.contact.safeParse({ firstName: 'A', lastName: 'B', email: 'no-es-email', phone: '3055550101' }).success).toBe(false);
  });
});

describe('payloadSchema', () => {
  it('acepta los payloads completos de ambos flujos', () => {
    expect(payloadSchema.safeParse(buyPayload).success).toBe(true);
    expect(payloadSchema.safeParse(refiPayload).success).toBe(true);
  });
  it('rechaza compra sin sus campos condicionales', () => {
    const { purchasePrice, ...sinPrecio } = buyPayload;
    expect(payloadSchema.safeParse(sinPrecio).success).toBe(false);
  });
  it('rechaza refi sin sus campos condicionales', () => {
    const { cashOut, ...sinCashOut } = refiPayload;
    expect(payloadSchema.safeParse(sinCashOut).success).toBe(false);
  });
  it('rechaza militar=yes sin rama', () => {
    expect(payloadSchema.safeParse({ ...buyPayload, military: 'yes' }).success).toBe(false);
  });
  it('malicioso: tipos cambiados y strings gigantes → rechazo', () => {
    expect(payloadSchema.safeParse({ ...buyPayload, purchasePrice: 'DROP TABLE' }).success).toBe(false);
    expect(payloadSchema.safeParse({ ...buyPayload, location: 'x'.repeat(5000) }).success).toBe(false);
  });
  it('QuizPayload conserva los campos condicionales en el tipo', () => {
    expectTypeOf<QuizPayload['purchasePrice']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<QuizPayload['downPayment']>().toEqualTypeOf<number | 'unsure' | undefined>();
    expectTypeOf<QuizPayload['stage']>().toEqualTypeOf<'research' | 'looking' | 'offerAccepted' | 'underContract' | undefined>();
    expectTypeOf<QuizPayload['militaryBranch']>().toEqualTypeOf<'army' | 'navy' | 'airForce' | 'marines' | 'coastGuard' | 'guardReserves' | undefined>();
  });
});
