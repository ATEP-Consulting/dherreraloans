// FUENTE ÚNICA de rutas de contenido (ADR-0002, ADR-0003 §3).
// La consumen: i18n/routing.ts, app/sitemap.ts, scripts/check-static.mjs y los tests.
// Añadir una página = añadir su entrada aquí + sus claves en messages/{en,es}.json.

export const locales = ['en', 'es'];
export const defaultLocale = 'en';

// Ruta interna → slug por idioma (sin prefijo de locale).
export const pathnames = {
  '/': { en: '/', es: '/' },
  '/loan-options': { en: '/loan-options', es: '/opciones-de-prestamo' },
  '/loan-options/[program]': {
    en: '/loan-options/[program]',
    es: '/opciones-de-prestamo/[program]',
  },
  '/quote': { en: '/quote', es: '/cotizacion' },
  '/pre-qualify': { en: '/pre-qualify', es: '/precalificacion' },
  '/calculator': { en: '/calculator', es: '/calculadora' },
  '/learn': { en: '/learn', es: '/aprende' },
  '/about': { en: '/about', es: '/sobre-mi' },
  '/contact': { en: '/contact', es: '/contacto' },
  '/privacy': { en: '/privacy', es: '/privacidad' },
  '/accessibility': { en: '/accessibility', es: '/accesibilidad' },
};

// Programas (ADR-0003 §4: página por programa). Clave interna → slug público por idioma.
export const programSlugs = {
  fha: { en: 'fha-loans', es: 'prestamos-fha' },
  conventional: { en: 'conventional-loans', es: 'prestamos-convencionales' },
  va: { en: 'va-loans', es: 'prestamos-va' },
  firstTimeHomebuyer: { en: 'first-time-homebuyer', es: 'primer-comprador' },
  refinance: { en: 'refinance', es: 'refinanciamiento' },
  fixedRate: { en: 'fixed-rate-mortgage', es: 'hipoteca-tasa-fija' },
  usda: { en: 'usda-loans', es: 'prestamos-usda' },
  jumbo: { en: 'jumbo-loans', es: 'prestamos-jumbo' },
  lowDownPayment: { en: 'low-down-payment', es: 'entrada-baja' },
  investment: { en: 'investment-property-loans', es: 'prestamos-de-inversion' },
  cashOutRefinance: { en: 'cash-out-refinance', es: 'refinanciamiento-cash-out' },
  vaRefinance: { en: 'va-refinance', es: 'refinanciamiento-va' },
};
