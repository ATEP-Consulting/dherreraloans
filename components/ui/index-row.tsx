import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type Props = {
  number?: string; // "No. 1" — oculto < lg
  name: string;
  stat: string;
  href: { pathname: string; params: Record<string, string> };
  children?: ReactNode; // descripción opcional (Loan Options)
};

export function IndexRow({ number, name, stat, href, children }: Props) {
  return (
    <Link
      href={href as never}
      className="group flex flex-wrap items-baseline border-b border-hairline py-4 lg:py-[21px]"
    >
      {number ? (
        <span className="hidden w-14 shrink-0 font-sans text-[13px] text-leader lg:inline">{number}</span>
      ) : null}
      <span className="font-display text-index text-ink group-hover:text-azure">{name}</span>
      <span aria-hidden className="mx-3 flex-1 -translate-y-1 border-b border-dotted border-leader lg:mx-4" />
      <span className="font-sans text-[12.5px] font-medium tracking-[.04em] text-navy lg:text-sm">{stat}</span>
      {children ? <span className="mt-1 w-full pl-0 font-sans text-sm text-muted lg:pl-14">{children}</span> : null}
    </Link>
  );
}
