import { programSlugs } from '@/config/routes.mjs';

/** Programas destacados en la home (mockup aprobado 2026-08-08), en este orden. */
export const FEATURED_PROGRAM_KEYS = ['conventional', 'fha', 'va', 'jumbo', 'investment'] as const;

export function slugFor(locale: string, key: string): string {
  return programSlugs[key as keyof typeof programSlugs][locale as 'en' | 'es'];
}

export function programKeyFromSlug(locale: string, slug: string): string | undefined {
  return Object.keys(programSlugs).find((key) => slugFor(locale, key) === slug);
}

/**
 * Programas agrupados por la intención del visitante (spec 2026-08-08, enmienda «desrayado»):
 * en `/loan-options` doce filas seguidas se leían como catálogo interminable; agrupadas son
 * tres decisiones. Cubre las 12 claves de `programSlugs` sin duplicados — lo verifica
 * `tests/unit/programs.test.ts`, así que un programa nuevo no puede quedarse huérfano.
 */
export const PROGRAM_GROUPS = [
  { key: 'buying', programs: ['conventional', 'fha', 'va', 'usda', 'firstTimeHomebuyer', 'lowDownPayment'] },
  { key: 'refinancing', programs: ['refinance', 'cashOutRefinance', 'vaRefinance'] },
  { key: 'investors', programs: ['investment', 'jumbo', 'fixedRate'] },
] as const;
