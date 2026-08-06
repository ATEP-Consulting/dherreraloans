// Valores de negocio no-copy. Cambiar aquí = cambia toda la web (requisito cliente).
export const NMLS_ID = '1459301';
export const APPLY_URL = 'https://aimsmtg.my1003app.com/1459301/register';
export const INSTAGRAM_URL = 'https://www.instagram.com/dherrera_loans/';
export const NMLS_CONSUMER_ACCESS_URL = 'https://www.nmlsconsumeraccess.org/';
/** PLACEHOLDER obvio hasta recibir el número real del cliente (Fase 4 lo bloquea). */
export const WHATSAPP_NUMBER = '13050000000';
export const PHONE_DISPLAY = '+1 (305) 000-0000';

export function whatsAppHref(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
