import { describe, it, expect } from 'vitest';
import { personJsonLd, mortgageLoanJsonLd, breadcrumbJsonLd, financialServiceJsonLd } from '@/lib/jsonld';

describe('JSON-LD (ADR-0003 §4)', () => {
  it('Person: NMLS como identifier, sameAs a Instagram y Consumer Access', () => {
    const p = personJsonLd();
    expect(p['@type']).toBe('Person');
    expect(p.identifier).toMatchObject({ propertyID: 'NMLS', value: '1459301' });
    expect(p.sameAs).toEqual(expect.arrayContaining([expect.stringContaining('instagram'), expect.stringContaining('nmlsconsumeraccess')]));
    expect(p.jobTitle).toBe('Mortgage Loan Originator');
  });
  it('MortgageLoan referencia a la Person como provider y usa la URL localizada', () => {
    const m = mortgageLoanJsonLd('es', 'fha');
    expect(m['@type']).toBe('MortgageLoan');
    expect(m.provider['@type']).toBe('Person');
    expect(m.url).toContain('/es/opciones-de-prestamo/prestamos-fha');
  });
  it('BreadcrumbList: Home → Loan Options → Programa', () => {
    const b = breadcrumbJsonLd('en', 'va');
    expect(b.itemListElement).toHaveLength(3);
    expect(b.itemListElement[2].name.length).toBeGreaterThan(0);
  });
  it('FinancialService enlaza provider Person y areaServed', () => {
    const f = financialServiceJsonLd('en');
    expect(f.provider['@type']).toBe('Person');
    expect(JSON.stringify(f.areaServed)).toContain('Miami');
  });
});
