import { Fragment } from 'react';

type Props = {
  lead: string;
  items: string[];
};

function Track({ lead, items, hidden }: Props & { hidden?: boolean }) {
  return (
    <span aria-hidden={hidden || undefined} className="flex items-baseline whitespace-nowrap pr-9">
      <span className="font-display text-[15px] italic text-body">{lead}</span>
      {items.map((city) => (
        <Fragment key={city}>
          <span aria-hidden className="mx-4 font-display italic text-leader">·</span>
          <span className="font-sans text-micro font-medium uppercase tracking-cities text-muted">{city}</span>
        </Fragment>
      ))}
    </span>
  );
}

export function Marquee(props: Props) {
  return (
    <div className="marquee border-b border-hairline py-[18px]">
      <div className="marquee-track">
        <Track {...props} />
        <Track {...props} hidden />
      </div>
    </div>
  );
}
