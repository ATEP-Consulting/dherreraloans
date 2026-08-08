import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { QuizDeferred } from '@/components/quiz/quiz-deferred';
import { QuizThanksCtas } from '@/components/quiz/quiz-thanks-ctas';
import type { QuizTexts } from '@/lib/quiz/texts';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'prequalify', pathname: '/pre-qualify' });
}

export default async function PreQualifyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('prequalify');
  const tq = await getTranslations('quote');
  const texts = tq.raw('quiz') as QuizTexts;

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/pre-qualify"
        image={heroPrograms}
        imageAlt={t('title')}
        eyebrow={t('title')}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      <section>
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
          <div className="reveal-rise">
            <SectionHeading eyebrow={t('why.eyebrow')} title={t('why.title')} />
          </div>
          <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('why.body')}</p>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
          <div className="reveal-rise">
            <SectionHeading eyebrow={t('credit.eyebrow')} title={t('credit.title')} />
          </div>
          <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('credit.body')}</p>
        </Container>
      </section>
      <section id="quiz" className="border-t border-hairline">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-16">
          <div className="reveal-rise">
            <SectionHeading eyebrow={t('start.eyebrow')} title={t('start.title')} helper={t('start.helper')} />
          </div>
          <QuizDeferred locale={locale} texts={texts} thanksCtas={<QuizThanksCtas />} />
        </Container>
      </section>
    </>
  );
}
