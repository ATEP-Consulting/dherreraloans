import { describe, it, expect, vi, afterEach } from 'vitest';
import { submitLead, SUBMIT_TIMEOUT_MS } from '@/lib/quiz/submit';

const valid = {
  goal: 'buy', location: 'Miami', propertyType: 'condo', stage: 'research', use: 'primary',
  military: 'no', hasAgent: 'yes', firstTime: 'no', purchasePrice: 300000, downPayment: 'unsure',
  employment: 'employed', income: 'under50k', credit: 'fair', history: 'none', status: 'workVisa',
  firstName: 'Ana', lastName: 'García', email: 'ana@example.com', phone: '3055550101',
};

afterEach(() => vi.useRealTimers());

describe('submitLead', () => {
  it('payload inválido → rechaza SIN llamar al transporte', async () => {
    const transport = vi.fn();
    await expect(submitLead({ goal: 'buy' }, transport)).rejects.toThrow();
    expect(transport).not.toHaveBeenCalled();
  });
  it('payload válido → llama al transporte con el payload parseado y resuelve', async () => {
    const transport = vi.fn().mockResolvedValue(undefined);
    const result = await submitLead(valid, transport);
    expect(transport).toHaveBeenCalledOnce();
    expect(result.email).toBe('ana@example.com');
  });
  it('error del transporte se propaga', async () => {
    await expect(submitLead(valid, () => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
  });
  it('transporte colgado → rechaza al vencer el timeout', async () => {
    vi.useFakeTimers();
    const hanging = () => new Promise<void>(() => {});
    const promise = submitLead(valid, hanging);
    const assertion = expect(promise).rejects.toThrow('timeout');
    await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS + 1);
    await assertion;
  });
});
