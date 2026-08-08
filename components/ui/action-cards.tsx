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
      <Container className="reveal-stagger grid gap-px border-y border-hairline bg-hairline px-0 lg:grid-cols-3">
        {CARDS.map(({ key, href, external }) => {
          const inner = (
            <span className="relative flex h-full flex-col gap-3 overflow-hidden bg-paper px-5 py-8 transition-colors duration-500 ease-expo group-hover:bg-navy lg:px-8 lg:py-10">
              <span className="font-sans text-micro font-medium uppercase tracking-label text-muted transition-colors duration-500 group-hover:text-azure-light">{t(`${key}.eyebrow`)}</span>
              <span className="font-display text-h3 font-light text-ink transition-colors duration-500 group-hover:text-paper">{t(`${key}.title`)}</span>
              <span className="max-w-[38ch] font-sans text-sm text-body transition-colors duration-500 group-hover:text-paper-a75">{t(`${key}.body`)}</span>
              <span aria-hidden className="absolute bottom-5 right-6 font-display text-[22px] text-leader transition-[color,transform] duration-500 group-hover:translate-x-1.5 group-hover:text-azure-light">→</span>
            </span>
          );
          return external ? (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="group reveal-rise">
              {inner}
            </a>
          ) : (
            <Link key={key} href={href} className="group reveal-rise">
              {inner}
            </Link>
          );
        })}
      </Container>
    </section>
  );
}
