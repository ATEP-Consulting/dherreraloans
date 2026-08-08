import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/metadata';
import { PROGRAM_GROUPS, slugFor } from '@/lib/programs';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { Band } from '@/components/ui/band';
import { ProgramGroups, type ProgramGroup } from '@/components/ui/program-groups';

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
  const tp = await getTranslations('programs');

  const groups: ProgramGroup[] = PROGRAM_GROUPS.map((group) => ({
    key: group.key,
    title: t(`groups.${group.key}`),
    programs: group.programs.map((key) => ({
      key,
      name: tp(`${key}.indexName`),
      stat: tp(`${key}.stat`),
      href: { pathname: '/loan-options/[program]', params: { program: slugFor(locale, key) } },
    })),
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
          <ProgramGroups groups={groups} />
        </div>
      </Band>
    </>
  );
}
