// Componente propio, sin dependencia externa (ADR-0003 §4). Renderiza en servidor:
// no lleva 'use client', así el JSON-LD sale en el HTML estático sin coste de JS.
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
