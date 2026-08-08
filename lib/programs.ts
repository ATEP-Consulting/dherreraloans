import { programSlugs } from '@/config/routes.mjs';

/** Programas destacados en la home (mockup aprobado 2026-08-08), en este orden. */
export const FEATURED_PROGRAM_KEYS = ['conventional', 'fha', 'va', 'jumbo', 'investment'] as const;

export function slugFor(locale: string, key: string): string {
  return programSlugs[key as keyof typeof programSlugs][locale as 'en' | 'es'];
}

export function programKeyFromSlug(locale: string, slug: string): string | undefined {
  return Object.keys(programSlugs).find((key) => slugFor(locale, key) === slug);
}
