import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/metadata';

describe('sitemap multiidioma (ADR-0003 §3)', () => {
  const entries = sitemap();
  it('incluye las 13 páginas × 2 idiomas', () => {
    expect(entries).toHaveLength(26); // 8 estáticas + 5 programas, por idioma
  });
  it('cada entrada declara alternates en/es', () => {
    for (const e of entries) {
      expect(e.alternates?.languages?.en).toMatch(new RegExp(`^${SITE_URL}/en`));
      expect(e.alternates?.languages?.es).toMatch(new RegExp(`^${SITE_URL}/es`));
    }
  });
});
