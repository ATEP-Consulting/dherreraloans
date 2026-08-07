import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname, routing } from '@/i18n/routing';
import { slugFor } from '@/lib/programs';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dherreraloans.vercel.app';

type Params = { program?: string };

function urlFor(locale: string, pathname: string, params?: Params): string {
  const href = params?.program
    ? { pathname, params: { program: slugFor(locale, params.program) } }
    : pathname;
  return SITE_URL + getPathname({ locale, href: href as never });
}

export function hreflangAlternates(pathname: string, params?: Params) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, urlFor(locale, pathname, params)]),
  ) as Record<string, string>;
  languages['x-default'] = urlFor(routing.defaultLocale, pathname, params); // ADR-0002: EN
  return { languages };
}

const SITE_NAME = 'DherreraLoans';

export function defaultOgSlug(namespace: string): string {
  if (namespace === 'home') return 'home';
  const segments = namespace.split('.');
  return segments[segments.length - 1];
}

function ogLocale(locale: string): 'en_US' | 'es_US' {
  return locale === 'en' ? 'en_US' : 'es_US';
}

export async function buildPageMetadata(args: {
  locale: string;
  namespace: string;
  pathname: string;
  params?: Params;
  ogSlug?: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale: args.locale, namespace: args.namespace });
  const alternates = hreflangAlternates(args.pathname, args.params);
  const canonical = alternates.languages[args.locale];
  const ogSlug = args.ogSlug ?? defaultOgSlug(args.namespace);
  const locale = ogLocale(args.locale);
  const alternateLocale = locale === 'en_US' ? 'es_US' : 'en_US';
  const title =
    args.namespace === 'home' ? `${SITE_NAME} — ${t('title')}` : `${t('title')} | ${SITE_NAME}`;

  return {
    title,
    description: t('description'),
    alternates: { canonical, ...alternates },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale,
      alternateLocale,
      url: canonical,
      images: [{ url: `/og/${args.locale}/${ogSlug}.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  };
}
