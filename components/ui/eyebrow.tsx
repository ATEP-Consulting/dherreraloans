import type { ReactNode } from 'react';

type Props = {
  tone?: 'muted' | 'azure-light';
  children: ReactNode;
};

const base = 'font-sans font-medium uppercase';
const tones = {
  muted: 'text-[11.5px] tracking-label-wide text-muted',
  'azure-light': 'text-micro tracking-label text-azure-light',
};

export function Eyebrow({ tone = 'muted', children }: Props) {
  return <span className={`${base} ${tones[tone]}`}>{children}</span>;
}
