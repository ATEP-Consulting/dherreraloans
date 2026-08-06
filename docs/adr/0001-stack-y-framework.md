# ADR-0001 — Stack y framework: Next.js 15 (App Router) con generación estática

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0002 (i18n)](0002-estrategia-i18n.md), [0003 (SEO)](0003-arquitectura-seo-y-rendimiento.md), [0008 (hosting)](0008-hosting-despliegue-ci.md)

## Contexto y problema

La web es mayoritariamente estática (Home, Loan Options, 5 páginas de programas, About, Contacto, legales — todas en EN y ES), con dos piezas interactivas (cuestionario multi-paso "Get a Quote" y calculadora de hipoteca) y 1–2 endpoints de servidor (recepción de leads de cuestionario y contacto). Hace falta elegir el framework que soporte a la vez: SEO técnico completo (SSG, metadata por página e idioma, hreflang), el compromiso contractual de Lighthouse > 95 en las 4 categorías, i18n al 100% desde el día uno, endpoints serverless para el flujo de leads, y un plazo de 1–2 semanas de desarrollo asistido por IA en free tier de hosting.

## Factores de decisión

1. **SEO**: renderizado estático de todo el contenido, control total de metadata, hreflang, canonical, sitemap, datos estructurados.
2. **Lighthouse > 95 contractual** en móvil, incluida la categoría de rendimiento con GA4 cargado.
3. **i18n madura**: la web es bilingüe al 100%; el tooling de i18n no puede ser experimental.
4. **Una sola pieza**: páginas + cuestionario interactivo + endpoints de API en el mismo proyecto, sin coordinar dos stacks en 2 semanas.
5. **DX con IA y ecosistema**: velocidad de desarrollo, abundancia de patrones probados.
6. **Hosting free tier** con previews por PR (ver ADR-0008).

## Opciones consideradas

### Opción A — Next.js 15, App Router, páginas estáticas + route handlers (elegida)

- ✅ SSG por página con `generateStaticParams` (cada ruta × cada idioma se sirve como HTML estático); Metadata API nativa para title/description/canonical/hreflang/OG por página e idioma.
- ✅ `next-intl` es la librería i18n más madura del ecosistema App Router y se integra con la Metadata API (ver ADR-0002).
- ✅ Cuestionario y calculadora como client components aislados; el resto Server Components sin JS de cliente. Endpoints como route handlers serverless en el mismo repo.
- ✅ `next/image` (AVIF/WebP, tamaños responsive) y `next/font` (self-hosting) resuelven de serie dos de los frentes de Lighthouse.
- ✅ DX con IA inmejorable: es el framework con más patrones documentados; menor riesgo de plazo.
- ✅ Despliegue cero-config en Vercel free tier con previews por PR.
- ❌ Baseline de JS de cliente (~100 KB gzip de framework) mayor que Astro; exige disciplina de Server Components y presupuesto de JS explícito (se fija en ADR-0003).

### Opción B — Astro 5 + isla React para el cuestionario + endpoints Astro

- ✅ El mejor rendimiento por defecto: cero JS en páginas de contenido; máximo margen para Lighthouse.
- ✅ i18n de rutas integrada; SSG por defecto.
- ❌ El componente más importante del proyecto (cuestionario) viviría en una isla React con su propio ciclo de hidratación, y los endpoints en el runtime de Astro: tres modelos mentales (Astro, React, endpoints) en vez de uno.
- ❌ Tooling i18n de metadata/hreflang menos integrado que next-intl + Metadata API: más código manual justo en el área contractualmente crítica (SEO).
- ❌ Menor densidad de patrones probados para el combo i18n + formularios + serverless; más riesgo de plazo.

### Opción C — SvelteKit / Remix (React Router 7)

- ✅ Frameworks capaces, buen rendimiento.
- ❌ Ecosistema i18n + SEO claramente menos maduro para este caso; sin ventaja diferencial que compense el riesgo. Descartados sin análisis extenso.

### Opción D — WordPress / builders (Webflow, Framer)

- ❌ Incumple la propuesta: el código debe ser propiedad del cliente, sin plantillas de terceros ni suscripciones obligatorias. Lighthouse > 95 móvil difícil de garantizar. Flujo de leads con lógica de resiliencia propia (ADR-0004) no implementable con control total. Descartado.

## Decisión

**Next.js 15 con App Router y TypeScript.** Todas las páginas de contenido se generan estáticamente en build; el cuestionario y la calculadora son client components aislados; el flujo de leads vive en route handlers serverless. No se usa `output: 'export'` (se necesitan funciones de servidor), pero cada página de contenido debe compilar como estática (verificable en el build output: símbolo `○`/`●`, no `ƒ`).

La ventaja real de Astro (menos JS por defecto) se compensa con un presupuesto de JS vigilado en CI (ADR-0003); la ventaja de Next.js (una sola pieza, i18n-SEO maduro, velocidad con IA) reduce el riesgo del plazo de 2 semanas y concentra la complejidad donde está el valor: el cuestionario.

## Consecuencias

### Positivas

- Un solo framework para páginas, cuestionario, calculadora y API: menos superficie de integración, menos riesgo de plazo.
- SEO técnico y i18n con herramientas de primera clase y patrones probados (ADR-0002 y 0003 se apoyan en esto).
- El cuestionario, componente nº 1 del proyecto, se desarrolla en React con todo el ecosistema disponible.

### Negativas

- Baseline de JS de cliente mayor que Astro: el compromiso Lighthouse exige disciplina permanente (Server Components por defecto, presupuesto de JS en CI — ADR-0003). Si en el primer deploy con Lighthouse CI el rendimiento móvil no supera 95, la mitigación es recortar JS de cliente, no cambiar de framework.
- Acoplamiento suave a Vercel para la mejor DX (mitigado: Next.js corre también en Netlify/self-host; ver plan B en ADR-0008).
- Actualizaciones mayores de Next.js requerirán mantenimiento (cubierto por el plan de mantenimiento mensual de la propuesta).
