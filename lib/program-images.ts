import type { StaticImageData } from 'next/image';
import { programSlugs } from '@/config/routes.mjs';
import programFha from '@/assets/img/program-fha.jpg';
import programConventional from '@/assets/img/program-conventional.jpg';
import programVa from '@/assets/img/program-va.jpg';
import programFirstTimeHomebuyer from '@/assets/img/program-firstTimeHomebuyer.jpg';
import programRefinance from '@/assets/img/program-refinance.jpg';
import programFixedRate from '@/assets/img/program-fixedRate.jpg';
import programUsda from '@/assets/img/program-usda.jpg';
import programJumbo from '@/assets/img/program-jumbo.jpg';
import programLowDownPayment from '@/assets/img/program-lowDownPayment.jpg';
import programInvestment from '@/assets/img/program-investment.jpg';
import programCashOutRefinance from '@/assets/img/program-cashOutRefinance.jpg';
import programVaRefinance from '@/assets/img/program-vaRefinance.jpg';

/** Claves derivadas de `programSlugs` (config/routes.mjs, fuente única de programas): si se
 * añade un programa 13 aquí sin foto, TS rompe la compilación en este objeto con un mensaje
 * legible ("falta la propiedad ...") en vez de fallar en runtime con un `as keyof` optimista. */
export type ProgramKey = keyof typeof programSlugs;

export const PROGRAM_IMAGES: Record<ProgramKey, StaticImageData> = {
  fha: programFha,
  conventional: programConventional,
  va: programVa,
  firstTimeHomebuyer: programFirstTimeHomebuyer,
  refinance: programRefinance,
  fixedRate: programFixedRate,
  usda: programUsda,
  jumbo: programJumbo,
  lowDownPayment: programLowDownPayment,
  investment: programInvestment,
  cashOutRefinance: programCashOutRefinance,
  vaRefinance: programVaRefinance,
};
