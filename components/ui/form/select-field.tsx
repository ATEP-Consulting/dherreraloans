import type { ComponentPropsWithoutRef } from 'react';
import { controlClass } from './text-input';

type Props = ComponentPropsWithoutRef<'select'> & { options: { value: string; label: string }[] };

export function SelectField({ options, className, ...props }: Props) {
  return (
    <select {...props} className={`${controlClass} appearance-none border-leader ${className ?? ''}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
