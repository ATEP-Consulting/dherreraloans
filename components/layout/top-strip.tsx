type Props = { left: string; right: string };

export function TopStrip({ left, right }: Props) {
  return (
    <div className="hidden justify-between border-b border-paper-a25 px-[72px] py-3 font-sans text-fine font-medium uppercase tracking-label text-paper-a75 lg:flex">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
