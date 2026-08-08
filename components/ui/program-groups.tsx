import { Link } from '@/i18n/routing';

export type ProgramGroup = {
  key: string;
  /** Título del grupo: «Comprar una casa», «Refinanciar»… */
  title: string;
  programs: { key: string; name: string; stat: string; href: { pathname: '/loan-options/[program]'; params: { program: string } } }[];
};

/**
 * Los doce programas ordenados por la intención del visitante: tres decisiones en vez de un
 * catálogo. Una sola línea fina bajo cada título de grupo (tres en total) y dentro solo aire
 * (spec 2026-08-08, enmienda «desrayado»).
 */
export function ProgramGroups({ groups }: { groups: ProgramGroup[] }) {
  return (
    <div className="reveal-stagger grid gap-10 lg:grid-cols-3 lg:gap-16">
      {groups.map((group) => (
        <div key={group.key} className="reveal-rise flex flex-col">
          <h3 className="border-b border-paper-a15 pb-3 font-sans text-micro font-semibold uppercase tracking-label text-azure-soft">
            {group.title}
          </h3>
          <ul className="mt-5 flex flex-col gap-5">
            {group.programs.map((program) => (
              <li key={program.key}>
                <Link href={program.href as never} className="group block">
                  <span className="block font-display text-index font-light text-paper transition-colors duration-300 group-hover:text-azure-light">
                    {program.name}
                  </span>
                  <span className="mt-1 block font-sans text-micro font-medium uppercase tracking-[.12em] text-azure-soft/75 transition-colors duration-300 group-hover:text-paper">
                    {program.stat}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
