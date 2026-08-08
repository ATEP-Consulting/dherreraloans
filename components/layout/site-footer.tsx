import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { TextLink } from '@/components/ui/text-link';
import { EhoMark } from '@/components/ui/eho-mark';
import { Container } from '@/components/ui/container';
import logoLight from '@/assets/img/logo-light.png';
import { INSTAGRAM_URL, NMLS_CONSUMER_ACCESS_URL, NMLS_ID } from '@/lib/site';

type Props = { locale: string };

const columnHeading = 'font-sans text-fine font-medium uppercase tracking-label text-paper';
const columnLink = 'font-sans text-[13.5px] text-paper-a75 hover:text-paper';

export async function SiteFooter({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'common' });

  const exploreLinks = [
    { href: '/loan-options', label: t('footer.links.loanOptions') },
    { href: '/calculator', label: t('footer.links.calculator') },
    { href: '/learn', label: t('footer.links.learn') },
    { href: '/quote', label: t('footer.links.quote') },
    { href: '/about', label: t('footer.links.about') },
    { href: '/contact', label: t('footer.links.contact') },
  ] as const;

  return (
    <footer className="border-t border-paper-a15 bg-navy-deep pb-6 pt-10 text-paper-a75 lg:pb-[30px] lg:pt-[52px]">
      <Container className="px-5 lg:px-[72px]">
        <div className="grid grid-cols-1 gap-10 border-b border-paper-a15 pb-9 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:gap-14">
          <div className="flex flex-col items-start gap-[14px]">
            <Image src={logoLight} alt="DherreraLoans" className="h-11 w-auto lg:h-[58px]" />
            <p className="font-sans text-[13px] leading-[1.7] text-paper-a75">
              {t('footer.licenseLine1')}
              <br />
              {t('footer.licenseLine2', { nmls: NMLS_ID })}
            </p>
            <TextLink href={INSTAGRAM_URL} external tone="paper">
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
            <TextLink href={NMLS_CONSUMER_ACCESS_URL} external tone="paper">
              {t('footer.links.consumerAccess')}
            </TextLink>
          </div>

          <EhoMark label={t('footer.eho')} tone="paper" />
        </div>

        <p className="mt-6 max-w-[1100px] font-sans text-fine leading-relaxed text-paper-a55">
          {t('footer.disclaimer', { nmls: NMLS_ID })}
        </p>
        <p className="mt-3 font-sans text-fine italic text-paper-a55">{t('footer.pendingValidation')}</p>

        <div className="mt-5 flex flex-col gap-2 font-sans text-fine text-paper-a55 lg:flex-row lg:justify-between">
          <span>{t('footer.copyright')}</span>
          <span>{t('footer.languages')}</span>
        </div>
      </Container>
    </footer>
  );
}
