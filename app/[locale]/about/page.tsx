import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { financialServiceJsonLd } from '@/lib/jsonld';
import { NMLS_ID, NMLS_CONSUMER_ACCESS_URL, INSTAGRAM_URL } from '@/lib/site';
import heroPersonal from '@/assets/img/hero-personal.jpg';
import davidImg from '@/assets/img/david.png';
import { PageHero } from '@/components/layout/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { PhotoPlate } from '@/components/ui/photo-plate';
import { SectionHeading } from '@/components/ui/section-heading';
import { Band } from '@/components/ui/band';
import { CtaBand } from '@/components/ui/cta-band';
import { Button } from '@/components/ui/button';
import { TextLink } from '@/components/ui/text-link';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { Container } from '@/components/ui/container';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'about', pathname: '/about' });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const th = await getTranslations('home');
  const tc = await getTranslations('common');

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/about"
        image={heroPersonal}
        imageAlt={t('title')}
        eyebrow={t('title')}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      <Band tone="sand">
        <div className="grid items-center gap-6 lg:grid-cols-[400px_1fr] lg:gap-16">
          <PhotoPlate image={davidImg} alt={th('about.photoAlt')} caption={th('about.caption')} />
          <div className="flex flex-col gap-5 lg:gap-6">
            <p className="max-w-[60ch] font-display text-h3 font-light text-ink [text-wrap:pretty]">{t('mission')}</p>
            <SectionHeading eyebrow={t('heading')} title={t('story.title')} />
            <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('story.body')}</p>
          </div>
        </div>
      </Band>
      <section className="border-t border-hairline">
        <Container className="px-5 py-10 lg:px-[72px] lg:py-14">
          <h2 className="max-w-[65ch] font-display text-h2 font-light text-ink">{t('values.title')}</h2>
          <ul className="mt-6 max-w-[65ch]">
            {t.raw('values.items').map((item: string) => (
              <li key={item} className="border-b border-hairline py-4 font-sans text-base text-body">
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
          <SectionHeading eyebrow={t('heading')} title={t('license.title')} />
          <div className="flex flex-col gap-4">
            <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('license.body', { nmls: NMLS_ID })}</p>
            <TextLink href={NMLS_CONSUMER_ACCESS_URL} external>
              {t('license.linkLabel')}
            </TextLink>
          </div>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
          <SectionHeading eyebrow={t('heading')} title={t('reach.title')} />
          <div className="flex flex-col gap-4">
            <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('reach.body')}</p>
            <TextLink href={INSTAGRAM_URL} external>
              {tc('footer.instagram')}
            </TextLink>
          </div>
        </Container>
      </section>
      <CtaBand
        ctas={
          <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
            <Button href="/quote" variant="paper" size="lg">
              {tc('cta.quote')}
            </Button>
            <WhatsAppButton label={tc('cta.whatsApp')} message={tc('cta.whatsAppMessage')} />
          </div>
        }
      />
      <JsonLd data={financialServiceJsonLd(locale)} />
    </>
  );
}
