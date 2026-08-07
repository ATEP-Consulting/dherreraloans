// Valores de negocio no-copy. Cambiar aquí = cambia toda la web (requisito cliente).
export const NMLS_ID = '1459301';
export const INSTAGRAM_URL = 'https://www.instagram.com/dherrera_loans/';
export const NMLS_CONSUMER_ACCESS_URL = 'https://www.nmlsconsumeraccess.org/';
export const EMAIL = 'hola@dherreraloans.com'; // PLACEHOLDER hasta email real del cliente
/** PLACEHOLDER obvio hasta recibir el número real del cliente (Fase 4 lo bloquea). */
export const WHATSAPP_NUMBER = '13050000000';
export const PHONE_DISPLAY = '+1 (305) 000-0000';
/** Formato E.164 para enlaces `tel:` — derivado del mismo placeholder. */
export const PHONE_TEL = PHONE_DISPLAY.replace(/[^\d+]/g, '');
// Solicitud 1003 online (POS externo). PLACEHOLDER OBVIO hasta que David confirme su
// enlace real (en aimsmtg era aimsmtg.my1003app.com/1459301/register — sin confirmar).
export const APPLY_URL = 'https://example.com/solicitud-online-PENDIENTE';

export function whatsAppHref(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
