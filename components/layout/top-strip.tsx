import { Container } from '@/components/ui/container';

type Props = { left: string; right: string };

// El borde va en el Container hijo: el wrapper colapsa a 0fr al scrollear y su propio
// borde seguiría pintándose con altura cero.
export function TopStrip({ left, right }: Props) {
  return (
    <div className="hdr-topstrip">
      {/* Wrapper SIN padding: el hijo directo del grid debe poder encogerse a 0
          (padding en el hijo directo no colapsa y dejaba 25px de franja). */}
      <div>
        <Container className="flex justify-between border-b border-(--hbr) px-[72px] py-3 font-sans text-fine font-medium uppercase tracking-label text-(--hfg-mut)">
          <span>{left}</span>
          <span>{right}</span>
        </Container>
      </div>
    </div>
  );
}
