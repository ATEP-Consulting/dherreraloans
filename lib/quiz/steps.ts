// Definición DECLARATIVA del flujo (ADR-0007): ajustar preguntas = editar este array.
// Los ids son estables: serán la serie histórica de GA4 (Fase 4). Orden = spec §3.1.
import type { Answers, StepId } from './schema';

export type StepKind = 'choice' | 'text' | 'fields' | 'contact';
export type StepDef = {
  id: StepId;
  kind: StepKind;
  fieldKeys: (keyof Answers)[];
  options?: readonly string[];
  escapeKey?: keyof Answers;
  visible?: (a: Answers) => boolean;
};

const buy = (a: Answers) => a.goal === 'buy';
const refi = (a: Answers) => a.goal === 'refinance';

export const steps: readonly StepDef[] = [
  { id: 'goal', kind: 'choice', fieldKeys: ['goal'], options: ['buy', 'refinance'] },
  { id: 'location', kind: 'text', fieldKeys: ['location'] },
  { id: 'propertyType', kind: 'choice', fieldKeys: ['propertyType'], options: ['singleFamily', 'townhouse', 'condo', 'multiUnit', 'other'] },
  { id: 'stage', kind: 'choice', fieldKeys: ['stage'], options: ['research', 'looking', 'offerAccepted', 'underContract'], visible: buy },
  { id: 'use', kind: 'choice', fieldKeys: ['use'], options: ['primary', 'second', 'investment'] },
  { id: 'military', kind: 'choice', fieldKeys: ['military'], options: ['yes', 'no'] },
  { id: 'militaryBranch', kind: 'choice', fieldKeys: ['militaryBranch'], options: ['army', 'navy', 'airForce', 'marines', 'coastGuard', 'guardReserves'], visible: (a) => a.military === 'yes' },
  { id: 'hasAgent', kind: 'choice', fieldKeys: ['hasAgent'], options: ['yes', 'notYet'], visible: buy },
  { id: 'firstTime', kind: 'choice', fieldKeys: ['firstTime'], options: ['yes', 'no'], visible: buy },
  { id: 'purchaseNumbers', kind: 'fields', fieldKeys: ['purchasePrice', 'downPayment'], escapeKey: 'downPayment', visible: buy },
  { id: 'refiNumbers', kind: 'fields', fieldKeys: ['propertyValue', 'currentBalance', 'currentRate'], escapeKey: 'currentRate', visible: refi },
  { id: 'secondMortgage', kind: 'choice', fieldKeys: ['secondMortgage'], options: ['yes', 'no'], visible: refi },
  { id: 'cashOut', kind: 'choice', fieldKeys: ['cashOut'], options: ['yes', 'no', 'unsure'], visible: refi },
  { id: 'employment', kind: 'choice', fieldKeys: ['employment'], options: ['employed', 'selfEmployed', 'retired', 'other'] },
  { id: 'income', kind: 'choice', fieldKeys: ['income'], options: ['under50k', '50to100k', '100to150k', 'over150k', 'discuss'] },
  { id: 'credit', kind: 'choice', fieldKeys: ['credit'], options: ['excellent', 'good', 'fair', 'needsWork', 'unknown'] },
  { id: 'history', kind: 'choice', fieldKeys: ['history'], options: ['none', 'over4y', 'within4y'] },
  { id: 'status', kind: 'choice', fieldKeys: ['status'], options: ['citizen', 'permanentResident', 'workVisa', 'otherStatus', 'discuss'] },
  { id: 'contact', kind: 'contact', fieldKeys: ['firstName', 'lastName', 'email', 'phone'] },
];

export function visibleSteps(answers: Answers): StepDef[] {
  return steps.filter((s) => (s.visible ? s.visible(answers) : true));
}
