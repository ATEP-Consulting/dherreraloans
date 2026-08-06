import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, pathnames, programSlugs } from '@/config/routes.mjs';

describe('config/routes', () => {
  it('define en y es, con en como default (ADR-0002)', () => {
    expect(locales).toEqual(['en', 'es']);
    expect(defaultLocale).toBe('en');
  });

  it('todo pathname tiene slug para cada locale', () => {
    for (const [route, byLocale] of Object.entries(pathnames)) {
      for (const locale of locales) {
        expect(byLocale[locale], `${route} sin slug ${locale}`).toBeTypeOf('string');
      }
    }
  });

  it('los slugs comprometidos en el ADR-0002 existen en es', () => {
    const slugsEs = Object.values(pathnames).map((p) => p.es);
    for (const slug of ['/opciones-de-prestamo', '/cotizacion', '/calculadora', '/sobre-mi', '/contacto']) {
      expect(slugsEs).toContain(slug);
    }
  });

  it('los 5 programas tienen slug en ambos idiomas y sin duplicados', () => {
    expect(Object.keys(programSlugs).sort()).toEqual(
      ['conventional', 'fha', 'firstTimeHomebuyer', 'refinance', 'va'],
    );
    for (const locale of locales) {
      const slugs = Object.values(programSlugs).map((s) => s[locale]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});
