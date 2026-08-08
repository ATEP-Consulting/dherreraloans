'use client';
import type { ReactNode } from 'react';

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
