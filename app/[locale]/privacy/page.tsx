import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import heroPersonal from '@/assets/img/hero-personal.jpg';
import { PageHero } from '@/components/layout/page-hero';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'legal.privacy', pathname: '/privacy' });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.privacy');
  return (
    <PageHero locale={locale} pathname="/privacy" image={heroPersonal} imageAlt={t('title')} eyebrow={t('title')} title={t('heading')} />
  );
}
