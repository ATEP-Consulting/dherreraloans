import { Container } from '@/components/ui/container';

type Props = {
  lead: string;
  list: string;
};

export function CitiesStrip({ lead, list }: Props) {
  return (
    <div className="border-b border-ink">
      <Container className="flex flex-wrap items-baseline justify-center gap-3.5 px-5 py-[18px] text-center lg:px-[72px]">
        <span className="font-display text-[15px] italic text-body">{lead}</span>
        <span className="font-sans text-micro font-medium uppercase tracking-cities text-muted">{list}</span>
      </Container>
    </div>
  );
}
