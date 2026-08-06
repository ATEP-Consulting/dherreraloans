import type { MetadataRoute } from 'next';
import { pathnames, programSlugs, locales } from '@/config/routes.mjs';
import { hreflangAlternates } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = Object.keys(pathnames).filter((p) => !p.includes('['));
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    const alternates = hreflangAlternates(route);
    for (const locale of locales) {
      entries.push({ url: alternates.languages[locale], alternates });
    }
  }
  for (const key of Object.keys(programSlugs)) {
    const alternates = hreflangAlternates('/loan-options/[program]', { program: key });
    for (const locale of locales) {
      entries.push({ url: alternates.languages[locale], alternates });
    }
  }
  return entries;
}
