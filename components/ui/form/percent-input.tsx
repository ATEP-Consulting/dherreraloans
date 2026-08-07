'use client';
import { useState } from 'react';
import { parseRate } from '@/lib/format';
import { controlClass } from './text-input';

type Props = { id: string; value: number | null; onValueChange: (v: number | null) => void; invalid?: boolean; disabled?: boolean };

export function PercentInput({ id, value, onValueChange, invalid, disabled }: Props) {
  const [raw, setRaw] = useState(value === null ? '' : String(value));
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
        onChange={(e) => {
          setRaw(e.target.value);
          onValueChange(parseRate(e.target.value));
        }}
        className={`${controlClass} border-0 bg-transparent pr-1.5`}
      />
      <span aria-hidden className="pr-4 font-sans text-base text-muted">%</span>
    </div>
  );
}
