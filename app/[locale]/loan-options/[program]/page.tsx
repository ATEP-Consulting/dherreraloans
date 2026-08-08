import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { programKeyFromSlug, slugFor } from '@/lib/programs';
import { programSlugs } from '@/config/routes.mjs';
import { buildPageMetadata } from '@/lib/metadata';
import { mortgageLoanJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import heroPrograms from '@/assets/img/hero-programs.jpg';
import { PageHero } from '@/components/layout/page-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { CtaBand } from '@/components/ui/cta-band';
import { Band } from '@/components/ui/band';
import { ProgramStats } from '@/components/ui/program-stats';
import { ProgramGrid, type ProgramGridItem } from '@/components/ui/program-grid';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(programSlugs).map((key) => ({ locale, program: slugFor(locale, key) })),
  );
}

export const dynamicParams = false; // slug desconocido → 404, nunca render dinámico

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; program: string }>;
}) {
  const { locale, program } = await params;
  const key = programKeyFromSlug(locale, program);
  if (!key) notFound();
  return buildPageMetadata({ locale, namespace: `programs.${key}`, pathname: '/loan-options/[program]', params: { program: key } });
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string; program: string }>;
}) {
  const { locale, program } = await params;
  setRequestLocale(locale);
  const key = programKeyFromSlug(locale, program);
  if (!key) notFound();
  const t = await getTranslations(`programs.${key}`);
  const tc = await getTranslations('common');
  const tp = await getTranslations('programs');
  const programKeys = Object.keys(programSlugs);
  const programIndex = programKeys.indexOf(key);
  const relatedKeys = [1, 2, 3].map((offset) => programKeys[(programIndex + offset) % programKeys.length]);
  const related: ProgramGridItem[] = relatedKeys.map((k) => ({
    key: k,
    name: tp(`${k}.indexName`),
    stat: tp(`${k}.stat`),
    href: { pathname: '/loan-options/[program]', params: { program: slugFor(locale, k) } },
  }));

  return (
    <>
      <PageHero
        locale={locale}
        pathname="/loan-options/[program]"
        params={{ program: key }}
        image={heroPrograms}
        imageAlt={t('title')}
        eyebrow={`${t('indexName')} · ${t('stat')}`}
        title={t('heroTitle')}
        body={t('heroSub')}
      />
      <nav aria-label={tc('nav.breadcrumb')} className="border-b border-hairline">
        <Container className="px-5 lg:px-[72px]">
          <ol className="flex flex-wrap items-center gap-2 py-4 font-sans text-micro font-medium uppercase tracking-label text-muted">
            <li>
              <Link href="/" className="hover:text-ink">
                {tc('nav.home')}
              </Link>
            </li>
            <li aria-hidden className="text-faint">
              /
            </li>
            <li>
              <Link href="/loan-options" className="hover:text-ink">
                {tc('nav.loanOptions')}
              </Link>
            </li>
            <li aria-hidden className="text-faint">
              /
            </li>
            <li aria-current="page" className="text-ink">
              {t('heading')}
            </li>
          </ol>
        </Container>
      </nav>
      <ProgramStats
        eyebrow={tc('programStats.eyebrow')}
        stat={t('stat')}
        items={(t.raw('required.items') as string[]).slice(0, 3)}
      />
      <section>
        <Container className="px-5 py-10 lg:px-[72px] lg:py-16">
          <p className="max-w-[65ch] font-sans text-lede leading-[1.65] text-body">{t('intro')}</p>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
          <div className="reveal-rise">
            <SectionHeading eyebrow={t('indexName')} title={t('whatIs.title')} />
          </div>
          <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('whatIs.body')}</p>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="grid gap-6 px-5 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-[72px] lg:py-14">
          <div className="reveal-rise">
            <SectionHeading eyebrow={t('indexName')} title={t('required.title')} />
          </div>
          <p className="max-w-[65ch] font-sans text-base leading-[1.7] text-body">{t('required.body')}</p>
        </Container>
      </section>
      <section className="border-t border-hairline">
        <Container className="px-5 py-10 lg:px-[72px] lg:py-14">
          <h2 className="reveal-rise max-w-[65ch] font-display text-h2 font-light text-ink">{t('how.title')}</h2>
          <ul className="reveal-stagger mt-6 max-w-[65ch]">
            {t.raw('how.items').map((item: string) => (
              <li key={item} className="reveal-left border-b border-hairline py-4 font-sans text-base text-body">
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <Band tone="navy">
        <div className="flex flex-col gap-8">
          <h2 className="reveal-rise font-display text-h3 font-light text-paper">{tc('related.title')}</h2>
          <ProgramGrid items={related} />
        </div>
      </Band>
      <CtaBand />
      <JsonLd data={mortgageLoanJsonLd(locale, key)} />
      <JsonLd data={breadcrumbJsonLd(locale, key)} />
    </>
  );
}
