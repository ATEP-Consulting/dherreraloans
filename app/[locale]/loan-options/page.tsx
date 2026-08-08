import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { programSlugs } from '@/config/routes.mjs';
import { slugFor } from '@/lib/programs';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import programFha from '@/assets/img/program-fha.jpg';
import programConventional from '@/assets/img/program-conventional.jpg';
import programVa from '@/assets/img/program-va.jpg';
import programFirstTime from '@/assets/img/program-firstTimeHomebuyer.jpg';
import programRefinance from '@/assets/img/program-refinance.jpg';
import programFixedRate from '@/assets/img/program-fixedRate.jpg';
import programUsda from '@/assets/img/program-usda.jpg';
import programJumbo from '@/assets/img/program-jumbo.jpg';
import programLowDown from '@/assets/img/program-lowDownPayment.jpg';
import programInvestment from '@/assets/img/program-investment.jpg';
import programCashOut from '@/assets/img/program-cashOutRefinance.jpg';
import programVaRefi from '@/assets/img/program-vaRefinance.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { Band } from '@/components/ui/band';
import { ProgramsIndex, type ProgramsIndexItem } from '@/components/ui/programs-index';

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
  const th = await getTranslations('home');
  const tp = await getTranslations('programs');
  const programKeys = Object.keys(programSlugs);

  const programImages = {
    fha: programFha,
    conventional: programConventional,
    va: programVa,
    firstTimeHomebuyer: programFirstTime,
    refinance: programRefinance,
    fixedRate: programFixedRate,
    usda: programUsda,
    jumbo: programJumbo,
    lowDownPayment: programLowDown,
    investment: programInvestment,
    cashOutRefinance: programCashOut,
    vaRefinance: programVaRefi,
  } as const;
  const items: ProgramsIndexItem[] = programKeys.map((key, i) => ({
    key,
    number: th('programsIndex.rowLabel', { number: i + 1 }),
    name: tp(`${key}.indexName`),
    stat: tp(`${key}.stat`),
    description: tp(`${key}.blurb`),
    image: programImages[key as keyof typeof programImages],
    href: { pathname: '/loan-options/[program]', params: { program: slugFor(locale, key) } },
  }));

  return (
    <>
      <PageHero locale={locale} pathname="/loan-options" image={heroPrograms} imageAlt={t('title')} eyebrow={t('title')} title={t('heading')} />
      <section>
        <Container className="px-5 py-10 lg:px-[72px] lg:py-16">
          <p className="max-w-[65ch] font-sans text-lede leading-[1.65] text-body">{t('helper')}</p>
        </Container>
      </section>
      <Band tone="navy">
        <div className="flex flex-col gap-8">
          <ProgramsIndex items={items} />
        </div>
      </Band>
    </>
  );
}
