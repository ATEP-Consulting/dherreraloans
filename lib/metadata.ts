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

export async function buildPageMetadata(args: {
  locale: string;
  namespace: string;
  pathname: string;
  params?: Params;
}): Promise<Metadata> {
  const t = await getTranslations({ locale: args.locale, namespace: args.namespace });
  const alternates = hreflangAlternates(args.pathname, args.params);
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: alternates.languages[args.locale], ...alternates },
  };
}
