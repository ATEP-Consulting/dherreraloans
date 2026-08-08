import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { NMLS_ID } from '@/lib/site';
import { financialServiceJsonLd } from '@/lib/jsonld';
import heroHome from '@/assets/img/hero-home.jpg';
import davidImg from '@/assets/img/david.png';
import interludeMiami from '@/assets/img/interlude-miami.jpg';
import programConventional from '@/assets/img/program-conventional.jpg';
import programFha from '@/assets/img/program-fha.jpg';
import programVa from '@/assets/img/program-va.jpg';
import programJumbo from '@/assets/img/program-jumbo.jpg';
import programInvestment from '@/assets/img/program-investment.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { SectionHeading } from '@/components/ui/section-heading';
import { Marquee } from '@/components/ui/marquee';
import { Interlude } from '@/components/ui/interlude';
import { ProgramsIndex, type ProgramsIndexItem } from '@/components/ui/programs-index';
import { Band } from '@/components/ui/band';
import { CtaBand } from '@/components/ui/cta-band';
import { PhotoPlate } from '@/components/ui/photo-plate';
import { TextLink } from '@/components/ui/text-link';
import { Container } from '@/components/ui/container';
import { ActionCards } from '@/components/ui/action-cards';
import { QuizDeferred } from '@/components/quiz/quiz-deferred';
import { QuizThanksCtas } from '@/components/quiz/quiz-thanks-ctas';
import type { QuizTexts } from '@/lib/quiz/texts';
import { FEATURED_PROGRAM_KEYS, slugFor } from '@/lib/programs';
import { INSTAGRAM_URL } from '@/lib/site';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'home', pathname: '/' });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tc = await getTranslations('common');
  const tp = await getTranslations('programs');
  const tq = await getTranslations('quote');
  const quizTexts = tq.raw('quiz') as QuizTexts;
  const em = { em: (c: React.ReactNode) => <em>{c}</em> };
  const featuredImages = {
    conventional: programConventional,
    fha: programFha,
    va: programVa,
    jumbo: programJumbo,
    investment: programInvestment,
  } as const;
  const featured: ProgramsIndexItem[] = FEATURED_PROGRAM_KEYS.map((key, i) => ({
    key,
    number: t('programsIndex.rowLabel', { number: i + 1 }),
    name: tp(`${key}.indexName`),
    stat: tp(`${key}.stat`),
    image: featuredImages[key],
    href: { pathname: '/loan-options/[program]', params: { program: slugFor(locale, key) } },
  }));

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/"
        variant="home"
        image={heroHome}
        imageAlt={t('hero.imageAlt')}
        eyebrow={t('hero.eyebrow')}
        eyebrowMobile={t('hero.eyebrowMobile', { nmls: NMLS_ID })}
        title={t.rich('hero.title', em)}
        body={t('hero.body')}
        bodyMobile={t('hero.bodyMobile')}
        ctas={
          <>
            <Button href="/quote" variant="paper" size="lg">{tc('cta.quote')}</Button>
            <WhatsAppButton label={tc('cta.whatsApp')} message={tc('cta.whatsAppMessage')} />
          </>
        }
      />
      <Marquee lead={t('cities.lead')} items={t.raw('cities.items') as string[]} />
      <section id="quiz">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-16">
          <div className="reveal-rise">
            <SectionHeading eyebrow={t('tellUs.eyebrow')} title={t('tellUs.title')} helper={t('tellUs.helper')} />
          </div>
          <QuizDeferred locale={locale} texts={quizTexts} thanksCtas={<QuizThanksCtas />} />
        </Container>
      </section>
      <Band tone="navy">
        <div className="flex flex-col gap-8">
          <div className="reveal-rise">
            <SectionHeading tone="navy" eyebrow={t('programsIndex.eyebrow')} title={t('programsIndex.title')} helper={t('programsIndex.helper')} />
          </div>
          <ProgramsIndex items={featured} viewAll={{ label: t('programsIndex.viewAll') }} />
        </div>
      </Band>
      <Interlude image={interludeMiami} alt={t('interlude.imageAlt')} quote={t('interlude.quote')} cite={t('interlude.cite')} />
      <Band tone="sand">
        <div className="grid items-center gap-6 lg:grid-cols-[400px_1fr] lg:gap-16">
          <div className="reveal-curtain-l">
            <PhotoPlate image={davidImg} alt={t('about.photoAlt')} caption={t('about.caption')} />
          </div>
          <div className="reveal-rise flex flex-col gap-4 lg:gap-5">
            <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
            <p className="max-w-[620px] font-sans text-base leading-[1.7] text-body">{t('about.body')}</p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
              <Button href="/quote" variant="navy">{tc('cta.quote')}</Button>
              <TextLink href={INSTAGRAM_URL} external>{tc('footer.instagram')}</TextLink>
            </div>
          </div>
        </div>
      </Band>
      <ActionCards />
      <CtaBand />
      <JsonLd data={financialServiceJsonLd(locale)} />
    </>
  );
}
