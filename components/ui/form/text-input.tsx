import type { ComponentPropsWithoutRef } from 'react';

export const controlClass =
  'w-full border bg-plate px-4 py-3.5 font-sans text-base text-ink placeholder:text-faint disabled:bg-sand disabled:text-muted';

type Props = ComponentPropsWithoutRef<'input'> & { invalid?: boolean };

export function TextInput({ invalid, className, ...props }: Props) {
  const border = invalid ? 'border-error' : 'border-leader';
  return <input {...props} aria-invalid={invalid || undefined} className={`${controlClass} ${border} ${className ?? ''}`} />;
}
