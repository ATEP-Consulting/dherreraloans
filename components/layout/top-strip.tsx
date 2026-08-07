import { Container } from '@/components/ui/container';

type Props = { left: string; right: string };

export function TopStrip({ left, right }: Props) {
  return (
    <div className="hidden border-b border-paper-a25 lg:block">
      <Container className="flex justify-between px-[72px] py-3 font-sans text-fine font-medium uppercase tracking-label text-paper-a75">
        <span>{left}</span>
        <span>{right}</span>
      </Container>
    </div>
  );
}
