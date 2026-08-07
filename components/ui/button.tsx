import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type Props = {
  href: string | { pathname: string; params?: Record<string, string> };
  variant: 'paper' | 'navy';
  size?: 'md' | 'lg';
  external?: boolean;
  children: ReactNode;
};

const base =
  'inline-flex items-center justify-center font-sans text-btn font-semibold uppercase tracking-button transition hover:brightness-95';
const variants = { paper: 'bg-paper text-navy', navy: 'bg-navy text-paper' };
const sizes = { md: 'px-[26px] py-3.5', lg: 'px-9 py-[18px]' };

/** Clases del Button expuestas para elementos no-link (p. ej. <button> del quiz) que deben verse idénticos. */
export function buttonVariantClass(variant: 'paper' | 'navy', size: 'md' | 'lg' = 'md'): string {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export function Button({ href, variant, size = 'md', external, children }: Props) {
  const className = `${base} ${variants[variant]} ${sizes[size]}`;
  if (external && typeof href === 'string') {
    return (
      <a href={href} target="_blank" rel="noopener" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href as never} className={className}>
      {children}
    </Link>
  );
}
