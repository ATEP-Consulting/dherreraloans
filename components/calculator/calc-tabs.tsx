'use client';
import { useRef, useState, type KeyboardEvent } from 'react';
import { PurchaseCalc, type PurchaseCalcTexts } from './purchase-calc';
import { AffordabilityCalc, type AffordabilityCalcTexts } from './affordability-calc';
import { RefinanceCalc, type RefinanceCalcTexts } from './refinance-calc';
import { RentVsBuyCalc, type RentVsBuyCalcTexts } from './rent-vs-buy-calc';

const TAB_IDS = ['afford', 'purchase', 'refi', 'rentBuy'] as const;

export type CalcSuiteTexts = {
  tabs: Record<(typeof TAB_IDS)[number], string>;
  purchase: PurchaseCalcTexts; afford: AffordabilityCalcTexts;
  refi: RefinanceCalcTexts; rentBuy: RentVsBuyCalcTexts;
};

const TABPANEL_ID = 'calc-tabpanel';

// Roving focus APG (variante "selection follows focus"): ArrowLeft/Right mueve foco y selección
// entre pestañas, Home/End va a la primera/última. Un único tabpanel compartido (su contenido
// cambia con la pestaña activa), así que todas las pestañas apuntan al mismo aria-controls y el
// panel anuncia su nombre vía aria-labelledby apuntando a la pestaña activa.
export function CalcTabs({ locale, texts }: { locale: string; texts: CalcSuiteTexts }) {
  const [active, setActive] = useState<(typeof TAB_IDS)[number]>('afford');
  const tabRefs = useRef<Partial<Record<(typeof TAB_IDS)[number], HTMLButtonElement | null>>>({});

  function selectTab(id: (typeof TAB_IDS)[number]) {
    setActive(id);
    tabRefs.current[id]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TAB_IDS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TAB_IDS.length) % TAB_IDS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TAB_IDS.length - 1;
    if (nextIndex !== null) {
      event.preventDefault();
      selectTab(TAB_IDS[nextIndex]);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" className="flex flex-wrap gap-px border border-hairline bg-hairline">
        {TAB_IDS.map((id, index) => (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            id={`calc-tab-${id}`}
            role="tab"
            aria-selected={active === id}
            aria-controls={TABPANEL_ID}
            tabIndex={active === id ? 0 : -1}
            onClick={() => selectTab(id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`px-4 py-3 font-sans text-micro font-medium uppercase tracking-label ${active === id ? 'bg-navy text-paper' : 'bg-paper text-body hover:bg-sand'}`}
          >
            {texts.tabs[id]}
          </button>
        ))}
      </div>
      <div id={TABPANEL_ID} role="tabpanel" aria-labelledby={`calc-tab-${active}`}>
        {active === 'afford' && <AffordabilityCalc locale={locale} texts={texts.afford} />}
        {active === 'purchase' && <PurchaseCalc locale={locale} texts={texts.purchase} />}
        {active === 'refi' && <RefinanceCalc locale={locale} texts={texts.refi} />}
        {active === 'rentBuy' && <RentVsBuyCalc locale={locale} texts={texts.rentBuy} />}
      </div>
    </div>
  );
}
