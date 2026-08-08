'use client';
import { useState } from 'react';
import { PurchaseCalc, type PurchaseCalcTexts } from './purchase-calc';
import { AffordabilityCalc, type AffordabilityCalcTexts } from './affordability-calc';
import { RefinanceCalc, type RefinanceCalcTexts } from './refinance-calc';
import { RentVsBuyCalc, type RentVsBuyCalcTexts } from './rent-vs-buy-calc';

export type CalcSuiteTexts = {
  tabs: Record<string, string>;
  purchase: PurchaseCalcTexts; afford: AffordabilityCalcTexts;
  refi: RefinanceCalcTexts; rentBuy: RentVsBuyCalcTexts;
};
const TAB_IDS = ['afford', 'purchase', 'refi', 'rentBuy'] as const;

export function CalcTabs({ locale, texts }: { locale: string; texts: CalcSuiteTexts }) {
  const [active, setActive] = useState<(typeof TAB_IDS)[number]>('afford');
  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" className="flex flex-wrap gap-px border border-hairline bg-hairline">
        {TAB_IDS.map((id) => (
          <button key={id} role="tab" aria-selected={active === id} onClick={() => setActive(id)}
            className={`px-4 py-3 font-sans text-micro font-medium uppercase tracking-label ${active === id ? 'bg-navy text-paper' : 'bg-paper text-body hover:bg-sand'}`}>
            {texts.tabs[id]}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {active === 'afford' && <AffordabilityCalc locale={locale} texts={texts.afford} />}
        {active === 'purchase' && <PurchaseCalc locale={locale} texts={texts.purchase} />}
        {active === 'refi' && <RefinanceCalc locale={locale} texts={texts.refi} />}
        {active === 'rentBuy' && <RentVsBuyCalc locale={locale} texts={texts.rentBuy} />}
      </div>
    </div>
  );
}
