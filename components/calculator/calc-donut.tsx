'use client';

type Segment = { label: string; value: number; swatchClass: string };

export function CalcDonut({ segments, centerLabel, centerValue }: { segments: Segment[]; centerLabel: string; centerValue: string }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const R = 15.9155; // circunferencia 100 → los dasharray son porcentajes
  let offset = 25;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 42 42" className="size-32 shrink-0" role="img" aria-label={`${centerLabel} ${centerValue}`}>
        {total > 0 && segments.filter((s) => s.value > 0).map((s) => {
          const pct = (s.value / total) * 100;
          const el = (
            <circle key={s.label} cx="21" cy="21" r={R} fill="none" strokeWidth="4"
              className={`stroke-current ${s.swatchClass}`}
              strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={offset} />
          );
          offset -= pct;
          return el;
        })}
        <text x="21" y="20" textAnchor="middle" className="fill-current font-sans text-[5px] text-ink">{centerValue}</text>
        <text x="21" y="26" textAnchor="middle" className="fill-current font-sans text-[3px] text-muted">{centerLabel}</text>
      </svg>
      <ul className="flex flex-col gap-1 font-sans text-sm text-body">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span aria-hidden className={`inline-block size-2 border border-hairline bg-current ${s.swatchClass}`} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
