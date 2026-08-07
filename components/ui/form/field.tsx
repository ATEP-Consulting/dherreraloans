import type { ReactNode } from 'react';

type Props = { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode };

export function Field({ label, htmlFor, hint, error, children }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-sans text-micro font-medium uppercase tracking-label text-muted">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="font-sans text-fine text-muted">{hint}</p> : null}
      {error ? (
        <p aria-live="polite" className="font-sans text-fine font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
