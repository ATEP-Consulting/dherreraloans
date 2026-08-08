import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type Props = {
  number?: string; // "No. 1" — oculto < lg
  name: string;
  stat: string;
  href: { pathname: string; params: Record<string, string> };
  tone?: 'paper' | 'navy';
  className?: string; // p. ej. reveal-left — se concatena al Link
  children?: ReactNode; // descripción opcional (Loan Options)
};

const tones = {
  paper: {
    row: 'border-hairline',
    number: 'text-leader',
    name: 'text-ink group-hover:text-azure',
    fill: 'border-leader',
    stat: 'text-navy',
    desc: 'text-muted',
  },
  navy: {
    row: 'border-paper-a15 transition-[padding] duration-300 hover:pl-3',
    number: 'text-azure-soft',
    name: 'text-paper group-hover:underline group-hover:decoration-azure-soft group-hover:decoration-1 group-hover:underline-offset-[5px]',
    fill: 'border-paper-a28',
    stat: 'text-azure-light',
    desc: 'text-paper-a75',
  },
} as const;

export function IndexRow({ number, name, stat, href, tone = 'paper', className = '', children }: Props) {
  const c = tones[tone];
  return (
    <Link
      href={href as never}
      className={`group flex flex-wrap items-baseline border-b py-4 lg:py-[21px] ${c.row} ${className}`}
    >
      {number ? (
        <span className={`hidden w-14 shrink-0 font-display text-[22px] font-extralight lg:inline ${c.number}`}>{number}</span>
      ) : null}
      <span className={`font-display text-index font-light ${c.name}`}>{name}</span>
      <span aria-hidden className={`mx-3 flex-1 -translate-y-1 border-b border-dotted lg:mx-4 ${c.fill}`} />
      <span className={`font-sans text-[12.5px] font-medium tracking-[.04em] lg:text-sm ${c.stat}`}>{stat}</span>
      {children ? <span className={`mt-1 w-full pl-0 font-sans text-sm lg:pl-14 ${c.desc}`}>{children}</span> : null}
    </Link>
  );
}
