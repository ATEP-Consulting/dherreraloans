import { describe, it, expect } from 'vitest';
import { formatMoney, parseMoney, parseRate } from '@/lib/format';

describe('formatMoney', () => {
  it('USD sin decimales por defecto', () => {
    expect(formatMoney(450000, 'en')).toBe('$450,000');
    expect(formatMoney(599.55, 'en', 2)).toBe('$599.55');
  });
  it('respeta el locale es', () => {
    expect(formatMoney(450000, 'es')).toMatch(/450/); // separadores según ICU, no se fija el literal exacto
  });
});

describe('parseMoney', () => {
  it('extrae dígitos de entrada sucia', () => {
    expect(parseMoney('$450,000')).toBe(450000);
    expect(parseMoney('45 000')).toBe(45000);
  });
  it('vacío o sin dígitos → null', () => {
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('abc')).toBeNull();
  });
});

describe('parseRate', () => {
  it('acepta punto y coma decimal', () => {
    expect(parseRate('6.5')).toBe(6.5);
    expect(parseRate('6,5')).toBe(6.5);
  });
  it('vacío o negativo → null', () => {
    expect(parseRate('')).toBeNull();
    expect(parseRate('-1')).toBeNull();
  });
});
