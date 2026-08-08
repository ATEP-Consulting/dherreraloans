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
        <ul className="reveal-stagger flex flex-col">
          {items.map((item) => (
            <li key={item} className="reveal-left border-b border-paper-a15 py-3.5 font-sans text-sm leading-relaxed text-paper-a85">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
