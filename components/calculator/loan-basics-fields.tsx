'use client';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { SelectField } from '@/components/ui/form/select-field';

// El bloque precio/entrada/tasa/plazo se repite idéntico en purchase, affordability y el grupo
// "hipoteca" de rent-vs-buy (ADR-0010). Refinance no tiene precio (no aplica) y rent-vs-buy suma
// campos propios (impuesto en dólares, etc.) que NO se fuerzan aquí — solo se extrae la duplicación real.
export type LoanBasicsFieldsTexts = {
  priceLabel: string;
  downLabel: string;
  downPct: string;
  errorDown: string;
  rateLabel: string;
  termLabel: string;
  termOption: string;
};

// Única fuente de verdad para el error/hint de entrada: cada variante también los necesita fuera
// del formulario (para bloquear el cálculo y para el mensaje vacío), así que se exportan sueltos
// en vez de quedar encapsulados solo dentro del componente de campos.
export function downPaymentError(price: number | null, down: number | null): boolean {
  return price !== null && down !== null && down >= price;
}

export function downPaymentPct(price: number | null, down: number | null): string | null {
  return price && down ? `${((down / price) * 100).toFixed(1)}%` : null;
}

export function LoanBasicsFields<Years extends number>({
  idPrefix,
  locale,
  texts,
  price,
  onPriceChange,
  down,
  onDownChange,
  rate,
  onRateChange,
  years,
  onYearsChange,
  terms,
}: {
  idPrefix: string;
  locale: string;
  texts: LoanBasicsFieldsTexts;
  price: number | null;
  onPriceChange: (v: number | null) => void;
  down: number | null;
  onDownChange: (v: number | null) => void;
  rate: number | null;
  onRateChange: (v: number | null) => void;
  years: Years;
  onYearsChange: (v: Years) => void;
  terms: readonly Years[];
}) {
  const downError = downPaymentError(price, down);
  const pct = downPaymentPct(price, down);
  return (
    <>
      <Field label={texts.priceLabel} htmlFor={`${idPrefix}-price`}>
        <MoneyInput id={`${idPrefix}-price`} value={price} onValueChange={onPriceChange} locale={locale} />
      </Field>
      <Field
        label={texts.downLabel}
        htmlFor={`${idPrefix}-down`}
        hint={pct ? texts.downPct.replace('{pct}', pct) : undefined}
        error={downError ? texts.errorDown : undefined}
      >
        <MoneyInput id={`${idPrefix}-down`} value={down} onValueChange={onDownChange} locale={locale} invalid={downError} />
      </Field>
      <Field label={texts.rateLabel} htmlFor={`${idPrefix}-rate`}>
        <PercentInput id={`${idPrefix}-rate`} value={rate} onValueChange={onRateChange} />
      </Field>
      <Field label={texts.termLabel} htmlFor={`${idPrefix}-term`}>
        <SelectField
          id={`${idPrefix}-term`}
          value={String(years)}
          onChange={(e) => onYearsChange(Number(e.target.value) as Years)}
          options={terms.map((y) => ({ value: String(y), label: texts.termOption.replace('{years}', String(y)) }))}
        />
      </Field>
    </>
  );
}
