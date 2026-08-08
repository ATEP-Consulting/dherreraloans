import { describe, it, expect } from 'vitest';
import { PROGRAM_GROUPS, programKeyFromSlug, slugFor } from '@/lib/programs';
import { programSlugs } from '@/config/routes.mjs';

describe('lib/programs', () => {
  it('resuelve slug localizado → clave interna', () => {
    expect(programKeyFromSlug('es', 'prestamos-fha')).toBe('fha');
    expect(programKeyFromSlug('en', 'fha-loans')).toBe('fha');
  });
  it('devuelve undefined para slug desconocido (→ notFound en la página)', () => {
    expect(programKeyFromSlug('en', 'prestamos-fha')).toBeUndefined();
  });
  it('slugFor es la inversa de programKeyFromSlug', () => {
    expect(slugFor('es', 'refinance')).toBe('refinanciamiento');
    expect(programKeyFromSlug('es', slugFor('es', 'va'))).toBe('va');
  });
});

describe('PROGRAM_GROUPS', () => {
  const grouped = PROGRAM_GROUPS.flatMap((g) => g.programs as readonly string[]);

  it('cubre las 12 claves de programa exactamente una vez', () => {
    expect([...grouped].sort()).toEqual(Object.keys(programSlugs).sort());
  });

  it('no repite ningún programa entre grupos', () => {
    expect(new Set(grouped).size).toBe(grouped.length);
  });
});
