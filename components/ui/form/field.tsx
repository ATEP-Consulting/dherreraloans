import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

type Props = { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode };

// WCAG 3.3.1 (Error Identification): el hint/error debe estar asociado al control, no solo
// visible al lado — si no, un lector de pantalla anuncia "inválido" sin decir el porqué.
// El hijo es siempre un único control de formulario (MoneyInput/PercentInput/TextInput/
// SelectField): se le inyecta aria-describedby por clonado, sin tocar la API de Field.
export function Field({ label, htmlFor, hint, error, children }: Props) {
  const hintId = hint && !error ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = errorId ?? hintId;
  const control =
    describedBy && isValidElement(children)
      ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': describedBy })
      : children;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-sans text-micro font-medium uppercase tracking-label text-muted">
        {label}
      </label>
      {control}
      {hintId ? (
        <p id={hintId} className="font-sans text-fine text-muted">
          {hint}
        </p>
      ) : null}
      {errorId ? (
        <p id={errorId} aria-live="polite" className="font-sans text-fine font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
