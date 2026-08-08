import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
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
  pathname: string;
  params?: { program?: string };
  image: StaticImageData;
  imageAlt: string;
  eyebrow: string;
  eyebrowMobile?: string;
  title: ReactNode;
  body?: ReactNode;
  bodyMobile?: ReactNode;
  variant?: 'home' | 'interior';
  ctas?: ReactNode;
};

export async function PageHero({ locale, pathname, params, image, imageAlt, eyebrow, eyebrowMobile, title, body, bodyMobile, variant = 'interior', ctas }: Props) {
  const t = await getTranslations('common');
  const heights = variant === 'home' ? 'min-h-svh' : 'min-h-[500px] lg:min-h-[580px]';
  return (
    <section className={`relative flex flex-col bg-navy ${heights}`}>
      <Image src={image} alt={imageAlt} fill priority placeholder="blur" sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 [background:var(--scrim-hero-mobile)] lg:[background:var(--scrim-hero-desktop)]" />
      {/* Header fijo: transparente sobre el hero en top 0; `hdr-solid` (script del layout)
          lo vuelve paper con texto ink al scrollear. Vive dentro del hero pero fuera de flujo. */}
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
              <a href={APPLY_URL} target="_blank" rel="noopener" className="sr-only border-b border-(--hfg-mut) pb-px font-sans text-[13.5px] font-medium text-(--hfg) hover:border-(--hfg) focus-visible:not-sr-only lg:not-sr-only lg:inline">
                {t('cta.apply')}
              </a>
              <span className="hdr-cta hidden lg:inline"><Button href="/quote" variant="paper">{t('cta.quote')}</Button></span>
              <MobileNav />
            </div>
          </Container>
        </header>
      </div>
      <div className="relative flex flex-1 flex-col pt-28 lg:pt-40">
        <div className="flex flex-1 flex-col justify-end">
          <Container className="flex flex-col gap-4 px-5 pb-[72px] lg:gap-7 lg:px-[72px] lg:pb-24">
            <p className="font-sans text-[10.5px] font-medium uppercase tracking-label text-azure-light lg:text-micro">
              <span className="lg:hidden">{eyebrowMobile ?? eyebrow}</span>
              <span className="hidden lg:inline">{eyebrow}</span>
            </p>
            <h1 className="max-w-[860px] font-display text-display font-light text-paper [text-wrap:pretty] [&_em]:font-light">{title}</h1>
            {body ? (
              <p className="max-w-[560px] font-sans text-[15px] leading-relaxed text-paper-a85 lg:text-lede">
                <span className="lg:hidden">{bodyMobile ?? body}</span>
                <span className="hidden lg:inline">{body}</span>
              </p>
            ) : null}
            {ctas ? <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">{ctas}</div> : null}
          </Container>
        </div>
      </div>
    </section>
  );
}
