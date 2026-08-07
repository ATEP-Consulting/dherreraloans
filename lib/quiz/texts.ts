import type { StepId } from './schema';

export type StepTexts = {
  title?: string;
  titleBuy?: string; // location varía por flujo
  titleRefi?: string;
  helper?: string;
  options?: Record<string, string>; // clave = valor enum del schema
  label?: string;
  placeholder?: string;
  priceLabel?: string;
  downLabel?: string;
  valueLabel?: string;
  balanceLabel?: string;
  rateLabel?: string;
  escape?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  consent?: string;
};

export type QuizTexts = {
  progress: { label: string }; // «Step {current} of {total}»
  nav: { back: string; continue: string; submit: string; sending: string; retry: string };
  errors: Record<'choice' | 'location' | 'money' | 'rate' | 'firstName' | 'lastName' | 'email' | 'phone' | 'submit', string>;
  steps: Record<StepId, StepTexts>;
  thanks: { title: string; body: string; noWait: string; explore: string };
};
