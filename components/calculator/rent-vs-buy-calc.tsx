'use client';
import { useState } from 'react';
import { rentVsBuy } from '@/lib/calc/rent-vs-buy';
import { formatMoney } from '@/lib/format';
import { Field } from '@/components/ui/form/field';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { SelectField } from '@/components/ui/form/select-field';
import { CalcLayout } from './calc-layout';

export type RentVsBuyCalcTexts = {
  mortgageTitle: string; buyTitle: string; rentTitle: string;
  priceLabel: string; downLabel: string; downPct: string; errorDown: string;
  rateLabel: string; termLabel: string; termOption: string;
  taxLabel: string; insuranceLabel: string; hoaLabel: string;
  annualCostsLabel: string; sellingCostsLabel: string; appreciationLabel: string;
  monthlyRentLabel: string; rentersInsuranceLabel: string; rentAppreciationLabel: string;
  horizonLabel: string;
  resultEmpty: string;
  comparisonTitle: string; buyColumnLabel: string; rentColumnLabel: string;
  netCostRowLabel: string; equityRowLabel: string;
  gainLabel: string; gainBuyWins: string; gainRentWins: string;
  verdictCrossover: string; verdictNoCrossover: string;
  disclaimer: string;
};

const TERMS = [30, 20, 15] as const;
const HORIZONS = Array.from({ length: 15 }, (_, i) => i + 1);

const groupTitle = 'font-sans text-micro font-semibold uppercase tracking-label text-ink border-b border-hairline pb-2';
const kpiLabel = 'font-sans text-micro font-medium uppercase tracking-label text-muted';
const kpiValue = 'font-display text-h2 font-light tabular-nums';

export function RentVsBuyCalc({ texts, locale }: { texts: RentVsBuyCalcTexts; locale: string }) {
  const [price, setPrice] = useState<number | null>(300000);
  const [down, setDown] = useState<number | null>(60000);
  const [rate, setRate] = useState<number | null>(6);
  const [years, setYears] = useState<(typeof TERMS)[number]>(30);
  const [taxYearly, setTaxYearly] = useState<number | null>(3600);
  const [insuranceYearly, setInsuranceYearly] = useState<number | null>(1200);
  const [hoaMonthly, setHoaMonthly] = useState<number | null>(0);
  const [annualCostsPct, setAnnualCostsPct] = useState<number | null>(0);
  const [sellingCostsPct, setSellingCostsPct] = useState<number | null>(6);
  const [appreciationPct, setAppreciationPct] = useState<number | null>(3);
  const [monthlyRent, setMonthlyRent] = useState<number | null>(2000);
  const [rentersInsuranceYearly, setRentersInsuranceYearly] = useState<number | null>(0);
  const [rentAppreciationPct, setRentAppreciationPct] = useState<number | null>(2);
  const [horizon, setHorizon] = useState(5);

  const downError = price !== null && down !== null && down >= price;
  const pct = price && down ? `${((down / price) * 100).toFixed(1)}%` : null;
  const money = (v: number, d = 0) => formatMoney(v, locale, d);

  const result =
    price !== null &&
    down !== null &&
    rate !== null &&
    taxYearly !== null &&
    insuranceYearly !== null &&
    hoaMonthly !== null &&
    annualCostsPct !== null &&
    sellingCostsPct !== null &&
    appreciationPct !== null &&
    monthlyRent !== null &&
    rentersInsuranceYearly !== null &&
    rentAppreciationPct !== null &&
    !downError
      ? rentVsBuy(
          {
            price, downPayment: down, annualRatePct: rate, years,
            taxYearly, insuranceYearly, hoaMonthly, annualCostsPct,
            sellingCostsPct, appreciationPct,
            monthlyRent, rentersInsuranceYearly, rentAppreciationPct,
          },
          horizon,
        )
      : null;

  const yearData = result ? result.years[result.years.length - 1] : null;

  const form = (
    <>
      <h3 className={groupTitle}>{texts.mortgageTitle}</h3>
      <Field label={texts.priceLabel} htmlFor="rentbuy-price">
        <MoneyInput id="rentbuy-price" value={price} onValueChange={setPrice} locale={locale} />
      </Field>
      <Field
        label={texts.downLabel}
        htmlFor="rentbuy-down"
        hint={pct ? texts.downPct.replace('{pct}', pct) : undefined}
        error={downError ? texts.errorDown : undefined}
      >
        <MoneyInput id="rentbuy-down" value={down} onValueChange={setDown} locale={locale} invalid={downError} />
      </Field>
      <Field label={texts.rateLabel} htmlFor="rentbuy-rate">
        <PercentInput id="rentbuy-rate" value={rate} onValueChange={setRate} />
      </Field>
      <Field label={texts.termLabel} htmlFor="rentbuy-term">
        <SelectField
          id="rentbuy-term"
          value={String(years)}
          onChange={(e) => setYears(Number(e.target.value) as (typeof TERMS)[number])}
          options={TERMS.map((y) => ({ value: String(y), label: texts.termOption.replace('{years}', String(y)) }))}
        />
      </Field>
      <Field label={texts.taxLabel} htmlFor="rentbuy-tax">
        <MoneyInput id="rentbuy-tax" value={taxYearly} onValueChange={setTaxYearly} locale={locale} />
      </Field>
      <Field label={texts.insuranceLabel} htmlFor="rentbuy-insurance">
        <MoneyInput id="rentbuy-insurance" value={insuranceYearly} onValueChange={setInsuranceYearly} locale={locale} />
      </Field>
      <Field label={texts.hoaLabel} htmlFor="rentbuy-hoa">
        <MoneyInput id="rentbuy-hoa" value={hoaMonthly} onValueChange={setHoaMonthly} locale={locale} />
      </Field>

      <h3 className={groupTitle}>{texts.buyTitle}</h3>
      <Field label={texts.annualCostsLabel} htmlFor="rentbuy-annual-costs">
        <PercentInput id="rentbuy-annual-costs" value={annualCostsPct} onValueChange={setAnnualCostsPct} />
      </Field>
      <Field label={texts.sellingCostsLabel} htmlFor="rentbuy-selling-costs">
        <PercentInput id="rentbuy-selling-costs" value={sellingCostsPct} onValueChange={setSellingCostsPct} />
      </Field>
      <Field label={texts.appreciationLabel} htmlFor="rentbuy-appreciation">
        <PercentInput id="rentbuy-appreciation" value={appreciationPct} onValueChange={setAppreciationPct} />
      </Field>

      <h3 className={groupTitle}>{texts.rentTitle}</h3>
      <Field label={texts.monthlyRentLabel} htmlFor="rentbuy-rent">
        <MoneyInput id="rentbuy-rent" value={monthlyRent} onValueChange={setMonthlyRent} locale={locale} />
      </Field>
      <Field label={texts.rentersInsuranceLabel} htmlFor="rentbuy-renters-insurance">
        <MoneyInput id="rentbuy-renters-insurance" value={rentersInsuranceYearly} onValueChange={setRentersInsuranceYearly} locale={locale} />
      </Field>
      <Field label={texts.rentAppreciationLabel} htmlFor="rentbuy-rent-appreciation">
        <PercentInput id="rentbuy-rent-appreciation" value={rentAppreciationPct} onValueChange={setRentAppreciationPct} />
      </Field>

      <Field label={texts.horizonLabel} htmlFor="rentbuy-horizon">
        <SelectField
          id="rentbuy-horizon"
          value={String(horizon)}
          onChange={(e) => setHorizon(Number(e.target.value))}
          options={HORIZONS.map((y) => ({ value: String(y), label: String(y) }))}
        />
      </Field>
    </>
  );

  const results = result && yearData ? (
    <>
      <div className="flex flex-col gap-2">
        <p id="rentbuy-table-heading" className={kpiLabel}>
          {texts.comparisonTitle.replace('{years}', String(horizon))}
        </p>
        <div className="overflow-x-auto">
          <table aria-labelledby="rentbuy-table-heading" className="w-full min-w-[320px] border-collapse font-sans text-sm text-body">
            <thead>
              <tr className="border-b border-hairline text-left">
                <th scope="col" className="py-2 font-normal"></th>
                <th scope="col" className="py-2 text-right font-medium text-ink">{texts.buyColumnLabel}</th>
                <th scope="col" className="py-2 text-right font-medium text-ink">{texts.rentColumnLabel}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-hairline">
                <th scope="row" className="py-2 text-left font-normal">{texts.netCostRowLabel}</th>
                <td className="py-2 text-right tabular-nums">{money(yearData.buyNetCost)}</td>
                <td className="py-2 text-right tabular-nums">{money(yearData.rentCost)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 text-left font-normal">{texts.equityRowLabel}</th>
                <td className="py-2 text-right tabular-nums">{money(yearData.equity)}</td>
                <td className="py-2 text-right text-muted">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-col gap-1 border-t border-hairline pt-4">
        <p className={kpiLabel}>{texts.gainLabel.replace('{years}', String(horizon))}</p>
        <p className={`${kpiValue} text-ink`}>{money(Math.abs(yearData.gain))}</p>
        <p className="font-sans text-sm text-body">{yearData.gain >= 0 ? texts.gainBuyWins : texts.gainRentWins}</p>
      </div>
      <p className="border-t border-hairline pt-4 font-sans text-sm leading-[1.7] text-body">
        {result.crossoverYear !== null
          ? texts.verdictCrossover.replace('{year}', String(result.crossoverYear))
          : texts.verdictNoCrossover.replace('{years}', String(horizon))}
      </p>
    </>
  ) : (
    <p className="font-sans text-base text-body">{downError ? texts.errorDown : texts.resultEmpty}</p>
  );

  return <CalcLayout form={form} results={results} disclaimer={texts.disclaimer} />;
}
