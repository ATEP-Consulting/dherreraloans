import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type Props = {
  href: string | { pathname: string; params?: Record<string, string> };
  external?: boolean;
  tone?: 'azure' | 'paper';
  children: ReactNode;
};

const base = 'font-sans text-sm font-medium border-b pb-px transition';
const tones = {
  azure: 'text-azure border-azure hover:text-navy hover:border-navy',
  paper: 'text-paper border-paper-a55 hover:border-paper',
};

export function TextLink({ href, external, tone = 'azure', children }: Props) {
  const className = `${base} ${tones[tone]}`;
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
