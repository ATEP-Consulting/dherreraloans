// Motor puro del cuestionario (ADR-0007): reducer sin efectos + persistencia aparte.
// La validación por paso NO vive aquí (la hace el componente con stepSchemas antes de 'next').
import type { Answers, StepId } from './schema';
import { steps, visibleSteps } from './steps';

export const STORAGE_KEY = 'dhl-quiz-v1';

export type QuizStatus = 'idle' | 'submitting' | 'error' | 'done';
export type QuizState = { answers: Answers; stepId: StepId; status: QuizStatus };
export type QuizAction =
  | { type: 'answer'; patch: Partial<Answers> }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'rehydrate'; state: QuizState }
  | { type: 'submitStart' }
  | { type: 'submitError' }
  | { type: 'submitDone' };

export function initialState(): QuizState {
  return { answers: {}, stepId: 'goal', status: 'idle' };
}

function indexOf(stepId: StepId, answers: Answers): number {
  return visibleSteps(answers).findIndex((s) => s.id === stepId);
}

/** Elimina respuestas cuyos pasos ya no son visibles (p. ej. al cambiar de flujo). */
function prune(answers: Answers): Answers {
  const visibleKeys = new Set(visibleSteps(answers).flatMap((s) => s.fieldKeys));
  const pruned: Answers = {};
  for (const [key, value] of Object.entries(answers)) {
    if (visibleKeys.has(key as keyof Answers)) (pruned as Record<string, unknown>)[key] = value;
  }
  return pruned;
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'answer': {
      const answers = prune({ ...state.answers, ...action.patch });
      return { ...state, answers };
    }
    case 'next': {
      const visible = visibleSteps(state.answers);
      const i = indexOf(state.stepId, state.answers);
      const nextStep = visible[Math.min(i + 1, visible.length - 1)];
      return { ...state, stepId: nextStep.id };
    }
    case 'back': {
      const visible = visibleSteps(state.answers);
      const i = indexOf(state.stepId, state.answers);
      return { ...state, stepId: visible[Math.max(i - 1, 0)].id, status: 'idle' };
    }
    case 'rehydrate':
      return action.state;
    case 'submitStart':
      return { ...state, status: 'submitting' };
    case 'submitError':
      return { ...state, status: 'error' };
    case 'submitDone':
      return { ...state, status: 'done' };
  }
}

export function progressOf(state: QuizState): { current: number; total: number } {
  const visible = visibleSteps(state.answers);
  return { current: Math.max(indexOf(state.stepId, state.answers), 0) + 1, total: visible.length };
}

export function saveState(state: QuizState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, status: 'idle' }));
  } catch {
    /* modo privado / storage lleno: el quiz sigue en memoria */
  }
}

export function loadState(): QuizState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizState;
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof parsed.answers !== 'object' || parsed.answers === null) return null;
    if (!steps.some((s) => s.id === parsed.stepId)) return null;
    return { answers: parsed.answers, stepId: parsed.stepId, status: 'idle' };
  } catch {
    return null;
  }
}
