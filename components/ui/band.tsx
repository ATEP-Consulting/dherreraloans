import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';

type Props = {
  tone: 'sand' | 'navy';
  children: ReactNode;
};

const tones = {
  sand: 'bg-sand border-y border-ink py-8 lg:py-16',
  navy: 'bg-navy py-12 lg:py-[84px]',
};

export function Band({ tone, children }: Props) {
  return (
    <div className={tones[tone]}>
      <Container className="px-5 lg:px-[72px]">{children}</Container>
    </div>
  );
}
