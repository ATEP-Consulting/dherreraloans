import { describe, it, expect } from 'vitest';
import { hreflangAlternates, SITE_URL } from '@/lib/metadata';

describe('hreflangAlternates', () => {
  it('genera canonical por idioma y x-default → EN (ADR-0002/0003)', () => {
    const alt = hreflangAlternates('/about');
    expect(alt.languages['x-default']).toBe(`${SITE_URL}/en/about`);
    expect(alt.languages.en).toBe(`${SITE_URL}/en/about`);
    expect(alt.languages.es).toBe(`${SITE_URL}/es/sobre-mi`);
  });
  it('soporta rutas con params de programa', () => {
    const alt = hreflangAlternates('/loan-options/[program]', { program: 'fha' });
    expect(alt.languages.en).toBe(`${SITE_URL}/en/loan-options/fha-loans`);
    expect(alt.languages.es).toBe(`${SITE_URL}/es/opciones-de-prestamo/prestamos-fha`);
  });
});
