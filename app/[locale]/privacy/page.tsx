import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import heroPersonal from '@/assets/img/hero-personal.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: 'legal.privacy', pathname: '/privacy' });
}

type Section = { title: string; body: string };

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal.privacy');
  const sections = t.raw('sections') as Section[];

  return (
    <>
      <PageHero locale={locale} pathname="/privacy" image={heroPersonal} imageAlt={t('title')} eyebrow={t('title')} title={t('heading')} />
      <section>
        <Container className="px-5 py-10 lg:px-[72px] lg:py-16">
          <div className="mx-auto flex max-w-[65ch] flex-col gap-10">
            {sections.map((s) => (
              <div key={s.title} className="flex flex-col gap-3">
                <h2 className="font-display text-h3 font-light text-ink">{s.title}</h2>
                <p className="font-sans text-base leading-[1.7] text-body">{s.body}</p>
              </div>
            ))}
            <p className="border-t border-hairline pt-6 font-sans text-fine italic text-muted">{t('pendingLegal')}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
