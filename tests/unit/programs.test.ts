import { describe, it, expect } from 'vitest';
import { programKeyFromSlug, slugFor } from '@/lib/programs';

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
