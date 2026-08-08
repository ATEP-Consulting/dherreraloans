'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { QuizTexts } from '@/lib/quiz/texts';

// El árbol del cuestionario (15 pasos, ~quiz.tsx) es caro de hidratar — bajo el throttling
// 4x de Lighthouse aporta ~800ms de TBT aunque el visitante nunca llegue a desplazarse hasta
// él. En los 3 embeds bajo el fold (home, /contact, /pre-qualify) se difiere su import y
// montaje hasta que el usuario se aproxima; en /quote el cuestionario ES la página (above the
// fold), así que ahí se usa <Quiz> directo, sin diferir.
const Quiz = dynamic(() => import('./quiz').then((m) => m.Quiz), { ssr: false });

type Props = { locale: string; texts: QuizTexts; thanksCtas: ReactNode };

export function QuizDeferred({ locale, texts, thanksCtas }: Props) {
  const [visible, setVisible] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = placeholderRef.current;
    if (!el) return;
    // rootMargin generoso: el import dinámico + montaje deben completarse ANTES de que el
    // cuestionario entre en viewport, para que el usuario nunca vea el placeholder sustituirse
    // por el componente real (evita CLS visible pese a la altura reservada aproximada).
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Una vez montado (`visible === true`), el placeholder ya no se renderiza y este efecto no
    // vuelve a correr (el componente nunca desmonta el Quiz real al hacer scroll fuera).
  }, []);

  if (visible) return <Quiz locale={locale} texts={texts} thanksCtas={thanksCtas} />;

  return <div ref={placeholderRef} aria-hidden className="min-h-[330px] max-w-[640px]" />;
}
