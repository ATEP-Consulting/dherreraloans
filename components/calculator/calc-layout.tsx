'use client';
import type { ReactNode } from 'react';

// Class-strings compartidos entre las 4 variantes de calculadora (ADR-0010: un token/const, no
// copiar-pegar). CalcGroupTitle/CalcKpiLabel/CalcKpi son wrappers finos — sin div contenedor propio,
// para no alterar el spacing (gap-*) del flex-col del padre en cada variante.
export const groupTitleClass = 'font-sans text-micro font-semibold uppercase tracking-label text-ink border-b border-hairline pb-2';
export const kpiLabelClass = 'font-sans text-micro font-medium uppercase tracking-label text-muted';
// Tamaño FIJO (no `text-h2` fluido): con el panel de ancho acotado, a 44 px los valores de dos
// KPI contiguos quedaban casi pegados en pantallas anchas. `min-h` de dos líneas en la etiqueta
// mantiene alineados los valores cuando una etiqueta ocupa una línea y otra dos.
export const kpiValueClass = 'font-display text-[28px] font-light leading-tight tabular-nums lg:text-[32px]';
// Solo desde `sm`: ahí los KPI van en dos columnas y hace falta reservar la segunda línea para
// que los valores queden alineados. En móvil (una columna) la etiqueta cabe en una línea.
export const kpiLabelReserveClass = 'sm:min-h-[2lh]';

export function CalcGroupTitle({ children }: { children: ReactNode }) {
  return <h3 className={groupTitleClass}>{children}</h3>;
}

export function CalcKpiLabel({ id, reserve, children }: { id?: string; reserve?: boolean; children: ReactNode }) {
  return (
    <p id={id} className={reserve ? `${kpiLabelClass} ${kpiLabelReserveClass}` : kpiLabelClass}>
      {children}
    </p>
  );
}

export function CalcKpi({ label, value, tone = 'default', reserveLabel }: { label: ReactNode; value: ReactNode; tone?: 'default' | 'error'; reserveLabel?: boolean }) {
  return (
    <>
      <CalcKpiLabel reserve={reserveLabel}>{label}</CalcKpiLabel>
      <p className={`${kpiValueClass} ${tone === 'error' ? 'text-error' : 'text-ink'}`}>{value}</p>
    </>
  );
}

export function CalcLayout({ form, results, disclaimer }: { form: ReactNode; results: ReactNode; disclaimer: string }) {
  return (
    <div className="grid max-w-[1120px] gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-14">
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>{form}</form>
      <div aria-live="polite" className="flex h-fit flex-col gap-6 border border-ink bg-plate p-6 lg:p-8">
        {results}
        <p className="font-sans text-fine italic text-muted">{disclaimer}</p>
      </div>
    </div>
  );
}
