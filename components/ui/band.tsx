import type { ReactNode } from 'react';

type Props = {
  tone: 'sand' | 'navy';
  children: ReactNode;
};

const base = 'px-5 lg:px-[72px]';
const tones = {
  sand: 'bg-sand border-y border-ink py-8 lg:py-16',
  navy: 'bg-navy py-12 lg:py-[84px]',
};

export function Band({ tone, children }: Props) {
  return <div className={`${base} ${tones[tone]}`}>{children}</div>;
}
