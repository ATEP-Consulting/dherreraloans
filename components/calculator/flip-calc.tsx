'use client';
import { useState } from 'react';
import { flipMetrics } from '@/lib/calc/flip';
import { steppedRange } from '@/lib/calc/constants';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { SelectField } from '@/components/ui/form/select-field';
import { CalcLayout, CalcGroupTitle, CalcKpi, CalcKpiLabel } from './calc-layout';

export type FlipCalcTexts = {
  dealTitle: string;
  costsTitle: string;
  loanTitle: string;
  priceLabel: string;
  renovationLabel: string;
  arvLabel: string;
  monthsLabel: string;
  monthsOptionOne: string;
  monthsOptionOther: string;
  taxLabel: string;
  insuranceLabel: string;
  ltvLabel: string;
  ltvExperiencedNote: string;
  rateLabel: string;
  originationLabel: string;
  otherClosingLabel: string;
  costToSellLabel: string;
  resultEmpty: string;
  notAvailable: string;
  kpiEquityLabel: string;
  kpiNetProfitLabel: string;
  kpiRoiLabel: string;
  kpiLtarvLabel: string;
  breakdownTitle: string;
  breakdownLoanLabel: string;
  breakdownDownLabel: string;
  breakdownMonthlyInterestLabel: string;
  breakdownTotalInterestLabel: string;
  breakdownOriginationLabel: string;
  breakdownOtherClosingLabel: string;
  breakdownCostToSellLabel: string;
  metricsTitle: string;
  metricsClosingLabel: string;
  metricsCarryingLabel: string;
  metricsEquityLabel: string;
  metricsCashInDealLabel: string;
  definitionsTitle: string;
  netProfitDefinition: string;
  roiDefinition: string;
  ltarvDefinition: string;
  disclaimer: string;
};

// §desglose «Variantes → 8»: rangos/pasos exactos de cada select. El LTV no es un rango
// continuo sino un conjunto de tramos concretos (85 %/90 % marcados "solo inversores con
// experiencia" en la referencia).
const MONTHS_OPTIONS = steppedRange(1, 18, 1);
const LTV_OPTIONS = [65, 70, 75, 80, 85, 90] as const;
const RATE_OPTIONS = steppedRange(9, 12, 0.125);
const ORIGINATION_OPTIONS = steppedRange(2, 3, 0.25);
const OTHER_CLOSING_OPTIONS = steppedRange(2, 4, 0.5);
const COST_TO_SELL_OPTIONS = steppedRange(1, 7, 1);

export function FlipCalc({ texts, locale }: { texts: FlipCalcTexts; locale: string }) {
  const [purchasePrice, setPurchasePrice] = useState<number | null>(500000);
  const [renovationCost, setRenovationCost] = useState<number | null>(75000);
  const [arv, setArv] = useState<number | null>(750000);
  const [months, setMonths] = useState(9);
  const [taxesYearly, setTaxesYearly] = useState<number | null>(4000);
  const [insuranceYearly, setInsuranceYearly] = useState<number | null>(3000);
  const [ltvPct, setLtvPct] = useState(80);
  const [ratePct, setRatePct] = useState(10);
  const [originationPct, setOriginationPct] = useState(2);
  const [otherClosingPct, setOtherClosingPct] = useState(3);
  const [costToSellPct, setCostToSellPct] = useState(5);

  const money = (v: number, d = 0) => formatMoney(v, locale, d);
  const pct = (v: number, d = 2) => `${v.toFixed(d)}%`;
  const na = <span aria-label={texts.notAvailable}>—</span>;

  const result =
    purchasePrice !== null && renovationCost !== null && arv !== null && taxesYearly !== null && insuranceYearly !== null
      ? flipMetrics({
          purchasePrice,
          renovationCost,
          arv,
          months,
          taxesYearly,
          insuranceYearly,
          ltvPct,
          annualRatePct: ratePct,
          originationPct,
          otherClosingPct,
          costToSellPct,
        })
      : null;

  const form = (
    <>
      <CalcGroupTitle>{texts.dealTitle}</CalcGroupTitle>
      <Field label={texts.priceLabel} htmlFor="flip-price">
        <MoneyInput id="flip-price" value={purchasePrice} onValueChange={setPurchasePrice} locale={locale} />
      </Field>
      <Field label={texts.renovationLabel} htmlFor="flip-renovation">
        <MoneyInput id="flip-renovation" value={renovationCost} onValueChange={setRenovationCost} locale={locale} />
      </Field>
      <Field label={texts.arvLabel} htmlFor="flip-arv">
        <MoneyInput id="flip-arv" value={arv} onValueChange={setArv} locale={locale} />
      </Field>
      <Field label={texts.monthsLabel} htmlFor="flip-months">
        <SelectField
          id="flip-months"
          value={String(months)}
          onChange={(e) => setMonths(Number(e.target.value))}
          options={MONTHS_OPTIONS.map((m) => ({
            value: String(m),
            label: m === 1 ? texts.monthsOptionOne.replace('{months}', '1') : texts.monthsOptionOther.replace('{months}', String(m)),
          }))}
        />
      </Field>

      <CalcGroupTitle>{texts.costsTitle}</CalcGroupTitle>
      <Field label={texts.taxLabel} htmlFor="flip-tax">
        <MoneyInput id="flip-tax" value={taxesYearly} onValueChange={setTaxesYearly} locale={locale} />
      </Field>
      <Field label={texts.insuranceLabel} htmlFor="flip-insurance">
        <MoneyInput id="flip-insurance" value={insuranceYearly} onValueChange={setInsuranceYearly} locale={locale} />
      </Field>

      <CalcGroupTitle>{texts.loanTitle}</CalcGroupTitle>
      <Field label={texts.ltvLabel} htmlFor="flip-ltv">
        <SelectField
          id="flip-ltv"
          value={String(ltvPct)}
          onChange={(e) => setLtvPct(Number(e.target.value))}
          options={LTV_OPTIONS.map((v) => ({
            value: String(v),
            label: v >= 85 ? `${v}% (${texts.ltvExperiencedNote})` : `${v}%`,
          }))}
        />
      </Field>
      <Field label={texts.rateLabel} htmlFor="flip-rate">
        <SelectField
          id="flip-rate"
          value={String(ratePct)}
          onChange={(e) => setRatePct(Number(e.target.value))}
          options={RATE_OPTIONS.map((v) => ({ value: String(v), label: `${v.toFixed(3)}%` }))}
        />
      </Field>
      <Field label={texts.originationLabel} htmlFor="flip-origination">
        <SelectField
          id="flip-origination"
          value={String(originationPct)}
          onChange={(e) => setOriginationPct(Number(e.target.value))}
          options={ORIGINATION_OPTIONS.map((v) => ({ value: String(v), label: `${v.toFixed(2)}%` }))}
        />
      </Field>
      <Field label={texts.otherClosingLabel} htmlFor="flip-other-closing">
        <SelectField
          id="flip-other-closing"
          value={String(otherClosingPct)}
          onChange={(e) => setOtherClosingPct(Number(e.target.value))}
          options={OTHER_CLOSING_OPTIONS.map((v) => ({ value: String(v), label: `${v.toFixed(1)}%` }))}
        />
      </Field>
      <Field label={texts.costToSellLabel} htmlFor="flip-cost-to-sell">
        <SelectField
          id="flip-cost-to-sell"
          value={String(costToSellPct)}
          onChange={(e) => setCostToSellPct(Number(e.target.value))}
          options={COST_TO_SELL_OPTIONS.map((v) => ({ value: String(v), label: `${v}%` }))}
        />
      </Field>
    </>
  );

  const results = result ? (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1">
          <CalcKpi label={texts.kpiEquityLabel} value={money(result.equityNeeded)} />
        </div>
        <div className="flex flex-col gap-1">
          <CalcKpi label={texts.kpiNetProfitLabel} value={money(result.netProfit)} tone={result.netProfit < 0 ? 'error' : 'default'} />
        </div>
        <div className="flex flex-col gap-1">
          <CalcKpi
            label={texts.kpiRoiLabel}
            value={result.roiPct === null ? na : pct(result.roiPct)}
            tone={result.roiPct !== null && result.roiPct < 0 ? 'error' : 'default'}
          />
        </div>
        <div className="flex flex-col gap-1">
          <CalcKpi label={texts.kpiLtarvLabel} value={pct(result.ltarvPct)} />
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.breakdownTitle}</CalcKpiLabel>
        <dl className="flex flex-col gap-2 font-sans text-sm text-body">
          <div className="flex justify-between gap-4"><dt>{texts.breakdownLoanLabel}</dt><dd className="tabular-nums">{money(result.loanAmount)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownDownLabel}</dt><dd className="tabular-nums">{money(result.downPayment)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownMonthlyInterestLabel}</dt><dd className="tabular-nums">{money(result.monthlyInterest, 2)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownTotalInterestLabel}</dt><dd className="tabular-nums">{money(result.totalInterest)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownOriginationLabel}</dt><dd className="tabular-nums">{money(result.originationFee)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownOtherClosingLabel}</dt><dd className="tabular-nums">{money(result.otherClosing)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.breakdownCostToSellLabel}</dt><dd className="tabular-nums">{money(result.costToSell)}</dd></div>
        </dl>
      </div>
      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.metricsTitle}</CalcKpiLabel>
        <dl className="flex flex-col gap-2 font-sans text-sm text-body">
          <div className="flex justify-between gap-4"><dt>{texts.metricsClosingLabel}</dt><dd className="tabular-nums">{money(result.originationFee + result.otherClosing)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.metricsCarryingLabel}</dt><dd className="tabular-nums">{money(result.carryingCosts)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.metricsEquityLabel}</dt><dd className="tabular-nums">{money(result.equityNeeded)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.metricsCashInDealLabel}</dt><dd className="tabular-nums">{money(result.cashInDeal)}</dd></div>
        </dl>
      </div>
      <div className="flex flex-col gap-3 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.definitionsTitle}</CalcKpiLabel>
        <dl className="flex flex-col gap-3 font-sans text-sm leading-[1.7] text-body">
          <div><dt className="font-medium text-ink">{texts.kpiNetProfitLabel}</dt><dd>{texts.netProfitDefinition}</dd></div>
          <div><dt className="font-medium text-ink">{texts.kpiRoiLabel}</dt><dd>{texts.roiDefinition}</dd></div>
          <div><dt className="font-medium text-ink">{texts.kpiLtarvLabel}</dt><dd>{texts.ltarvDefinition}</dd></div>
        </dl>
      </div>
    </>
  ) : (
    <p className="font-sans text-base text-body">{texts.resultEmpty}</p>
  );

  return <CalcLayout form={form} results={results} disclaimer={texts.disclaimer} />;
}
