import { existsSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { buildPageMetadata, defaultOgSlug as defaultOgSlugFromMetadata } from '@/lib/metadata';
import { defaultOgSlug as defaultOgSlugFromScript } from '@/scripts/og-slug.mjs';

describe('metadata OG (ADR-0003 §2)', () => {
  it('openGraph con locale, alternates e imagen por idioma', async () => {
    const m = await buildPageMetadata({ locale: 'es', namespace: 'about', pathname: '/about' });
    expect(m.openGraph).toMatchObject({ locale: 'es_US', siteName: 'DherreraLoans' });
    expect(JSON.stringify(m.openGraph?.images)).toContain('/og/es/about.png');
    expect(m.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(String(m.title)).toMatch(/DherreraLoans/);
  });
});

describe('defaultOgSlug — guardia de sincronía lib/metadata.ts ↔ scripts/generate-og.mjs', () => {
  // Namespaces reales de página (mismo listado que `namespaces` en scripts/generate-og.mjs).
  const namespaces = [
    'home',
    'loanOptions',
    'programs.fha',
    'programs.conventional',
    'programs.va',
    'programs.firstTimeHomebuyer',
    'programs.refinance',
    'programs.fixedRate',
    'programs.usda',
    'programs.jumbo',
    'programs.lowDownPayment',
    'programs.investment',
    'programs.cashOutRefinance',
    'programs.vaRefinance',
    'quote',
    'calculator',
    'about',
    'contact',
    'legal.privacy',
    'legal.accessibility',
  ];

  it.each(namespaces)('%s produce el mismo slug en ambas copias y coincide con el PNG committeado', (namespace) => {
    const fromMetadata = defaultOgSlugFromMetadata(namespace);
    const fromScript = defaultOgSlugFromScript(namespace);
    expect(fromScript).toBe(fromMetadata);
    expect(existsSync(`public/og/en/${fromMetadata}.png`)).toBe(true);
    expect(existsSync(`public/og/es/${fromMetadata}.png`)).toBe(true);
  });
});
