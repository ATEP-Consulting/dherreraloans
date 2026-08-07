import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type Props = {
  href: string | { pathname: string; params?: Record<string, string> };
  external?: boolean;
  /** Solo aplica con `external`. Por defecto true (pestaña nueva). En false, omite
   * target="_blank" — para hrefs tipo `tel:`/`mailto:` que delegan a otra app del sistema
   * en vez de navegar, donde una pestaña en blanco de sobra no aporta nada. */
  newTab?: boolean;
  tone?: 'azure' | 'paper';
  children: ReactNode;
};

const base = 'font-sans text-sm font-medium border-b pb-px transition';
const tones = {
  azure: 'text-azure border-azure hover:text-navy hover:border-navy',
  paper: 'text-paper border-paper-a55 hover:border-paper',
};

export function TextLink({ href, external, newTab = true, tone = 'azure', children }: Props) {
  const className = `${base} ${tones[tone]}`;
  if (external && typeof href === 'string') {
    return (
      <a href={href} {...(newTab ? { target: '_blank' } : {})} rel="noopener" className={className}>
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
