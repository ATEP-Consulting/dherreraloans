import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'loanOptions', pathname: '/loan-options' });
}

export default async function LoanOptionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('loanOptions');
  return <h1 className="text-2xl font-bold">{t('heading')}</h1>;
}
