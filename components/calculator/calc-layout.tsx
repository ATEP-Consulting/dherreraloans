'use client';
import type { ReactNode } from 'react';

// Class-strings compartidos entre las 4 variantes de calculadora (ADR-0010: un token/const, no
// copiar-pegar). CalcGroupTitle/CalcKpiLabel/CalcKpi son wrappers finos — sin div contenedor propio,
// para no alterar el spacing (gap-*) del flex-col del padre en cada variante.
export const groupTitleClass = 'font-sans text-micro font-semibold uppercase tracking-label text-ink border-b border-hairline pb-2';
export const kpiLabelClass = 'font-sans text-micro font-medium uppercase tracking-label text-muted';
export const kpiValueClass = 'font-display text-h2 font-light tabular-nums';

export function CalcGroupTitle({ children }: { children: ReactNode }) {
  return <h3 className={groupTitleClass}>{children}</h3>;
}

export function CalcKpiLabel({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className={kpiLabelClass}>
      {children}
    </p>
  );
}

export function CalcKpi({ label, value, tone = 'default' }: { label: ReactNode; value: ReactNode; tone?: 'default' | 'error' }) {
  return (
    <>
      <CalcKpiLabel>{label}</CalcKpiLabel>
      <p className={`${kpiValueClass} ${tone === 'error' ? 'text-error' : 'text-ink'}`}>{value}</p>
    </>
  );
}

export function CalcLayout({ form, results, disclaimer }: { form: ReactNode; results: ReactNode; disclaimer: string }) {
  return (
    <div className="grid max-w-[880px] gap-8 lg:grid-cols-2 lg:gap-12">
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>{form}</form>
      <div aria-live="polite" className="flex flex-col gap-5 border border-ink p-6 lg:p-8">
        {results}
        <p className="border-t border-hairline pt-4 font-sans text-fine italic text-muted">{disclaimer}</p>
      </div>
    </div>
  );
}
