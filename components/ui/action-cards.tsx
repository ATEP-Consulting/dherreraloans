import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { APPLY_URL } from '@/lib/site';
import { Container } from '@/components/ui/container';

const CARDS = [
  { key: 'quote', href: '/quote' as const, external: false },
  { key: 'apply', href: APPLY_URL, external: true },
  { key: 'calculator', href: '/calculator' as const, external: false },
] as const;

export async function ActionCards() {
  const t = await getTranslations('home.actionCards');
  return (
    <section>
      <Container className="grid gap-px border-y border-hairline bg-hairline px-0 lg:grid-cols-3">
        {CARDS.map(({ key, href, external }) => {
          const inner = (
            <span className="flex h-full flex-col gap-3 bg-paper px-5 py-8 transition-colors hover:bg-sand lg:px-8 lg:py-10">
              <span className="font-sans text-micro font-medium uppercase tracking-label text-muted">{t(`${key}.eyebrow`)}</span>
              <span className="font-display text-h3 font-light text-ink">{t(`${key}.title`)}</span>
              <span className="font-sans text-sm text-body">{t(`${key}.body`)}</span>
            </span>
          );
          return external ? (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          ) : (
            <Link key={key} href={href}>
              {inner}
            </Link>
          );
        })}
      </Container>
    </section>
  );
}
