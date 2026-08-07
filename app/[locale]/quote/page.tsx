import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { CtaBand } from '@/components/ui/cta-band';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'quote', pathname: '/quote' });
}

type Step = { title: string; line: string };

export default async function QuotePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('quote');
  const tc = await getTranslations('common');
  const steps = t.raw('steps.items') as Step[];

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/quote"
        image={heroPrograms}
        imageAlt={t('title')}
        eyebrow={t('title')}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      <section>
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-16">
          <SectionHeading eyebrow={t('title')} title={t('steps.title')} />
          <ul className="max-w-[65ch]">
            {steps.map((step) => (
              <li key={step.title} className="border-b border-hairline py-4">
                <p className="font-sans text-base font-semibold text-ink">{step.title}</p>
                <p className="mt-1 font-sans text-base leading-[1.7] text-body">{step.line}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
          <SectionHeading eyebrow={t('title')} title={t('meanwhile.title')} />
          <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('meanwhile.body')}</p>
        </Container>
      </section>
      <CtaBand
        ctas={
          <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
            <Button href="/contact" variant="paper" size="lg">
              {t('meanwhile.cta')}
            </Button>
            <WhatsAppButton label={tc('cta.whatsApp')} message={tc('cta.whatsAppMessage')} />
          </div>
        }
      />
    </>
  );
}
