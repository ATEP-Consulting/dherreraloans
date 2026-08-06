import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, Link } from '@/i18n/routing';
import { LocaleSwitcher } from '@/components/locale-switcher';
import './../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dherreraloans.vercel.app'),
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
  const t = await getTranslations('common');
  // `Link` (de next-intl/navigation) renderiza internamente un client component
  // (BaseLink) que llama a useLocale(); necesita un NextIntlClientProvider
  // ancestro aunque `Link` se use desde un Server Component. Se acota `messages`
  // al namespace `common` para no serializar el resto de namespaces de página
  // al cliente (ADR-0002: los mensajes viven en Server Components).
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-svh bg-white text-slate-900 antialiased">
        <NextIntlClientProvider messages={{ common: messages.common }}>
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
            <Link href="/" className="font-bold">{t('brand')}</Link>
            <nav aria-label={t('nav.home')} className="flex flex-wrap gap-4 text-sm">
              <Link href="/loan-options">{t('nav.loanOptions')}</Link>
              <Link href="/quote">{t('nav.quote')}</Link>
              <Link href="/calculator">{t('nav.calculator')}</Link>
              <Link href="/about">{t('nav.about')}</Link>
              <Link href="/contact">{t('nav.contact')}</Link>
            </nav>
            <LocaleSwitcher />
          </header>
        </NextIntlClientProvider>
        <main className="p-4">{children}</main>
        <footer className="border-t border-slate-200 p-4 text-sm text-slate-500">
          <p>{t('footer.tagline')}</p>
          <p>{t('footer.nmls')}</p>
        </footer>
      </body>
    </html>
  );
}
