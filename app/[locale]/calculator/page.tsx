import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { CtaBand } from '@/components/ui/cta-band';
import { CalcTabs, type CalcSuiteTexts } from '@/components/calculator/calc-tabs';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'calculator', pathname: '/calculator' });
}

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('calculator');

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/calculator"
        image={heroPrograms}
        imageAlt={t('title')}
        eyebrow={t('title')}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      <section>
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-16">
          <SectionHeading eyebrow={t('title')} title={t('explain.title')} />
          <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('explain.body')}</p>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="px-5 py-10 lg:px-[72px] lg:py-14">
          <SectionHeading eyebrow={t('title')} title={t('calc.sectionTitle')} />
          <div className="mt-8">
            <CalcTabs locale={locale} texts={t.raw('calc') as CalcSuiteTexts} />
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
