'use client';
import { useState } from 'react';
import { affordability } from '@/lib/calc/affordability';
import { DEFAULTS, CREDIT_BANDS, type Program, type CreditBand } from '@/lib/calc/constants';
import type { VaUse } from '@/lib/calc/va';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { SelectField } from '@/components/ui/form/select-field';
import { CalcLayout, CalcKpi } from './calc-layout';
import { CalcDonut } from './calc-donut';
import { LoanBasicsFields, downPaymentError } from './loan-basics-fields';

export type AffordabilityCalcTexts = {
  programs: Record<Program, string>;
  programGroupLabel: string;
  incomeLabel: string; debtsLabel: string; debtsHint: string;
  priceLabel: string; downLabel: string; downPct: string;
  rateLabel: string; termLabel: string; termOption: string;
  taxLabel: string; insuranceLabel: string; hoaLabel: string; creditLabel: string;
  vaUseLabel: string; vaUseOptions: Record<VaUse, string>;
  resultLabel: string; resultEmpty: string; errorDown: string;
  breakdownPiLabel: string; breakdownTaxLabel: string; breakdownInsuranceLabel: string; breakdownHoaLabel: string;
  feeLabel: { pmi: string; mip: string; usda: string; none: string };
  upfrontLabel: string;
  dtiYours: string; dtiAllowed: string; dtiOk: string; dtiOver: string;
  summary: string; confirm: string;
};

const VA_USES: VaUse[] = ['first', 'subsequent', 'exempt'];

const TERMS = [30, 20, 15] as const;
const PROGRAMS: Program[] = ['conventional', 'fha', 'va', 'usda', 'jumbo'];

// El fee mensual cambia de nombre según el programa (PMI/MIP/USDA/ninguno) — §desglose
// «Affordability → Outputs»: leyenda del donut "PMI / MIP / USDA MIP / nada extra (VA)".
function feeLabelFor(program: Program, texts: AffordabilityCalcTexts): string {
  if (program === 'fha') return texts.feeLabel.mip;
  if (program === 'usda') return texts.feeLabel.usda;
  if (program === 'va') return texts.feeLabel.none;
  return texts.feeLabel.pmi; // conventional / jumbo
}

export function AffordabilityCalc({ texts, locale }: { texts: AffordabilityCalcTexts; locale: string }) {
  const [program, setProgram] = useState<Program>('conventional');
  const [income, setIncome] = useState<number | null>(DEFAULTS.monthlyIncome);
  const [debts, setDebts] = useState<number | null>(DEFAULTS.monthlyDebts);
  const [price, setPrice] = useState<number | null>(DEFAULTS.price);
  const [down, setDown] = useState<number | null>(0);
  const [rate, setRate] = useState<number | null>(DEFAULTS.ratePct);
  const [years, setYears] = useState<(typeof TERMS)[number]>(DEFAULTS.years);
  const [taxPct, setTaxPct] = useState<number | null>(DEFAULTS.propertyTaxPct);
  const [insuranceYearly, setInsuranceYearly] = useState<number | null>(DEFAULTS.insuranceYearly);
  const [hoa, setHoa] = useState<number | null>(0);
  const [creditBand, setCreditBand] = useState<CreditBand>('760+');
  const [vaUse, setVaUse] = useState<VaUse>('first');

  const downError = downPaymentError(price, down);
  const money = (v: number, d = 0) => formatMoney(v, locale, d);
  const showCredit = program === 'conventional' || program === 'jumbo';
  const showVaUse = program === 'va';

  const result =
    income !== null &&
    debts !== null &&
    price !== null &&
    down !== null &&
    rate !== null &&
    taxPct !== null &&
    insuranceYearly !== null &&
    hoa !== null &&
    !downError
      ? affordability(
          {
            monthlyIncome: income, monthlyDebts: debts, price, downPayment: down,
            annualRatePct: rate, years, propertyTaxPct: taxPct, insuranceYearly,
            hoaMonthly: hoa, creditBand, vaUse,
          },
          program,
        )
      : null;

  // Selector de programa: grupo de botones tipo radio (aria-pressed), no un tablist anidado
  // dentro del tabpanel de CalcTabs — la semántica de "pestañas dentro de pestañas" viola APG.
  const programTabs = (
    <div role="group" aria-label={texts.programGroupLabel} className="flex flex-wrap gap-px border border-hairline bg-hairline">
      {PROGRAMS.map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={program === p}
          onClick={() => setProgram(p)}
          className={`px-3 py-2 font-sans text-micro font-medium uppercase tracking-label ${program === p ? 'bg-navy text-paper' : 'bg-paper text-body hover:bg-sand'}`}
        >
          {texts.programs[p]}
        </button>
      ))}
    </div>
  );

  const form = (
    <>
      <Field label={texts.incomeLabel} htmlFor="afford-income">
        <MoneyInput id="afford-income" value={income} onValueChange={setIncome} locale={locale} />
      </Field>
      <Field label={texts.debtsLabel} htmlFor="afford-debts" hint={texts.debtsHint}>
        <MoneyInput id="afford-debts" value={debts} onValueChange={setDebts} locale={locale} />
      </Field>
      <LoanBasicsFields
        idPrefix="afford"
        locale={locale}
        texts={texts}
        price={price}
        onPriceChange={setPrice}
        down={down}
        onDownChange={setDown}
        rate={rate}
        onRateChange={setRate}
        years={years}
        onYearsChange={setYears}
        terms={TERMS}
      />
      <Field label={texts.taxLabel} htmlFor="afford-tax">
        <PercentInput id="afford-tax" value={taxPct} onValueChange={setTaxPct} />
      </Field>
      <Field label={texts.insuranceLabel} htmlFor="afford-insurance">
        <MoneyInput id="afford-insurance" value={insuranceYearly} onValueChange={setInsuranceYearly} locale={locale} />
      </Field>
      <Field label={texts.hoaLabel} htmlFor="afford-hoa">
        <MoneyInput id="afford-hoa" value={hoa} onValueChange={setHoa} locale={locale} />
      </Field>
      {showCredit ? (
        <Field label={texts.creditLabel} htmlFor="afford-credit">
          <SelectField
            id="afford-credit"
            value={creditBand}
            onChange={(e) => setCreditBand(e.target.value as CreditBand)}
            options={CREDIT_BANDS.map((band) => ({ value: band, label: band }))}
          />
        </Field>
      ) : null}
      {showVaUse ? (
        <Field label={texts.vaUseLabel} htmlFor="afford-va-use">
          <SelectField
            id="afford-va-use"
            value={vaUse}
            onChange={(e) => setVaUse(e.target.value as VaUse)}
            options={VA_USES.map((use) => ({ value: use, label: texts.vaUseOptions[use] }))}
          />
        </Field>
      ) : null}
    </>
  );

  const results = result ? (
    <>
      <CalcKpi label={texts.resultLabel} value={money(result.totalMonthly, 2)} />
      <CalcDonut
        segments={[
          { label: `${texts.breakdownPiLabel} · ${money(result.monthlyPI, 2)}`, value: result.monthlyPI, swatchClass: 'text-navy' },
          { label: `${texts.breakdownTaxLabel} · ${money(result.monthlyTax, 2)}`, value: result.monthlyTax, swatchClass: 'text-azure' },
          { label: `${texts.breakdownInsuranceLabel} · ${money(result.monthlyInsurance, 2)}`, value: result.monthlyInsurance, swatchClass: 'text-azure-soft' },
          { label: `${texts.breakdownHoaLabel} · ${money(result.monthlyHoa, 2)}`, value: result.monthlyHoa, swatchClass: 'text-ink' },
          { label: `${feeLabelFor(program, texts)} · ${money(result.monthlyFee, 2)}`, value: result.monthlyFee, swatchClass: 'text-muted' },
        ]}
        centerLabel={texts.resultLabel}
        centerValue={money(result.totalMonthly, 2)}
      />
      {result.upfrontFee > 0 ? (
        <dl className="flex flex-col gap-2 border-t border-hairline pt-4 font-sans text-sm text-body">
          <div className="flex justify-between gap-4">
            <dt>{texts.upfrontLabel}</dt>
            <dd className="tabular-nums">{money(result.upfrontFee)}</dd>
          </div>
        </dl>
      ) : null}
      <div className="flex flex-col gap-2 border-t border-hairline pt-4 font-sans text-sm text-body">
        <p>{texts.dtiYours.replace('{front}', result.frontDti.toFixed(2)).replace('{back}', result.backDti.toFixed(2))}</p>
        <p>{texts.dtiAllowed.replace('{maxFront}', String(result.limits.front)).replace('{maxBack}', String(result.limits.back))}</p>
        <p className={`font-medium ${result.withinLimits ? 'text-ink' : 'text-error'}`}>
          {result.withinLimits ? texts.dtiOk : texts.dtiOver}
        </p>
      </div>
      <p className="border-t border-hairline pt-4 font-sans text-sm leading-[1.7] text-body">
        {texts.summary
          .replace('{total}', money(result.totalMonthly, 2))
          .replace('{program}', texts.programs[program])
          .replace('{front}', result.frontDti.toFixed(2))
          .replace('{back}', result.backDti.toFixed(2))
          .replace('{maxFront}', String(result.limits.front))
          .replace('{maxBack}', String(result.limits.back))}
      </p>
    </>
  ) : (
    <p className="font-sans text-base text-body">{downError ? texts.errorDown : texts.resultEmpty}</p>
  );

  return (
    <div className="flex flex-col gap-6">
      {programTabs}
      <CalcLayout form={form} results={results} disclaimer={texts.confirm} />
    </div>
  );
}
