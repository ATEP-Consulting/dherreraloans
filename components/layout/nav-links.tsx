import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

type Props = { className?: string };

const base = 'font-sans text-[13.5px] font-medium text-paper-a85 hover:text-paper';

export async function NavLinks({ className }: Props) {
  const t = await getTranslations('common.nav');
  const links = [
    { href: '/loan-options', label: t('loanOptions') },
    { href: '/learn', label: t('learn') },
    { href: '/pre-qualify', label: t('prequalify') },
    { href: '/calculator', label: t('calculator') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ] as const;

  return (
    <>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={className ? `${base} ${className}` : base}>
          {link.label}
        </Link>
      ))}
    </>
  );
}
