import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_INDEXABLE !== 'true') {
    return { rules: { userAgent: '*', disallow: '/' } }; // pre-lanzamiento (Fase 4 lo abre)
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
