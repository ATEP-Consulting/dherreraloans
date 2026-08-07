// Deriva el slug de archivo OG a partir del namespace de mensajes de una página.
// Módulo puro (sin efectos secundarios, sin imports): única fuente de verdad,
// compartida por `scripts/generate-og.mjs` (generador) y `lib/metadata.ts` (metadata
// en runtime) — ver tests/unit/metadata-og.test.ts para la guardia de sincronía.
// ('home' es un caso especial; el resto usa el último segmento del namespace.)
export function defaultOgSlug(namespace) {
  if (namespace === 'home') return 'home';
  const segments = namespace.split('.');
  return segments[segments.length - 1];
}
