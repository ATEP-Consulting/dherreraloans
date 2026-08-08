import type { ReactNode } from 'react';
import { ViewTransition } from 'react';

// Se remonta en cada navegación de su nivel → re-dispara la transición.
// SPIKE (Task 16, rama spike/view-transitions): <ViewTransition> (React, vía guía oficial
// node_modules/next/dist/docs/01-app/02-guides/view-transitions.md) activa el cross-fade real
// de salida+entrada del navegador cuando la View Transitions API está disponible. `.page-enter`
// (CSS, solo transform, LCP-safe) sigue de fallback para navegadores sin soporte — se anula vía
// `@supports (view-transition-name: none)` en app/globals.css para no animar dos veces a la vez.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition>
      <div className="page-enter">{children}</div>
    </ViewTransition>
  );
}
