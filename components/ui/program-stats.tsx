import { Band } from '@/components/ui/band';
import { Eyebrow } from '@/components/ui/eyebrow';

type Props = {
  eyebrow: string;
  stat: string;
  items: string[];
};

export function ProgramStats({ eyebrow, stat, items }: Props) {
  return (
    <Band tone="navy">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="reveal-rise flex flex-col gap-3">
          <Eyebrow tone="azure-light">{eyebrow}</Eyebrow>
          <p className="reveal-mask font-display text-h2 font-light text-paper">{stat}</p>
        </div>
        {/* Sin bordes por item: la separación es aire y una viñeta azure (enmienda «desrayado») */}
        <ul className="reveal-stagger flex flex-col gap-4">
          {items.map((item) => (
            <li key={item} className="reveal-left flex gap-3 font-sans text-sm leading-relaxed text-paper-a85">
              <span aria-hidden className="mt-[7px] size-1.5 shrink-0 bg-azure-soft" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
