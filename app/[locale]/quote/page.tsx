import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { Quiz } from '@/components/quiz/quiz';
import { QuizThanksCtas } from '@/components/quiz/quiz-thanks-ctas';
import type { QuizTexts } from '@/lib/quiz/texts';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'quote', pathname: '/quote' });
}

export default async function QuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('quote');
  const texts = t.raw('quiz') as QuizTexts;

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/quote"
        image={heroPrograms}
        imageAlt={t('title')}
        eyebrow={t('title')}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      <section>
        <Container className="px-5 py-10 lg:px-[72px] lg:py-16">
          <Quiz locale={locale} texts={texts} thanksCtas={<QuizThanksCtas />} />
        </Container>
      </section>
    </>
  );
}
