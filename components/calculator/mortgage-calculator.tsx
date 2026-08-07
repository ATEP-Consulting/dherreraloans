'use client';
import { useState } from 'react';
import { mortgageBreakdown } from '@/lib/mortgage';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { SelectField } from '@/components/ui/form/select-field';

export type CalculatorTexts = {
  sectionTitle: string; priceLabel: string; downLabel: string; downPct: string;
  rateLabel: string; termLabel: string; termOption: string;
  resultLabel: string; resultEmpty: string; firstSplitLabel: string; interestLabel: string;
  principalLabel: string; totalInterestLabel: string; totalCostLabel: string;
  errorDown: string; disclaimer: string;
};

const TERMS = [30, 20, 15] as const;

export function MortgageCalculator({ texts, locale }: { texts: CalculatorTexts; locale: string }) {
  const [price, setPrice] = useState<number | null>(400000);
  const [down, setDown] = useState<number | null>(40000);
  const [rate, setRate] = useState<number | null>(6.5);
  const [years, setYears] = useState<(typeof TERMS)[number]>(30);

  const downError = price !== null && down !== null && down >= price;
  const breakdown =
    price !== null && rate !== null && !downError
      ? mortgageBreakdown({ price, downPayment: down ?? 0, annualRatePct: rate, years })
      : null;
  const pct = price && down ? `${((down / price) * 100).toFixed(1)}%` : null;
  const money = (v: number, d = 0) => formatMoney(v, locale, d);
  const interestShare = breakdown ? (breakdown.firstInterest / breakdown.monthly) * 100 : 0;

  return (
    <div className="grid max-w-[880px] gap-8 lg:grid-cols-2 lg:gap-12">
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
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
      </form>
      <div aria-live="polite" className="flex flex-col gap-5 border border-ink p-6 lg:p-8">
        <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">{texts.resultLabel}</p>
        {breakdown ? (
          <>
            <p className="font-display text-h2 font-light tabular-nums text-ink">{money(breakdown.monthly, 2)}</p>
            <div>
              <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">{texts.firstSplitLabel}</p>
              <div aria-hidden className="mt-2 flex h-2 w-full border border-hairline">
                <span className="bg-navy" style={{ width: `${interestShare}%` }} />
                <span className="bg-sand" style={{ width: `${100 - interestShare}%` }} />
              </div>
              <p className="mt-2 font-sans text-sm tabular-nums text-body">
                {texts.interestLabel} {money(breakdown.firstInterest, 2)} · {texts.principalLabel} {money(breakdown.firstPrincipal, 2)}
              </p>
            </div>
            <dl className="flex flex-col gap-2 border-t border-hairline pt-4 font-sans text-sm text-body">
              <div className="flex justify-between gap-4"><dt>{texts.totalInterestLabel}</dt><dd className="tabular-nums">{money(breakdown.totalInterest)}</dd></div>
              <div className="flex justify-between gap-4"><dt>{texts.totalCostLabel}</dt><dd className="tabular-nums">{money(breakdown.totalCost)}</dd></div>
            </dl>
          </>
        ) : (
          <p className="font-sans text-base text-body">{downError ? texts.errorDown : texts.resultEmpty}</p>
        )}
        <p className="border-t border-hairline pt-4 font-sans text-fine italic text-muted">{texts.disclaimer}</p>
      </div>
    </div>
  );
}
