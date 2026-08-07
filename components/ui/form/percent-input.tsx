'use client';
import { useEffect, useRef, useState } from 'react';
import { parseRate } from '@/lib/format';
import { controlClass } from './text-input';

type Props = {
  id: string;
  value: number | null;
  onValueChange: (v: number | null) => void;
  invalid?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
};

export function PercentInput({ id, value, onValueChange, invalid, disabled, 'aria-describedby': describedBy }: Props) {
  const [raw, setRaw] = useState(value === null ? '' : String(value));
  const lastNotifiedValue = useRef(value);

  // Resync if value changed externally (e.g., parent checked "No la recuerdo" → null)
  useEffect(() => {
    if (value !== lastNotifiedValue.current) {
      setRaw(value === null ? '' : String(value));
      lastNotifiedValue.current = value;
    }
  }, [value]);

  const border = invalid ? 'border-error' : 'border-leader';
  return (
    <div className={`flex items-center border bg-plate ${border} ${disabled ? 'bg-sand' : ''}`}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={raw}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const newRaw = e.target.value;
          setRaw(newRaw);
          const parsed = parseRate(newRaw);
          onValueChange(parsed);
          lastNotifiedValue.current = parsed;
        }}
        className={`${controlClass} border-0 bg-transparent pr-1.5`}
      />
      <span aria-hidden className="pr-4 font-sans text-base text-muted">%</span>
    </div>
  );
}
