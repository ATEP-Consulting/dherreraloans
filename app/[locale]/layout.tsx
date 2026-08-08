import type { Metadata } from 'next';
import { Spectral, Instrument_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SiteFooter } from '@/components/layout/site-footer';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE_URL } from '@/lib/metadata';
import { personJsonLd } from '@/lib/jsonld';
import './../globals.css';

const spectral = Spectral({
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-spectral',
  // 'optional': el h1 del hero es el LCP; un swap tardío repinta y dispara LCP >2.5s con throttling (gate ADR-0003)
  // preload:false — los preloads de fuente encadenan el LCP simulado (Lantern) y compiten con recursos críticos; con optional el fallback ajustado pinta al instante.
  display: 'optional',
  preload: false,
});
const instrument = Instrument_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // `Link` (de next-intl/navigation) renderiza internamente un client component
  // (BaseLink) que llama a useLocale(); necesita un NextIntlClientProvider
  // ancestro aunque `Link` se use desde un Server Component (PageHero, SiteFooter,
  // NavLinks…). Se acota `messages` al namespace `common` para no serializar el
  // resto de namespaces de página al cliente (ADR-0002: los mensajes viven en
  // Server Components).
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${spectral.variable} ${instrument.variable}`}>
      <body className="min-h-svh bg-paper text-ink antialiased">
        <JsonLd data={personJsonLd()} />
        <NextIntlClientProvider messages={{ common: messages.common }}>
          <main>{children}</main>
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
