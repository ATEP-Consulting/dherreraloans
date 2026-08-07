import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/metadata';
import { locales, pathnames, programSlugs } from '@/config/routes.mjs';

describe('sitemap multiidioma (ADR-0003 §3)', () => {
  const entries = sitemap();
  it('una entrada por página estática y programa, por idioma', () => {
    const staticRoutes = Object.keys(pathnames).filter((r) => !r.includes('[')).length;
    expect(entries).toHaveLength((staticRoutes + Object.keys(programSlugs).length) * locales.length);
  });
  it('cada entrada declara alternates en/es', () => {
    for (const e of entries) {
      expect(e.alternates?.languages?.en).toMatch(new RegExp(`^${SITE_URL}/en`));
      expect(e.alternates?.languages?.es).toMatch(new RegExp(`^${SITE_URL}/es`));
    }
  });
});
