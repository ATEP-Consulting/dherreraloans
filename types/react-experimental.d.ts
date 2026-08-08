// Shim de tipos — SOLO mientras react@19 estable no exporte ni tipe `ViewTransition`.
//
// Contexto (spike/view-transitions, Task 16): Next 16 resuelve internamente los imports
// de 'react' en app/ al React vendorizado (node_modules/next/dist/compiled/react), que SÍ
// exporta `ViewTransition` en runtime (confirmado: `exports.ViewTransition =
// REACT_VIEW_TRANSITION_TYPE` en react.production.js). El react@19.2.8 instalado en
// node_modules/react (el que usa `tsc` para tipar) no lo declara → sin este shim,
// `tsc --noEmit` rompe con "Module '\"react\"' has no exported member 'ViewTransition'".
//
// Guía oficial (node_modules/next/dist/docs/01-app/02-guides/view-transitions.md) importa
// exactamente `import { ViewTransition } from 'react'` — de ahí el nombre del export aquí.
// Si una futura versión estable de react/@types/react lo tipa nativamente, borrar este fichero.
import 'react';
declare module 'react' {
  export function ViewTransition(props: {
    children?: React.ReactNode;
    name?: string;
    enter?: string;
    exit?: string;
    default?: string;
  }): React.ReactNode;
}
