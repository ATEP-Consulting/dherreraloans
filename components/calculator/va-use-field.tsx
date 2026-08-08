'use client';
import { VA_USES, type VaUse } from '@/lib/calc/va';
import { Field } from '@/components/ui/form/field';
import { SelectField } from '@/components/ui/form/select-field';

// El select "This is my..." (uso del beneficio VA) se repite igual en Affordability→VA,
// VaPurchaseCalc y VaRefinanceCalc (ADR-0010: un único bloque, no copia-pega en 3 sitios).
export type VaUseFieldTexts = { vaUseLabel: string; vaUseOptions: Record<VaUse, string> };

export function VaUseField({
  id,
  value,
  onChange,
  texts,
}: {
  id: string;
  value: VaUse;
  onChange: (value: VaUse) => void;
  texts: VaUseFieldTexts;
}) {
  return (
    <Field label={texts.vaUseLabel} htmlFor={id}>
      <SelectField
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as VaUse)}
        options={VA_USES.map((use) => ({ value: use, label: texts.vaUseOptions[use] }))}
      />
    </Field>
  );
}
