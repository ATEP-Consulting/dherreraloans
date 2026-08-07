// Datos estructurados JSON-LD (ADR-0003 §4). `Person` es la entidad central de la
// marca: no se inventa una `Organization` — señal YMYL honesta y coherente con el
// futuro Google Business Profile (Fase 2.8). Builders puros y síncronos: los
// mensajes se importan directamente (no `next-intl/server`) para que sean
// testeables fuera de un Request de Next y reusables desde Server Components.
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import { NMLS_ID, INSTAGRAM_URL, NMLS_CONSUMER_ACCESS_URL, PHONE_DISPLAY } from '@/lib/site';
import { SITE_URL, hreflangAlternates } from '@/lib/metadata';

const messagesByLocale = { en, es } as const;
type Locale = keyof typeof messagesByLocale;

function messagesFor(locale: string) {
  return messagesByLocale[locale as Locale] ?? messagesByLocale.en;
}

function programName(locale: string, programKey: string): string {
  const t = messagesFor(locale);
  const programs = t.programs as Record<string, { heading: string }>;
  return programs[programKey]?.heading ?? programKey;
}

/** Miami/FL — todos los programas se ofrecen en toda Florida (ADR-0003 §4). */
const AREA_SERVED = {
  '@type': 'City',
  name: 'Miami',
  containedInPlace: { '@type': 'State', name: 'Florida' },
};

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'David Herrera',
    jobTitle: 'Mortgage Loan Originator',
    url: SITE_URL,
    identifier: { '@type': 'PropertyValue', propertyID: 'NMLS', value: NMLS_ID },
    // PENDIENTE: confirmar razón social exacta con el cliente
    worksFor: { '@type': 'Organization', name: 'AIMS Mortgage' },
    areaServed: AREA_SERVED,
    sameAs: [INSTAGRAM_URL, NMLS_CONSUMER_ACCESS_URL],
  };
}

export function financialServiceJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'DherreraLoans',
    provider: personJsonLd(),
    areaServed: AREA_SERVED,
    telephone: PHONE_DISPLAY,
    url: hreflangAlternates('/').languages[locale] ?? SITE_URL,
  };
}

export function mortgageLoanJsonLd(locale: string, programKey: string) {
  const name = programName(locale, programKey);
  return {
    '@context': 'https://schema.org',
    '@type': 'MortgageLoan',
    name,
    loanType: name,
    provider: personJsonLd(),
    url:
      hreflangAlternates('/loan-options/[program]', { program: programKey }).languages[locale] ??
      SITE_URL,
  };
}

export function breadcrumbJsonLd(locale: string, programKey: string) {
  const t = messagesFor(locale);
  const home = hreflangAlternates('/').languages[locale] ?? SITE_URL;
  const loanOptions = hreflangAlternates('/loan-options').languages[locale] ?? SITE_URL;
  const program =
    hreflangAlternates('/loan-options/[program]', { program: programKey }).languages[locale] ??
    SITE_URL;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.common.nav.home, item: home },
      { '@type': 'ListItem', position: 2, name: t.common.nav.loanOptions, item: loanOptions },
      { '@type': 'ListItem', position: 3, name: programName(locale, programKey), item: program },
    ],
  };
}
