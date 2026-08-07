'use client';
import { parseMoney } from '@/lib/format';
import { controlClass } from './text-input';

type Props = {
  id: string;
  value: number | null;
  onValueChange: (v: number | null) => void;
  locale: string;
  invalid?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
};

export function MoneyInput({ id, value, onValueChange, locale, invalid, disabled, 'aria-describedby': describedBy }: Props) {
  const display =
    value === null ? '' : new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US').format(value);
  const border = invalid ? 'border-error' : 'border-leader';
  return (
    <div className={`flex items-center border bg-plate ${border} ${disabled ? 'bg-sand' : ''}`}>
      <span aria-hidden className="pl-4 font-sans text-base text-muted">$</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onValueChange(parseMoney(e.target.value))}
        className={`${controlClass} border-0 bg-transparent pl-1.5`}
      />
    </div>
  );
}
