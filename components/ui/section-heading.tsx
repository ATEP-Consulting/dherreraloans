import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';

type Props = {
  eyebrow: ReactNode;
  title: ReactNode;
  helper?: ReactNode;
  tone?: 'paper' | 'navy';
};

export function SectionHeading({ eyebrow, title, helper, tone = 'paper' }: Props) {
  const navy = tone === 'navy';
  return (
    <div className="flex flex-col gap-3">
      <Eyebrow tone={navy ? 'azure-light' : 'muted'}>{eyebrow}</Eyebrow>
      <h2 className={`font-display text-h2 font-light [&_em]:italic ${navy ? 'text-paper' : 'text-ink'}`}>{title}</h2>
      {helper ? <p className={`mt-1.5 font-sans text-sm ${navy ? 'text-paper-a75' : 'text-muted'}`}>{helper}</p> : null}
    </div>
  );
}
