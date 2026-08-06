import { programSlugs } from '@/config/routes.mjs';

export function slugFor(locale: string, key: string): string {
  return programSlugs[key as keyof typeof programSlugs][locale as 'en' | 'es'];
}

export function programKeyFromSlug(locale: string, slug: string): string | undefined {
  return Object.keys(programSlugs).find((key) => slugFor(locale, key) === slug);
}
