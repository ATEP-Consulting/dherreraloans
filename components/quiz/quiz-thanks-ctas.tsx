import { getTranslations } from 'next-intl/server';
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/site';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { TextLink } from '@/components/ui/text-link';

// Trío de CTAs de la pantalla de gracias del cuestionario (WhatsApp, teléfono, explorar
// programas): idéntico en /quote, home, /contact y /pre-qualify — antes duplicado 4× en
// cada page.tsx (ADR-0010). `newTab={false}` en el teléfono a propósito: `tel:` delega al
// marcador del sistema en vez de navegar, así que abrir una pestaña en blanco detrás no
// aporta nada (a diferencia del resto de enlaces `external`, que sí navegan).
export async function QuizThanksCtas() {
  const tc = await getTranslations('common');
  const tq = await getTranslations('quote');
  return (
    <>
      <WhatsAppButton label={tc('cta.whatsApp')} message={tc('cta.whatsAppMessage')} />
      <TextLink href={`tel:${PHONE_TEL}`} external newTab={false} tone="paper">
        {PHONE_DISPLAY}
      </TextLink>
      <TextLink href="/loan-options" tone="paper">
        {tq('quiz.thanks.explore')}
      </TextLink>
    </>
  );
}
