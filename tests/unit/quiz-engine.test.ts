import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initialState, quizReducer, progressOf, saveState, loadState, STORAGE_KEY } from '@/lib/quiz/engine';

function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() { return map.size; },
  } as Storage;
}

beforeEach(() => vi.stubGlobal('sessionStorage', makeStorage()));

describe('quizReducer', () => {
  it('answer registra sin avanzar; next/back navegan por pasos visibles', () => {
    let s = initialState();
    s = quizReducer(s, { type: 'answer', patch: { goal: 'buy' } });
    expect(s.stepId).toBe('goal');
    s = quizReducer(s, { type: 'next' });
    expect(s.stepId).toBe('location');
    s = quizReducer(s, { type: 'back' });
    expect(s.stepId).toBe('goal');
    expect(quizReducer(s, { type: 'back' }).stepId).toBe('goal'); // no sale por abajo
  });
  it('cambiar de flujo poda las respuestas del flujo abandonado', () => {
    let s = initialState();
    s = quizReducer(s, { type: 'answer', patch: { goal: 'buy' } });
    s = quizReducer(s, { type: 'answer', patch: { stage: 'looking', purchasePrice: 450000 } });
    s = quizReducer(s, { type: 'answer', patch: { goal: 'refinance' } });
    expect(s.answers.stage).toBeUndefined();
    expect(s.answers.purchasePrice).toBeUndefined();
    expect(s.answers.goal).toBe('refinance');
  });
  it('militar no→sí añade el paso de rama al total', () => {
    let s = initialState();
    s = quizReducer(s, { type: 'answer', patch: { goal: 'buy' } });
    const before = progressOf(s).total;
    s = quizReducer(s, { type: 'answer', patch: { military: 'yes' } });
    expect(progressOf(s).total).toBe(before + 1);
  });
  it('progressOf: goal es 1/N', () => {
    const p = progressOf(initialState());
    expect(p.current).toBe(1);
    expect(p.total).toBeGreaterThan(1);
  });
});

describe('persistencia', () => {
  it('save→load redondo', () => {
    let s = initialState();
    s = quizReducer(s, { type: 'answer', patch: { goal: 'refinance' } });
    s = quizReducer(s, { type: 'next' });
    saveState(s);
    expect(loadState()).toEqual({ ...s, status: 'idle' });
  });
  it('JSON corrupto → null', () => {
    sessionStorage.setItem(STORAGE_KEY, '{no es json');
    expect(loadState()).toBeNull();
  });
  it('stepId desconocido o answers no-objeto → null', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: {}, stepId: 'hackeado', status: 'idle' }));
    expect(loadState()).toBeNull();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: 'x', stepId: 'goal', status: 'idle' }));
    expect(loadState()).toBeNull();
  });
  it('sessionStorage que lanza (modo privado) → save silencioso y load null', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
    } as unknown as Storage);
    expect(() => saveState(initialState())).not.toThrow();
    expect(loadState()).toBeNull();
  });
});
