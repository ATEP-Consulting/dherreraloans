import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';

type Props = {
  tone: 'sand' | 'navy' | 'navyDeep';
  glow?: boolean; // brillo radial azure (solo se nota sobre navy)
  children: ReactNode;
};

const tones = {
  sand: 'bg-sand border-y border-ink py-8 lg:py-16',
  navy: 'bg-navy py-12 lg:py-[84px]',
  navyDeep: 'bg-navy-deep py-12 lg:py-[84px]',
};

export function Band({ tone, glow, children }: Props) {
  return (
    <div className={`relative overflow-hidden ${tones[tone]}`}>
      {glow ? <div aria-hidden className="absolute inset-0 [background:var(--glow-cta)]" /> : null}
      <Container className="relative px-5 lg:px-[72px]">{children}</Container>
    </div>
  );
}
