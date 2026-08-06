import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { programKeyFromSlug, slugFor } from '@/lib/programs';
import { programSlugs } from '@/config/routes.mjs';
import { buildPageMetadata } from '@/lib/metadata';

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
  return <h1 className="text-2xl font-bold">{t('heading')}</h1>;
}
