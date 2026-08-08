'use client';
import { useState } from 'react';
import { refinanceComparison } from '@/lib/calc/refinance';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { SelectField } from '@/components/ui/form/select-field';
import { TextInput } from '@/components/ui/form/text-input';
import { ChoiceCard } from '@/components/ui/form/choice-card';
import { CalcLayout, CalcGroupTitle, CalcKpi, CalcKpiLabel, kpiLabelClass } from './calc-layout';

export type RefinanceCalcTexts = {
  currentTitle: string; newTitle: string;
  currentBalanceLabel: string; currentRateLabel: string; currentYearsLabel: string;
  newRateLabel: string; newYearsLabel: string; newYearsOption: string;
  cashOutLabel: string; costsLabel: string;
  financeCostsLabel: string; financeCostsIncluded: string; financeCostsOutOfPocket: string;
  resultEmpty: string;
  savingsLabel: string; savingsWarning: string;
  interestDiffLabel: string; interestDiffWarning: string;
  comparisonTitle: string; currentMonthlyLabel: string; newMonthlyLabel: string; newLoanAmountLabel: string;
  interestComparisonTitle: string; currentInterestLabel: string; newInterestLabel: string;
  breakEvenLabel: string; breakEvenMonths: string; breakEvenNever: string;
  disclaimer: string;
};

const NEW_TERMS = [30, 20, 15] as const;

export function RefinanceCalc({ texts, locale }: { texts: RefinanceCalcTexts; locale: string }) {
  const [balance, setBalance] = useState<number | null>(250000);
  const [currentRate, setCurrentRate] = useState<number | null>(7);
  const [currentYears, setCurrentYears] = useState<number | null>(25);
  const [newRate, setNewRate] = useState<number | null>(5.5);
  const [newYears, setNewYears] = useState<(typeof NEW_TERMS)[number]>(30);
  const [cashOut, setCashOut] = useState<number | null>(0);
  const [costs, setCosts] = useState<number | null>(1000);
  const [financeCosts, setFinanceCosts] = useState(true);

  const money = (v: number, d = 0) => formatMoney(v, locale, d);

  const result =
    balance !== null &&
    currentRate !== null &&
    currentYears !== null &&
    newRate !== null &&
    cashOut !== null &&
    costs !== null
      ? refinanceComparison(
          { balance, annualRatePct: currentRate, remainingYears: currentYears },
          { annualRatePct: newRate, years: newYears, cashOut, costs, financeCosts },
        )
      : null;

  const form = (
    <>
      <CalcGroupTitle>{texts.currentTitle}</CalcGroupTitle>
      <Field label={texts.currentBalanceLabel} htmlFor="refi-balance">
        <MoneyInput id="refi-balance" value={balance} onValueChange={setBalance} locale={locale} />
      </Field>
      <Field label={texts.currentRateLabel} htmlFor="refi-current-rate">
        <PercentInput id="refi-current-rate" value={currentRate} onValueChange={setCurrentRate} />
      </Field>
      <Field label={texts.currentYearsLabel} htmlFor="refi-current-years">
        <TextInput
          id="refi-current-years"
          type="number"
          inputMode="numeric"
          min={1}
          value={currentYears ?? ''}
          onChange={(e) => setCurrentYears(e.target.value === '' ? null : Number(e.target.value))}
        />
      </Field>

      <CalcGroupTitle>{texts.newTitle}</CalcGroupTitle>
      <Field label={texts.newRateLabel} htmlFor="refi-new-rate">
        <PercentInput id="refi-new-rate" value={newRate} onValueChange={setNewRate} />
      </Field>
      <Field label={texts.newYearsLabel} htmlFor="refi-new-years">
        <SelectField
          id="refi-new-years"
          value={String(newYears)}
          onChange={(e) => setNewYears(Number(e.target.value) as (typeof NEW_TERMS)[number])}
          options={NEW_TERMS.map((y) => ({ value: String(y), label: texts.newYearsOption.replace('{years}', String(y)) }))}
        />
      </Field>
      <Field label={texts.cashOutLabel} htmlFor="refi-cash-out">
        <MoneyInput id="refi-cash-out" value={cashOut} onValueChange={setCashOut} locale={locale} />
      </Field>
      <Field label={texts.costsLabel} htmlFor="refi-costs">
        <MoneyInput id="refi-costs" value={costs} onValueChange={setCosts} locale={locale} />
      </Field>
      <fieldset className="flex flex-col gap-2.5">
        <legend className={kpiLabelClass}>{texts.financeCostsLabel}</legend>
        <ChoiceCard
          name="refi-finance-costs"
          value="included"
          label={texts.financeCostsIncluded}
          checked={financeCosts}
          onSelect={() => setFinanceCosts(true)}
        />
        <ChoiceCard
          name="refi-finance-costs"
          value="pocket"
          label={texts.financeCostsOutOfPocket}
          checked={!financeCosts}
          onSelect={() => setFinanceCosts(false)}
        />
      </fieldset>
    </>
  );

  const results = result ? (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1">
          <CalcKpi label={texts.savingsLabel} value={money(result.monthlySavings, 2)} tone={result.monthlySavings < 0 ? 'error' : 'default'} />
          {result.monthlySavings < 0 ? <p className="font-sans text-fine font-medium text-error">{texts.savingsWarning}</p> : null}
        </div>
        <div className="flex flex-col gap-1">
          <CalcKpi label={texts.interestDiffLabel} value={money(result.interestDifference)} tone={result.interestDifference < 0 ? 'error' : 'default'} />
          {result.interestDifference < 0 ? <p className="font-sans text-fine font-medium text-error">{texts.interestDiffWarning}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.comparisonTitle}</CalcKpiLabel>
        <dl className="flex flex-col gap-2 font-sans text-sm text-body">
          <div className="flex justify-between gap-4"><dt>{texts.currentMonthlyLabel}</dt><dd className="tabular-nums">{money(result.currentMonthly, 2)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.newMonthlyLabel}</dt><dd className="tabular-nums">{money(result.newMonthly, 2)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.newLoanAmountLabel}</dt><dd className="tabular-nums">{money(result.newLoanAmount)}</dd></div>
        </dl>
      </div>
      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.interestComparisonTitle}</CalcKpiLabel>
        <dl className="flex flex-col gap-2 font-sans text-sm text-body">
          <div className="flex justify-between gap-4"><dt>{texts.currentInterestLabel}</dt><dd className="tabular-nums">{money(result.currentRemainingInterest)}</dd></div>
          <div className="flex justify-between gap-4"><dt>{texts.newInterestLabel}</dt><dd className="tabular-nums">{money(result.newTotalInterest)}</dd></div>
        </dl>
      </div>
      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <CalcKpiLabel>{texts.breakEvenLabel}</CalcKpiLabel>
        <p className="font-sans text-sm text-body">
          {result.breakEvenMonths !== null ? texts.breakEvenMonths.replace('{months}', String(result.breakEvenMonths)) : texts.breakEvenNever}
        </p>
      </div>
    </>
  ) : (
    <p className="font-sans text-base text-body">{texts.resultEmpty}</p>
  );

  return <CalcLayout form={form} results={results} disclaimer={texts.disclaimer} />;
}
