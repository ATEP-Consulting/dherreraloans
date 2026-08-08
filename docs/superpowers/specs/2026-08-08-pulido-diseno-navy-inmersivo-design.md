# Pulido de diseño · Dirección «Navy inmersivo» — Design Spec

**Fecha:** 2026-08-08 · **Estado:** aprobado por Pablo (brainstorming con companion visual)
**Contexto:** Fase 2.5 completada. Antes de la primera demo con David, rediseño visual de todas las secciones del sitio. El único elemento que sobrevive intacto es el hero (home e interiores).

## 1. Problema

Las secciones actuales se perciben **planas y monótonas** (todo paper, bordes 1px, mismo ritmo, nada destaca) y **vacías / poco premium** (mucho texto sin recompensa visual). El hero promete un nivel que el resto de la página no cumple.

## 2. Decisiones de dirección (validadas visualmente en el companion)

| Decisión | Elección |
|---|---|
| Dirección visual | **A · Navy inmersivo** — las secciones heredan el drama del hero: bandas navy profundas, fotografía con velo azul, texto paper. Sensación de banca privada. |
| Ritmo de página | **Alternancia con anclas navy** (~50/50): el navy marca los momentos clave (índice de programas, CTA final, footer); entre ellos paper/sand para lectura y formularios. |
| Motion | **Escenográfico calibrado**: titulares con máscara, fotos-cortina, entradas laterales escalonadas en secciones narrativas; en superficies funcionales (quiz, calculadoras, formularios) el motion baja a rise/fade sutil. |
| Alcance | **Todo el sitio** (home + todas las interiores). |
| Fotografía | **Stock curado ya** (Unsplash/Pexels: Miami, arquitectura, interiores) con velo navy uniforme por CSS; descargado a `assets/img` y servido con `next/image` (sin hotlinks). Las fotos reales de David las sustituirán sin tocar diseño. |
| Estrategia | **Sistema primero**: PR fundacional (tokens + primitivos + motion, home como banco de pruebas) y después PRs de migración del resto de páginas. |

**Relación con el handoff:** `design_handoff_home_fachada/` sigue siendo fuente de verdad para el **hero** y para el ADN tipográfico (Spectral + Instrument Sans, radius 0, sin sombras, bordes finos). Para las **secciones**, este spec lo sustituye como fuente de verdad visual. La profundidad se consigue con capas de color y fotografía, nunca con sombras ni radius.

## 3. Home aprobada — 9 secciones (mockup `home-full.html`)

1. **Hero** — sin cambios (100svh, foto + scrim navy, header integrado).
2. **Ciudades** — de línea estática a **marquesina continua** (animación CSS infinita de la lista de ciudades, pausa en hover, se detiene con `prefers-reduced-motion`).
3. **Quiz «Cuéntanos»** — paper, dos columnas, tarjeta plate con borde hairline. Motion contenido.
4. **Índice de programas** — **ancla navy**, la sección estrella: eyebrow azure-light, H2 Spectral con em itálica y reveal de máscara; filas con numeral Spectral (azure-soft), nombre paper, guía punteada, stat azure-light; entrada lateral escalonada; **panel derecho sticky con preview fotográfica que cambia según la fila en hover** (CSS puro vía `:has()`, oculto < lg); enlace «Ver los 12 programas →».
5. **Interludio fotográfico** — foto Miami a sangre con velo navy, entra como **cortina** (clip-path) con zoom decreciente; cita de David en Spectral itálica + atribución.
6. **David** — banda sand con bordes ink (herencia handoff): **placa blanca con marco y caption** (PhotoPlate), texto, botón navy + text-link Instagram.
7. **Acciones** — tres celdas (Cotización / Solicitud 1003 / Calculadoras) sobre grid de hairlines; **hover: inversión completa a navy** con texto paper y flecha que se desliza.
8. **CTA final** — banda navy con **glow radial azure** sutil, titular Spectral con máscara, botón paper.
9. **Footer** — **navy profundo** (`navy-deep`), funde visualmente con el CTA en un bloque oscuro de cierre.

## 4. Interiores por tipo de página

Todas conservan su `PageHero` interior actual. Cada página termina en oscuro (CtaBand cuando aplique + footer navy-deep).

- **`/loan-options`**: adopta el patrón del índice de la home — 12 filas navy con preview fotográfica al hover.
- **Fichas de programa (12)**: tras el hero, **banda navy compacta de datos clave** (entrada mínima, score, montos… en numerales Spectral); cuerpo editorial paper; programas relacionados como mini-índice navy; CtaBand.
- **Calculadoras (`/calculator`)**: superficie funcional — paper/plate, tabs y formularios estructuralmente intactos; re-tematizado (acentos azure, tipografía del sistema); motion contenido; CTA navy al cierre.
- **`/quote`, `/pre-qualify`, `/contact`**: paper + tarjeta plate (como el quiz de home); motion contenido; cierre navy.
- **`/learn`**: editorial paper con interludios fotográficos navy.
- **`/about`**: reutiliza placa de David + biografía editorial + interludio.
- **Legales (`/privacy`, `/accessibility`)**: solo re-tematización por tokens; sin cambios estructurales.

## 5. Motion — arquitectura

Cero client components nuevos (se mantiene la regla del proyecto). Todo CSS.

- **Reveals al scroll**: CSS scroll-driven animations (`animation-timeline: view()` + `animation-range`), declaradas **dentro de `@supports (animation-timeline: view())`** → Firefox y navegadores sin soporte ven contenido estático visible, sin FOUC ni JS de respaldo. Solo propiedades de compositor: `transform`, `opacity`, `clip-path` (cero CLS).
- **Vocabulario** (clases utilitarias en `globals.css`): `reveal-rise`, `reveal-mask` (titulares), `reveal-curtain` / `reveal-curtain-l` (fotos), `reveal-left` (filas), con stagger por `nth-child` vía `animation-range` desplazado. Easings token: `--ease-expo: cubic-bezier(.16,1,.3,1)`, `--ease-curtain: cubic-bezier(.7,0,.2,1)`.
- **Transición entre páginas**: `app/[locale]/template.tsx` (se remonta en cada navegación) con animación CSS de entrada (fade + rise suave del contenido). Sin JS.
- **View Transitions (Next 16, experimental)**: PR de evaluación **aparte y al final**; se descarta sin coste si compromete Lighthouse o estabilidad.
- **Marquesina**: keyframes infinitos sobre `transform`, contenido duplicado con `aria-hidden`, pausa en hover.
- **`prefers-reduced-motion: reduce`**: desactiva reveals y marquesina globalmente.

## 6. Sistema de componentes y tokens

**Tokens nuevos (`@theme` en `globals.css`):**
- `--color-navy-deep` (≈ `#0b2438`, cierre de página y footer).
- Alphas de paper para superficies navy: `--color-paper-a15` (borde de fila, `rgb(247 245 240 / .15)`) y `--color-paper-a28` (guía punteada) — mismo esquema de nombre que los `paper-a25/a55/…` existentes.
- Easings y duraciones de motion (`--ease-expo`, `--ease-curtain`).
- Radius sigue 0; sombras siguen prohibidas.

**Componentes nuevos (`components/ui/`):** `Marquee` (ciudades), `Interlude` (foto-cortina + cita opcional), `ProgramsIndex` (filas + preview `:has()`), `ProgramStats` (banda navy de datos clave de ficha).

**Evolucionan:** `Band` (+`navy-deep`), `IndexRow` (variante sobre navy), `ActionCards` (inversión hover), `CtaBand` (glow azure), `SiteFooter` (navy-deep), `CitiesStrip` → sustituida por `Marquee`.

**Se conservan:** `PageHero`, `PhotoPlate`, `Button`, `Eyebrow`, `SectionHeading`, `Container`, formularios y quiz (estructura intacta).

**Contenido:** cadenas nuevas (cita del interludio, labels) en `messages/{en,es}.json` con paridad; la cita es borrador YMYL hasta validación del cliente, como todo el copy.

## 7. Restricciones y gates (invariables)

- Lighthouse **≥ 95 ×4** en cada PR (CI); `skipAudits` intactos.
- Todas las páginas prerenderizadas (`npm run check:static`); rutas desde `config/routes.mjs`.
- Cero client components propios; interactividad y motion CSS-only.
- Paridad EN/ES testeada; datos no-copy en `lib/site.ts`.
- Contraste AA en superficies navy (azure-light `#9bc4df` sobre navy `#10314a` ≈ 7:1 ✓; verificar cada par nuevo).
- e2e existentes (quiz, calculadoras) deben seguir en verde sin reescritura estructural.

## 8. Fuera de alcance

- Copy nuevo más allá de las cadenas que exijan las secciones nuevas (el copy es borrador YMYL pendiente de David).
- Fotos reales de David / datos reales (teléfono, email, APPLY_URL) — siguen placeholder.
- Backlog funcional de Fase 2.5 (accesibilidad de tabs, e2e numéricos…) — se mantiene como backlog aparte.
- Fase 3 (pipeline de leads) y Fase 4 (SEO on).

## 9. Criterios de éxito

1. La home y todas las interiores muestran el sistema navy inmersivo con la cadencia aprobada; el hero permanece intacto.
2. Reveals escenográficos activos en Chrome/Edge/Safari; contenido estático correcto en Firefox; `prefers-reduced-motion` respetado.
3. Transición de entrada entre páginas perceptible y suave.
4. Gates verdes: Lighthouse ≥95×4, `check:static`, tests unit/e2e, paridad i18n, `tsc`, lint.
5. Pablo valida el resultado contra los mockups del companion (`.superpowers/brainstorm/94878-1786182921/content/`, local) antes de la demo con David.

## Referencias locales (no versionadas)

Mockups aprobados del companion: `visual-direction.html` (dirección A), `home-rhythm.html` (opción 2), `motion-style.html` (opción 3), `home-full.html` (home completa aprobada). Viven en `.superpowers/brainstorm/94878-1786182921/content/` (gitignored); si se pierden, este spec es la descripción canónica.

## Enmienda 2026-08-08 (post-verificación visual de Pablo)

1. **Motion:** los reveals scrubbed con `animation-timeline: view()` se percibían como «sin animación» a velocidad de scroll real (verificado con sonda: la animación completaba dentro del gesto). Sustituidos por animaciones **por tiempo** (0.9–1.1s, mismas keyframes/easings) disparadas al entrar en viewport por un IntersectionObserver **vanilla inline** en el layout (~30 líneas, no es client component; re-escanea en navegaciones client-side vía MutationObserver). `html.js-reveal` se arma pre-paint solo con JS y sin `prefers-reduced-motion`; sin JS o con reduced-motion todo es estático visible. Beneficio: también anima en Firefox.
2. **Header fijo con estado:** el header (con TopStrip) pasa a `position: fixed`; transparente integrado con el hero en top 0, y con `hdr-solid` (scroll > 8px, script del layout) fondo paper, texto ink, logo oscuro (`logo.png`) y top-strip plegado. Colores vía vars `--hfg/--hfg-mut/--hbr` en `.site-header`.
3. **Mega-menú «Loan Options»** (referencia: luisroyuelanutricionistas.com): panel a ancho completo bajo el header (CSS-only, hover/focus-within, `visibility` para accesibilidad y e2e) con cabecera+descripción (claves nuevas `common.megaMenu.*`) y los 12 programas (nombre+stat).
4. **Hero interior con más aire:** `min-h` 420/480 → 500/580 + `pt` de compensación del header fijo. **Numeral del índice:** columna 56→80px (respiro tras «No. N»).
