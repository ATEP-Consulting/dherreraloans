'use client';
import { useState } from 'react';
import { purchaseBreakdown } from '@/lib/calc/purchase';
import { vaFundingFeePct, vaFinalLoan, type VaUse } from '@/lib/calc/va';
import { DEFAULTS } from '@/lib/calc/constants';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { SelectField } from '@/components/ui/form/select-field';
import { CalcLayout, CalcKpi, CalcKpiLabel } from './calc-layout';
import { CalcDonut } from './calc-donut';
import { LoanBasicsFields, downPaymentError } from './loan-basics-fields';

export type VaPurchaseCalcTexts = {
  priceLabel: string; downLabel: string; downPct: string;
  rateLabel: string; termLabel: string; termOption: string;
  vaUseLabel: string; vaUseOptions: Record<VaUse, string>;
  taxLabel: string; insuranceLabel: string; hoaLabel: string; extraLabel: string;
  resultLabel: string; resultEmpty: string;
  breakdownPiLabel: string; breakdownTaxLabel: string; breakdownInsuranceLabel: string;
  breakdownHoaLabel: string; breakdownExtraLabel: string;
  feeLabel: string; finalLoanLabel: string;
  totalInterestLabel: string; totalCostLabel: string;
  earlyPayoffTitle: string; monthsSavedLabel: string; interestSavedLabel: string;
  errorDown: string; disclaimer: string;
};

const TERMS = [30, 20, 15] as const;
const VA_USES: VaUse[] = ['first', 'subsequent', 'exempt'];

export function VaPurchaseCalc({ texts, locale }: { texts: VaPurchaseCalcTexts; locale: string }) {
  const [price, setPrice] = useState<number | null>(DEFAULTS.price);
  const [down, setDown] = useState<number | null>(0);
  const [rate, setRate] = useState<number | null>(DEFAULTS.ratePct);
  const [years, setYears] = useState<(typeof TERMS)[number]>(DEFAULTS.years);
  const [vaUse, setVaUse] = useState<VaUse>('first');
  const [propertyTaxPct, setPropertyTaxPct] = useState<number | null>(DEFAULTS.propertyTaxPct);
  const [insuranceYearly, setInsuranceYearly] = useState<number | null>(DEFAULTS.insuranceYearly);
  const [hoaMonthly, setHoaMonthly] = useState<number | null>(0);
  const [extraMonthly, setExtraMonthly] = useState<number | null>(0);

  const downError = downPaymentError(price, down);
  const money = (v: number, d = 0) => formatMoney(v, locale, d);

  const result =
    price !== null &&
    down !== null &&
    rate !== null &&
    propertyTaxPct !== null &&
    insuranceYearly !== null &&
    hoaMonthly !== null &&
    extraMonthly !== null &&
    !downError
      ? (() => {
          const base = price - down;
          const downPct = (down / price) * 100;
          const feePct = vaFundingFeePct(vaUse, downPct, 'purchase');
          const finalLoan = vaFinalLoan(base, feePct);
          // Truco: purchaseBreakdown deriva el principal como price − downPayment, así que le
          // pasamos price = finalLoan + down para que el principal sea el préstamo final (con el
          // funding fee ya financiado). Esto también desplaza la base del property tax de
          // finalLoan+down en vez del valor real de la vivienda — simplificación aceptable dado
          // que el fee es pequeño (≤3.3%) frente al valor de la propiedad.
          const breakdown = purchaseBreakdown({
            price: finalLoan + down,
            downPayment: down,
            annualRatePct: rate,
            years,
            pmiYearly: 0,
            propertyTaxPct,
            insuranceYearly,
            hoaMonthly,
            extraMonthly,
          });
          return breakdown ? { ...breakdown, feePct, feeAmount: finalLoan - base, finalLoan } : null;
        })()
      : null;

  const form = (
    <>
      <LoanBasicsFields
        idPrefix="va-purchase"
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
      <Field label={texts.vaUseLabel} htmlFor="va-purchase-use">
        <SelectField
          id="va-purchase-use"
          value={vaUse}
          onChange={(e) => setVaUse(e.target.value as VaUse)}
          options={VA_USES.map((use) => ({ value: use, label: texts.vaUseOptions[use] }))}
        />
      </Field>
      <Field label={texts.taxLabel} htmlFor="va-purchase-tax">
        <PercentInput id="va-purchase-tax" value={propertyTaxPct} onValueChange={setPropertyTaxPct} />
      </Field>
      <Field label={texts.insuranceLabel} htmlFor="va-purchase-insurance">
        <MoneyInput id="va-purchase-insurance" value={insuranceYearly} onValueChange={setInsuranceYearly} locale={locale} />
      </Field>
      <Field label={texts.hoaLabel} htmlFor="va-purchase-hoa">
        <MoneyInput id="va-purchase-hoa" value={hoaMonthly} onValueChange={setHoaMonthly} locale={locale} />
      </Field>
      <Field label={texts.extraLabel} htmlFor="va-purchase-extra">
        <MoneyInput id="va-purchase-extra" value={extraMonthly} onValueChange={setExtraMonthly} locale={locale} />
      </Field>
    </>
  );

  const results = result ? (
    <>
      <CalcKpi label={texts.resultLabel} value={money(result.totalMonthly, 2)} />
      <CalcDonut
        segments={[
          { label: `${texts.breakdownPiLabel} · ${money(result.breakdown.pi, 2)}`, value: result.breakdown.pi, swatchClass: 'text-navy' },
          { label: `${texts.breakdownTaxLabel} · ${money(result.breakdown.tax, 2)}`, value: result.breakdown.tax, swatchClass: 'text-azure' },
          { label: `${texts.breakdownInsuranceLabel} · ${money(result.breakdown.insurance, 2)}`, value: result.breakdown.insurance, swatchClass: 'text-azure-soft' },
          { label: `${texts.breakdownHoaLabel} · ${money(result.breakdown.hoa, 2)}`, value: result.breakdown.hoa, swatchClass: 'text-ink' },
          { label: `${texts.breakdownExtraLabel} · ${money(result.breakdown.extra, 2)}`, value: result.breakdown.extra, swatchClass: 'text-leader' },
        ]}
        centerLabel={texts.resultLabel}
        centerValue={money(result.totalMonthly, 2)}
      />
      <dl className="flex flex-col gap-2 border-t border-hairline pt-4 font-sans text-sm text-body">
        <div className="flex justify-between gap-4"><dt>{texts.feeLabel.replace('{pct}', result.feePct.toFixed(2))}</dt><dd className="tabular-nums">{money(result.feeAmount)}</dd></div>
        <div className="flex justify-between gap-4"><dt>{texts.finalLoanLabel}</dt><dd className="tabular-nums">{money(result.finalLoan)}</dd></div>
        <div className="flex justify-between gap-4"><dt>{texts.totalInterestLabel}</dt><dd className="tabular-nums">{money(result.totalInterest)}</dd></div>
        <div className="flex justify-between gap-4"><dt>{texts.totalCostLabel}</dt><dd className="tabular-nums">{money(result.totalCost)}</dd></div>
      </dl>
      {extraMonthly !== null && extraMonthly > 0 ? (
        <div className="flex flex-col gap-2 border-t border-hairline pt-4">
          <CalcKpiLabel>{texts.earlyPayoffTitle}</CalcKpiLabel>
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
