import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { faqPageJsonLd } from '@/lib/jsonld';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { CtaBand } from '@/components/ui/cta-band';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'learn', pathname: '/learn' });
}

type Item = { q: string; a: string };

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('learn');
  const items = t.raw('items') as Item[];

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/learn"
        image={heroPrograms}
        imageAlt={t('title')}
        eyebrow={t('title')}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      {items.map((item, i) => (
        <section key={item.q} className={i > 0 ? 'border-t border-hairline' : undefined}>
          <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
            <SectionHeading eyebrow={t('title')} title={item.q} />
            <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{item.a}</p>
          </Container>
        </section>
      ))}
      <CtaBand />
      <JsonLd data={faqPageJsonLd(locale)} />
    </>
  );
}
