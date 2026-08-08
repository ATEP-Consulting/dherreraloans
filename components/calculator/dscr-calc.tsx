'use client';
import { useState } from 'react';
import { dscrMetrics } from '@/lib/calc/dscr';
import { steppedRange } from '@/lib/calc/constants';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { SelectField } from '@/components/ui/form/select-field';
import { ChoiceCard } from '@/components/ui/form/choice-card';
import { CalcLayout, CalcGroupTitle, CalcKpi, CalcKpiLabel, kpiLabelClass } from './calc-layout';

type Units = 1 | 2 | 3 | 4;
type Purpose = 'purchase' | 'refinance';

export type DscrCalcTexts = {
  propertyTitle: string;
  expensesTitle: string;
  loanTitle: string;
  unitsLabel: string;
  unitRentLabel: string;
  purposeLabel: string;
  purposeOptions: Record<Purpose, string>;
  valueLabelPurchase: string;
  valueLabelRefinance: string;
  taxLabel: string;
  insuranceLabel: string;
  hoaLabel: string;
  vacancyLabel: string;
  repairsLabel: string;
  utilitiesLabel: string;
  ltvLabel: string;
  rateLabel: string;
  originationLabel: string;
  closingLabel: string;
  resultEmpty: string;
  notAvailable: string;
  kpiCashFlowLabel: string;
  kpiCapRateLabel: string;
  kpiCashOnCashLabel: string;
  kpiDscrLabel: string;
  breakdownTitle: string;
  breakdownLoanLabel: string;
  breakdownDownLabel: string;
  breakdownAnnualMortgageLabel: string;
  breakdownMonthlyLabel: string;
  breakdownOriginationLabel: string;
  metricsTitle: string;
  metricsClosingLabel: string;
  metricsCashNeededLabel: string;
  metricsPricePerUnitLabel: string;
  metricsGrossRentLabel: string;
  metricsOpexLabel: string;
  metricsNoiLabel: string;
  definitionsTitle: string;
  cashFlowDefinition: string;
  capRateDefinition: string;
  cashOnCashDefinition: string;
  dscrDefinition: string;
  disclaimer: string;
};

// §desglose «Variantes → 7»: rangos/pasos exactos de cada select. El plazo de amortización no
// es un campo del formulario en la referencia — se fija a 30 años (caso probado del motor).
const YEARS = 30;
const UNITS_OPTIONS: Units[] = [1, 2, 3, 4];
const PURPOSES: Purpose[] = ['refinance', 'purchase'];
const VACANCY_OPTIONS = steppedRange(3, 20, 1);
const REPAIRS_OPTIONS = steppedRange(300, 1000, 100);
const LTV_OPTIONS = steppedRange(0, 80, 5);
const RATE_OPTIONS = steppedRange(6, 9, 0.125);
const ORIGINATION_OPTIONS = steppedRange(0, 3, 0.25);

export function DscrCalc({ texts, locale }: { texts: DscrCalcTexts; locale: string }) {
  const [units, setUnits] = useState<Units>(1);
  const [purpose, setPurpose] = useState<Purpose>('refinance');
  const [value, setValue] = useState<number | null>(500000);
  const [rents, setRents] = useState<(number | null)[]>([2500, null, null, null]);
  const [taxesYearly, setTaxesYearly] = useState<number | null>(4000);
  const [insuranceYearly, setInsuranceYearly] = useState<number | null>(3000);
  const [hoaMonthly, setHoaMonthly] = useState<number | null>(0);
  const [vacancyPct, setVacancyPct] = useState(5);
  const [repairsYearly, setRepairsYearly] = useState(500);
  const [utilitiesYearly, setUtilitiesYearly] = useState<number | null>(5000);
  const [ltvPct, setLtvPct] = useState(80);
  const [ratePct, setRatePct] = useState(8);
  const [originationPct, setOriginationPct] = useState(2);
  const [closingCosts, setClosingCosts] = useState<number | null>(6500);

  const money = (v: number, d = 0) => formatMoney(v, locale, d);
  const pct = (v: number, d = 2) => `${v.toFixed(d)}%`;
  const na = <span aria-label={texts.notAvailable}>—</span>;

  const activeRents = rents.slice(0, units);
  const rentsValid = activeRents.every((r) => r !== null && r >= 0);

  function setRent(index: number, v: number | null) {
    setRents((prev) => prev.map((r, i) => (i === index ? v : r)));
  }

  // closingCosts se re-adjunta al resultado (junto con el total desglosado) para no repetir la
  // guarda de null fuera del ternario — mismo patrón que VaRefinanceCalc.
  const result =
    value !== null &&
    rentsValid &&
    taxesYearly !== null &&
    insuranceYearly !== null &&
    hoaMonthly !== null &&
    utilitiesYearly !== null &&
    closingCosts !== null
      ? (() => {
          const r = dscrMetrics({
            value,
            monthlyRents: activeRents as number[],
            taxesYearly,
            insuranceYearly,
            hoaMonthly,
            vacancyPct,
            repairsYearly,
            utilitiesYearly,
            ltvPct,
            annualRatePct: ratePct,
            originationPct,
            closingCosts,
            years: YEARS,
          });
          return r ? { ...r, totalClosingCosts: r.originationFee + closingCosts } : null;
        })()
      : null;

  const valueLabel = purpose === 'purchase' ? texts.valueLabelPurchase : texts.valueLabelRefinance;

  const form = (
    <>
      <CalcGroupTitle>{texts.propertyTitle}</CalcGroupTitle>
      <Field label={texts.unitsLabel} htmlFor="dscr-units">
        <SelectField
          id="dscr-units"
          value={String(units)}
          onChange={(e) => setUnits(Number(e.target.value) as Units)}
          options={UNITS_OPTIONS.map((u) => ({ value: String(u), label: String(u) }))}
        />
      </Field>
      <fieldset className="flex flex-col gap-2.5">
        <legend className={kpiLabelClass}>{texts.purposeLabel}</legend>
        {PURPOSES.map((p) => (
          <ChoiceCard key={p} name="dscr-purpose" value={p} label={texts.purposeOptions[p]} checked={purpose === p} onSelect={() => setPurpose(p)} />
        ))}
      </fieldset>
      <Field label={valueLabel} htmlFor="dscr-value">
        <MoneyInput id="dscr-value" value={value} onValueChange={setValue} locale={locale} />
      </Field>
      {Array.from({ length: units }, (_, i) => (
        <Field key={i} label={texts.unitRentLabel.replace('{n}', String(i + 1))} htmlFor={`dscr-rent-${i}`}>
          <MoneyInput id={`dscr-rent-${i}`} value={rents[i]} onValueChange={(v) => setRent(i, v)} locale={locale} />
        </Field>
      ))}

      <CalcGroupTitle>{texts.expensesTitle}</CalcGroupTitle>
      <Field label={texts.taxLabel} htmlFor="dscr-tax">
        <MoneyInput id="dscr-tax" value={taxesYearly} onValueChange={setTaxesYearly} locale={locale} />
      </Field>
      <Field label={texts.insuranceLabel} htmlFor="dscr-insurance">
        <MoneyInput id="dscr-insurance" value={insuranceYearly} onValueChange={setInsuranceYearly} locale={locale} />
      </Field>
      <Field label={texts.hoaLabel} htmlFor="dscr-hoa">
        <MoneyInput id="dscr-hoa" value={hoaMonthly} onValueChange={setHoaMonthly} locale={locale} />
      </Field>
      <Field label={texts.vacancyLabel} htmlFor="dscr-vacancy">
        <SelectField
          id="dscr-vacancy"
          value={String(vacancyPct)}
          onChange={(e) => setVacancyPct(Number(e.target.value))}
          options={VACANCY_OPTIONS.map((v) => ({ value: String(v), label: `${v}%` }))}
        />
      </Field>
      <Field label={texts.repairsLabel} htmlFor="dscr-repairs">
        <SelectField
          id="dscr-repairs"
          value={String(repairsYearly)}
          onChange={(e) => setRepairsYearly(Number(e.target.value))}
          options={REPAIRS_OPTIONS.map((v) => ({ value: String(v), label: money(v, 2) }))}
        />
      </Field>
      <Field label={texts.utilitiesLabel} htmlFor="dscr-utilities">
        <MoneyInput id="dscr-utilities" value={utilitiesYearly} onValueChange={setUtilitiesYearly} locale={locale} />
      </Field>

      <CalcGroupTitle>{texts.loanTitle}</CalcGroupTitle>
      <Field label={texts.ltvLabel} htmlFor="dscr-ltv">
        <SelectField
          id="dscr-ltv"
          value={String(ltvPct)}
          onChange={(e) => setLtvPct(Number(e.target.value))}
          options={LTV_OPTIONS.map((v) => ({ value: String(v), label: `${v}%` }))}
        />
      </Field>
      <Field label={texts.rateLabel} htmlFor="dscr-rate">
        <SelectField
          id="dscr-rate"
          value={String(ratePct)}
          onChange={(e) => setRatePct(Number(e.target.value))}
          options={RATE_OPTIONS.map((v) => ({ value: String(v), label: `${v.toFixed(3)}%` }))}
        />
      </Field>
      <Field label={texts.originationLabel} htmlFor="dscr-origination">
        <SelectField
          id="dscr-origination"
          value={String(originationPct)}
          onChange={(e) => setOriginationPct(Number(e.target.value))}
          options={ORIGINATION_OPTIONS.map((v) => ({ value: String(v), label: `${v.toFixed(2)}%` }))}
        />
      </Field>
      <Field label={texts.closingLabel} htmlFor="dscr-closing">
        <MoneyInput id="dscr-closing" value={closingCosts} onValueChange={setClosingCosts} locale={locale} />
      </Field>
    </>
  );

  const results = result ? (
    <>
      <div className="grid grid-cols-2 gap-6">
        <CalcKpi label={texts.kpiCashFlowLabel} value={money(result.cashFlow)} tone={result.cashFlow < 0 ? 'error' : 'default'} />
        <CalcKpi label={texts.kpiCapRateLabel} value={pct(result.capRatePct)} />
        <CalcKpi
          label={texts.kpiCashOnCashLabel}
          value={result.cashOnCashPct === null ? na : pct(result.cashOnCashPct)}
          tone={result.cashOnCashPct !== null && result.cashOnCashPct < 0 ? 'error' : 'default'}
        />
        <CalcKpi
          label={texts.kpiDscrLabel}
          value={result.dscr === null ? na : result.dscr.toFixed(2)}
          tone={result.dscr !== null && result.dscr < 1 ? 'error' : 'default'}
        />
      </div>
      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.breakdownTitle}</CalcKpiLabel>
        <dl className="flex flex-col gap-2 font-sans text-sm text-body">
          <div className="flex justify-between gap-4"><dt>{texts.breakdownLoanLabel}</dt><dd className="tabular-nums">{money(result.loanAmount)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownDownLabel}</dt><dd className="tabular-nums">{money(result.downPayment)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownAnnualMortgageLabel}</dt><dd className="tabular-nums">{money(result.monthlyDebtService * 12)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownMonthlyLabel}</dt><dd className="tabular-nums">{money(result.monthlyDebtService, 2)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownOriginationLabel}</dt><dd className="tabular-nums">{money(result.originationFee)}</dd></div>
        </dl>
      </div>
      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.metricsTitle}</CalcKpiLabel>
        <dl className="flex flex-col gap-2 font-sans text-sm text-body">
          <div className="flex justify-between gap-4"><dt>{texts.metricsClosingLabel}</dt><dd className="tabular-nums">{money(result.totalClosingCosts)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.metricsCashNeededLabel}</dt><dd className="tabular-nums">{money(result.cashNeeded)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.metricsPricePerUnitLabel}</dt><dd className="tabular-nums">{money(result.pricePerUnit)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.metricsGrossRentLabel}</dt><dd className="tabular-nums">{money(result.grossRentYearly)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.metricsOpexLabel}</dt><dd className="tabular-nums">{money(result.operatingExpenses)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.metricsNoiLabel}</dt><dd className="tabular-nums">{money(result.noi)}</dd></div>
        </dl>
      </div>
      <div className="flex flex-col gap-3 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.definitionsTitle}</CalcKpiLabel>
        <dl className="flex flex-col gap-3 font-sans text-sm leading-[1.7] text-body">
          <div><dt className="font-medium text-ink">{texts.kpiCashFlowLabel}</dt><dd>{texts.cashFlowDefinition}</dd></div>
          <div><dt className="font-medium text-ink">{texts.kpiCapRateLabel}</dt><dd>{texts.capRateDefinition}</dd></div>
          <div><dt className="font-medium text-ink">{texts.kpiCashOnCashLabel}</dt><dd>{texts.cashOnCashDefinition}</dd></div>
          <div><dt className="font-medium text-ink">{texts.kpiDscrLabel}</dt><dd>{texts.dscrDefinition}</dd></div>
        </dl>
      </div>
    </>
  ) : (
    <p className="font-sans text-base text-body">{texts.resultEmpty}</p>
  );

  return <CalcLayout form={form} results={results} disclaimer={texts.disclaimer} />;
}
