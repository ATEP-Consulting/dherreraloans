import type { ReactNode } from 'react';

type Props = {
  className?: string;
  children: ReactNode;
};

/**
 * Centra el CONTENIDO a --container-max (1440px, artboard del handoff).
 * Se usa DENTRO de cada fondo full-bleed (hero, bandas, footer…) para que
 * el fondo/borde siga ocupando el 100% del viewport mientras el contenido
 * se limita y centra. No aporta padding propio: el padding horizontal se
 * pasa vía `className` en cada punto de uso.
 */
export function Container({ className = '', children }: Props) {
  return <div className={`mx-auto w-full max-w-[var(--container-max)] ${className}`}>{children}</div>;
}
