import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { programSlugs } from '@/config/routes.mjs';
import { NMLS_ID } from '@/lib/site';
import { financialServiceJsonLd } from '@/lib/jsonld';
import heroHome from '@/assets/img/hero-home.jpg';
import davidImg from '@/assets/img/david.png';
import { PageHero } from '@/components/layout/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { CitiesStrip } from '@/components/ui/cities-strip';
import { SectionHeading } from '@/components/ui/section-heading';
import { IndexRow } from '@/components/ui/index-row';
import { Band } from '@/components/ui/band';
import { CtaBand } from '@/components/ui/cta-band';
import { PhotoPlate } from '@/components/ui/photo-plate';
import { TextLink } from '@/components/ui/text-link';
import { Container } from '@/components/ui/container';
import { ActionCards } from '@/components/ui/action-cards';
import { slugFor } from '@/lib/programs';
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
  const programKeys = Object.keys(programSlugs);
  const em = { em: (c: React.ReactNode) => <em>{c}</em> };

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
      <CitiesStrip lead={t('cities.lead')} list={t('cities.list')} />
      <section>
        <Container className="grid gap-6 px-5 py-8 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-[72px]">
          <SectionHeading eyebrow={t('programsIndex.eyebrow')} title={t('programsIndex.title')} helper={t('programsIndex.helper')} />
          <div className="flex flex-col">
            {programKeys.map((key, i) => (
              <IndexRow
                key={key}
                number={t('programsIndex.rowLabel', { number: i + 1 })}
                name={tp(`${key}.indexName`)}
                stat={tp(`${key}.stat`)}
                href={{ pathname: '/loan-options/[program]', params: { program: slugFor(locale, key) } }}
              />
            ))}
          </div>
        </Container>
      </section>
      <Band tone="sand">
        <div className="grid items-center gap-6 lg:grid-cols-[400px_1fr] lg:gap-16">
          <PhotoPlate image={davidImg} alt={t('about.photoAlt')} caption={t('about.caption')} />
          <div className="flex flex-col gap-4 lg:gap-5">
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
