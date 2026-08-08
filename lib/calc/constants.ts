// Configuración de negocio de las calculadoras. ⚠︎ = copiado de la referencia o
// estándar de mercado — pendiente de validación de David (YMYL).
export const DEFAULTS = {
  price: 200000, ratePct: 5, years: 30, propertyTaxPct: 0.6, insuranceYearly: 1200,
  monthlyIncome: 5000, monthlyDebts: 1500,
} as const;

export const CREDIT_BANDS = ['620-639', '640-659', '660-679', '680-699', '700-719', '720-739', '740-759', '760+'] as const;
export type CreditBand = (typeof CREDIT_BANDS)[number];

// ⚠︎ % anual de PMI sobre el préstamo, por tramo de credit score (conventional/jumbo).
export const PMI_FACTOR_BY_SCORE: Record<CreditBand, number> = {
  '620-639': 1.5, '640-659': 1.31, '660-679': 1.23, '680-699': 0.98,
  '700-719': 0.79, '720-739': 0.7, '740-759': 0.58, '760+': 0.46,
};

// ⚠︎ Ratios DTI (front/back, %) permitidos por programa.
export const DTI_LIMITS = {
  conventional: { front: 50, back: 50 }, fha: { front: 50, back: 50 },
  va: { front: 65, back: 65 }, usda: { front: 29, back: 41 }, jumbo: { front: 50, back: 50 },
} as const;
export type Program = keyof typeof DTI_LIMITS;

export const FHA_MIP = { upfrontPct: 1.75, annualPct: 0.55 } as const; // ⚠︎ estándar mercado
export const USDA_FEE = { upfrontPct: 1.0, annualPct: 0.35 } as const; // ⚠︎ estándar mercado

// Genera un array de valores igualmente espaciados para los <select> de %/plazos de DSCR y
// Fix & Flip (§desglose «Variantes → 7/8»: rangos y pasos exactos, ej. 6.000%-9.000% en pasos
// de 0.125). Redondeo a 3 decimales para evitar errores de coma flotante (0.1 + 0.2 !== 0.3).
export function steppedRange(start: number, end: number, step: number): number[] {
  const count = Math.round((end - start) / step);
  return Array.from({ length: count + 1 }, (_, i) => Math.round((start + i * step) * 1000) / 1000);
}

// Tabla VA por tramos de entrada (§desglose, tabla VA funding fee).
export const VA_FUNDING_FEE = {
  purchase: {
    first: [{ minDownPct: 10, pct: 1.25 }, { minDownPct: 5, pct: 1.5 }, { minDownPct: 0, pct: 2.15 }],
    subsequent: [{ minDownPct: 10, pct: 1.25 }, { minDownPct: 5, pct: 1.5 }, { minDownPct: 0, pct: 3.3 }],
  },
  cashOut: { first: 2.15, subsequent: 3.3 },
  irrrl: 0.5,
} as const;
