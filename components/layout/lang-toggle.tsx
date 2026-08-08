import { Link } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { slugFor } from '@/lib/programs';

type Props = { locale: string; pathname: string; params?: { program?: string } };

export function LangToggle({ locale, pathname, params }: Props) {
  return (
    <span className="font-sans text-micro font-medium uppercase tracking-button text-(--hfg-mut)">
      {routing.locales.map((l, i) => {
        const href = params?.program
          ? { pathname, params: { program: slugFor(l, params.program) } }
          : pathname;
        return (
          <span key={l}>
            {i > 0 ? ' — ' : null}
            {l === locale ? (
              <span aria-current="true" className="text-(--hfg)">{l.toUpperCase()}</span>
            ) : (
              <Link locale={l} href={href as never} className="hover:text-(--hfg)">
                {l.toUpperCase()}
              </Link>
            )}
          </span>
        );
      })}
    </span>
  );
}
