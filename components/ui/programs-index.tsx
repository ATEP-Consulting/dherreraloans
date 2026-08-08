import Image, { type StaticImageData } from 'next/image';
import { Link } from '@/i18n/routing';
import { IndexRow } from '@/components/ui/index-row';

export type ProgramsIndexItem = {
  key: string;
  number?: string;
  name: string;
  stat: string;
  description?: string;
  image: StaticImageData;
  href: { pathname: '/loan-options/[program]'; params: { program: string } };
};

type Props = {
  items: ProgramsIndexItem[];
  viewAll?: { label: string };
};

export function ProgramsIndex({ items, viewAll }: Props) {
  return (
    <div className="pindex grid items-start gap-6 lg:grid-cols-[1fr_300px] lg:gap-16">
      <div>
        {/* Filas como hijas DIRECTAS de .pindex-rows: el :has(.pindex-rows > a:hover) del
            preview depende de ello. .pindex-rows y .pindex-preview NO son hermanos (columnas
            distintas del grid) — por eso el :has() ancla en la raíz .pindex, no en `~`. */}
        <div className="pindex-rows reveal-stagger flex flex-col">
          {items.map((item) => (
            <IndexRow key={item.key} tone="navy" className="reveal-left" number={item.number} name={item.name} stat={item.stat} href={item.href}>
              {item.description}
            </IndexRow>
          ))}
        </div>
        {viewAll ? (
          <Link
            href="/loan-options"
            className="mt-7 inline-block border-b border-azure-soft pb-1 font-sans text-btn font-semibold uppercase tracking-button text-azure-light"
          >
            {viewAll.label}
          </Link>
        ) : null}
      </div>
      <div aria-hidden className="pindex-preview reveal-curtain-l h-[340px]">
        {items.map((item) => (
          <div key={item.key} className="relative">
            <Image src={item.image} alt="" fill sizes="300px" className="object-cover" />
            <div className="absolute inset-0 bg-navy/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
