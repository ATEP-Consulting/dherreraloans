import { Fragment } from 'react';
import { Container } from '@/components/ui/container';

type Props = {
  lead: string;
  items: string[];
};

/** Un pase completo de la lista. Se repite 4 veces: la animación desplaza -25%, así que
 *  siempre quedan 3 pases cubriendo el ancho — nunca aparece hueco por muy ancha que sea
 *  la pantalla. El `lead` NO va dentro (repetido cada pase parecía texto roto en medio). */
function Pass({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <span aria-hidden={hidden || undefined} className="flex items-baseline whitespace-nowrap">
      {items.map((city) => (
        <Fragment key={city}>
          <span className="font-sans text-micro font-medium uppercase tracking-cities text-muted">{city}</span>
          <span aria-hidden className="mx-5 font-display italic text-leader">·</span>
        </Fragment>
      ))}
    </span>
  );
}

export function Marquee({ lead, items }: Props) {
  return (
    <div className="bg-paper">
      <Container className="flex items-baseline gap-6 px-5 py-[18px] lg:px-[72px]">
        <span className="hidden shrink-0 font-display text-[15px] italic text-body lg:block">{lead}</span>
        {/* La máscara difumina la entrada y la salida por los laterales del contenedor. */}
        <div className="marquee min-w-0 flex-1">
          <div className="marquee-track">
            <Pass items={items} />
            <Pass items={items} hidden />
            <Pass items={items} hidden />
            <Pass items={items} hidden />
          </div>
        </div>
      </Container>
    </div>
  );
}
