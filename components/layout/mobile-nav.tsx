import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { TextLink } from '@/components/ui/text-link';
import { APPLY_URL } from '@/lib/site';
import { NavLinks } from './nav-links';

export async function MobileNav() {
  const t = await getTranslations('common');

  return (
    <details className="lg:hidden">
      <summary
        aria-label={t('menu.open')}
        className="flex cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="text-(--hfg)"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </summary>
      <div className="hdr-mobile-panel absolute inset-x-0 top-full flex flex-col gap-5 border-t border-paper-a25 bg-navy px-5 py-6">
        <NavLinks />
        <TextLink href={APPLY_URL} external tone="paper">
          {t('cta.apply')}
        </TextLink>
        <Button href="/quote" variant="paper">
          {t('cta.quote')}
        </Button>
      </div>
    </details>
  );
}
