'use client';
import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { stepSchemas, type Answers, type StepId } from '@/lib/quiz/schema';
import { visibleSteps, type StepDef } from '@/lib/quiz/steps';
import { initialState, loadState, progressOf, quizReducer, saveState, STORAGE_KEY } from '@/lib/quiz/engine';
import { submitLead } from '@/lib/quiz/submit';
import type { QuizTexts } from '@/lib/quiz/texts';
import { Field } from '@/components/ui/form/field';
import { TextInput } from '@/components/ui/form/text-input';
import { MoneyInput } from '@/components/ui/form/money-input';
import { PercentInput } from '@/components/ui/form/percent-input';
import { ChoiceCard } from '@/components/ui/form/choice-card';
import { CheckEscape } from '@/components/ui/form/check-escape';
import { buttonVariantClass } from '@/components/ui/button';

const AUTO_ADVANCE_MS = 300;
const interpolate = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

// fieldKey → clave de texto de error (errors del QuizTexts)
const ERROR_KEY: Partial<Record<keyof Answers, keyof QuizTexts['errors']>> = {
  location: 'location',
  purchasePrice: 'money',
  downPayment: 'money',
  propertyValue: 'money',
  currentBalance: 'money',
  currentRate: 'rate',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
};

export function Quiz({ texts, locale, thanksCtas }: { texts: QuizTexts; locale: string; thanksCtas: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, undefined, initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof Answers, string>>>({});
  // Estado (no ref) a propósito: debe asentarse en el MISMO render que la rehidratación
  // (React agrupa dispatch(rehydrate) + setMounted(true) del mismo effect), para que el
  // efecto de guardado nunca vea "mounted=true" con el `state` inicial todavía sin rehidratar
  // — si no, ese guardado prematuro sobrescribe sessionStorage con respuestas vacías (visible
  // sobre todo bajo StrictMode, que invoca el efecto de carga dos veces).
  const [mounted, setMounted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Rehidratación post-montaje (evita hydration mismatch) y persistencia por cambio.
  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: 'rehydrate', state: saved });
    // Flag "hidratado" cliente-only (sessionStorage no existe en SSR): patrón estándar de
    // Next.js para evitar hydration mismatch, deliberadamente en el mismo effect que el
    // dispatch de arriba para que React los aplique en UN solo re-render (ver comentario
    // sobre `mounted` más arriba — necesario para que la rehidratación no se pierda).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && state.status !== 'done') saveState(state);
  }, [state, mounted]);
  // Foco al heading en cada cambio de paso (ADR-0007 §7); no en el montaje inicial.
  useEffect(() => {
    if (mounted) headingRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stepId, state.status === 'done']);
  useEffect(() => () => clearTimeout(autoTimer.current), []);

  const step = visibleSteps(state.answers).find((s) => s.id === state.stepId) ?? visibleSteps(state.answers)[0];
  const { current, total } = progressOf(state);

  const answer = (patch: Partial<Answers>) => {
    setErrors({});
    dispatch({ type: 'answer', patch });
  };
  const validateAndNext = () => {
    const result = stepSchemas[step.id].safeParse(
      Object.fromEntries(step.fieldKeys.map((k) => [k, state.answers[k]])),
    );
    if (!result.success) {
      const map: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Answers;
        map[key] = texts.errors[ERROR_KEY[key] ?? 'choice'];
      }
      // Paso choice sin respuesta: el issue llega sin path útil → error genérico en el primer campo
      if (Object.keys(map).length === 0) map[step.fieldKeys[0]] = texts.errors.choice;
      setErrors(map);
      return;
    }
    if (step.id === 'contact') {
      dispatch({ type: 'submitStart' });
      submitLead(state.answers)
        .then(() => {
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {
            /* modo privado */
          }
          dispatch({ type: 'submitDone' });
        })
        .catch(() => dispatch({ type: 'submitError' }));
      return;
    }
    dispatch({ type: 'next' });
  };
  const autoAdvance = () => {
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => dispatch({ type: 'next' }), AUTO_ADVANCE_MS);
  };

  if (state.status === 'done') {
    return (
      <div className="flex max-w-[640px] flex-col gap-6 motion-safe:animate-[quiz-step-in_200ms_ease-out]">
        <div className="flex flex-col gap-5">
          <h2 ref={headingRef} tabIndex={-1} className="font-display text-h2 font-light text-ink outline-none">
            {interpolate(texts.thanks.title, { name: state.answers.firstName ?? '' })}
          </h2>
          <p className="font-sans text-lede leading-[1.65] text-body">{texts.thanks.body}</p>
        </div>
        <div className="flex flex-col gap-4 bg-navy px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
          <p className="font-sans text-micro font-medium uppercase tracking-label text-paper-a85">{texts.thanks.noWait}</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">{thanksCtas}</div>
        </div>
      </div>
    );
  }

  const st = texts.steps[step.id];
  const title =
    step.id === 'location'
      ? ((state.answers.goal === 'refinance' ? st.titleRefi : st.titleBuy) ?? '')
      : (st.title ?? '');

  return (
    <div className="max-w-[640px]">
      <p className="font-sans text-micro font-medium uppercase tracking-label text-muted">
        {interpolate(texts.progress.label, { current, total })}
      </p>
      <div aria-hidden className="mt-3 h-0.5 w-full bg-hairline">
        <div className="h-full bg-navy transition-[width] duration-300" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <div key={step.id} className="mt-8 flex flex-col gap-6 motion-safe:animate-[quiz-step-in_200ms_ease-out]">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-h3 font-light text-ink outline-none">
          {title}
        </h2>
        {st.helper ? <p className="-mt-3 font-sans text-base leading-[1.7] text-body">{st.helper}</p> : null}
        <StepBody
          step={step}
          st={st}
          locale={locale}
          answers={state.answers}
          errors={errors}
          onAnswer={answer}
          onAutoAdvance={autoAdvance}
        />
        {state.status === 'error' ? (
          <p aria-live="assertive" className="border border-error p-4 font-sans text-sm font-medium text-error">
            {texts.errors.submit}
          </p>
        ) : null}
        <div className="flex items-center gap-4">
          {step.id !== 'goal' ? (
            <button
              type="button"
              onClick={() => dispatch({ type: 'back' })}
              className="font-sans text-btn font-semibold uppercase tracking-button text-body hover:text-ink"
            >
              {texts.nav.back}
            </button>
          ) : null}
          <button
            type="button"
            onClick={validateAndNext}
            disabled={state.status === 'submitting'}
            className={`${buttonVariantClass('navy')} disabled:opacity-60`}
          >
            {step.id === 'contact'
              ? state.status === 'submitting'
                ? texts.nav.sending
                : state.status === 'error'
                  ? texts.nav.retry
                  : texts.nav.submit
              : texts.nav.continue}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepBody({
  step,
  st,
  locale,
  answers,
  errors,
  onAnswer,
  onAutoAdvance,
}: {
  step: StepDef;
  st: QuizTexts['steps'][StepId];
  locale: string;
  answers: Answers;
  errors: Partial<Record<keyof Answers, string>>;
  onAnswer: (patch: Partial<Answers>) => void;
  onAutoAdvance: () => void;
}) {
  if (step.kind === 'choice') {
    const key = step.fieldKeys[0];
    return (
      <fieldset className="flex flex-col gap-2.5">
        <legend className="sr-only">{st.title}</legend>
        {(step.options ?? []).map((value) => (
          <ChoiceCard
            key={value}
            name={step.id}
            value={value}
            label={st.options?.[value] ?? value}
            checked={answers[key] === value}
            onSelect={(v) => onAnswer({ [key]: v } as Partial<Answers>)}
            onPointerSelect={() => onAutoAdvance()}
          />
        ))}
        {errors[key] ? <p aria-live="polite" className="font-sans text-fine font-medium text-error">{errors[key]}</p> : null}
      </fieldset>
    );
  }
  if (step.kind === 'text') {
    return (
      <Field label={st.label ?? ''} htmlFor="quiz-location" error={errors.location}>
        <TextInput
          id="quiz-location"
          value={answers.location ?? ''}
          placeholder={st.placeholder}
          invalid={Boolean(errors.location)}
          onChange={(e) => onAnswer({ location: e.target.value })}
        />
      </Field>
    );
  }
  if (step.kind === 'fields' && step.id === 'purchaseNumbers') {
    const unsure = answers.downPayment === 'unsure';
    return (
      <div className="flex flex-col gap-5">
        <Field label={st.priceLabel ?? ''} htmlFor="quiz-price" error={errors.purchasePrice}>
          <MoneyInput
            id="quiz-price"
            locale={locale}
            invalid={Boolean(errors.purchasePrice)}
            value={typeof answers.purchasePrice === 'number' ? answers.purchasePrice : null}
            onValueChange={(v) => onAnswer({ purchasePrice: v ?? undefined })}
          />
        </Field>
        <Field label={st.downLabel ?? ''} htmlFor="quiz-down" error={errors.downPayment}>
          <MoneyInput
            id="quiz-down"
            locale={locale}
            disabled={unsure}
            invalid={Boolean(errors.downPayment)}
            value={typeof answers.downPayment === 'number' ? answers.downPayment : null}
            onValueChange={(v) => onAnswer({ downPayment: v ?? undefined })}
          />
        </Field>
        <CheckEscape
          id="quiz-down-unsure"
          label={st.escape ?? ''}
          checked={unsure}
          onChange={(c) => onAnswer({ downPayment: c ? 'unsure' : undefined })}
        />
      </div>
    );
  }
  if (step.kind === 'fields') {
    // refiNumbers
    const unsure = answers.currentRate === 'unsure';
    return (
      <div className="flex flex-col gap-5">
        <Field label={st.valueLabel ?? ''} htmlFor="quiz-value" error={errors.propertyValue}>
          <MoneyInput
            id="quiz-value"
            locale={locale}
            invalid={Boolean(errors.propertyValue)}
            value={typeof answers.propertyValue === 'number' ? answers.propertyValue : null}
            onValueChange={(v) => onAnswer({ propertyValue: v ?? undefined })}
          />
        </Field>
        <Field label={st.balanceLabel ?? ''} htmlFor="quiz-balance" error={errors.currentBalance}>
          <MoneyInput
            id="quiz-balance"
            locale={locale}
            invalid={Boolean(errors.currentBalance)}
            value={typeof answers.currentBalance === 'number' ? answers.currentBalance : null}
            onValueChange={(v) => onAnswer({ currentBalance: v ?? undefined })}
          />
        </Field>
        <Field label={st.rateLabel ?? ''} htmlFor="quiz-rate" error={errors.currentRate}>
          <PercentInput
            id="quiz-rate"
            disabled={unsure}
            invalid={Boolean(errors.currentRate)}
            value={typeof answers.currentRate === 'number' ? answers.currentRate : null}
            onValueChange={(v) => onAnswer({ currentRate: v ?? undefined })}
          />
        </Field>
        <CheckEscape
          id="quiz-rate-unsure"
          label={st.escape ?? ''}
          checked={unsure}
          onChange={(c) => onAnswer({ currentRate: c ? 'unsure' : undefined })}
        />
      </div>
    );
  }
  // contact
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label={st.firstName ?? ''} htmlFor="quiz-firstname" error={errors.firstName}>
          <TextInput
            id="quiz-firstname"
            autoComplete="given-name"
            value={answers.firstName ?? ''}
            invalid={Boolean(errors.firstName)}
            onChange={(e) => onAnswer({ firstName: e.target.value })}
          />
        </Field>
        <Field label={st.lastName ?? ''} htmlFor="quiz-lastname" error={errors.lastName}>
          <TextInput
            id="quiz-lastname"
            autoComplete="family-name"
            value={answers.lastName ?? ''}
            invalid={Boolean(errors.lastName)}
            onChange={(e) => onAnswer({ lastName: e.target.value })}
          />
        </Field>
      </div>
      <Field label={st.email ?? ''} htmlFor="quiz-email" error={errors.email}>
        <TextInput
          id="quiz-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={answers.email ?? ''}
          invalid={Boolean(errors.email)}
          onChange={(e) => onAnswer({ email: e.target.value })}
        />
      </Field>
      <Field label={st.phone ?? ''} htmlFor="quiz-phone" error={errors.phone}>
        <TextInput
          id="quiz-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={answers.phone ?? ''}
          invalid={Boolean(errors.phone)}
          onChange={(e) => onAnswer({ phone: e.target.value })}
        />
      </Field>
      <p className="font-sans text-fine leading-[1.65] text-muted">{st.consent}</p>
    </div>
  );
}
