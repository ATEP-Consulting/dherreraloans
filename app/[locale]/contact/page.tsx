import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, whatsAppHref } from '@/lib/site';
import heroPersonal from '@/assets/img/hero-personal.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Eyebrow } from '@/components/ui/eyebrow';
import { CtaBand } from '@/components/ui/cta-band';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'contact', pathname: '/contact' });
}

const plateClass =
  'flex flex-col gap-2 border border-ink bg-plate p-6 transition hover:bg-sand';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const tc = await getTranslations('common');

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/contact"
        image={heroPersonal}
        imageAlt={t('title')}
        eyebrow={t('title')}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      <section>
        <Container className="px-5 py-10 lg:px-[72px] lg:py-16">
          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            <a href={`tel:${PHONE_TEL}`} className={plateClass}>
              <Eyebrow>{t('phone.label')}</Eyebrow>
              <span className="font-display text-h3 font-light text-ink">{PHONE_DISPLAY}</span>
            </a>
            <a href={`mailto:${EMAIL}`} className={plateClass}>
              <Eyebrow>{t('email.label')}</Eyebrow>
              <span className="break-all font-display text-h3 font-light text-ink">{EMAIL}</span>
            </a>
            <a href={whatsAppHref(tc('cta.whatsAppMessage'))} target="_blank" rel="noopener" className={plateClass}>
              <Eyebrow>{t('whatsapp.label')}</Eyebrow>
              <span className="font-sans text-base leading-[1.5] text-body">{t('whatsapp.note')}</span>
            </a>
          </div>
          <p className="mt-6 max-w-[65ch] font-sans text-fine italic text-muted">{t('pendingNote')}</p>
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
            <Button href="/quote" variant="navy">
              {tc('cta.quote')}
            </Button>
            <p className="max-w-[46ch] font-sans text-sm text-muted">{t('quoteNudge')}</p>
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
