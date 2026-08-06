import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

function flatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object'
      ? flatKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

describe('paridad de mensajes EN/ES', () => {
  it('mismas claves exactamente', () => {
    expect(flatKeys(es).sort()).toEqual(flatKeys(en).sort());
  });
  it('ninguna clave con valor vacío', () => {
    for (const messages of [en, es]) {
      for (const key of flatKeys(messages)) {
        const value = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], messages);
        expect(String(value).trim(), key).not.toHaveLength(0);
      }
    }
  });
});
