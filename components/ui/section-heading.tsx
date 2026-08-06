import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';

type Props = {
  eyebrow: ReactNode;
  title: ReactNode;
  helper?: ReactNode;
};

export function SectionHeading({ eyebrow, title, helper }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-h2 font-light text-ink">{title}</h2>
      {helper ? <p className="mt-1.5 font-sans text-sm text-muted">{helper}</p> : null}
    </div>
  );
}
