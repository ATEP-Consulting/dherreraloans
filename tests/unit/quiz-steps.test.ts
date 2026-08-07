import { describe, it, expect } from 'vitest';
import { steps, visibleSteps } from '@/lib/quiz/steps';
import { stepSchemas } from '@/lib/quiz/schema';

describe('definición de pasos', () => {
  it('ids únicos y todos con schema', () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(stepSchemas[id], `sin schema: ${id}`).toBeDefined();
  });
  it('contacto es SIEMPRE el último paso visible en ambos flujos', () => {
    expect(visibleSteps({ goal: 'buy' }).at(-1)?.id).toBe('contact');
    expect(visibleSteps({ goal: 'refinance' }).at(-1)?.id).toBe('contact');
  });
  it('flujo compra: 15 pasos (16 con militar=sí), sin pasos de refi', () => {
    const buy = visibleSteps({ goal: 'buy' }).map((s) => s.id);
    expect(buy).toHaveLength(15);
    expect(buy).toContain('stage');
    expect(buy).not.toContain('refiNumbers');
    expect(visibleSteps({ goal: 'buy', military: 'yes' })).toHaveLength(16);
  });
  it('flujo refi: 14 pasos (15 con militar=sí), sin pasos de compra', () => {
    const refi = visibleSteps({ goal: 'refinance' }).map((s) => s.id);
    expect(refi).toHaveLength(14);
    expect(refi).toContain('cashOut');
    expect(refi).not.toContain('purchaseNumbers');
    expect(refi).not.toContain('firstTime');
  });
  it('sin objetivo aún: solo los pasos comunes hasta decidir flujo', () => {
    expect(visibleSteps({})[0]?.id).toBe('goal');
  });
});
