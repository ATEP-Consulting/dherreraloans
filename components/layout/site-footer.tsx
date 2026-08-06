import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { TextLink } from '@/components/ui/text-link';
import { EhoMark } from '@/components/ui/eho-mark';
import logo from '@/assets/img/logo.png';
import { INSTAGRAM_URL, NMLS_CONSUMER_ACCESS_URL, NMLS_ID } from '@/lib/site';

type Props = { locale: string };

const columnHeading = 'font-sans text-fine font-medium uppercase tracking-label text-faint';
const columnLink = 'font-sans text-[13.5px] text-body hover:text-navy';

export async function SiteFooter({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'common' });

  const exploreLinks = [
    { href: '/loan-options', label: t('footer.links.loanOptions') },
    { href: '/calculator', label: t('footer.links.calculator') },
    { href: '/quote', label: t('footer.links.quote') },
    { href: '/about', label: t('footer.links.about') },
    { href: '/contact', label: t('footer.links.contact') },
  ] as const;

  return (
    <footer className="border-t border-ink bg-paper px-5 pb-6 pt-10 lg:px-[72px] lg:pb-[30px] lg:pt-[52px]">
      <div className="grid grid-cols-1 gap-10 border-b border-hairline pb-9 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:gap-14">
        <div className="flex flex-col items-start gap-[14px]">
          <Image src={logo} alt="DherreraLoans" className="h-11 w-auto lg:h-[58px]" />
          <p className="font-sans text-[13px] leading-[1.7] text-muted">
            {t('footer.licenseLine1')}
            <br />
            {t('footer.licenseLine2', { nmls: NMLS_ID })}
          </p>
          <TextLink href={INSTAGRAM_URL} external>
            {t('footer.instagram')}
          </TextLink>
        </div>

        <div className="flex flex-col gap-[9px]">
          <span className={columnHeading}>{t('footer.explore')}</span>
          {exploreLinks.map((link) => (
            <Link key={link.href} href={link.href} className={columnLink}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-[9px]">
          <span className={columnHeading}>{t('footer.legal')}</span>
          <Link href="/privacy" className={columnLink}>
            {t('footer.links.privacy')}
          </Link>
          <Link href="/accessibility" className={columnLink}>
            {t('footer.links.accessibility')}
          </Link>
          <TextLink href={NMLS_CONSUMER_ACCESS_URL} external>
            {t('footer.links.consumerAccess')}
          </TextLink>
        </div>

        <EhoMark label={t('footer.eho')} />
      </div>

      <p className="mt-6 max-w-[1100px] font-sans text-fine leading-relaxed text-faint">
        {t('footer.disclaimer', { nmls: NMLS_ID })}
      </p>
      <p className="mt-3 font-sans text-fine italic text-faint">{t('footer.pendingValidation')}</p>

      <div className="mt-5 flex flex-col gap-2 font-sans text-fine text-faint lg:flex-row lg:justify-between">
        <span>{t('footer.copyright')}</span>
        <span>{t('footer.languages')}</span>
      </div>
    </footer>
  );
}
