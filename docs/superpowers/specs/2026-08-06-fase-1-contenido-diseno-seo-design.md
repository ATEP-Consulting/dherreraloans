# Fase 1 — Contenido, diseño y SEO: Design spec

Estado: borrador para revisión · Fecha: 2026-08-06 · Gobernado por ADRs 0001–0010

## 1. Objetivo

Convertir el esqueleto de Fase 0 en la web real: sistema de diseño componetizado (tokens + `components/ui/`), layout definitivo con compliance, las ~12 páginas × 2 idiomas con contenido de primer borrador, SEO completo (metadata, JSON-LD, OG) y la deuda técnica de Fase 0 saldada. Sin cuestionario, calculadora funcional, pipeline de leads ni indexación (Fases 2–4).

## 2. Fuente de verdad visual

**`design_handoff_home_fachada/`** (home «Fachada 4a»): README + `home-desktop.html` (1440px) + `home-mobile.html` (390px, **versión primaria**) + assets. Fidelidad **pixel-perfect**, responsive fluido entre 390 y 1440 con breakpoint ~980px. Este handoff define el sistema visual de TODA la web; las páginas interiores lo extienden sin inventar estética nueva.

Decisión post-handoff (usuario, 2026-08-06): **paridad completa en móvil** — todas las secciones del desktop existen en móvil adaptadas (cities strip compacta, banda CTA navy apilada); solo el top strip se omite en móvil (README). Razón: indexación mobile-first + superficie de conversión.

Decisiones de brainstorm que el handoff supersede: no hay acento ámbar; 2 familias tipográficas; estructura de home del handoff; WhatsApp outlined en el hero (deep link `wa.me` con mensaje prellenado, jamás burbuja flotante).

## 3. Sistema de diseño (primera tarea de la fase — todo lo demás se monta encima)

**Requisito explícito del cliente (2026-08-06):** todo lo que se repite vive en UN componente y todo valor de estilo en UN token — si David quiere cambiar un color (o un botón, un espaciado…), debe bastar un cambio o dos que se propaguen a toda la web. Un reviewer trata cualquier estilo repetido fuera de `components/ui/`/tokens como defecto Important (ADR-0010).

### 3.1 Tokens (Tailwind v4 `@theme` en `app/globals.css` — única definición, ADR-0010)

| Token | Valor | Uso |
|---|---|---|
| `--color-paper` | `#F7F5F0` | fondo de página |
| `--color-sand` | `#EFEBE2` | banda About / paneles |
| `--color-ink` | `#1E2124` | titulares, bordes estructurales 1px |
| `--color-body` | `#4A5158` | texto de párrafo |
| `--color-muted` | `#6B7076` | secundario, captions |
| `--color-faint` | `#9AA0A6` | fine print legal |
| `--color-hairline` | `#D9D4C8` | reglas suaves entre filas |
| `--color-leader` | `#B9B2A4` | puntos del índice, numeración |
| `--color-navy` | `#10314A` | primario/acento (del logo, oscurecido para AA) |
| `--color-azure` | `#17618F` | enlaces sobre claro |
| `--color-azure-light` / `-soft` | `#9BC4DF` / `#7FAECD` | eyebrows y detalles sobre navy |
| `--color-azure-logo` | `#2287C6` | SOLO decorativo (falla AA en texto pequeño sobre blanco) |
| `--color-scrim` | `rgba(9,26,40,…)` | gradientes sobre foto de hero |
| `--color-focus` | `#2287C6` | anillo `:focus-visible` 2px (README §Interactions) |

Radius **0 en todo**; **sin sombras** (bordes 1px = lenguaje visual); espaciado en múltiplos de 8 (gutters 72px desktop / 20px móvil); tipografía y tamaños como tokens `--text-*` según la escala del handoff (H1 72/40, H2 44/38/36/30/26, índice 25/19, body 16–17, micro 11–12 con tracking .2–.26em).

### 3.2 Tipografía

`next/font` self-hosted, subset latin, `display: swap` (ADR-0003 §6, máx. 2 familias — cumplido):
- **Spectral** 300 (+300 italic, 400): display/titulares. La cursiva como énfasis puntual dentro de titulares es intencional del diseño.
- **Instrument Sans** 400/500/600: UI, cuerpo, botones (uppercase, tracking .14em), microlabels.

### 3.3 Inventario `components/ui/` (cero estilos ad hoc en páginas — ADR-0010)

**`PageHero`** — EL componente central (requisito del cliente: el hero es EL MISMO en todas las páginas, con imagen de background): foto full-bleed + scrim de gradiente + top strip (≥980) + header transparente con logo-light + eyebrow + H1 Spectral (+ párrafo y CTAs opcionales). Variantes solo de altura/contenido vía props (home 820/680px con CTAs; interiores más corto con solo eyebrow+H1+sub), nunca de estilo. El header vive dentro del hero en todas las páginas; la variante sólida navy existe únicamente como estado sticky al scrollear (README: «if sticky → solid #10314A + dark logo swap»).

Resto del kit: `Button` (variantes: `paper` sobre navy/foto, `navy` sobre claro; uppercase, radius 0) · `TextLink` (subrayado 1px / azure) · `WhatsAppButton` (outlined claro, icono SVG propio, deep link) · `Eyebrow` (microlabel tracked) · `SectionHeading` (eyebrow + H2 Spectral + helper) · `IndexRow` (No. + nombre Spectral + leader punteado + stat; el patrón del índice de programas, reutilizable en listados) · `PhotoPlate` (marco blanco borde ink + caption italic) · `Band` (variantes `sand` / `navy`) · `CitiesStrip` · `MobileNav` (hamburguesa accesible, panel; CSS-first) · `LangToggle` (EN — ES, server-rendered) · `SiteFooter` (4 col + EHO + disclaimer + bottom row) · `EhoMark` (glifo SVG en referencia; logo oficial HUD en producción) · `JsonLd` (componente tipado propio, ADR-0003 §4).

### 3.4 Assets

- Logos: `logo.png` (oscuro, fondos claros) y `logo-light.png` (marfil+azure, sobre foto/navy) → optimizar (recorte ya hecho); servir como imagen con dimensiones explícitas.
- `david.png`: temporal en baja resolución — se usa hasta recibir la foto profesional.
- **Fotos de hero: placeholder de Unsplash en la referencia.** Para Fase 1 se usan fotos con licencia libre verificada (casa/entorno Florida) marcadas TEMPORALES; las definitivas (licenciadas o del cliente) son bloqueantes de Fase 4, no de Fase 1. Como el hero es común a todas las páginas: una foto para la home y 1–3 compartidas para las interiores (por grupo: programas, about/contacto, legales) — añadir fotos por página después es cambiar una prop. Presupuesto ADR-0003: ninguna imagen >200KB servida, hero con `priority`/`fetchpriority=high`, AVIF/WebP responsive.
- Iconos: SVG inline propios (WhatsApp, hamburguesa, EHO); sin librerías.

## 4. Páginas (estructura EN = ES; copy espejado, no traducción literal)

Todas prerenderizadas (gate `check:static`), todas con `generateMetadata` vía `buildPageMetadata` existente, y **todas abren con el mismo `PageHero` con imagen de background** (requisito del cliente) — la home con la variante alta con CTAs; las interiores con la variante corta (eyebrow + H1 + sub).

1. **Home** — el handoff, con paridad móvil completa: top strip (≥980) → header transparente sobre hero → hero (foto + scrim + eyebrow + H1 + párrafo + GET A QUOTE + WhatsApp) → cities strip → índice de programas (5 `IndexRow` → páginas de programa) → banda About sand (PhotoPlate David + «a person, not a portal» + CTA + @dherrera_loans) → banda CTA navy → footer.
2. **Loan Options** — índice extendido: mismo patrón `IndexRow` con 1–2 líneas de descripción por programa bajo el `PageHero` corto.
3. **5 páginas de programa** (template único) — H1 Spectral + stat clave, cuerpo editorial (qué es, para quién, requisitos orientativos, pasos), banda CTA navy, breadcrumb visible; JSON-LD `MortgageLoan` + `BreadcrumbList`.
4. **Get a Quote** — shell estilizado: promesa del cuestionario, qué te va a preguntar, tiempo estimado, CTA a contacto/WhatsApp mientras el cuestionario llega en Fase 2. Sin formulario.
5. **Calculator** — shell estilizado equivalente (la calculadora funcional es Fase 2): explica qué calcula y muestra un resultado de muestra estático («$300,000 · 30 años · 6.5% → $1,896/mes», verificado matemáticamente) etiquetado «Ejemplo ilustrativo, no es una oferta».
6. **About** — versión extendida de la banda About: bio, cómo trabajo, licencia NMLS + Consumer Access, Instagram.
7. **Contact** — teléfono/email/WhatsApp (placeholders marcados) como vías principales, con el patrón visual del handoff. **Sin formulario en Fase 1**: un formulario que no envía es UX deshonesta; el formulario llega en Fase 3 con el pipeline (los componentes de input del ui kit se diseñan entonces).
8. **Privacy / Accessibility** — layout documento editorial (medida 65ch); textos borrador estándar claramente marcados «pendiente de validación legal».

Copy: primer borrador completo EN + ES en `messages/{en,es}.json` (paridad testeada). Tono handoff: directo, primera persona, sin hipérbole. **Prohibido inventar métricas/testimonios**; stats de programas («3.5% down», «$0 down», «FL assistance») son datos de programa estándar que el cliente valida (YMYL) antes de publicar.

## 5. SEO (ADR-0003)

- **Metadata**: title pattern `{Página} | DherreraLoans — {claim}`, descriptions por página/idioma, canonical + hreflang ya operativos.
- **JSON-LD** (componente propio server-rendered): `Person` global (David Herrera, jobTitle, `identifier` NMLS 1459301, worksFor compañía licenciante [pendiente nombre], areaServed Miami/FL, sameAs Instagram + NMLS Consumer Access) · `FinancialService` en Home y About (`provider` → Person) · `MortgageLoan` + `BreadcrumbList` en programas. Test unit: JSON válido y campos obligatorios.
- **OG images**: estáticas 1200×630 por idioma con el sistema del handoff (navy, Spectral, logo-light), **pre-generadas por script una vez y commiteadas como assets** (ADR-0003 §2; nada en runtime): una por página × idioma con título embebido — el script las regenera cuando cambie el copy.
- Sitemap/robots: sin cambios (noindex hasta Fase 4).

## 6. Deuda técnica de Fase 0 (se salda en esta fase)

1. `middleware.ts` → `proxy.ts` (convención Next 16).
2. **LocaleSwitcher server-rendered** (elimina el único client component): enlace por idioma calculado con `getPathname`, incluyendo el slug de programa alternativo en páginas de programa (cierra la limitación documentada del switcher con params).
3. `not-found` localizado con el nuevo sistema visual.
4. `aria-label` correcto del nav (hoy usa `t('nav.home')`).
5. Re-baseline presupuesto JS: medir First Load tras eliminar el client component; actualizar el número de referencia (~147KB actual) en nota del ADR-0003 y vigilar en PRs.

## 7. Rendimiento y accesibilidad (gate contractual)

Lighthouse ≥95 ×4 en cada PR (pipeline de Fase 0, intocable). Riesgos nuevos y mitigación: 2 familias de fuente (subsets latin, solo pesos usados: Spectral 300/300i/400, Instrument 400/500/600); foto hero grande (AVIF responsive <200KB, `priority`, dimensiones explícitas, CLS 0); animaciones ≈ ninguna (README: «none required», JS casi cero). Contraste AA: pares del handoff verificados — azure #17618F solo ≥14px o con subrayado; #2287C6 nunca como texto pequeño sobre claro; texto sobre navy en paper/azure-light. `:focus-visible` 2px visible en todo lo interactivo; hit targets ≥44px móvil.

## 8. Testing (proporcional — ADR-0010)

- Unit: paridad i18n (existente, crecerá con las claves), rutas/metadata/sitemap (existentes), JSON-LD (nuevo), slug alternativo del LocaleSwitcher (nuevo).
- E2E smoke: actualizar selectores/textos; añadir: switcher traduce slugs de programa, nav móvil abre/cierra, enlaces externos (`my1003app`, Consumer Access, wa.me) con `rel="noopener"` y href correcto.
- Sin tests de contenido estático (los cubren build + Lighthouse + revisión YMYL).

## 9. Proceso de entrega

PR tornasol primero: tokens + `components/ui/` + layout (header/footer/top strip) + **home completa** → preview Vercel → el usuario aprueba el visual contra el handoff en su móvil → resto de páginas en PRs por grupos (programas+loan options · about+contact · legales+shells quote/calculator · SEO/JSON-LD/OG · deuda técnica), cada uno con el gate completo verde. Ejecución con subagentes según plan de implementación (writing-plans, documento aparte).

## 10. Pendientes del cliente (bloquean Fase 4, no Fase 1)

Foto profesional alta resolución · foto hero licenciada definitiva · nombre exacto compañía licenciante (JSON-LD `worksFor` + footer) · teléfono/email/WhatsApp reales (placeholders `+1 (305) 000-0000` / `hola@dherreraloans.com` mientras) · textos legales validados por su compañía · validación YMYL de todo el copy y stats de programas. El NMLS #1459301 del handoff se trata como real (coincide con la URL de my1003app de la propuesta).

## Fuera de alcance

Cuestionario y calculadora funcionales (Fase 2) · pipeline de leads/formularios que envían (Fase 3) · GA4, dominio, indexación, retirada de skips de lighthouserc (Fase 4).
