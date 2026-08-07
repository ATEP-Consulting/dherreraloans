# ADR-0003 — Arquitectura SEO y rendimiento: estático, medido en CI desde el primer deploy

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0001 (stack)](0001-stack-y-framework.md), [0002 (i18n)](0002-estrategia-i18n.md), [0008 (CI)](0008-hosting-despliegue-ci.md), [0009 (GA4)](0009-analitica-ga4.md)

> **Este es el ADR crítico del proyecto.** La propuesta compromete contractualmente Lighthouse > 95 en las 4 categorías y una base "preparada para SEO". El porqué es de negocio: SEO y velocidad traen y convierten tráfico — más visitantes que llegan y menos que abandonan por lentitud = más leads.

## Contexto y problema

Sitio de contenido YMYL (finanzas personales) que parte de autoridad de dominio cero, con tráfico inicial de Instagram (móvil) y ambición de tráfico orgánico local (Miami/Florida). Hay que definir la arquitectura de renderizado, metadata, datos estructurados, imágenes, fuentes, presupuesto de JS y — decisivo — cómo se mide el compromiso Lighthouse de forma continua y no al final.

## Factores de decisión

1. Lighthouse > 95 en rendimiento, accesibilidad, buenas prácticas y SEO, **en móvil y con GA4 cargado** (condiciones reales).
2. Contenido YMYL: Google exige señales de legitimidad (E-E-A-T); la autoridad forma parte del SEO, no solo la técnica.
3. Bilingüe: toda señal SEO existe por idioma (ADR-0002).
4. La regresión de rendimiento debe detectarse en el PR que la causa, no en la auditoría de entrega.

## Decisión

Se descompone en 8 sub-decisiones. La alternativa global descartada — SSR dinámico con optimización "al final del proyecto" — se rechaza de plano: en un sitio cuyo contenido cambia solo con deploys, servir HTML estático desde CDN es estrictamente superior en TTFB, coste y fiabilidad, y la experiencia demuestra que el rendimiento no medido se degrada silenciosamente.

### 1. Renderizado: 100% estático para contenido

Todas las páginas de contenido (Home, Loan Options, 5 programas, Get a Quote, calculadora, About, Contacto, legales × 2 idiomas ≈ 24 rutas) se generan en build (`generateStaticParams` sobre el idioma) y se sirven desde CDN. **Gate en CI**: si una página de contenido aparece como dinámica (`ƒ`) en el build output, el build falla. Las únicas piezas de servidor son los route handlers del flujo de leads (ADR-0004). No hay ISR ni revalidación: el contenido vive en el repo y cambia con deploys (flujo de revisión YMYL, ADR-0002).

### 2. Metadata por página e idioma

`generateMetadata` en cada página, alimentado por los archivos de mensajes (ADR-0002): `title` (patrón `{Página} | DherreraLoans — {claim}`), `description`, **canonical absoluto autorreferente** por idioma, `hreflang` (`en`, `es`, `x-default` → EN) vía `alternates.languages`, Open Graph (`og:locale`, `og:locale:alternate`, imagen OG estática 1200×630 por idioma cuando lleve texto embebido) y Twitter card. `metadataBase` con el dominio de producción. Ninguna página sin metadata explícita: plantilla de página nueva la exige.

### 3. Sitemap y robots

`app/sitemap.ts` genera un único sitemap multiidioma: una entrada por URL con `alternates.languages` (equivalente a `xhtml:link`), construido desde el mismo archivo de configuración de rutas que los pathnames localizados — imposible que sitemap y rutas diverjan. `app/robots.ts`: allow all + referencia al sitemap; `Disallow` de rutas de API. Alta en Google Search Console y Bing Webmaster Tools con envío de sitemap en el primer deploy de producción (compromiso 2.9 de la propuesta).

### 4. Datos estructurados (JSON-LD)

Evaluados `FinancialService`, `MortgageLoan` y `Person` — se usan los tres, cada uno donde aporta:

- **Global (layout)**: `Person` — David Herrera, `jobTitle: "Mortgage Loan Originator"`, `identifier` NMLS individual, `worksFor` (compañía licenciante), `areaServed` Miami/FL, `sameAs` → Instagram y perfil público de NMLS Consumer Access. La marca es personal, no una empresa: **la entidad central es la persona** (no se inventa una `Organization` — señal YMYL honesta, coherente con el futuro Google Business Profile de la Fase 2.8).
- **Home y About**: `FinancialService` enlazado a la `Person` vía `provider`, con `areaServed`, teléfono y dirección de contacto pública.
- **Páginas de programa**: `MortgageLoan` (`name`, `loanType`, `provider` → Person) — sin rich result garantizado hoy, pero da claridad de entidad a Google en páginas YMYL; coste marginal cero porque se genera desde los mismos mensajes.
- **Páginas de programa**: `BreadcrumbList` (Home → Loan Options → Programa).

JSON-LD generado por componente propio tipado (sin dependencia externa), renderizado en servidor, validado con Rich Results Test en la entrega.

### 5. Imágenes

`next/image` en todas las imágenes raster: AVIF/WebP automático, `sizes` responsive, dimensiones explícitas siempre (CLS = 0). Hero con `priority`; todo lo demás lazy (comportamiento por defecto). Logos e iconografía en SVG inline u optimizado. La foto profesional del cliente se recorta/comprime en build, no se sube "tal cual". Presupuesto: ninguna imagen > 200 KB servida; el LCP de cada página debe ser texto o una imagen con `priority`.

### 6. Fuentes y CSS

`next/font` con self-hosting: máximo 2 familias, subsets `latin` (cubre ES), `display: swap`, sin peticiones a Google Fonts (rendimiento + privacidad). CSS: Tailwind (ADR-0010) — hoja final purgada, sin CSS-in-JS runtime.

### 7. Presupuesto de JS en cliente

- Páginas de contenido: **First Load JS ≤ 130 KB gzip** (baseline Next ~100 KB + margen).
- Ruta del cuestionario: **≤ 170 KB gzip** (su chunk solo se carga en su ruta; es la inversión de JS justificada del proyecto).
- Prohibido por defecto: librerías de componentes pesadas, librerías de animación JS (se anima con CSS), moment/lodash completos. Toda dependencia de cliente nueva se justifica contra este presupuesto.
- Vigilancia: el resumen de tamaños del build se revisa en cada PR y Lighthouse CI (abajo) convierte las regresiones en fallo de CI.

### 8. Lighthouse en CI desde el primer deploy

**Lighthouse CI (GitHub Actions, `treosh/lighthouse-ci-action`) corre contra la URL de preview de Vercel en cada PR**, emulación móvil, 3 runs por URL (mediana), sobre un conjunto representativo: home EN/ES, un programa EN/ES, Get a Quote EN/ES, contacto. **Assertions: ≥ 95 en las 4 categorías; el incumplimiento bloquea el merge.** Se activa en el PR nº 1 (esqueleto del proyecto): así el proyecto nunca está "por debajo y ya lo arreglaremos". La auditoría documentada de la entrega (compromiso 2.9) es un artefacto de esta misma tubería, no un ejercicio aparte. GA4 está activo en previews: se mide la realidad, no una versión maquillada (mitigación del coste de GA en ADR-0009).

### Señales YMYL / E-E-A-T (arquitectura, no contenido)

La arquitectura reserva y hace visibles: NMLS individual en header o footer de **todas** las páginas, logo Equal Housing Opportunity, enlace a NMLS Consumer Access, disclaimers del sector y Privacy Policy en el footer global, página About robusta (la entidad `Person` la referencia), y declaración de accesibilidad. Los textos los aporta y valida el cliente (metodología de la propuesta); la arquitectura garantiza que tienen sitio fijo y no se pueden omitir por descuido (componentes de layout obligatorios, no opcionales por página).

## Consecuencias

### Positivas

- HTML estático desde CDN: TTFB mínimo, LCP dominado por contenido, rendimiento estable sin esfuerzo continuo.
- El compromiso contractual se convierte en un gate automático: una regresión de Lighthouse es un PR rojo, no una sorpresa en la entrega.
- Sitemap, hreflang, pathnames y canonical derivan de una única fuente de rutas: coherencia estructural garantizada.
- Señales de entidad YMYL honestas y coherentes (Person + NMLS) que además preparan el terreno del Google Business Profile sin trabajo extra.

### Negativas

- El gate de CI es exigente: habrá PRs bloqueados por rendimiento que obliguen a recortar en vez de "pasar y seguir" (es el coste asumido de un compromiso contractual; la alternativa — descubrirlo en la entrega — es peor).
- Lighthouse en preview tiene varianza (red, cold start de funciones); mitigación: 3 runs con mediana y umbral interno de aviso en 97 para detectar erosión antes de rozar el 95.
- Los presupuestos (JS, imágenes) añaden fricción al añadir dependencias o assets — fricción deliberada.
- El x-default a EN prioriza el mercado general de EE. UU.; si el negocio del cliente resultase casi 100% hispano, se revisaría (decisión reversible: un cambio de configuración).

## Nota post-aprobación (2026-08-07): re-baseline del presupuesto JS

Baseline real medido al cierre de Fase 1 (cero client components propios): First Load JS ≈ 149 KB gz en páginas de contenido (build local, Next 16.3.0). Presupuesto operativo: ≤ 164 KB; el gate de Lighthouse sigue siendo la vigilancia automática (ADR-0008). Sustituye al presupuesto nominal de 130 KB del §7, que la realidad de Next 16 + next-intl hizo obsoleto.

*Metodología de medición*: Next.js 16 eliminó las métricas `size`/`First Load JS` de la salida de `next build` (ver `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`, sección "Improved terminal output"). El número se calculó a partir de los artefactos reales del build: se leyeron las etiquetas `<script src>` del HTML pre-renderizado de una página de contenido (`.next/server/app/en.html`, home) y de una página de programa (`.next/server/app/en/loan-options/fha-loans.html`) — ambas cargan exactamente los mismos 7 chunks compartidos (confirma "cero client components propios": ninguna página añade JS propio) — y se sumó el tamaño gzip (`gzip -c | wc -c`) de esos 7 archivos en `.next/static/chunks/`. Se excluyó el chunk de polyfills (`noModule=""` en el HTML, 39 KB gz): solo lo descargan navegadores sin soporte de módulos ES, no representa la carga real de un usuario moderno.
