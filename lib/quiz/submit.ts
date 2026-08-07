// Envío del lead. FASE 2: transporte SIMULADO — el submit valida y resuelve como lo hará
// el pipeline real, pero NO persiste en ningún sitio (decisión de spec §2.6: demo del
// estado final para el cliente; producción sigue noindex). FASE 3: sustituir
// simulatedTransport por el POST a /api/lead. Nada más cambia.
import { payloadSchema, type QuizPayload } from './schema';

export const SUBMIT_TIMEOUT_MS = 25_000;

export type Transport = (payload: QuizPayload) => Promise<void>;

const simulatedTransport: Transport = async () => {
  // Gancho e2e para el camino de error (se elimina junto con el stub en Fase 3):
  if (typeof location !== 'undefined' && location.search.includes('e2e-fail-submit')) {
    await new Promise((r) => setTimeout(r, 300));
    throw new Error('simulated failure');
  }
  await new Promise((r) => setTimeout(r, 600));
};

export async function submitLead(raw: unknown, transport: Transport = simulatedTransport): Promise<QuizPayload> {
  const payload = payloadSchema.parse(raw);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), SUBMIT_TIMEOUT_MS);
  });
  try {
    await Promise.race([transport(payload), timeout]);
    return payload;
  } finally {
    clearTimeout(timer);
  }
}
