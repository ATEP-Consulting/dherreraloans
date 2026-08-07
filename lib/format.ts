// Formateo/parseo de inputs numéricos (calculadora y cuestionario). Locale 'en'|'es' → en-US/es-US.
const intlLocale = (locale: string) => (locale === 'es' ? 'es-US' : 'en-US');

export function formatMoney(value: number, locale: string, decimals = 0): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function parseMoney(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? null : Number(digits);
}

export function parseRate(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '') return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
