# Desglose completo de aimsmtg.com (referencia funcional)

**Fecha de investigación:** 2026-08-07. **Método:** fetch directo de todas las páginas + análisis del HTML/JS crudo (Gravity Forms, plugin de calculadora, widgets); snapshot de Wayback Machine y API de Elfsight donde el hosting bloqueó el acceso directo. No se envió ningún formulario.

**Propósito:** aimsmtg.com (AIMS Capital Mortgage, LLC — compañía licenciante de David) es la guía funcional de DherreraLoans. Este documento desengrana TODA la web — funcionalidades, contenido, flujos y tecnología — para que, al implementar, tengamos casi las mismas capacidades; después el cliente dirá qué quiere y qué no. Complementa a [referencia-contenido-aimsmtg.md](referencia-contenido-aimsmtg.md) (directrices de adaptación de contenido); aquí está el inventario exhaustivo.

**Alcance acordado:** Learn (Learning Center) y Blog quedan documentados pero **fuera de la implementación actual** (acuerdo con el cliente); todo lo demás es candidato a implementarse. Recordatorio permanente: el objetivo de la web es la **generación de leads**; redacción siempre propia (nunca copia literal — copyright + YMYL, todo copy es borrador hasta validación de David).

---

## Mapa completo del sitio

**Páginas principales (25):**

| URL | Qué es |
|---|---|
| `/` | Home: hero + Purchase/Refinance + cuestionario embebido + reviews + blog + 3 tarjetas CTA |
| `/quote/` | «Get A Quote» — landing desnuda con el cuestionario de 20 pasos |
| `/mortgage-prequalified/` | «Pre-Qualify» — landing educativa + el mismo cuestionario |
| `/apply-online/` | Página vestigial; el CTA real va al POS externo (Lodasoft my1003app) |
| `/mortgage-calculator/` | 8 calculadoras en pestañas (Affordability ×5 subvariantes, Purchase, Refinance, Rent vs Buy, VA ×2, DSCR, Fix & Flip) |
| `/loan-options/` | Hub del catálogo (8 purchase + 3 refinance) |
| `/loan-options/{fixed-rate-mortgage, fha-home-loan, va-home-loan, usda-loan, jumbo-home-loan, first-time-home-buyer, low-down-payment-purchase-options, investment-property-loans, refinance}/` | 9 páginas de producto con plantilla común |
| `/cash-out-refinance/` · `/va-loan-refinance-options/` | 2 productos refinance más (cuelgan de raíz, incoherencia de URLs) |
| `/about-us/` | About corporativo: quote del fundador + 8 párrafos de misión/valores |
| `/meet-our-team/` | Grid de 16 miembros (nombre, cargo, NMLS) |
| `/reviews/` | Widget Elfsight de Google Reviews (client-side) |
| `/contact-us/` | Datos de contacto + el mismo cuestionario (sin formulario simple) |
| `/learning-center/` | Grid curado de 27 guías evergreen (FUERA de alcance actual) |
| `/blog/` | Grid cronológico, 1 post/semana automatizado, 28 categorías (FUERA de alcance actual) |
| `/privacy-policy/` · `/ada-accessibility-statement/` | Legales (genéricos y débiles) |

**Fichas de staff (16):** `/david-herrera/`, `/jorge-f-acosta/`, `/carolina-teijeiro/`, `/lourdes-rosado/`, `/alejandro-lamas/`, `/marc-r-williams/`, `/fabian-silnik/`, `/gloria-gilman/`, `/vanessa-campa/`, `/esther-acosta/`, `/juan-morales/`, `/margarita-vivas/`, `/luz-ruiztagle/`, `/carlos-sarria/`, `/albania-rodriguez/`, `/ester-castaneda/` — plantilla idéntica centrada en conversión.

**Blog:** ~324 posts (2022→2026). **Tecnología global:** WordPress + tema Total + WPBakery, plataforma llave en mano de Vonk Digital; Gravity Forms + gf-mdext (cuestionario), vonk-mortgage-calculator (calculadora), Elfsight (reviews), UserWay (accesibilidad), GTranslate (pseudo-español), Yoast; sin GA/GTM (analítica first-party vonk-insights).

---

## aimsmtg.com — Elementos globales y páginas de soporte

### Header / nav

**Sin topbar.** El header es una sola barra (estilo `header-nine` del tema Total): logo a la izquierda + menú a la derecha, **transparente superpuesto al hero** (`overlay-header white-style`), **sticky** al hacer scroll (con drop-shadow y logo alternativo sticky), dropdowns estilo "minimal square" y subrayado en hover (`has-menu-underline`). El teléfono **no** aparece en el header (solo en footer).

- Logo: `AIMS-Capital-01-1.png` (alt "AIMS Capital Mortgage, LLC").
- Menú completo (con URLs):

| Item | URL |
|---|---|
| Learn | `/learning-center/` |
| Pre-Qualify | `/mortgage-prequalified/` |
| Calculator | `/mortgage-calculator/` |
| Loan Options | `/loan-options/` |
| About Us | `/about-us/` |
| — Meet Our Team | `/meet-our-team/` |
| — Reviews | `/reviews/` |
| Blog | `/blog/` |
| Contact Us | `/contact-us/` |
| **Apply Online** (botón) | `https://aimsmtg.my1003app.com/953494/register` (POS externo — solicitud 1003) |
| **Get A Quote** (botón) | `/quote/` |

Los dos últimos llevan clase `menu-button` (CTAs estilizados como botones dentro del nav). "About Us" es el único con submenú. Móvil: hamburguesa a partir del breakpoint con panel lateral deslizante (sidr).

### Footer

Fondo oscuro, 4 columnas + 2 bloques de sellos, más barra inferior:

1. **About Us** — párrafo corporativo ("AIMS Capital Mortgage, LLC is a leading residential mortgage financing company… in the state of Florida…") + **"Company NMLS: 2506467"**.
2. Sello **Equal Housing Opportunity** (imagen `EHO-dark.png`).
3. **Contact Us** — NAP: "8950 SW 74th CT / Suite 2201 PMB A4 / Miami, FL 33156", tel `(305) 440-4374` (link `tel:`), "Email Us Today" → `mailto:jacosta@aimsmtg.com` (ofuscado con entidades HTML).
4. Sello **SSL Certificate** (imagen `SSL-Seal-1.png`).
5. **Loan Options** — 9 enlaces: Fixed Rate Mortgage, FHA Home Loan, VA Home Loan, USDA Loan, Jumbo Home Loan, First Time Home Buyer, Low Down Payment Purchase Options, Investment Property Loans, Refinance (todos bajo `/loan-options/{slug}/`).
6. **Resources** — Learning Center, Contact Us, Apply Online (externo), Get A Quote, Reviews, Mortgage Calculator, **NMLS Consumer Access** (→ `http://www.nmlsconsumeraccess.org/`), ADA Accessibility Statement, Privacy Policy.

**Footer bottom** (`#footer-bottom`, centrado, texto pequeño) — disclaimer legal literal:

> "The content provided within this website is presented for information purposes only. This is not a commitment to lend or extend credit. Information and/or dates are subject to change without notice. All loans are subject to credit approval. Other restrictions may apply. Mortgage loans may be arranged through third party providers."

Debajo, logo-enlace **"Powered By Vonk Digital"** → `vonkdigital.com`. Cierra con enlace "Back To Top". Sin iconos sociales en toda la página.

### Widgets globales y tecnología

- **WordPress** (meta generator 7.0.3) + tema **Total** (WPExplorer) con child theme (`total-child-theme-master`) + constructor **WPBakery** (`js_composer`). Es una web llave en mano de **Vonk Digital** (proveedor SaaS de webs para mortgage brokers).
- **Gravity Forms** + plugin custom **`gf-mdext`**: extensión que auto-avanza el formulario multi-página al hacer clic en un radio/select (`trigger-next-zzd` → dispara el botón Next automáticamente). Es el motor del cuestionario "Tell Us Your Story" de la home (form 21, ramas Purchase/Refinance, incluye una lista gigante de ZIP codes embebida en el HTML — por eso la página pesa ~900 KB).
- **`vonk-mortgage-calculator`** (calculadora), **`vonk-insights`** (analítica first-party propia: endpoint `/wp-json/vonk/v1/collect`; **no hay** GA/GTM/Facebook Pixel), "Vonk Staff Limit".
- **UserWay** (widget de accesibilidad, `cdn.userway.org/widget.js`, account `XwGsZCSFoU`) — flotante global.
- **GTranslate** (ver Idiomas).
- Sin chat en vivo, sin pop-ups, sin exit-intent, sin sticky CTA más allá del header fijo.

### Idiomas

**No hay versión en español real.** Usan el plugin **GTranslate** con esta config: `default_language: "en"`, `languages: ["en","es"]`, `url_structure: "none"`, widget flotante abajo-derecha con nombres nativos. Es traducción automática vía JavaScript sobre la misma URL: **no existen** URLs `/es/`, ni `hreflang`, ni WPML/Polylang. El español es invisible para buscadores (cero SEO en ES).

### Learning Center

`/learning-center/` es una **página estática curada** (WPBakery), no un archivo de blog:

- Intro: "Learn everything you need to know about buying a home."
- **Grid de 27 guías evergreen**; cada card = imagen + título H2 enlazado. Sin subcategorías, sin buscador, sin paginación.
- Las guías son posts de la categoría **"Learn"** (`/category/learn/`) publicados con URL en raíz (`/first-time-homebuyers-checklist/`, `/how-to-get-preapproved-for-a-mortgage/`, etc.).
- Temática 100 % compra de vivienda: proceso paso a paso, checklist first-time buyer, preapproval, cash to close, estrategias de ahorro y down payment, buy vs rent, ingresos necesarios, cosigning, tipos de préstamo populares, no money down, realtor sí/no, appraisal/inspection checklists, FHA MIP, elección de barrio, buydown de tipo, tiempos de compra, buyer's vs seller's market, preparar la casa para vender, negociación.
- Cierre con CTA "Request A Free Consultation" → botón "Get Started" → `/quote/`.

### Blog

`/blog/` también es una página con módulo de grid de posts (cards `wpex-card` del tema):

- **Card**: imagen destacada (415×276) → etiqueta de categoría coloreada → título H2 → excerpt corto → pie con avatar Gravatar + autor + fecha.
- **12 cards iniciales + botón "Load More"** (AJAX `vcex-loadmore`, textos "Loading…" / "Failed to load posts."; sin infinite scroll ni números de página).
- Autor único: **Jorge Acosta**.
- **Frecuencia: exactamente 1 post/semana** (fechas visibles: Aug 5, Jul 29, Jul 22, Jul 15, Jul 8, Jul 1, Jun 24, Jun 17, Jun 9, Jun 3, May 26, May 19 de 2026) con títulos estacionales tipo SEO ("Labor Day and Your Loan…", "4th of July Financial Freedom…") — patrón de contenido sindicado/automatizado por la plataforma Vonk.
- La página incluye además un bloque de **newsletter**: "Stay Informed with changes and news about the mortgage market join our email list" + Gravity Form (First Name, Last Name, Email, captcha aritmético "8+3", honeypot) + "We will never spam you or sell your information."
- **28 categorías** (de `category-sitemap.xml`): buying-a-home, closing, community, credit, escrow, fha-loan, first-time-home-buyer, heloc, home-improvement, home-maintenance, home-owner-tips, home-trends, insurance, investment-properties, learn, mortgage-calculator, mortgage-news, mortgage-refinance, mortgage-tips, pmi, real-estate-tips, refinance, renovations, rent-vs-buy, second-homes, tax-benefits, usda-loan, va-loans.

### Legales

**Privacy Policy** (`/privacy-policy/`) — genérica y muy breve (~2.000 caracteres). Secciones H3: Collection of Personal Information · Use of Personal Information · Sharing of Personal Information · Security of Personal Information · Cookies and Other Tracking Technologies · Changes to this Privacy Policy · Contact Us. Consentimiento implícito por uso ("By using our website or services, you consent…"). **No menciona TCPA, SMS/text messaging, opt-out, CCPA ni GLBA** — llamativo para una web YMYL con formularios de lead que piden teléfono.

**ADA Accessibility Statement** (`/ada-accessibility-statement/`) — 3 párrafos: compromiso genérico de accesibilidad, contacto para reportar problemas (curiosamente `info@vonkdigital.com`, el email del **vendor**, no del cliente) y promesa de ofrecer versión en texto si una página no puede hacerse accesible. No cita WCAG ni nivel de conformidad. La herramienta real es el widget **UserWay** global.

### SEO técnico

- **Title** home: `Home - AIMS Capital Mortgage, LLC` (patrón `%título% - %sitename%`).
- **Meta description** home: "Mortgage rates are at all time lows. Let us check your situation and see if a mortgage refinance could save you money." (genérica/desactualizada).
- Robots: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`. Canonical correcto. Plugin: **Yoast SEO** (sitemaps incluidos).
- **JSON-LD** (grafo Yoast): `WebPage` + `BreadcrumbList` + `WebSite` (con `SearchAction`; description **"Just Another Vonk Digital Website"** — tagline por defecto sin personalizar) + `Organization` (nombre, logo). **No** usa `LocalBusiness`/`FinancialService`, sin `address`/`telephone`/`aggregateRating` en schema.
- **OG**: solo `og:locale/type/title/url/site_name`; **sin `og:image`, sin `og:description`, sin Twitter Cards**.
- Favicon: logo recortado en PNG 32×32 / 192×192 + apple-touch-icon 180×180.
- Sin `hreflang`. HTML de ~900 KB (CSS inline del builder + lista de ZIP codes embebida): rendimiento estructuralmente pobre.

### Notas para replicación

1. **Arquitectura nav**: 7 items + 2 CTAs-botón diferenciados ("Apply Online" a POS externo + "Get A Quote" interno). El único submenú es About Us (Team, Reviews). Patrón directamente trasladable.
2. **Footer de compliance**: 4 columnas (About+NMLS · Contact NAP · Loan Options · Resources+legales) + sellos EHO/SSL + disclaimer en barra inferior + enlace a NMLS Consumer Access. Es el patrón estándar del sector; el disclaimer literal de arriba sirve de referencia para redactar uno propio (no copiar literal).
3. **Cuestionario (relevante para Fase 2)**: su lead form es un Gravity Forms multi-paso con **auto-avance al seleccionar una opción** (clic en radio dispara Next) y ramas Purchase/Refinance — mismo UX que el motor de cuestionario en curso en DHerreraLoans.
4. **Español**: aimsmtg no tiene ES real (GTranslate JS, cero SEO). La estrategia next-intl con `/es/` prerenderizado de DHerreraLoans es objetivamente superior y una ventaja competitiva medible.
5. **Accesibilidad**: delegada al widget UserWay con statement mínimo. Accesibilidad nativa WCAG sin widget es mejor enfoque (y el statement propio no debería apuntar a un email de terceros).
6. **Learning Center vs Blog**: mismo pool de posts; el Learning Center es un grid curado de ~27 evergreen de la categoría "learn" con URLs en raíz, y el blog un grid cronológico con Load More, 28 categorías y cadencia semanal automatizada.
7. **Huecos SEO explotables**: sin `LocalBusiness`/`FinancialService` schema, sin `og:image`/Twitter Cards, meta description genérica, tagline por defecto del vendor en el `WebSite` schema, HTML de 900 KB. Todos superables con el stack actual del proyecto.

---

## Informe: flujos de captación de leads en aimsmtg.com

**Fecha de captura:** 2026-08-07 · **Método:** HTML crudo vía `curl` + análisis de los scripts de configuración de Gravity Forms embebidos en las páginas. No se envió ningún formulario (para no generar leads falsos), por lo que el mensaje de confirmación post-envío no es verificable desde fuera; todo lo demás está extraído literalmente del HTML/JS servido.

**Hallazgo estructural clave:** el sitio solo tiene DOS mecanismos reales de captación:

1. **Un único cuestionario multi-paso (Gravity Forms, ID 21, 20 páginas)** que se embebe idéntico en la home, en `/quote/` y en `/mortgage-prequalified/`. No son tres formularios: es el mismo, con distinto copy alrededor.
2. **Un POS externo (portal de solicitud 1003)**: `https://aimsmtg.my1003app.com/953494/register`, producto de **Lodasoft**. Todos los CTAs "Apply Online" del sitio (menú principal, hero de la home, tarjeta "Ready To Apply") apuntan ahí con `target="_blank"`. La página interna `/apply-online/` es vestigial (ver flujo 3).

**Stack detectado:** WordPress + tema Total (wpex) + WPBakery (`js_composer`), plantilla de la agencia **Vonk Digital**. Formulario: **Gravity Forms 3.0.2** en markup *legacy*, con plugins auxiliares: **gf-mdext** (plugin de Vonk/MDExt que aporta los range sliders con noUiSlider + wNumb, el auto-avance y la validación de zip), **Image Choices** (opciones radio con imagen) y un tracker propio **vonk-insights**. También cargan `vonk-mortgage-calculator` (calculadora con Chart.js) y "Vonk Staff Limit".

---

### El motor compartido: Gravity Form #21 ("online-mortgage-form"), 20 pasos

#### Mecánica general

- `<form method='post' enctype='multipart/form-data' target='gform_ajax_frame_21' id='gform_21' class='online-mortgage-form with-border-background' action='/quote/' data-formid='21' novalidate>` — el `action` es la URL de la propia página donde está embebido (`/`, `/quote/` o `/mortgage-prequalified/`). Envío **AJAX vía iframe oculto** (`gform_ajax_frame_21`, `gform_submission_method=iframe`): no hay endpoint externo; el POST va al mismo WordPress y la confirmación se pinta en el iframe/contenedor.
- Las 20 páginas del formulario vienen **todas renderizadas en el HTML inicial** (`gform_page_21_1` … `gform_page_21_20`), ocultas con `display:none` salvo la primera. La navegación es JS puro de Gravity Forms.
- **Barra de progreso:** tipo *percentage*, estilo *blue*. Markup: `<h3 class="gf_progressbar_title">Step <span>1</span> of <span>20</span></h3>` + barra `percentbar_blue` que arranca en `width:5%` con el texto `5%` dentro. (5% por paso, 20 pasos.)
- **Auto-avance:** todas las páginas cuya pregunta es un radio llevan las clases `trigger-next-zzd hide-next-button` (plugin gf-mdext): al hacer clic en una opción se avanza automáticamente y el botón "Next" está oculto. Las páginas con slider o inputs de texto sí muestran "Next".
- **Botones:** "Next" / "Back" (secundario) en cada página; "Submit" en la última. Literalmente `Next`, `Back`, `Submit`.
- **Campos ocultos del POST:** `gform_ajax`, `gform_submission_method=iframe`, `gform_theme=legacy`, `gform_style_settings=[]`, `is_submit_21=1`, `gform_submit=21`, `gform_currency` (USD, token cifrado), `gform_unique_id`, `state_21` (estado firmado en base64), `gform_target_page_number_21`, `gform_source_page_number_21`, `gform_field_values`. Honeypot estándar de GF presente.
- **Sin checkbox de consentimiento/TCPA en el formulario.** El único disclaimer del sitio es el del footer.

#### Los 20 pasos, en orden y literal

Los radios se marcan (R) = auto-avance sin botón Next. Los sliders son noUiSlider con formato wNumb.

| # | Pregunta / contenido literal (EN) | Control | Opciones / rango literal | Visibilidad |
|---|---|---|---|---|
| 1 | HTML intro: **"What are your goals?<br>We are committed to helping you reach them."** + pregunta (label oculto "Purchase or Refinance") | Radio con imágenes (R) — plugin Image Choices, imágenes `Purchase-300x300.png` / `Refinance-300x300.png` | `I want to purchase` · `I want to refinance` | Siempre (campo 9, el pivote de todo el flujo) |
| 2 | HTML: **"Where is the home located?"** + `<small>City or Zip Code</small>` | Texto requerido, placeholder `City or Zip Code`, clase `gf-mdext-zip-code` | — | Siempre (campo 89) |
| 3 | **"What type of home is it?"** | Radio (R) | `Single Family` · `Townhouse` · `Condominium` · `Multi-Family` | Siempre (campo 15) |
| 4 | **"Where are you in the home buying process?"** | Radio (R) | `Signed a purchase contract` · `Found a home` · `Looking to buy within one month` · `Looking to buy in 1 to 3 months` · `Looking to buy in more than 3 months` | **Solo purchase** (campo 23) |
| 5 | **"How do you plan to use your new home?"** | Radio (R) | `Primary Residence` · `Vacation Property` · `Investment Property` | **Solo purchase** (campo 26) |
| 6 | **"Have you or your spouse served in the US military?"** | Radio (R) | `Yes` · `No` | Siempre (campo 33) |
| 7 | **"What is your (or your spouse's) branch of military service?"** | Radio (R) | `Army` · `Marine Corps` · `Navy` · `Air Force` · `Coast Guard` · `National Guard` · `Military Spouse` · `Other VA Eligibility` · `No Military Experience` | **Solo si paso 6 = Yes** (campo 32) |
| 8 | **"Are you actively working with a real estate agent?"** | Radio (R) | `Yes` · `No` | **Solo purchase** (campo 34) |
| 9 | **"Is this your first time purchasing a home?"** | Radio (R) | `Yes` · `No` | **Solo purchase** (campo 37) |
| 10 | **"What is the approximate purchase price of the new property?"** — desc: *"(it's OK to estimate)"* / **"What is the estimated value of your property?"** — desc: *"Use the slider to select the price range of homes you're interested in (it's OK to estimate)"* | 2 range sliders (página siempre visible; cada slider condicionado) | Ambos: min `$50,000`, max `$2,000,000`, step `$10,000`, formato `$` con separador de miles; valor inicial $50,000 | Campo 81 (precio) **solo purchase**; campo 82 (valor) **solo refinance** |
| 11 | **"How much do you have for a down payment?"** — desc: *"(it's OK to estimate)"* / **"What is the balance of your first mortgage?"** — desc: *"(It's OK to estimate)"* | 2 range sliders | Campo 83 (down payment): **porcentaje**, min 0 – max 100, step 1 (clase `percentage_down_payment`). Campo 84 (balance): min `$50,000` – max `$2,000,000`, step `$10,000` | 83 **solo purchase**; 84 **solo refinance** |
| 12 | **"What is the interest rate of your first mortgage?"** — desc: *"(It's OK to estimate)"* | Range slider | min 0% – max 20%, step 0.125, 3 decimales, sufijo `%` (inicial 1%) | **Solo refinance** (campo 85) |
| 13 | **"Do you have a second mortgage?"** | Radio (R) | `Yes` · `No` (sin pregunta de seguimiento condicionada) | **Solo refinance** (campo 64) |
| 14 | **"How much additional cash do you wish to borrow?"** — desc: *"(It's OK to estimate or if no cash-out leave at $0)"* | Range slider | min `$0` – max `$2,000,000`, step `$5,000` | **Solo refinance** (campo 86) |
| 15 | **"What is your current employment status?"** | Radio (R) | `Employed` · `Self-Employed/1099 Independent Contractor` · `Retired` | Siempre (campo 44) |
| 16 | **"What is your household gross (before taxes) annual income?"** | Radio (R) | `Less than $30,000` · `$30,000 - $50,000` · `$50,000 - $75,000` · `$75,000 - $100,000` · `Greater than $100,000` | Siempre (campo 46) |
| 17 | **"What is your credit score?"** | Radio (R) | `Excellent 740+` · `Good 700-739` · `Average 660-699` · `Fair 600-659` · `Poor < 600` | Siempre (campo 48) |
| 18 | **"Have you had a bankruptcy or foreclosure in the past 3 years?"** | Radio (R) | `Yes` · `No` | Siempre (campo 50) |
| 19 | **"What is your first name?"** \* / **"What is your last name?"** \* | 2 textos requeridos | — | Siempre (campos 90/91) |
| 20 | **"What is your email address?"** \* / **"What is your phone number?"** \* | Email requerido + teléfono requerido con máscara `(999) 999-9999` | — | Siempre (campos 54/92) + botón **Submit** |

#### Lógica condicional (extraída de `gf_form_conditional_logic[21]` y `GFPageConditionalLogic`)

- **Páginas condicionadas** (regla `show` sobre el campo 9): pasos 4, 5, 8 y 9 solo si `I want to purchase`; pasos 12, 13 y 14 solo si `I want to refinance`; paso 7 solo si campo 33 (militar) = `Yes`. El resto, siempre.
- **Campos condicionados dentro de páginas compartidas** (pasos 10 y 11): 81 y 83 purchase; 82, 84 (y 85, 86 en sus páginas) refinance.
- **Recorrido efectivo:** ambas ramas responden **16 pantallas (17 si hay servicio militar)** de las 20 renderizadas. Purchase: 1→2→3→4→5→6→(7)→8→9→10→11→15…20. Refinance: 1→2→3→6→(7)→10→11→12→13→14→15…20.
- Nota curiosa: el sí/no militar se pregunta también en la rama refinance (tiene sentido: elegibilidad VA/IRRRL).

#### Datos que captura un lead completo

Objetivo (purchase/refi) · ciudad o ZIP · tipo de vivienda · fase de compra\* · uso de la vivienda\* · militar (+ rama) · agente inmobiliario\* · primera vivienda\* · precio/valor · down payment %/saldo hipoteca · tipo de interés† · segunda hipoteca† · cash-out† · situación laboral · ingresos anuales (tramo) · score crediticio (tramo) · bancarrota/foreclosure 3 años · nombre y apellido · email · teléfono. (\* = solo purchase, † = solo refinance.) **Nunca pide SSN, fecha de nacimiento ni dirección exacta** — es soft-lead 100%, sin datos sensibles.

---

### Flujo 1 — `/quote/` ("Get A Quote")

- **Title:** `Request A Quote - AIMS Capital Mortgage, LLC`. En el menú aparece como **"Get A Quote"**.
- Página minimalista: sin H1 visible ni hero con texto. El contenido antes del formulario es solo:
  > "Fill out the questionnaire on this page to start a discussion about your mortgage needs today!"
  >
  > "We pride ourselves on excellent communication and easy accessibility when you need us. Our experienced staff is here to guide you every step of the way."

  más una checklist de tres bullets: **"Speak to a Local Mortgage Professional" · "Free Consultation" · "Competitive Rates & Fees"**.
- Debajo, el Gravity Form 21 completo (con borde, clase `with-border-background`). **No hay nada después del formulario**: es la landing más corta y enfocada del sitio — copy mínimo + cuestionario.
- Es el destino de la mayoría de CTAs internos: botón "Get A Quote" del header/hero, tarjetas "Purchase" y "Refinance" de la home, tarjeta "Request A Quote — See my loan scenarios.".

### Flujo 2 — `/mortgage-prequalified/` ("Pre-Qualify")

- **Title:** `Mortgage Prequalification - AIMS Capital Mortgage, LLC`. En el menú: **"Pre-Qualify"**.
- Misma mecánica (Gravity Form 21 idéntico), pero con una landing educativa encima. Copy literal:
  - Hero: **"Become more attractive to sellers as a pre-qualified buyer."** — "Some realtors require buyers to get pre-qualified before even starting to house hunt." + botones **"Get Your Quote"** (`#quote`, ancla que baja al formulario) y **"Learn More"** (`#learn`).
  - **"Before you start looking for your first home, we can help you with a mortgage prequalification."** — "AIMS Capital Mortgage can help you get pre-qualified and on your way to home ownership! Simply fill out our mortgage prequalification form securely on our website. With a prequalification letter in hand, you know that you may get approved for a mortgage before you even look at your first potential new home." + párrafo sobre realtors y la carta de precualificación.
  - **"Determine how your credit looks."** — párrafo sobre payment history/income/debts y score, con enlaces externos a `www.freecreditreport.com` y `www.creditkarma.com`, y consejo literal: "If you have a credit score below 640, consider delving deeper into your report…".
  - **"Get started today!"** — "Fill out the questionnaire on this page to start a discussion about your mortgage needs today!" → formulario 21.
- Diferencia con /quote/: **solo el envoltorio editorial** (SEO/educación + anclas). El formulario, los pasos y el POST son bit a bit los mismos.

### Flujo 3 — `/apply-online/` y el portal externo (POS Lodasoft)

- **Title:** `Pre-Qualification Form - AIMS Capital Mortgage, LLC`; meta description: "Your data is secure and protected by 2048 bit Industry Standard SSL Certificate". Modificada por última vez el 2023-01-31 (Yoast schema).
- **La página está vacía de funcionalidad**: su contenido es solo un H2 centrado **"Pre-Qualification Form"**, el párrafo "Your data is secure and protected by 2048 bit Industry Standard SSL Certificate" y una fila de maquetación vacía. Ni formulario, ni iframe, ni enlace en el cuerpo. Es una **página vestigial** (probablemente alojó un formulario/iframe de solicitud que fue retirado al migrar al POS).
- El "Apply Online" real vive en los CTAs: menú principal, botón del hero de la home y tarjeta **"Ready To Apply — Begin my online application."** apuntan todos a **`https://aimsmtg.my1003app.com/953494/register`** (`target="_blank"`).
- Ese portal es **my1003app.com, el POS de borrower de Lodasoft** (plataforma de mortgage digital; su portal de solicitud para clientes usa subdominios `<empresa>.my1003app.com`). Lo verificado del portal en sí:
  - Es una **SPA Angular** con `noindex, nofollow`; title `Easy and secure online loan application`; meta: "With our online my1003 app, you can quickly and securely complete your loan application, check status of your loan and complete your tasks".
  - La ruta `/953494/register` (953494 = id de la compañía/LO) es el **registro de cuenta del prestatario** previo a la solicitud 1003 guiada; al ser client-rendered, los campos concretos no son extraíbles por HTML estático (verificado: el shell solo renderiza el titular).
- Conclusión: `/apply-online/` **no es un flujo de captación propio** — la solicitud formal está externalizada al POS, que exige crear cuenta (fricción alta, lead "duro").

### Flujo 4 — Cuestionario embebido en la home ("Tell Us Your Story")

- La home (`Home - AIMS Capital Mortgage, LLC`) estructura su embudo así, en orden:
  1. **Hero:** "Fast, Reliable, Affordable Mortgage Solutions" + botones **"Apply Online"** (→ POS Lodasoft) y **"Get A Quote"** (→ `/quote/`).
  2. **Tarjetas Purchase/Refinance:** "What is Your Why?" con lista "Create Memories · Build Equity · Raise a Family · Stabilize Your Housing Costs · Be Proud of Where You Live" → botón **"Purchase"** (→ `/quote/`); y "Refinance and Save." — "Mortgage rates are at all time lows. Let us check your situation and see if a mortgage refinance could save you money." → botón **"Refinance"** (→ `/quote/`).
  3. **Sección "Tell Us Your Story."** — copy literal:
     > "Whether you are a first time homebuyer or an experienced real estate investor, having a mortgage team you can count on is crucial."
     >
     > "We pride ourselves on excellent communication and easy accessibility when you need us. Our experienced staff is here to guide you every step of the way."
     >
     > "Fill out the questionnaire on this page to start a discussion about your mortgage needs today!"

     …seguido del **mismo Gravity Form 21 de 20 pasos**, embebido tal cual en mitad de la home (action `/`).
  4. Después: Google Reviews ("Our Reputation."), blog ("Fresh from The Blog."), y el trío de tarjetas final: **"Request A Quote — See my loan scenarios."** (→ `/quote/`), **"Ready To Apply — Begin my online application."** (→ POS) y **"Mortgage Calculator — Look at some comparisons"** (→ `/mortgage-calculator/`).
- Es decir: la home ofrece el **camino blando** (cuestionario in-page) y el **camino duro** (POS) uno al lado del otro, y además empuja tráfico a `/quote/` desde tres sitios distintos.

---

### Comparativa y notas para replicación

| | Home | /quote/ | /mortgage-prequalified/ | /apply-online/ + POS |
|---|---|---|---|---|
| Mecanismo | GF 21 embebido a mitad de página | GF 21, landing desnuda | GF 21 + landing educativa | Página vacía; el CTA real va a `aimsmtg.my1003app.com/953494/register` (Lodasoft) |
| Pasos | 20 renderizados / 16–17 efectivos | idem | idem | 1003 completa guiada (SPA, requiere cuenta) |
| Datos sensibles | No (soft lead) | No | No | Sí (solicitud formal) |
| Copy diferencial | "Tell Us Your Story." | checklist de 3 beneficios | pre-cualificación + crédito + anclas `#quote`/`#learn` | "Your data is secure… SSL" |

**Notas clave para replicar en DherreraLoans:**

1. **Un solo motor, tres envoltorios.** No construir tres formularios: un componente de cuestionario reutilizable y tres páginas con copy distinto (exactamente la dirección de la Fase 2 actual). El "form" de prequal y el de quote de AIMS son literalmente el mismo recurso.
2. **Patrón de UX del cuestionario:** una pregunta por pantalla; radios con auto-avance y sin botón Next (Next visible solo en pasos de texto/slider); "Back" siempre disponible; barra de progreso porcentual + "Step X of 20"; pregunta pivote (purchase/refi) como primer paso con dos tarjetas ilustradas; los datos de contacto **al final** (nombre en el paso 19, email+teléfono en el 20 con el Submit) — la inversión del usuario ya hecha maximiza la conversión del último paso.
3. **Poda por rama:** purchase pregunta fase/uso/agente/primera-vivienda + precio/down payment; refinance pregunta valor/saldo/tipo/2ª hipoteca/cash-out; militar se pregunta en ambas. Con la poda, ambas ramas quedan en 16–17 pantallas.
4. **Sliders con rangos generosos y "(it's OK to estimate)"** en cada pregunta numérica — baja la fricción de las preguntas de dinero. Down payment se pide en **porcentaje** (0–100), no en dólares.
5. **Cumplimiento:** AIMS no muestra consentimiento TCPA ni checkbox alguno en el formulario; solo el disclaimer global del footer + Equal Housing Opportunity + NMLS (2506467) + Privacy Policy + ADA statement. *Para DherreraLoans conviene ir más allá (consentimiento explícito) — que la referencia no lo tenga no significa que sea buena práctica YMYL en 2026.*
6. **Envío:** POST AJAX al propio WordPress (iframe oculto); sin endpoint de terceros ni CRM visible en cliente. La confirmación no es observable sin enviar; no existe página `/thank-you` enlazada.
7. **Solicitud formal externalizada:** el "Apply Online" debe ser un enlace saliente al POS del broker (en AIMS: Lodasoft my1003app; en DherreraLoans será el que use la licenciante), nunca un formulario propio con datos sensibles.

---

## Documentación exhaustiva — Página de calculadoras de aimsmtg.com (`/mortgage-calculator/`)

### Calculadora — resumen

- **URL**: `https://aimsmtg.com/mortgage-calculator/` · `<title>`: "Mortgage Calculator - AIMS Capital Mortgage, LLC". La meta description reutiliza el texto del disclaimer legal de la calculadora.
- La página **no tiene hero propio**: tras el header del sitio entra directamente el widget de calculadora, que lleva su propio encabezado interno `<h2>Calculator</h2>` (bloque `.top-hea-block .title`).
- Es **una única página con 8 pestañas** (tabs por anclas `#`), cada una una calculadora completa con layout de dos columnas: panel izquierdo oscuro (`#282828`) con el formulario de inputs y panel derecho claro con resultados (gráfico donut Chart.js, desgloses, sliders interactivos y resumen textual).
- Pestañas exactas (texto del tab → `data-name` interno → ancla):
  1. "Affordability Calculator" → `#affordability` (con 5 sub-pestañas: Conventional, FHA, VA, USDA, Jumbo)
  2. "Purchase" → "Purchase Calculator" → `#purchase-item`
  3. "Refinance" → "Refinance Calculator" → `#refinance-item`
  4. "Rent vs Buy" → "Rent vs Buy Calculator" → `#rent-buy-item`
  5. "VA Purchase" → "VA Purchase Calculator" → `#veteran-affairs`
  6. "VA Refinance" → "VA Refinance Calculator" → `#va-refinance`
  7. "Debt-Service (DSCR)" → `#rental-loan`
  8. "Fix & Flip" → "Fix & Flip Calculator" → `#fix-and-flip`
- Cada calculadora tiene un único CTA activo: botón **"GET A QUOTE"** que enlaza a `/quote/`. (Existe un botón "Email Me This" con clase `afd-trigger-email-form` en el markup, pero está **comentado en HTML** en las 12 apariciones — funcionalidad del plugin desactivada en este sitio.)
- Todo se recalcula en cliente (jQuery); no hay iframe ni servicio externo embebido.

### Proveedor / tecnología

- **Proveedor: VonkDigital** (agencia especializada en webs para brokers hipotecarios). La calculadora es un **plugin WordPress propio**: `vonk-mortgage-calculator` (script principal `public/js/mortgage-calculator-public.js?ver=1.4.8`). Un icono del markup incluso referencia `demotest.vonkdigital.com`, y el footer lleva "Powered by VonkDigital". Otros plugins Vonk instalados: `vonk-insights` (tracking/analytics de formularios) y "Vonk Staff Limit".
- **Stack del widget**: jQuery 3.7.1 + jQuery UI 1.13.3 (`slider`, `datepicker`, `draggable`, `touch-punch` para sliders táctiles), **Chart.js** (`Chart.min.js` + extensión `Chart.roundedBarCharts.min.js`) para los donuts/barras, `counto`/`jquery.counterup` (números animados), `waypoints`, `mCustomScrollbar`. No hay REST/ajax para calcular (el `ajaxurl` localizado solo serviría para el email desactivado): **todas las fórmulas viven en el JS del plugin**.
- **Tema/builder**: tema "Total" + WPBakery (`js_composer` 8.7.3). Extras del sitio: GTranslate (traducción), UserWay (`cdn.userway.org/widget.js`, accesibilidad).
- **Config inyectada** (`var frontend = {...}` vía `wp_localize_script`), útil porque expone defaults y colores del gráfico:
  - Colores de series: Principal & Interest `#FA9D39`, HOA Dues `#41A2ED`, Taxes `#59C2C0`, PMI `#eeee22`, Insurance `#F85A85`, Extra Payment `#8224e3`.
  - Defaults purchase: `home_val 200000`, `down_payment 0`, `mortgage_amount 200000`, `interest_rate 5`, `loan_terms 30`, `PMI 0`, `property_tax 0.6` (%), `home_insurance 1200`, `HOA 0`, `extra_payment 0`.
  - **Tabla VA funding fee**: primer uso → 2.15% (<5% entrada), 1.5% (≥5%), 1.25% (≥10%); uso posterior → 3.3% / 1.5% / 1.25%; refinance cash-out → 2.15% primer uso, 3.3% posterior; **IRRRL → 0.5%**.

### Variantes

#### 1. Affordability Calculator (`#affordability`)

Propósito: cuánta casa puedes permitirte según ingresos/deudas, con el ratio DTI como resultado central. Sub-pestañas: **Conventional · FHA · VA · USDA · Jumbo** (ids `#affordability-conventional` … `#affordability-jumbo`), cada una un formulario independiente con campos propios prefijados (`affordability…`, `affordabilityFHA…`, etc.).

**Inputs comunes a las 5 subvariantes** (label exacto · tipo · default):
| Campo | Tipo | Default |
|---|---|---|
| Gross Income (Monthly) | text (currency) | 5000 |
| Monthly Debts (con tooltip) | text (currency) | 1500 |
| Home Price ("Home Value" en VA) | text (currency) | 200000 |
| Down Payment | text + toggle radio **$ / %** | 0 (FHA: **3.5**, en %) |
| Loan Amount ("Base Mortgage Amount" en VA) | text, autocalculado | 200000 |
| Loan Term ("Loan Terms" en VA) | number + toggle **Year / Month** | 30 |
| Interest Rate | number, `min 0.125`, `step 0.125` | 5 |
| Prop Tax ( Yearly ) / "Property Tax (Yearly)" | text + toggle **$ / %** | 0.6 (%) |
| Homeowners Insurance ( Yearly ) | text + toggle **$ / %** | 1200 ($) |
| HOA Dues ( Monthly ) | text | 0 |

Tooltip de Monthly Debts (literal): *"Monthly Debt includes the payments you make each month on auto loans, and credit cards (minimum payment) and student loans. Exclude Rent and Utilities."*

**Campos específicos por subvariante:**
- **Conventional / Jumbo**: "Credit Score" — select cuyo value es el factor PMI anual: 620-639→1.50, 640-659→1.31, 660-679→1.23, 680-699→0.98, 700-719→0.79, 720-739→0.70, 740-759→0.58, "760 and above"→0.46. Además "PMI ( Yearly )" (default 0, lo rellena el JS con el factor).
- **FHA**: "Upfront MIP (%)", "Annual MIP (%)", "Annual FHA Duration" (los tres vacíos en HTML; los inicializa el JS del plugin).
- **VA**: "This is my..." — select: "First Time Use of a VA Loan" (default) / "I have used a VA loan before" / "I am exempt from the VA funding fee"; "VA Funding Fee" (number, default 2.15, se recalcula con la tabla de tiers según entrada); "Final Mortgage Amount" (readonly calculado); "First Payment Date" (datepicker, default fecha actual); inputs hidden con los 6 tiers de funding fee.
- **USDA**: sin campos extra visibles (guarantee fee la aplica el JS).

**Outputs (panel derecho, por subvariante):**
- Donut **"Payment Breakdown" — "$0 / per month"** con leyenda: Principal & Interest, Taxes, Insurance, HOA Dues + PMI (Conventional/Jumbo) / MIP (FHA) / USDA MIP (USDA) / nada extra (VA). Canvas ids: `affordabilityChart`, `affordabilityFHAChart`, `affordabilityVAChart`, `affordabilityUSDAChart`, `affordabilityJumboChart`.
- Lista **"Loan Details"**: Conventional/Jumbo → Home Value, Mortgage Amount, Monthly Conventional Payment, Down Payment, Monthly Estimated PMI. FHA → Home Value, Base Loan Amount, Monthly FHA Payment, Down Payment, FHA Loan Amount, Upfront MIP. VA → Home Value, Base Loan Amount, Monthly VA Payment, Down Payment, VA Loan Amount, VA Funding Fee. USDA → Home Value, Base Loan Amount, Monthly USDA Payment, Down Payment, USDA Loan Amount, USDA Guarantee Fee.
- Bloque DTI: **"Your Debt to Income Ratio" X/Y** vs **"Allowable Debt to Income Ratio"**: Conventional **50%/50%**, FHA **50%/50%**, VA **65%/65%**, USDA **29%/41%**, Jumbo **50%/50%**.
- Dos **sliders jQuery UI** interactivos que reescriben el formulario: "Purchase Price" (`$200000`) y "Down Payment" (`$0`).
- **"Summary:"** (plantilla literal): *"Based on what you input into today your Total Payment would be **$2850** on a **Conventional Loan** with a Down Payment of **15%**. Your Debt-to-Income Ratio is **32%/45%** and the maximum allowable on this program type is **50%/50%**. Please confirm all these numbers for accuracy with your loan officer. The Monthly Debts Calculation is often where we see errors."* (cambia tipo de préstamo y ratios por subvariante).

#### 2. Purchase (`#purchase-item`)

Propósito: pago mensual de compra estándar + estrategia de amortización anticipada.

**Inputs**: Home Value (200000) · Down Payment ($/%, 0) · Mortgage Amount (200000) · Loan Terms (Year/Month, 30) · Interest Rate (5, step 0.125) · PMI (Yearly) ($/%, 0) · Property Tax (Yearly) ($/%, 0.6%) · Homeowners Insurance (Yearly) ($/%, 1200) · HOA Dues Per Month (0) · First Payment Date (datepicker, hoy) · Extra Payment Per Month (0).

**Outputs**:
- Cabecera con 3 totales: **"All Payment" · "Total Loan Amount" · "Total Interest Paid"**.
- Donut "Payment Breakdown" (canvas `myChart`) — *"A breakdown of your total payment so you can see where money is allocated."* — con "$1,915 / per month" placeholder y leyenda: Principal & Interest, Taxes, Insurance, HOA Dues, PMI, Extra Payment.
- Toggle de dos pestañas **"Monthly Payment" / "Total Payment"**:
  - Monthly: Home Value, Mortgage Amount, Monthly Principal & Interest, Monthly Extra Payment, Monthly Property Tax, Monthly Home Insurance, Monthly PMI, Monthly HOA Fees, Total # Of Payments.
  - Total: Down Payment, Principal, Total Extra Payment, Total Interest Paid, Total Tax, Insurance, PMI and Fees, Total of all Payments.
- **"Early Payoff Strategy"** — *"Add an extra payment and see how many months you can eliminate on the back end of the loan."* Inputs: "Additional Monthly" + "Increase Frequency" (Monthly / Bi weekly / Weekly). Salida en tabla "Savings": **Payment Amount / Shorten Loan Term By**.
- **"Lump Sum Payment"** — *"Shorten your loan term by paying a lump sum all to principal."* Inputs: "Lump Sum Addition" + "Frequency" (One time / Yearly / Quarterly). Misma salida Savings.
- No hay tabla de amortización fila a fila; el detalle temporal se expresa vía estos ahorros y los totales.

#### 3. Refinance (`#refinance-item`)

Propósito: comparar préstamo actual vs refinanciado (con cash-out) y el break-even de costes.

**Inputs**:
- Radio **"What is most important to you?"**: "Low Monthly Payment" / "Lower Interest Paid".
- Grupo **"Current Loan"**: Original Loan Amount (300000) · Original Rate (5) · Original Loan Term (Year/Month, 30) · Loan Start Date (month-year picker, "March 2022").
- Grupo **"New Loan"**: Current Loan Balance (250000) · Cash Out Amount (10000) · Refinance Costs (1000) · New Loan Amount (calculado, 250000) · New Rate (3) · New Loan Term (15) · New Loan Start Date ("August 2026") · Radio **"Paying Refinance Costs"**: "Include In Loan" / "Pay Out of Pocket".
- Tooltips literales: "Enter your current mortgage balance." · "Enter the amount of Cash Out you are taking on your new mortgage." · "Enter the amount of fixed refinance costs (Points/Fees)." · "The new loan amount after cash out and refinance costs." · "Enter the current Market Rate." · "Will Refinance costs be included in the new loan?"

**Outputs**: dos KPIs grandes — **"Monthly Payment Decrease $"** y **"Total Interest Difference $"** — y dos tarjetas comparativas:
- "Monthly Payment Comparison": Current Loan $, New Loan $, Monthly Payment Difference $, Refinance Costs $, **"Time to Recoup Fees"** (con barra de progreso `myProgress`).
- "Total Interest Comparison": Current Loan Remaining Interest $, New Loan Interest $, Total Interest Difference $.

#### 4. Rent vs Buy (`#rent-buy-item`)

**Inputs** en 4 grupos:
- **"Mortgage Information"**: Home Price (500000) · Down Payment ($/%, 50000) · Loan Amount (450000) · Interest Rate (7.5) · Loan Term (Year/Month, 30, min 1 max 50) · Start Date ("March 2020") · PMI (Yearly) (number, 0, max 2.50).
- **"Optional Information"**: Home Insurance (1500) · Taxes (6000) · HOA Dues (600; tooltip dice "Enter the annual HOA dues.").
- **"Buying Assumptions"**: Marginal Tax Bracket (25, min 1 max 50) · Annual Costs (1.00 — tooltip "Enter the % of home value expected in costs per year.") · Selling Costs (6.00) · Annual Appreciation (3.00).
- **"Renting Assumptions"**: Monthly Rent (2000) · Renters Insurance (1.30 %) · Rent Appreciation (2.00 %).

**Outputs**:
- Slider **"Years"** (jQuery UI; el range original comentado era min 0 max 15) con etiqueta "1 years".
- **"Results Summary"** — tabla comparativa **Buying vs Renting**: Cash Spent, Home value, Balance on Loan, Closing costs on sale, **Adjusted Net Cash Savings** (columna Renting marca "--" donde no aplica); barras "Rent $ / Buy $".
- Tarjeta resultado "YEAR N — BUY/RENT — GAIN $X" y tres párrafos plantilla literales: *"**Out of Pocket Cost:** If you opt for homeownership of a property valued at $…, your total expenses out of your pocket for N years would add up to $…. However, if you choose to rent instead, your overall expenditure would come to $…, thus saving you $… (which also covers the down payment you would have otherwise made)."* · *"**Financial Gain:** After N years, if you choose to purchase the property, the value of equity in your home would be $…, which you can access upon selling it."* · *"**Summary:** Based on the overall expenses incurred and the equity gained, it would be more advantageous for you to buy the property instead of renting, provided you intend to reside in the house for more than N years."*

#### 5. VA Purchase (`#veteran-affairs`)

Igual que Purchase pero con funding fee VA y sin PMI. **Inputs**: Home Value (200000) · Down Payment ($/%, 0) · Base Mortgage Amount (200000) · Loan Terms (Year/Month, 30) · Interest Rate (5) · **"This is my..."** (select 3 opciones VA, default "First Time Use of a VA Loan") · VA Funding Fee (2.15, autocalculado por tiers) · **Final Mortgage Amount** (base + fee financiado) · Property Tax (Yearly) ($/%, 0.6%) · Homeowners Insurance (Yearly) ($/%, 1200) · HOA Dues Per Month (0) · First Payment Date · Extra Payment Per Month (0).

**Outputs**: idénticos a Purchase (canvas `vaChart`, cabecera All Payment / Total Loan Amount / Total Interest Paid, toggle Monthly/Total Payment, Early Payoff Strategy y Lump Sum) pero sin línea PMI: la leyenda es Principal & Interest, Taxes, Insurance, HOA Dues, Extra Payment, y el total es "Total Tax, Insurance and Fees".

#### 6. VA Refinance (`#va-refinance`)

Igual que Refinance más lógica VA. Campos añadidos sobre la variante 3: **"VA Refinance Purpose"** — select: "Cash Out Refinance" (default) / "Interest Rate Reduction (IRRL)" — y el par "This is my..." + "VA Funding Fee" (2.15; IRRRL usa 0.5%, cash-out repetidor 3.3%). Defaults idénticos (300000 / 5% / 30y / March 2022 → 250000 / 10000 cash out / 1000 costes / 3% / 15y / August 2026). **Outputs**: los mismos dos KPIs y dos tarjetas comparativas que Refinance.

#### 7. Debt-Service (DSCR) (`#rental-loan`)

Propósito: análisis de inversión en alquiler 1-4 unidades.

**Inputs**: Number of Units (select 1-4, default 1; añade "Unit N Monthly Rent" por unidad) · radio **"Purchase or Refinance"** (default marcado: **Refinance**) · Property Value or Purchase Price (500000) · Unit 1 Monthly Rent (2500) · Annual Property Taxes (4000) · Annual Insurance (3000) · Monthly HOA Fee (0) · Vacancy Rate (select 3%-20%, default **5%**) · Annual Repairs & Maintenance (select $300-$1000 en pasos de $100, default **$500.00**) · Annual Utilities (5000) · Loan to Value (select 0%-80% en pasos de 5, default **80%**) · Interest Rate (select 6.000%-9.000% en pasos de 0.125, default **8.000%**) · Origination Fee (select 0.00%-3.00% en pasos de 0.25, default **2.00%**) · Closing Costs (6500). Hidden `rlEnablePropertyAddress=0` (campo de dirección del plugin desactivado).

**Outputs**: 4 KPIs — **Cash Flow $ · Cap Rate % · Cash on Cash Return % · DSCR** — más:
- "Deal Breakdown" (*"A breakdown of your rental loan deal."*): Loan Amount, Down Payment, Mortgage Payment, Monthly Payment, Origination Fee Amount.
- "Deal Metrics": Total Closing Costs, Cash Needed to Close, Price Per Unit, Gross Rental Income, Operating Expenses, Net Operating Income.
- "Return Metrics" con definiciones literales: *"Cash Flow: Annual cash flow after all expenses and mortgage are paid."* · *"Cap Rate, or capitalization rate, is a metric that divides your net operating income (not including your mortgage) by the purchase price or property value. It is most useful in comparing multifamily properties."* · *"Cash on cash return is a metric that divides your pre-tax cash flow by the total cash invested in the deal. This is a key metric for most investors."* · *"DSCR calculates the ratio of rental income to your mortgage payment. Ideally, you'll have a DSCR of 1.0 or higher."*

#### 8. Fix & Flip (`#fix-and-flip`)

**Inputs**: Purchase Price (500000) · Renovation Cost (75000) · After Repaired Value (750000) · Length of Loan (select 1-18 meses, default **9 Months**) · Annual Property Taxes (4000) · Annual Insurance (3000) · Purchase Price LTV (select: "90% (Experienced Only)", "85% (Experienced Only)", 80% default, 75%, 70%, 65%) · "Intrest Rate" [sic, typo del original] (select 9.000%-12.000% pasos 0.125, default **10.000%**) · Origination Fee (select 2.00%-3.00% pasos 0.25, default **2.00%**) · Other Closing Costs (select 2.0%-4.0% pasos 0.5, default **3.0%**) · Cost To Sell (select 1%-7%, default **5%**). Hidden `ffEnablePropertyAddress=0`.

**Outputs**: 4 KPIs — **Borrower Equity Needed $ · Net Profit $ · Return on Investment % · Loan to After Repaired Value %** — más "Deal Breakdown" (Loan Amount, Down Payment, Monthly Interest Payment, Total Interest Over Term, Origination Fee Amount, Other Closing Costs Amount, Cost To Sell Amount) y "Deal Metrics" (Closing Costs, Carrying Costs, Borrower Equity Needed, Total Cash In Deal) y "Return Metrics" (Net Profit, Loan to After Repaired Value, ROI).

### Resto de la página

- **Header** (compartido del sitio): logo + menú — Learn (`/learning-center/`), Pre-Qualify (`/mortgage-prequalified/`), Calculator, Loan Options (`/loan-options/`), About Us (submenú: Meet Our Team, Reviews), Blog, Contact Us, **Apply Online** (externo: `https://aimsmtg.my1003app.com/953494/register` — portal 1003 de solicitud), **Get A Quote** (`/quote/`).
- **Disclaimer de la calculadora** (bajo el widget, literal): *"Disclaimer: Results received from this calculator are designed for comparative purposes only, and accuracy is not guaranteed. We do not guarantee the accuracy of any information or inputs by users of the software. This calculator does not have the ability to pre-qualify you for any loan program which should be verified independently with one of our Loan Consultants. Qualification for loan programs may require additional information such as credit scores and cash reserves which is not gathered in this calculator. Information such as interest rates and pricing are subject to change at any time and without notice. Additional fees such as HOA dues are not included in calculations. All information such as interest rates, taxes, insurance, PMI payments, etc. are estimates and should be used for comparison only. We do not guarantee any of the information obtained by this calculator."*
- **Footer callout** (banda pre-footer): *"What are your goals? Everyone is unique, request your personalized rates and fees."* + botón **"Get Started"** → `/quote/`.
- **Footer**: About Us (*"AIMS Capital Mortgage, LLC is a leading residential mortgage financing company dedicated to providing exceptional services and tailored solutions to homeowners in the state of Florida. With our deep expertise in the mortgage industry, we strive to make the dream of owning a home a reality for individuals and families."*), **Company NMLS: 2506467**, logo Equal Housing Opportunity, dirección (8950 SW 74th CT, Suite 2201 PMB A4, Miami, FL 33156), teléfono (305) 440-4374, "Email Us Today" (mailto ofuscado a jacosta@aimsmtg.com), sello SSL; columna "Loan Options" (9 enlaces a `/loan-options/...`); columna "Resources" (Learning Center, Contact Us, Apply Online, Get A Quote, Reviews, Mortgage Calculator, NMLS Consumer Access → nmlsconsumeraccess.org, ADA Accessibility Statement, Privacy Policy). Legal final: *"The content provided within this website is presented for information purposes only. This is not a commitment to lend or extend credit. Information and/or dates are subject to change without notice. All loans are subject to credit approval. Other restrictions may apply. Mortgage loans may be arranged through third party providers."*

### Notas para replicación

1. **No es un widget de terceros embebible**: es un plugin WP a medida de VonkDigital que renderiza HTML estático + jQuery. Para DherreraLoans se puede replicar el modelo de datos por completo con lo documentado aquí (labels, defaults, opciones y fórmulas públicas estándar: amortización francesa, DTI, funding fees VA por tiers, NOI/Cap Rate/DSCR, ROI flip).
2. **Jerarquía UX clave**: tabs horizontales → formulario oscuro a la izquierda / resultados vivos a la derecha (donut + listas + sliders espejo del formulario + resumen en prosa). El resumen en prosa ("Based on what you input today…") y las definiciones didácticas del DSCR son los elementos más diferenciales del copy.
3. **Patrones de input reutilizables**: toggle $/% en down payment, tax e insurance; toggle Year/Month en plazos; selects con valores "de negocio" embebidos (credit score→factor PMI, LTV, tarifas); campos calculados de solo lectura (Loan Amount, Final Mortgage Amount, New Loan Amount).
4. **Valores por defecto** pensados para Florida: property tax 0.6%, insurance $1,200/año, precio $200k (500k en inversión). Los KPI placeholder ($2850, 32%/45%, $1,915, $43,244) están hardcodeados en el HTML hasta el primer cálculo.
5. Detalles a no copiar: typo "Intrest Rate" en Fix & Flip, botón "Email Me This" muerto (comentado), y "1 years" sin pluralización. Los ratios DTI permitidos (50/50, 65/65, 29/41) son configuración del broker, no normativa exacta — validar con el cliente antes de mostrar.
6. El JS del plugin (`mortgage-calculator-public.js`) no se pudo descargar (el servidor corta la conexión), así que los defaults FHA de MIP (campos vacíos en HTML, los inyecta ese JS) quedan sin confirmar: usar los estándar del mercado (upfront 1.75%, annual 0.55%) y validarlos.

---

## Catálogo «Loan Options» de aimsmtg.com — Documentación estructural

Investigación realizada el 2026-08-07 vía fetch directo de las 12 URLs. Todo el copy literal citado está en inglés tal cual aparece en la web. AIMS Capital Mortgage, LLC (NMLS 2506467, Miami FL) es el sitio de referencia.

### Hub loan-options (`/loan-options/`)

**Hero:** título `"Loan Options"` + subtítulo `"Finding a great home loan involves careful consideration of your needs, finances and history. We are here to guide you."` Imagen de hero: pareja mirando un ordenador.

**Organización del catálogo:** grid de cards dividido en **dos categorías con este orden exacto**:

**PURCHASE (8 productos):**
1. **Fixed Rate Mortgage** — `"Interest Rate and payments remain the same for the entire term of the loan."` → `/loan-options/fixed-rate-mortgage/`
2. **FHA Loan** — `"An FHA loan provides a government-insured loan with flexible loan options."` → `/loan-options/fha-home-loan/`
3. **VA Loan** — `"VA Loans offer flexible options as either fixed-rate or ARM mortgages."` → `/loan-options/va-home-loan/`
4. **USDA Loan** — `"Purchase a home with no money down in certain rural and suburban areas."` → `/loan-options/usda-loan/`
5. **Jumbo Loan** — `"Jumbo loans offer maximum flexibility for home financing for larger loans."` → `/loan-options/jumbo-home-loan/`
6. **First Time Home Buyer** — `"Popular loan programs for first time home buyers."` → `/loan-options/first-time-home-buyer/`
7. **Low Down Payment Options** — `"Explore options that may make you a home owner with a low down payment."` → `/loan-options/low-down-payment-purchase-options/`
8. **Investment Property** — `"Mortgage loan programs for vacation and investment properties."` → `/loan-options/investment-property-loans/`

**REFINANCE (3 productos):**
1. **Refinance** — `"Mortgage refinancing may lower your monthly payments."` → `/loan-options/refinance/`
2. **Cash-Out Refinance** — `"Access home equity for various purposes."` → cash-out refinance
3. **VA Loan Refinance** — `"There are two main ways to refinance your VA loan."` → VA loan refinance

*Cada card = título + descripción de una sola frase + enlace.* Nota de URLs: las dos últimas páginas viven en **raíz** (`/cash-out-refinance/` y `/va-loan-refinance-options/`), no bajo `/loan-options/`, aunque el hub las presenta como parte del catálogo.

**Resto del hub:** tras el grid aparece la misma sección `"Get started today!"` con el cuestionario de 20 pasos que comparten todas las páginas (ver Plantilla común). Sin FAQ, tablas ni testimonios.

### Plantilla común (compartida por las 11 páginas de producto)

Todas las páginas de producto siguen **exactamente la misma plantilla**; solo cambian hero, cuerpo editorial y bullets:

1. **Header fijo** con logo y navegación: `Learn | Pre-Qualify | Calculator | Loan Options | About Us | Blog | Contact Us | Apply Online | Get A Quote`.
2. **Hero** con foto, un **titular en forma de beneficio o pregunta directa** (nunca el nombre técnico del producto a secas) + subtítulo de una frase + dos CTAs ancla: `"Get Your Quote"` → `#quote` y `"Learn More"` → `#learn`.
3. **Cuerpo editorial** de 2–5 secciones cortas (qué es, cómo funciona, requisitos/para quién), con patrón recurrente de sección de bullets **"How [X] Loans Work"**.
4. **Sección `"Get started today!"`** con subtítulo `"Fill out the questionnaire on this page to start a discussion about your mortgage needs today!"` y el **cuestionario de 20 pasos** (el mismo en todas las páginas, incluido el hub): barra de progreso ("Step 1 of 20", 5%), navegación Back/Next/Submit. Preguntas literales: 1) `"What are your goals?"` (Purchase/Refinance) · 2) ubicación (city/zip) · 3) tipo de vivienda (Single Family/Townhouse/Condominium/Multi-Family) · 4) fase del proceso de compra (5 opciones de timeline) · 5) uso (Primary Residence/Vacation/Investment) · 6) servicio militar (Yes/No) · 7) rama militar (Army, Marine Corps, Navy, Air Force, Coast Guard, National Guard, Military Spouse, Other VA Eligibility, No Military Experience) · 8) agente inmobiliario (Yes/No) · 9) primera compra (Yes/No) · 10) precio aproximado (slider) · 11) entrada disponible · 12) saldo de la primera hipoteca · 13) tipo de interés actual · 14) segunda hipoteca (Yes/No) · 15) cash adicional deseado · 16) empleo (Employed/Self-Employed–1099/Retired) · 17) ingresos anuales brutos (5 tramos) · 18) credit score (5 tramos, 740+ a <600) · 19) bancarrota/ejecución en 3 años (Yes/No) · 20) nombre, apellido, email, teléfono. Con campos condicionales purchase vs refinance.
5. **CTAs repetidos en todas las páginas:** `"Give us a call!"` → `/contact-us/` · `"Apply Online"` → `https://aimsmtg.my1003app.com/953494/register` (portal externo 1003) · `"Get A Quote"` → `/quote/` · `"Email Us Today"` → mailto.
6. **Footer estándar** de varias columnas: bloque About (`"AIMS Capital Mortgage, LLC is a leading residential mortgage financing company dedicated to providing exceptional services and tailored solutions to homeowners in the state of Florida."` + Company NMLS 2506467), contacto (dirección Miami, teléfono, email), columna **Loan Options** (9 enlaces), columna **Resources** (Learning Center, Contact Us, Apply Online, Get A Quote, Reviews, Mortgage Calculator, NMLS Consumer Access, ADA Accessibility Statement, Privacy Policy), badges Equal Housing Opportunity + SSL, atribución "Powered By VonkDigital", "Back To Top".
7. **Disclaimers legales** (en todas): `"The content provided within this website is presented for information purposes only. This is not a commitment to lend or extend credit. Information and/or dates are subject to change without notice. All loans are subject to credit approval. Other restrictions may apply. Mortgage loans may be arranged through third party providers."` y, en páginas de productos gubernamentales: `"AIMS Capital Mortgage, LLC is not affiliated with or acting on behalf of or at the direction of FHA, VA, USDA or the Federal Government."`

**Lo que NO hay en ninguna página:** FAQ, tablas comparativas, testimonios en página de producto, calculadoras embebidas (la calculadora es página aparte), banners promocionales. El único elemento interactivo es el cuestionario.

**Bullet firma que se repite en casi todos los productos:** `"Pay your mortgage off at any time without pre-payment penalties."`

### Fixed Rate Mortgage (`/loan-options/fixed-rate-mortgage/`)

- **Hero:** `"Interest rates on Fixed Rate Mortgages are still very low!"` + `"If you plan to stay in your home for the long term, a consistent payment that never changes can help you prepare for your financial future."`
- **Secciones:** 1) propuesta de valor (`"Plan your budget with a consistent mortgage payment at a low rate that will stay the same through the life of your loan."`); 2) **tipos comunes**: *The 15-Year Mortgage* (menos interés total —ejemplo con préstamo de $100,000 al 4%—, casa pagada en la mitad de tiempo; contra: cuota mensual más alta) y *The 30-Year Mortgage* (cuota más baja, apto para presupuestos ajustados; contra: `"You will pay more in interest. Longer mortgage means more interest charged."`); 3) **How It Works** (bullets); 4) Get started today!
- **Bullets literales (How It Works):** `"Monthly payments are based on interest rate, principal loan amount, and amortized interest over 30 years. With a Fixed Rate Mortgage, your interest rate will never change, even if market rates increase!"` · `"Your payment will not change throughout the life of the loan."` · `"Your actual payment will vary based on your situation and the current interest rates when you apply."` · `"Pay your mortgage off at any time without pre-payment penalties."`
- **Único de esta página:** la comparativa editorial 15 vs 30 años con pros y contras.

### FHA Home Loan (`/loan-options/fha-home-loan/`)

- **Hero:** `"An FHA Home Loan may get you into a home with a low down payment."` + `"One of the biggest hurdles that first time homebuyers face is saving up for a sizable down payment on a home."`
- **Secciones:** 1) overview (government-insured, `"as little as 3.5% down"`); 2) **What is an FHA Loan?** (respaldado por la Federal Housing Administration, contraste con préstamos convencionales y PMI, mayor escrutinio a cambio); 3) **What is Required for an FHA Loan?** (historial de empleo, tasación, DTI; mínimo 3.5% de entrada; si el credit score es <580, entrada mayor; solo residencia principal; crédito más flexible que en convencional); 4) **How FHA Loans Work** (bullets); 5) Get started today!
- **Bullets literales:** `"Purchase your home with as little as 3.5% down payment (compared to 20% required on most loans)."` · `"30-, 25-, 20- and 15-year terms are all available with fixed rates."` · `"5-year adjustable rate mortgage available."` · `"Pay your mortgage off at any time without pre-payment penalties."`
- **Único:** estructura pregunta-respuesta ("What is…? / What is required…?") y el disclaimer federal en footer.

### VA Home Loan (`/loan-options/va-home-loan/`)

- **Hero:** `"Are you a military service member or veteran looking to buy a home?"` + `"The VA Loan is a valuable tool that military members and veterans may use to pursue home ownership."`
- **Secciones:** 1) **overview** (Department of Veterans Affairs, `"low or zero down payment"`, financiación 100%, hay que calificar por crédito e ingresos, closing costs negociables con el vendedor); 2) **The VA Loan Process** (proceso de compra estándar + exigencias VA: inspección de habitabilidad y tasación; reparaciones necesarias no descalifican pero deben completarse antes del cierre; VA ofrece renovation loans de forma limitada); 3) **How VA Loans Work** (bullets); 4) Get started today!
- **Bullets literales:** `"Purchase your home with as little as 0% down payment."` · `"30-, 25-, 20- and 15-year terms are all available with fixed rates."` · `"5-year adjustable rate mortgage available."` · `"Jumbo VA loans available."` · `"VA Streamline Refinance with a reduced funding fee and flexible documentation requirements – available for veterans currently in VA loans."` · `"No monthly PMI (Private Mortgage Insurance)."` · `"VA loans are governed by the U.S. Department of Veterans Affairs."` · `"Pay your mortgage off at any time without pre-payment penalties."`
- **Único:** hero en formato pregunta al segmento; la lista "How it works" más larga del catálogo (8 bullets); cross-sell implícito al VA Streamline Refinance.

### USDA Loan (`/loan-options/usda-loan/`)

- **Hero:** `"USDA Loans offer flexible options as either Fixed Rate or Adjustable Rate mortgages."` + `"Buying a home with little or no down payment can provide opportunities for buyers that otherwise may not be able to become homeowners."`
- **Secciones:** 1) **What is a USDA home loan?** (el USDA no presta directamente: garantiza el préstamo como VA/FHA; prestamistas privados ponen los fondos; menor riesgo → menor entrada); 2) **Who can use the USDA program?** (pese al nombre, para `"low and moderate income households"` que compren residencia principal en zonas rurales elegibles; límites de ingresos por ubicación; vale para vivienda nueva, existente o a renovar); 3) **How USDA Loans Work** (bullets); 4) **Qualification Requirements** (bullets); 5) Get started today!
- **Bullets literales (How USDA Loans Work):** `"Purchase your home with as little as 0% down payment."` · `"30-, 25-, 20- and 15-year terms are all available with fixed rates."` · `"5-year adjustable rate mortgage available."` · `"No monthly PMI (Private Mortgage Insurance)."` · `"USDA loans are governed by the U.S. Department of Agriculture."` · `"Pay your mortgage off at any time without pre-payment penalties."`
- **Bullets literales (Qualification Requirements):** `"Household income limits apply and are based on location."` · `"Only available in certain areas. Talk to a specialist today to see if it is an option for you!"` · `"Buy a home with no money down (primary home)."` · `"Refinance up to 100% of your primary home's value."`
- **Único:** doble lista de bullets (funcionamiento + requisitos); es el único producto con sección explícita de requisitos en bullets.

### Jumbo Home Loan (`/loan-options/jumbo-home-loan/`)

- **Hero:** `"Jumbo Homes Loans may make high-end home purchases possible."` + `"With a choice between fixed or adjustable rates, our jumbo loans offer maximum flexibility for home financing for larger loans."`
- **Secciones:** 1) **propuesta de valor única** (jumbo y super jumbo para viviendas por encima de los límites conforming; muchos prestamistas han reducido su oferta jumbo, ellos mantienen tarifas competitivas; fijo o variable); 2) Get started today!
- **Único:** es **la página más corta del catálogo** — una sola sección editorial, sin bullets propios ni listas "How it works". Demuestra que la plantilla aguanta contenidos mínimos.

### First Time Home Buyer (`/loan-options/first-time-home-buyer/`)

- **Hero:** `"First time home buyers typically have a lot of questions and we love to help!"` + `"Before finding your new home, we can help you get pre-qualified. We can also help find you a loan program that best fits your needs."`
- **Secciones:** 1) **introducción**: `"Buying your first home is a very exciting step! AIMS Capital Mortgage, LLC loan specialists are here to guide you through every step of the loan process."` (pre-cualificación gratis, matching con agente inmobiliario, opciones de entrada baja, acompañamiento personalizado); 2) **Popular Loan Programs for First-Time Home Buyers** — página agregadora que destaca 3 programas: **30-Year Fixed Rate Mortgage** (`"Lock in a low payment and sleep tight knowing that your rate will not change."`), **FHA Loan** (desde 3.5% de entrada) y **VA Loan** ($0 de entrada, sin PMI para elegibles); 3) Get started today!
- **Único:** no es un producto en sí, sino una **página-segmento** que enruta hacia otros tres productos del catálogo. Tono más emocional/acompañamiento.

### Investment Property Loans (`/loan-options/investment-property-loans/`)

- **Hero:** `"Mortgage Loan Programs for Vacation and Investment Homes"` + `"Whether you are looking for an investment property or a vacation home reach out to us to get prequalified."` Copy de apertura: `"Ready to reach financial independence through real estate? … AIMS Capital Mortgage, LLC can bring the same level of personalized attention and service to all of your real estate purchases."`
- **Secciones:** 1) propuesta de valor (`"Your dream home might be within reach!"`; préstamos para inversión, pre-cualificación, referidos de agentes); 2) **Mortgage Loan Programs**: **30-Year Loan** (`"Take advantage of low rates by locking into a low payment"`; puede calificar como owner-occupied con mejor tipo según uso) y **15-Year Loan** (`"Get the same security of a 30-year fixed rate mortgage, but pay your mortgage off in half the time"`; menos interés, propiedad antes, más ingreso mensual de inversión); 3) **CTA de urgencia**: `"Great investment properties are out there but are often purchased by buyers 'in the know' quickly."` — pre-cualificarse da poder de negociación; 4) Get started today!
- **Único:** segmento doble (inversión + vacacional), argumento de urgencia/escasez, y programas presentados por plazo (30/15) en lugar de por tipo de producto.

### Low Down Payment Purchase Options (`/loan-options/low-down-payment-purchase-options/`)

- **Hero:** `"Not ready for a sizable down payment?"` + `"There are options that can make you a home owner with a low down payment."`
- **Secciones (la página más larga del catálogo):** 1) introducción (la decisión de la entrada es confusa; soluciones a medida); 2) **opciones de entrada baja** — agregadora de 3 productos: **FHA** (mínimo 3.5%, PMI si el préstamo supera el 80% del precio), **USDA** (0% en zonas rurales/suburbanas, límites de ingresos, PMI si entrada <20%) y **VA** (100% financiación para veteranos; menciona programas no-conforming 80/20 con segunda hipoteca); 3) guía de decisión (consultar con especialista); 4) **costes de una entrada baja** (bullets); 5) **beneficios de una entrada baja** (bullets); 6) reflexión personal (calificar por X no obliga a gastar X: comodidad mensual); 7) Get started today!
- **Bullets literales (costes):** `"Higher interest rates"` · `"Higher mortgage insurance premiums"` (con nota: el PMI se puede quitar al llegar al 20% de equity).
- **Bullets literales (beneficios):** `"Less money out of pocket at the time of purchase"` · `"Higher rate of return. Your property's appreciation will be the same…"` · `"Opportunity cost. In some cases, the smart investor can make more money…"`
- **Único:** la única página con estructura pros/contras equilibrada y consejo editorial neutral; segunda página-agregadora del catálogo.

### Refinance (`/loan-options/refinance/`)

- **Hero:** `"Wanting to pay less in interest on your mortgage and lower your monthly payments?"` + `"A mortgage refinance is the replacement of an existing mortgage with another mortgage under different terms."`
- **Secciones:** 1) introducción (`"Mortgage refinancing can lower your monthly payments, which can add up to significant savings."`; importancia de conocer tipos actuales y del timing con ayuda experta); 2) **"Reasons to consider a mortgage refinance:"** (bullets); 3) **"When to Refinance Your Mortgage?"** (contactar para orientación personalizada sobre programas); 4) Get started today!
- **Bullets literales:** `"Reduce your monthly mortgage payment: Mortgage rates are still very low. A refinance with AIMS Capital Mortgage, LLC may help you lower payment and possibly save you money."` · `"Consolidate high interest debt: You could pay off those higher-interest debts by refinancing with a lower rate."` · `"Pay Off Your Mortgage Faster: The shorter the term on your mortgage, the lower your mortgage rate."`
- **Único:** bullets con formato `motivo en negrita: explicación`; página genérica que sirve de paraguas de la categoría Refinance.

### Cash-Out Refinance (`/cash-out-refinance/` — fuera de `/loan-options/`)

- **Hero:** `"Cash-Out Refinance"` (único hero del catálogo que es el nombre del producto a secas) + `"A cash-out refinance is a type of mortgage refinance that allows homeowners to take out a new mortgage for more than their existing mortgage balance, and then receive the difference in cash."`
- **Secciones:** 1) **overview con ejemplo numérico** — hipoteca de $200,000 sobre casa de $300,000 → refinanciar por $250,000 y recibir $50,000 en cash, según equity y requisitos del prestamista; usos: `"access their home equity to pay off debt, make home improvements, or invest"`; 2) **Benefits for Cash-Out Refinance** — beneficios (posible tipo más bajo → cuota menor y menor coste total; el cash es de uso libre: deuda, mejoras, educación, inversión) **y riesgos con honestidad** (closing costs significativos que pueden anular el ahorro; más deuda total, plazo más largo, posible cuota mayor y más interés); 3) Get started today!
- **Único:** único producto con ejemplo numérico concreto; único con sección explícita de riesgos; sin bullets propios en el cuerpo.

### VA Loan Refinance Options (`/va-loan-refinance-options/` — fuera de `/loan-options/`)

- **Hero:** `"VA Loan Refinance Options"` + `"If you have already used your VA loan, you may still benefit from working with a lender to get better terms. Called 'refinancing,' this process is similar to the home buying process but does not include the home search or contract negotiations."`
- **Secciones:** 1) introducción (refinanciar = ajustar términos tras la compra, motivado por bajada de tipos, mejora financiera o subida del valor; `"You already own the home but are just seeking better financing."`); 2) **dos métodos de refinanciación**: **A) Streamlined Refinance (IRRRL** — Interest Rate Reduction Refinance Loan): aportación mínima o nula del propietario, para cuando los tipos han bajado desde la compra; **B) Cash-Out Refinance**: extraer equity como cash (consolidar deuda, compras grandes, mejoras); aplicable a VA, USDA, FHA y convencional; el prestamista fija el máximo de cash-out y el equity mínimo a retener; puede aumentar el interés total; 3) Get started today!
- **Único:** estructura A/B de dos caminos; conecta la familia VA (compra) con la familia refinance.

### Notas para replicación

1. **Arquitectura de dos niveles:** un hub con grid de cards (título + frase única + enlace) segmentado en **Purchase / Refinance**, y páginas de detalle con plantilla idéntica. El orden del hub va de lo más genérico (Fixed Rate) a lo más nicho, con refinance al final.
2. **La plantilla es rígida y el contenido elástico:** desde Jumbo (1 sección) hasta Low Down Payment (7 secciones) usan el mismo esqueleto: hero-beneficio → cuerpo editorial → «How it works» en bullets → captación. No hay que inventar secciones nuevas por producto.
3. **Heroes orientados a beneficio o pregunta, nunca a nombre técnico** (salvo Cash-Out): `"Not ready for a sizable down payment?"`, `"Are you a military service member…?"`. Buen patrón a imitar con redacción propia.
4. **Tres tipos de página** conviven en el catálogo: producto puro (Fixed, FHA, VA, USDA, Jumbo, Cash-Out), **página-segmento agregadora** que enruta a productos (First Time Buyer, Low Down Payment, Investment) y página-paraguas de categoría (Refinance, VA Refinance). Útil para decidir la taxonomía propia.
5. **Bullets fórmula reutilizables:** entre FHA/VA/USDA se repite el patrón `entrada mínima → plazos disponibles → ARM → PMI → organismo que gobierna → sin penalización por amortización anticipada`. Es literalmente la misma lista con 2-3 variaciones por producto — ideal para componentizar como lista tokenizada.
6. **Captación única y omnipresente:** el cuestionario de 20 pasos es EL mecanismo de conversión y aparece idéntico en las 12 páginas (equivale a la Fase 2 «cuestionario» de DHerreraLoans). CTAs duales de hero (`Get Your Quote`/`Learn More` como anclas) + CTAs globales (Apply Online externo, Get A Quote, teléfono, email).
7. **Cumplimiento YMYL:** lenguaje siempre condicional (`"may get you"`, `"may lower"`, nunca promesas), disclaimer general en footer, disclaimer específico de no-afiliación federal en productos FHA/VA/USDA, Equal Housing Opportunity y NMLS visibles en todas las páginas. Cash-Out incluye riesgos explícitos — patrón de honestidad a conservar.
8. **Ausencias notables** (decisiones conscientes a valorar): sin FAQs, sin tablas de tipos, sin testimonios en producto, sin calculadoras embebidas (la calculadora es página propia enlazada desde nav), sin precios/tipos concretos en ninguna página.
9. **Incoherencia de URLs a no replicar:** Cash-Out y VA Refinance cuelgan de raíz en vez de `/loan-options/`; en DHerreraLoans conviene unificar todo el catálogo bajo un mismo prefijo de ruta.

---

## Documentación aimsmtg.com — Páginas corporativas y de confianza

**Metodología:** páginas vivas leídas con WebFetch (2026-08-07); HTML crudo verificado con el snapshot íntegro de Wayback Machine (2024-09) porque el hosting (nginx + Mod Security) bloquea curl directo; configuración del widget de reseñas obtenida en vivo de la API de Elfsight (`core.service.elfsight.com/p/boot/`).

---

### /about-us/ — About Us

**Título del navegador:** `About Us - AIMS Capital Mortgage, LLC`

**Estructura de secciones en orden:**

1. **Banner de página** con H2 `About Us` (no hay H1 en el contenido).
2. **Bloque fundador (quote card):** cita destacada + foto headshot 250×250 de Jorge Acosta + nombre enlazado a su ficha `/jorge-f-acosta/` + cargo y NMLS. Texto exacto:
   > "We aim to provide a fast, reliable, and affordable mortgage platform for our clients and referral partners"
   >
   > **Jorge F. Acosta** — FOUNDER/ OWNER — NMLS#: 953494
3. **Cuerpo de texto corporativo** — 8 párrafos seguidos, sin subheadings. Temas por párrafo (con citas literales clave):
   - P1 (quiénes somos): "AIMS Capital Mortgage, LLC is a leading residential mortgage financing company dedicated to providing exceptional services and tailored solutions to homeowners in the state of Florida. With our deep expertise in the mortgage industry, we strive to make the dream of owning a home a reality for individuals and families."
   - P2 (simplificar el proceso): "At AIMS Capital Mortgage, we understand that securing a mortgage can be a complex and daunting process. That's why we are committed to simplifying the journey by offering a wide range of mortgage financing options and personalized guidance. Whether you're a first-time homebuyer or a seasoned homeowner, our team of experienced professionals is here to assist you every step of the way."
   - P3 (especialización/productos): "We specialize in residential mortgage financing, offering a comprehensive suite of loan programs… From conventional loans to government-backed mortgages and refinancing solutions… Our dedicated loan officers work closely with you to understand your goals, answer your questions, and provide customized advice to help you make informed decisions."
   - P4 (valores): "…we pride ourselves on our commitment to excellence and integrity. We believe in transparency and ethical business practices… Our reputation is built on trust…"
   - P5 (misión): "Our mission is to provide competitive mortgage solutions that not only meet our clients' financial goals but also contribute to their long-term financial stability and prosperity. With our extensive knowledge of the mortgage industry and access to a wide network of lenders, we can offer competitive rates and terms tailored to your needs."
   - P6 (tecnología): "…we value innovation and embrace technology to streamline the mortgage process. Our user-friendly online tools and digital platforms make it easier for our clients to apply for a mortgage, track their application progress, and communicate with our team."
   - P7 (cierre aspiracional): "Whether you are buying your first home, refinancing your existing mortgage, or exploring investment opportunities, AIMS Capital Mortgage is here to guide you toward a successful outcome…"
   - P8 (CTA textual): "Contact us today to discover how AIMS Capital Mortgage, LLC can help you achieve your homeownership goals…"
4. **Callout pre-footer** (global): "What are your goals? Request A Free Consultation" + botón "Get Started" → `/quote/`.
5. **Footer global.**

No hay formularios propios, ni mapa, ni historia/timeline, ni stats numéricas. El único enlace del cuerpo es el nombre del fundador hacia su ficha.

---

### /meet-our-team/ — Meet Our Team

**Título:** `Meet Our Team - AIMS Capital Mortgage, LLC`

**Hero/banner:** headline "Meet The Team", subheadline "Backed By Great People, 100% Customer Focused."

**Intro literal:** "The most important asset to our company, is our people. Our team was built with you as our focus."

**Grid de fichas** — cada tarjeta: foto headshot 250×250 + nombre (enlace a ficha individual) + cargo + NMLS con formato `NMLS#: XXXXXXX`. Los 16 miembros en orden de aparición:

| # | Nombre | Cargo | NMLS | URL |
|---|--------|-------|------|-----|
| 1 | Jorge F. Acosta | Founder/ Owner | 953494 | /jorge-f-acosta/ |
| 2 | Lourdes Rosado | Mortgage Specialist | 1001437 | /lourdes-rosado/ |
| 3 | Alejandro Lamas | Mortgage Specialist | 2133546 | /alejandro-lamas/ |
| 4 | Marc R. Williams | Mortgage Specialist | 371350 | /marc-r-williams/ |
| 5 | Fabian Silnik | Mortgage Specialist | 713815 | /fabian-silnik/ |
| 6 | Gloria Gilman | Mortgage Specialist | 372974 | /gloria-gilman/ |
| 7 | Vanessa Campa | Mortgage Specialist | 2558397 | /vanessa-campa/ |
| 8 | **David Herrera** | Mortgage Specialist | **1459301** | /david-herrera/ |
| 9 | Esther Acosta | Mortgage Specialist | 1902673 | /esther-acosta/ |
| 10 | Juan Morales | Mortgage Specialist | 725057 | /juan-morales/ |
| 11 | Carolina Teijeiro | Mortgage Specialist | 2619939 | /carolina-teijeiro/ |
| 12 | Margarita Vivas | Mortgage Specialist | 364068 | /margarita-vivas/ |
| 13 | Luz Ruiztagle | Mortgage Specialist | 2039219 | /luz-ruiztagle/ |
| 14 | Carlos Sarria | Mortgage Specialist | 319813 | /carlos-sarria/ |
| 15 | Albania Rodriguez | Mortgage Specialist | 2709672 | /albania-rodriguez/ |
| 16 | Ester Castaneda | Mortgage Specialist | 2661438 | /ester-castaneda/ |

Todos comparten el cargo "Mortgage Specialist" salvo el fundador. No hay bios en el grid, ni teléfonos/emails individuales (eso vive en cada ficha). Cierra con el callout global "What are your goals? Request A Free Consultation" → Get Started → `/quote/`.

---

### /reviews/ — Reviews

**Título:** `Reviews - AIMS Capital Mortgage, LLC`

**Estructura:**

1. **Hero** con imagen `couple-looking-at-home.jpg` y dos CTAs: "Read Reviews" (ancla `#reviews`, scroll en la misma página) y "Request A Quote" → `/quote/`.
2. **Sección de reseñas** (ancla `#reviews`): H2 "Client reviews from around the internet." + subtítulo "Our clients are the foundation of our success." + widget.
3. Callout y footer globales.

**Fuente de las reseñas — hallazgo clave:** NO son reseñas hardcodeadas ni un embed nativo de Google. Es un **widget SaaS de Elfsight (app "Google Reviews")** insertado como bloque raw-JS de WPBakery:

```html
<script src=".../platform.js" defer></script>  <!-- static.elfsight.com/platform/platform.js -->
<div class="elfsight-app-c2121122-d856-43a6-8b3b-c65f8cbe66e2"></div>
```

Las reseñas se cargan 100 % client-side (por eso no aparecen en el HTML ni las ve un fetcher sin JS). Configuración actual del widget según la API de Elfsight:

- **Fuente:** tipo `google` (Google Business Profile vía Place ID); rating agregado y nº de reseñas en cabecera.
- **Layout:** carrusel, 1 fila, columnas responsive 5/4/3/2/1 (desktop-L → móvil), flechas visibles, sin paginación ni autoplay, swipe habilitado.
- **Tarjeta de reseña:** estilo "classic"; muestra nombre completo del autor, fecha, estrellas y logo de la fuente (Google); oculta foto de autor, badge verificado, fotos adjuntas y respuestas del propietario; texto recortado a 3 líneas con "leer más".
- **Filtros:** solo reseñas de rating ≥ 4, ordenadas por fecha; exclusión por palabra clave configurada.
- **Cabecera del widget** (`header1`): rating agregado + número de reseñas + título; pestañas por fuente con icono/nombre/rating; badge "Overall Rating".
- **Extras:** `enableSchemaOrg: true` (rich snippets), enlaces externos en pestaña nueva, logo de Elfsight oculto, ancho 1200 px, color de acento `rgba(0,109,255,1)`.
- **Sin CTA "deja tu reseña"** en la página (el widget enlaza a Google).

**Advertencia:** el Place ID configurado actualmente en el widget resuelve a "Vonk Digital, LLC." (Solana Beach, CA — el proveedor de la plataforma web), y el historial del widget incluye otras hipotecarias clientes de Vonk (Guide Mortgage, Lift Home Lending). Es decir, parece un widget plantilla del proveedor; no está garantizado que las reseñas mostradas sean del perfil de Google de AIMS. Para la nueva web esto refuerza usar una fuente propia y verificada.

---

### /contact-us/ — Contact Us

**Título:** `Contact Us - AIMS Capital Mortgage, LLC`

**Copy del hero:** "Feel free to send us a message, give us a call. Our group of friendly staff is here to help."

**Bloques de contacto (en orden):**
- **Office Location:** 8950 SW 74th CT, Suite 2201 PMB A4, Miami, FL 33156
- **Phone Number:** (305) 440-4374
- **Send a Message:** info@aimsmtg.com
- **Horario:** no se publica. **Mapa embebido:** no hay. **Redes sociales:** no hay.

**Formulario** — titulado "Request an Intro Meeting Below". No es un formulario de contacto clásico: es el mismo **multi-step de cualificación de lead (~20 pasos, Gravity Forms + `gf-mdext`)** que usa `/quote/`, con cierre "Get a Personalized Quote and Expert Advice Today." Sin texto de consentimiento dentro del formulario.

---

### Ficha tipo de staff (plantilla)

Las 16 fichas comparten plantilla idéntica (verificada en 3 muestras). Bloques en orden:

1. **Header/nav global.**
2. **Tarjeta hero del agente:** saludo `Hello, I'm {Nombre}` + cargo (`Mortgage Specialist`) + `NMLS#: {número}` + email personal `{inicial}{apellido}@aimsmtg.com` + **teléfono directo personal** + botón **"Apply Online"** con URL personalizada por NMLS: `https://aimsmtg.my1003app.com/{NMLS}/register` (aplicación 1003 online, cada originator tiene la suya).
3. **Foto headshot** bajo la intro + **bio genérica de plantilla** (idéntica en todas, no personalizada): "Hello, welcome to my page. I'm here to answer any questions you might have about our products and services. Feel free to contact me to discuss any of your mortgage needs. Your mortgage journey begins here. Getting started on the purchase or refinance of your home is just a few minutes away. No commitment needed." (En la de Jorge hay una errata: "Feel feel to contact me".)
4. **The Loan Process — visual de 6 pasos** (idéntico en todas):
   1. PRE-APPROVAL — "A loan pre-approval sets you up for a smooth home buying experience."
   2. SHOP — "Start working with a real estate agent and viewing homes."
   3. LOAN APPLICATION — "A few documents are needed to get a loan file through underwriting."
   4. LOAN PROCESSING — "Assemble all the necessary paperwork and details for the underwriter."
   5. UNDERWRITING — "They closely evaluate all the documentation in the loan package."
   6. CLOSING — "Documents are drawn and sent to the title company for closing."
5. **About Us** (párrafo corporativo P1 de /about-us/) + Company NMLS 2506467 + Equal Housing.
6. **Bloque de contacto de la empresa** (dirección + teléfono oficina + "Email Us Today").
7. **Footer global** con Loan Options + Resources.

Sin testimonios, sin redes sociales, sin widget de reseñas, sin sidebar, sin calendario de citas.

### David Herrera (detalle completo — /david-herrera/)

- **Título del navegador:** `David Herrera - AIMS Capital Mortgage, LLC`
- **Nombre:** David Herrera. **Cargo:** Mortgage Specialist. **NMLS#: 1459301** (coincide con el NMLS real del cliente).
- **Contacto directo:** email **DHerrera@aimsmtg.com** · teléfono directo **(305) 733-3714** · oficina (305) 440-4374 · 8950 SW 74th CT, Suite 2201 PMB A4, Miami, FL 33156.
- **Foto:** headshot profesional bajo el bloque de intro (formato 250×250 como el resto del equipo).
- **Bio:** la genérica de plantilla citada arriba — no hay bio personalizada, ni años de experiencia, ni especialidades, ni idiomas.
- **CTAs:** "Apply Online" → `https://aimsmtg.my1003app.com/1459301/register` (su 1003 personal) · "Get A Quote" → `/quote/` · "Mortgage Calculator" → `/mortgage-calculator/`.
- **Resto de la página:** bloques 4–7 de la plantilla (Loan Process 6 pasos, About Us, contacto empresa, footer). Sin reseñas propias, sin redes, sin agenda.

**Jorge F. Acosta** (/jorge-f-acosta/): igual plantilla; cargo "Founder / Owner", NMLS 953494, tel. directo (305) 803-0146, jacosta@aimsmtg.com, Apply Online → `.../953494/register`, CTA extra "Email Us Today" (mailto). **Carolina Teijeiro** (/carolina-teijeiro/): igual plantilla; NMLS 2619939, tel. directo (305) 903-4708, Cteijeiro@aimsmtg.com, Apply Online → `.../2619939/register`.

---

### Notas para replicación

1. **Datos maestros de AIMS** (aparecen en footer de todas las páginas): dirección 8950 SW 74th CT, Suite 2201 PMB A4, Miami, FL 33156 · tel. (305) 440-4374 · jacosta@aimsmtg.com / info@aimsmtg.com · Company NMLS 2506467 · Equal Housing Opportunity + sello SSL + "Powered by Vonk Digital".
2. **Footer de dos listas** en todo el sitio — Loan Options (9) y Resources (9), ver informe de elementos globales.
3. **Patrón de conversión transversal:** callout pre-footer "What are your goals? Request A Free Consultation" + "Get Started" → `/quote/` en TODAS las páginas; el funnel multi-step es el destino universal (incluso la página de contacto lo embebe en lugar de un formulario simple).
4. **Para la ficha de David en la nueva web:** AIMS no le da bio real — hay una oportunidad clara de diferenciarse con bio personalizada (YMYL, pendiente de validación del cliente), foto de calidad, teléfono directo (305) 733-3714 y email DHerrera@aimsmtg.com como referencia (verificar con el cliente cuáles usar), y NMLS #1459301 siempre visible junto al nombre (patrón `NMLS#: 1459301`).
5. **Reseñas:** AIMS delega en un widget Elfsight de Google Reviews cargado por JS (client-side), con filtro ≥ 4 estrellas y schema.org activado — y con la trampa de que el Place ID configurado apunta al proveedor de la plataforma, no necesariamente a AIMS. Para DherreraLoans (cero JS cliente, Lighthouse ≥ 95) el equivalente sería reseñas estáticas curadas en build con `schema.org/Review` + enlace saliente al perfil real de Google de David/AIMS, nunca un widget de terceros.
6. **Jerarquía de páginas de confianza:** About (quote del fundador + valores en prosa, sin timeline ni stats) → Team (grid plano nombre/cargo/NMLS) → fichas individuales (plantilla uniforme centrada en conversión con 1003 por NMLS) → Reviews (prueba social) → Contact (funnel). La "historia" de la empresa se cuenta en 8 párrafos de misión/valores, no con hitos.

---

## Síntesis: aimsmtg vs DherreraLoans hoy (huecos a cubrir)

Estado nuestro a 2026-08-07: Fase 1 en producción (12 páginas EN/ES, rutas en `config/routes.mjs`: home, loan-options + 5 programas, quote, calculator, about, contact, privacy, accessibility) y Fase 2 en curso (cuestionario: schemas + steps + motor hechos; calculadora funcional de 1 variante en el ui kit).

| Elemento de aimsmtg | Nuestra web hoy | Hueco / acción propuesta (pendiente de validar con David) |
|---|---|---|
| **Calculadora: 8 pestañas + 5 subvariantes de Affordability** | 1 calculadora (pago mensual de compra) | El hueco más grande. Ampliar por fases con el modelo de datos documentado arriba: 1º Affordability con DTI (subvariantes Conventional/FHA/VA/USDA/Jumbo), 2º Refinance (break-even), 3º Rent vs Buy, 4º VA Purchase/VA Refinance (funding fee por tiers), 5º DSCR y Fix & Flip (perfil inversor). Ratios DTI y defaults son configuración del broker → validar con David. |
| **Cuestionario 20 pasos (16–17 efectivos), auto-avance, ramas purchase/refi** | En construcción (Fase 2, esta rama) — mismo flujo base + estatus migratorio añadido | Coincidimos por diseño. Del original conviene copiar: «(it's OK to estimate)» en cada pregunta de dinero, down payment en %, contacto al final (nombre → email+teléfono con el Submit), pivote purchase/refi con dos tarjetas ilustradas. Mejorar: consentimiento TCPA explícito (aimsmtg no lo tiene). |
| **Un motor, tres envoltorios** (home + `/quote/` + `/mortgage-prequalified/`) | `/quote` existe; el cuestionario aún no está embebido en home | Añadir ruta **Pre-Qualify** (p.ej. `/pre-qualify` · `/precalificacion`) con envoltorio educativo (crédito, carta de precualificación) y embeber el cuestionario también en la home («Tell Us Your Story») y en `/quote`. |
| **Apply Online → POS externo** (Lodasoft my1003app; David tiene URL personal `aimsmtg.my1003app.com/1459301/register`) | No existe | CTA «Apply Online» como enlace saliente al 1003 personal de David — confirmar con el cliente que ese enlace sigue vigente. Nunca formulario propio con datos sensibles. |
| **Catálogo de 11 productos** (8 purchase + 3 refinance) | 5 programas (FHA, Convencional, VA, Primer comprador, Refinanciamiento) | Faltan 6: Fixed Rate (valorar si lo cubre Convencional o separar), USDA, Jumbo, Low Down Payment, Investment Property, Cash-Out Refinance y VA Refinance. La propuesta §4 ya prevé Jumbo/USDA/Investment/Low Down. Hub con grid segmentado Purchase/Refinance. Todo bajo `/loan-options/` (no repetir su incoherencia de URLs). |
| **Reviews** (widget Elfsight client-side, filtro ≥4★) | No existe | Página de reseñas estáticas curadas en build + `schema.org/Review` + enlace al perfil real de Google (su widget además apunta a un Place ID del proveedor, no de AIMS — no imitar). |
| **About + Team + 16 fichas de staff** | `/about` (David) | Nuestra web es personal: no aplica Team. Integrar en About/ficha de David lo mejor de su plantilla: NMLS junto al nombre, teléfono directo, email, CTA Apply Online personal, y el visual **«The Loan Process» de 6 pasos** (Pre-approval → Shop → Application → Processing → Underwriting → Closing). aimsmtg no da bio real a David → nuestra bio personalizada es diferenciación directa. |
| **Contact con cuestionario embebido** | `/contact` | Valorar añadir el cuestionario (o CTA fuerte hacia él) además del contacto directo. |
| **Callout pre-footer universal** («What are your goals?… Get Started» → quote) en todas las páginas | Parcial (CTAs de Fachada) | Candidato a componente global: banda CTA idéntica al final de cada página. |
| **Trío de tarjetas** Request A Quote · Ready To Apply · Mortgage Calculator | No | Candidato para home (cierre) — mapea 1:1 con los tres caminos de conversión. |
| **Learning Center (27 guías) + Blog (semanal, 28 categorías) + newsletter** | No | **Excluidos por acuerdo.** Documentados arriba para cuando toque (la newsletter con «We will never spam you…» es barata de añadir si David la quiere). |
| **Legales** (privacy sin TCPA/CCPA, ADA statement con email del vendor) | `/privacy` + `/accessibility` | Ya los tenemos; los suyos son débiles — no imitar. Nuestra privacy debe cubrir TCPA/consentimiento cuando el cuestionario entre en producción. |
| **Pseudo-español** (GTranslate JS, sin SEO) | ES real con rutas propias y paridad testeada | Ventaja nuestra ya ganada — mantener. |
| **SEO técnico** (sin LocalBusiness/FinancialService, sin og:image, HTML 900 KB) | Lighthouse ≥95 ×4, prerender total | Ventaja nuestra. Hueco explotable: añadir JSON-LD `FinancialService`/`LocalBusiness` con NAP y NMLS cuando salgamos de noindex (Fase 4). |

### Datos de David en aimsmtg (referencia, confirmar con cliente antes de usar)

- NMLS #1459301 (coincide con el nuestro) · email `DHerrera@aimsmtg.com` · teléfono directo `(305) 733-3714` · oficina `(305) 440-4374` · 8950 SW 74th CT, Suite 2201 PMB A4, Miami, FL 33156 · 1003 personal: `https://aimsmtg.my1003app.com/1459301/register` · Company NMLS 2506467 (AIMS Capital Mortgage, LLC).

### Orden sugerido de conversación con el cliente

1. **Calculadoras**: ¿cuáles de las 8 variantes quiere? (las de inversor —DSCR, Fix & Flip— son las más discutibles para una web de leads de vivienda).
2. **Apply Online**: ¿su enlace my1003app sigue activo y es el que quiere usar?
3. **Catálogo**: ¿los 11 productos o un subconjunto? ¿Fixed Rate separado de Convencional?
4. **Pre-Qualify** como página propia: ¿sí o el cuestionario general basta?
5. **Reviews**: ¿tiene perfil de Google propio con reseñas o usamos las de AIMS?
6. **Datos de contacto** definitivos (teléfono/email de la web actual vs nuevos).
