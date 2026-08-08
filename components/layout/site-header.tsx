import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import logoLight from '@/assets/img/logo-light.png';
import logoDark from '@/assets/img/logo.png';
import { APPLY_URL, NMLS_ID } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { TopStrip } from './top-strip';
import { NavLinks } from './nav-links';
import { MobileNav } from './mobile-nav';
import { LangToggle } from './lang-toggle';

type Props = {
  locale: string;
  /** Ruta interna de la página (para que LangToggle enlace a su gemela). */
  pathname: string;
  params?: { program?: string };
};

/**
 * Header global: `position: fixed`, transparente sobre el hero en top 0 y sólido
 * (paper) al scrollear — el script de `app/[locale]/layout.tsx` alterna `hdr-solid`
 * con histéresis. Lo montan `PageHero` y las páginas que no lo usan (Contact).
 * Recibe `pathname`/`params` porque LangToggle necesita la ruta gemela y el layout,
 * al ser server component, no tiene acceso a ella.
 */
export async function SiteHeader({ locale, pathname, params }: Props) {
  const t = await getTranslations('common');
  return (
    <div className="site-header fixed inset-x-0 top-0 z-50">
      <TopStrip left={t('topStrip.left', { nmls: NMLS_ID })} right={t('topStrip.right', { nmls: NMLS_ID })} />
      <header className="relative border-b border-(--hbr) py-4 lg:border-0 lg:py-5">
        <Container className="flex items-center justify-between px-5 lg:px-[72px]">
          <Link href="/" aria-label="DherreraLoans" className="relative block">
            <Image src={logoLight} alt="DherreraLoans" className="hdr-logo-light h-11 w-auto lg:h-14" />
            <Image src={logoDark} alt="" aria-hidden className="hdr-logo-dark absolute inset-0 h-11 w-auto lg:h-14" />
          </Link>
          <nav aria-label={t('nav.primary')} className="hidden items-center gap-[34px] lg:flex">
            <NavLinks locale={locale} mega />
          </nav>
          <div className="flex items-center gap-4 lg:gap-[26px]">
            <LangToggle locale={locale} pathname={pathname} params={params} />
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noopener"
              className="sr-only border-b border-(--hfg-mut) pb-px font-sans text-[13.5px] font-medium text-(--hfg) hover:border-(--hfg) focus-visible:not-sr-only lg:not-sr-only lg:inline"
            >
              {t('cta.apply')}
            </a>
            <span className="hdr-cta hidden lg:inline">
              <Button href="/quote" variant="paper">
                {t('cta.quote')}
              </Button>
            </span>
            <MobileNav />
          </div>
        </Container>
      </header>
    </div>
  );
}
