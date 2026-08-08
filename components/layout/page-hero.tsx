import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { SiteHeader } from './site-header';

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
  const heights = variant === 'home' ? 'min-h-svh' : 'min-h-[500px] lg:min-h-[580px]';
  return (
    <section className={`relative flex flex-col bg-navy ${heights}`}>
      <Image src={image} alt={imageAlt} fill priority placeholder="blur" sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 [background:var(--scrim-hero-mobile)] lg:[background:var(--scrim-hero-desktop)]" />
      <SiteHeader locale={locale} pathname={pathname} params={params} />
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
