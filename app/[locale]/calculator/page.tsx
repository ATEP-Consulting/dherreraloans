import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { CtaBand } from '@/components/ui/cta-band';

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
          <SectionHeading eyebrow={t('title')} title={t('example.title')} />
          <dl className="mt-6 grid max-w-[560px] grid-cols-2 gap-x-8 gap-y-6 border border-ink p-6 font-sans tabular-nums lg:p-8">
            <div>
              <dt className="text-micro font-medium uppercase tracking-label text-muted">{t('example.priceLabel')}</dt>
              <dd className="mt-1.5 font-display text-h3 font-light text-ink">{t('example.price')}</dd>
            </div>
            <div>
              <dt className="text-micro font-medium uppercase tracking-label text-muted">{t('example.termLabel')}</dt>
              <dd className="mt-1.5 font-display text-h3 font-light text-ink">{t('example.term')}</dd>
            </div>
            <div>
              <dt className="text-micro font-medium uppercase tracking-label text-muted">{t('example.rateLabel')}</dt>
              <dd className="mt-1.5 font-display text-h3 font-light text-ink">{t('example.rate')}</dd>
            </div>
            <div>
              <dt className="text-micro font-medium uppercase tracking-label text-muted">{t('example.paymentLabel')}</dt>
              <dd className="mt-1.5 font-display text-h3 font-light text-ink">{t('example.payment')}</dd>
            </div>
          </dl>
          <p className="mt-4 max-w-[65ch] font-sans text-fine italic text-muted">{t('example.note')}</p>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="px-5 py-10 lg:px-[72px] lg:py-14">
          <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('comingSoon.body')}</p>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
