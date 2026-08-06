# ADR-0002 — Estrategia i18n EN/ES: rutas con prefijo, next-intl, inglés como x-default

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting (x-default confirmado con el responsable del proyecto)
- ADRs relacionados: [0001 (stack)](0001-stack-y-framework.md), [0003 (SEO)](0003-arquitectura-seo-y-rendimiento.md), [0007 (cuestionario)](0007-cuestionario-multi-paso.md)

## Contexto y problema

La web es bilingüe al 100% desde el día uno: todo el contenido, el cuestionario, la calculadora y los emails existen en inglés y español. Esta decisión condiciona el enrutado, el SEO (hreflang, sitemaps), la estructura de archivos de contenido y el flujo de revisión humana del contenido YMYL. Hay que decidir: estructura de URLs, librería, comportamiento de la raíz del dominio, y dónde viven las traducciones.

## Factores de decisión

1. SEO: señales hreflang limpias y simétricas, sin contenido duplicado, indexación de ambos idiomas.
2. Un solo dominio (el cliente aporta un dominio; presupuesto cerrado).
3. Revisión humana del contenido YMYL: los textos deben ser editables sin tocar código de componentes.
4. El tráfico principal llega desde Instagram (enlaces controlables, se puede enlazar directo a un idioma).
5. Madurez del tooling (plazo 1–2 semanas).

## Opciones consideradas

### Estructura de URLs

- **A. Subrutas con prefijo en ambos idiomas: `/en/...` y `/es/...` (elegida)** — simétrica, un solo dominio, hreflang limpio, sin ambigüedad sobre qué idioma es la raíz. Coste: la raíz `/` necesita una redirección.
- **B. Idioma por defecto sin prefijo (`/about` + `/es/sobre-mi`)** — ahorra un segmento en EN pero rompe la simetría: hreflang y sitemap más propensos a error, y migrar el default después obliga a redirecciones masivas. Descartada.
- **C. Dominios o subdominios por idioma (`es.dherreraloans.com`)** — divide la autoridad de dominio entre dos hosts justo cuando se parte de autoridad cero, duplica configuración (DNS, Search Console, sitemaps) y coste. Descartada.

### Librería

- **A. `next-intl` (elegida)** — diseñada para App Router: middleware de negociación de idioma, mensajes en Server Components sin enviar JSON al cliente, integración con `generateMetadata`, y soporte de **pathnames localizados** (`/en/loan-options` ↔ `/es/opciones-de-prestamo`).
- **B. `next-i18next`** — pensada para Pages Router; en App Router es un mal encaje. Descartada.
- **C. Solución artesanal (diccionarios + params)** — viable pero reinventa negociación, metadata y pathnames localizados en el área contractualmente crítica. Descartada.

### Comportamiento de la raíz `/`

- **A. Redirección 307 según `Accept-Language` con cookie de preferencia (`NEXT_LOCALE`) (elegida)** — comportamiento estándar del middleware de next-intl: primera visita → idioma del navegador; visitas siguientes → idioma elegido con el selector. Googlebot (sin preferencia clara) aterriza en `/en`, coherente con el x-default.
- **B. Página raíz "elige idioma"** — añade un clic antes del contenido a todos los visitantes: veneno para la conversión. Descartada.

## Decisión

1. **Rutas siempre prefijadas** (`localePrefix: 'always'`): `/en/...` y `/es/...`. La raíz `/` redirige 307 según negociación de idioma con cookie de preferencia.
2. **`next-intl`** como única librería i18n, con **pathnames localizados** en español para las rutas de contenido (mejor SEO en el idioma de la audiencia principal de Instagram): `/es/opciones-de-prestamo`, `/es/cotizacion`, `/es/calculadora`, `/es/sobre-mi`, `/es/contacto`, etc. El mapeo vive en un único archivo de configuración de rutas.
3. **`hreflang`**: cada página declara `en`, `es` y `x-default` → **la versión inglesa** (mercado EE. UU.; Google rastrea desde EE. UU. en inglés). Los enlaces de Instagram del cliente apuntarán directamente a `/es/...` cuando el post sea en español. Detalle de implementación en ADR-0003.
4. **Sitemap único multiidioma** con alternates `xhtml:link` por URL (ADR-0003); no hay sitemaps separados por idioma que mantener.
5. **Traducciones en archivos JSON versionados en el repo**: `messages/en.json` y `messages/es.json`, organizados por namespace de página (`home`, `loanOptions`, `programs.fha`, `quote`, `calculator`, `about`, `contact`, `legal`, `emails`, `common`). **Ningún texto visible se hardcodea en componentes**: esto es lo que hace posible la validación humana del contenido YMYL (el cliente revisa texto plano, no JSX) y las 2 rondas de revisión de la propuesta sin tocar código.

## Consecuencias

### Positivas

- hreflang y sitemap simétricos y generados desde una sola fuente de rutas: mínima superficie de error en el área contractual.
- El contenido (incluido el de los emails y el cuestionario) es editable y revisable como texto plano — requisito YMYL — y añadir contenido de Fase 2 es añadir claves y rutas, sin cambios estructurales.
- Mensajes consumidos en Server Components: las traducciones no engordan el JS del cliente (solo el cuestionario y la calculadora reciben sus namespaces).
- URLs en español legibles y posicionables para la audiencia hispana.

### Negativas

- Los pathnames localizados añaden un mapeo que mantener; cada página nueva exige tocar la config de rutas y ambos JSON (aceptado: es justo el punto de revisión que el flujo YMYL necesita).
- `/en/...` prefijado renuncia a la URL raíz "limpia" para el inglés (aceptado a cambio de simetría y de no hipotecar migraciones futuras).
- Dos archivos de mensajes pueden desincronizarse (claves faltantes); mitigación: check de paridad de claves EN/ES en CI (ADR-0008) que falla si un idioma pierde claves.
- La redirección de `/` no es contenido indexable; mitigación: x-default explícito y enlaces internos siempre a URLs prefijadas.
