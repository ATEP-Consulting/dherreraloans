import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, whatsAppHref } from '@/lib/site';
import heroPersonal from '@/assets/img/hero-personal.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Band } from '@/components/ui/band';
import { SectionHeading } from '@/components/ui/section-heading';
import { ContactChannels, type ContactChannel } from '@/components/ui/contact-channels';
import { Container } from '@/components/ui/container';
import { CtaBand } from '@/components/ui/cta-band';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'contact', pathname: '/contact' });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const tc = await getTranslations('common');

  const channels: ContactChannel[] = [
    { key: 'whatsapp', label: t('whatsapp.label'), value: t('whatsapp.action'), note: t('whatsapp.note'), href: whatsAppHref(tc('cta.whatsAppMessage')) },
    { key: 'phone', label: t('phone.label'), value: PHONE_DISPLAY, note: t('phone.note'), href: `tel:${PHONE_TEL}` },
    { key: 'email', label: t('email.label'), value: EMAIL, note: t('email.note'), href: `mailto:${EMAIL}` },
    { key: 'form', label: t('form.label'), value: t('form.action'), note: t('form.note'), href: '/quote', internal: true },
  ];

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/contact"
        image={heroPersonal}
        imageAlt={t('imageAlt')}
        eyebrow={t('eyebrow')}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      <Band tone="navy">
        <div className="flex flex-col gap-8">
          <div className="reveal-rise">
            <SectionHeading tone="navy" eyebrow={t('channels.eyebrow')} title={t('channels.title')} />
          </div>
          <ContactChannels channels={channels} />
        </div>
      </Band>
      <section className="border-b border-hairline bg-paper">
        <Container className="px-5 py-5 lg:px-[72px]">
          <p className="max-w-[75ch] font-sans text-fine italic text-muted">{t('pendingNote')}</p>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
