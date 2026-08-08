'use client';
import { useState } from 'react';
import { purchaseBreakdown } from '@/lib/calc/purchase';
import { DEFAULTS } from '@/lib/calc/constants';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { SelectField } from '@/components/ui/form/select-field';
import { CalcLayout } from './calc-layout';
import { CalcDonut } from './calc-donut';

export type PurchaseCalcTexts = {
  priceLabel: string; downLabel: string; downPct: string;
  rateLabel: string; termLabel: string; termOption: string;
  pmiLabel: string; taxLabel: string; insuranceLabel: string; hoaLabel: string; extraLabel: string;
  resultLabel: string; resultEmpty: string;
  breakdownPiLabel: string; breakdownTaxLabel: string; breakdownInsuranceLabel: string;
  breakdownHoaLabel: string; breakdownPmiLabel: string; breakdownExtraLabel: string;
  totalInterestLabel: string; totalCostLabel: string;
  earlyPayoffTitle: string; monthsSavedLabel: string; interestSavedLabel: string;
  errorDown: string; disclaimer: string;
};

const TERMS = [30, 20, 15] as const;

export function PurchaseCalc({ texts, locale }: { texts: PurchaseCalcTexts; locale: string }) {
  const [price, setPrice] = useState<number | null>(400000);
  const [down, setDown] = useState<number | null>(40000);
  const [rate, setRate] = useState<number | null>(6.5);
  const [years, setYears] = useState<(typeof TERMS)[number]>(30);
  const [pmiYearly, setPmiYearly] = useState<number | null>(0);
  const [propertyTaxPct, setPropertyTaxPct] = useState<number | null>(DEFAULTS.propertyTaxPct);
  const [insuranceYearly, setInsuranceYearly] = useState<number | null>(DEFAULTS.insuranceYearly);
  const [hoaMonthly, setHoaMonthly] = useState<number | null>(0);
  const [extraMonthly, setExtraMonthly] = useState<number | null>(0);

  const downError = price !== null && down !== null && down >= price;
  const pct = price && down ? `${((down / price) * 100).toFixed(1)}%` : null;
  const money = (v: number, d = 0) => formatMoney(v, locale, d);

  const result =
    price !== null &&
    down !== null &&
    rate !== null &&
    pmiYearly !== null &&
    propertyTaxPct !== null &&
    insuranceYearly !== null &&
    hoaMonthly !== null &&
    extraMonthly !== null &&
    !downError
      ? purchaseBreakdown({
          price,
          downPayment: down,
          annualRatePct: rate,
          years,
          pmiYearly,
          propertyTaxPct,
          insuranceYearly,
          hoaMonthly,
          extraMonthly,
        })
      : null;

  const form = (
    <>
      <Field label={texts.priceLabel} htmlFor="calc-price">
        <MoneyInput id="calc-price" value={price} onValueChange={setPrice} locale={locale} />
      </Field>
      <Field
        label={texts.downLabel}
        htmlFor="calc-down"
        hint={pct ? texts.downPct.replace('{pct}', pct) : undefined}
        error={downError ? texts.errorDown : undefined}
      >
        <MoneyInput id="calc-down" value={down} onValueChange={setDown} locale={locale} invalid={downError} />
      </Field>
      <Field label={texts.rateLabel} htmlFor="calc-rate">
        <PercentInput id="calc-rate" value={rate} onValueChange={setRate} />
      </Field>
      <Field label={texts.termLabel} htmlFor="calc-term">
        <SelectField
          id="calc-term"
          value={String(years)}
          onChange={(e) => setYears(Number(e.target.value) as (typeof TERMS)[number])}
          options={TERMS.map((y) => ({ value: String(y), label: texts.termOption.replace('{years}', String(y)) }))}
        />
      </Field>
      <Field label={texts.pmiLabel} htmlFor="calc-pmi">
        <MoneyInput id="calc-pmi" value={pmiYearly} onValueChange={setPmiYearly} locale={locale} />
      </Field>
      <Field label={texts.taxLabel} htmlFor="calc-tax">
        <PercentInput id="calc-tax" value={propertyTaxPct} onValueChange={setPropertyTaxPct} />
      </Field>
      <Field label={texts.insuranceLabel} htmlFor="calc-insurance">
        <MoneyInput id="calc-insurance" value={insuranceYearly} onValueChange={setInsuranceYearly} locale={locale} />
      </Field>
      <Field label={texts.hoaLabel} htmlFor="calc-hoa">
        <MoneyInput id="calc-hoa" value={hoaMonthly} onValueChange={setHoaMonthly} locale={locale} />
      </Field>
      <Field label={texts.extraLabel} htmlFor="calc-extra">
        <MoneyInput id="calc-extra" value={extraMonthly} onValueChange={setExtraMonthly} locale={locale} />
      </Field>
    </>
  );

  const results = result ? (
    <>
      <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">{texts.resultLabel}</p>
      <p className="font-display text-h2 font-light tabular-nums text-ink">{money(result.totalMonthly, 2)}</p>
      <CalcDonut
        segments={[
          { label: `${texts.breakdownPiLabel} · ${money(result.breakdown.pi, 2)}`, value: result.breakdown.pi, swatchClass: 'text-navy' },
          { label: `${texts.breakdownTaxLabel} · ${money(result.breakdown.tax, 2)}`, value: result.breakdown.tax, swatchClass: 'text-azure' },
          { label: `${texts.breakdownInsuranceLabel} · ${money(result.breakdown.insurance, 2)}`, value: result.breakdown.insurance, swatchClass: 'text-azure-soft' },
          { label: `${texts.breakdownHoaLabel} · ${money(result.breakdown.hoa, 2)}`, value: result.breakdown.hoa, swatchClass: 'text-ink' },
          { label: `${texts.breakdownPmiLabel} · ${money(result.breakdown.pmi, 2)}`, value: result.breakdown.pmi, swatchClass: 'text-muted' },
          { label: `${texts.breakdownExtraLabel} · ${money(result.breakdown.extra, 2)}`, value: result.breakdown.extra, swatchClass: 'text-leader' },
        ]}
        centerLabel={texts.resultLabel}
        centerValue={money(result.totalMonthly, 2)}
      />
      <dl className="flex flex-col gap-2 border-t border-hairline pt-4 font-sans text-sm text-body">
        <div className="flex justify-between gap-4"><dt>{texts.totalInterestLabel}</dt><dd className="tabular-nums">{money(result.totalInterest)}</dd></div>
        <div className="flex justify-between gap-4"><dt>{texts.totalCostLabel}</dt><dd className="tabular-nums">{money(result.totalCost)}</dd></div>
      </dl>
      {extraMonthly !== null && extraMonthly > 0 ? (
        <div className="flex flex-col gap-2 border-t border-hairline pt-4">
          <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">{texts.earlyPayoffTitle}</p>
          <dl className="flex flex-col gap-2 font-sans text-sm text-body">
            <div className="flex justify-between gap-4"><dt>{texts.monthsSavedLabel}</dt><dd className="tabular-nums">{result.monthsSaved}</dd></div>
            <div className="flex justify-between gap-4"><dt>{texts.interestSavedLabel}</dt><dd className="tabular-nums">{money(result.interestSaved)}</dd></div>
          </dl>
        </div>
      ) : null}
    </>
  ) : (
    <p className="font-sans text-base text-body">{downError ? texts.errorDown : texts.resultEmpty}</p>
  );

  return <CalcLayout form={form} results={results} disclaimer={texts.disclaimer} />;
}
