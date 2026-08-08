import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { programSlugs } from '@/config/routes.mjs';
import { slugFor } from '@/lib/programs';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';

type Props = {
  className?: string;
  /** Necesario para construir los hrefs de programa del mega-menú. */
  locale?: string;
  /** Solo en el nav de escritorio: «Loan Options» despliega el panel con los 12 programas. */
  mega?: boolean;
};

const base = 'font-sans text-[13.5px] font-medium text-(--hfg-mut) transition-colors hover:text-(--hfg)';

async function MegaPanel({ locale }: { locale: string }) {
  const t = await getTranslations('common.megaMenu');
  const tp = await getTranslations('programs');
  const keys = Object.keys(programSlugs);
  return (
    <div className="invisible absolute inset-x-0 top-full translate-y-1 border-b border-hairline bg-paper opacity-0 transition-[opacity,transform,visibility] duration-300 ease-expo group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
      <Container className="grid gap-10 px-5 py-10 lg:grid-cols-[280px_1fr] lg:px-[72px]">
        <div className="flex flex-col gap-3">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <p className="font-display text-h3 font-light text-ink">{t('title')}</p>
          <p className="font-sans text-sm leading-relaxed text-body">{t('description')}</p>
          <Link href="/loan-options" className="mt-2 font-sans text-btn font-semibold uppercase tracking-button text-azure">
            {t('viewAll')}
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-10 xl:grid-cols-3">
          {keys.map((key) => (
            <li key={key}>
              <Link
                href={{ pathname: '/loan-options/[program]', params: { program: slugFor(locale, key) } }}
                className="group/item flex flex-col gap-0.5 border-b border-hairline py-3"
              >
                <span className="font-display text-[17px] font-light text-ink transition-colors group-hover/item:text-azure">
                  {tp(`${key}.indexName`)}
                </span>
                <span className="font-sans text-micro font-medium tracking-[.04em] text-muted">{tp(`${key}.stat`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

export async function NavLinks({ className, locale, mega }: Props) {
  const t = await getTranslations('common.nav');
  const links = [
    { href: '/loan-options', label: t('loanOptions') },
    { href: '/learn', label: t('learn') },
    { href: '/pre-qualify', label: t('prequalify') },
    { href: '/calculator', label: t('calculator') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ] as const;

  return (
    <>
      {links.map((link) =>
        mega && locale && link.href === '/loan-options' ? (
          <span key={link.href} className="group">
            <Link href={link.href} className={className ? `${base} ${className}` : base}>
              {link.label}
            </Link>
            <MegaPanel locale={locale} />
          </span>
        ) : (
          <Link key={link.href} href={link.href} className={className ? `${base} ${className}` : base}>
            {link.label}
          </Link>
        ),
      )}
    </>
  );
}
