import { Link } from '@/i18n/routing';

export type ProgramGridItem = {
  key: string;
  name: string;
  stat: string;
  href: { pathname: '/loan-options/[program]'; params: { program: string } };
};

type Props = {
  items: ProgramGridItem[];
  /** Enlace opcional al índice completo (la home solo muestra los destacados). */
  viewAll?: { label: string };
  columns?: 2 | 3;
};

/**
 * Rejilla tipográfica de programas: nombre en Spectral y dato en versalitas, **sin una sola
 * línea** — la separación la hace el aire (spec 2026-08-08, enmienda «desrayado»: el patrón
 * anterior sumaba un borde y una guía punteada por fila, y doce filas eran veinticuatro líneas).
 */
export function ProgramGrid({ items, viewAll, columns = 3 }: Props) {
  const cols = columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div className="flex flex-col">
      <div className={`reveal-stagger grid gap-x-10 gap-y-8 lg:gap-y-9 ${cols}`}>
        {items.map((item) => (
          <Link key={item.key} href={item.href as never} className="group reveal-rise block">
            <span className="block font-display text-index font-light text-paper transition-colors duration-300 group-hover:text-azure-light">
              {item.name}
            </span>
            <span className="mt-1.5 block font-sans text-micro font-medium uppercase tracking-label text-azure-soft transition-colors duration-300 group-hover:text-paper">
              {item.stat}
            </span>
          </Link>
        ))}
      </div>
      {viewAll ? (
        <Link
          href="/loan-options"
          className="reveal-rise mt-10 inline-block self-start border-b border-azure-soft pb-1 font-sans text-btn font-semibold uppercase tracking-button text-azure-light transition-colors hover:border-paper hover:text-paper"
        >
          {viewAll.label}
        </Link>
      ) : null}
    </div>
  );
}
