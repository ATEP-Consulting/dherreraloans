# Fase 2 — Cuestionario Get a Quote, calculadora funcional y paridad de contenido con aimsmtg

- Fecha: 2026-08-07 · Estado: aprobado en brainstorm (decisiones una a una con el responsable)
- Fuentes: propuesta §2.2/§4 · ADR-0007 (motor) · ADR-0003 (presupuestos) · ADR-0004 (submit futuro) · ADR-0010 (componentización/testing) · `docs/referencia-contenido-aimsmtg.md` (flujo y catálogo VINCULANTES) · sistema Fachada 4a
- Precedente: spec y plan de Fase 1 en este directorio (se heredan idioms, componentes y gates)

## 1. Objetivo

Tres entregables: (a) el cuestionario Get a Quote real — el core del proyecto —, (b) la calculadora de hipoteca funcional, y (c) paridad de contenido con aimsmtg.com: 5 páginas de programa nuevas + página Learn/FAQ. Fuera de alcance: pipeline de leads/emails/CRM (Fase 3), GA4/dominio/indexación/perfiles (Fase 4), blog y reviews (propuesta post-lanzamiento; reviews exige el perfil de Google de Fase 4).

## 2. Decisiones de UX (cerradas en brainstorm)

1. **Granularidad híbrida**: preguntas de selección = 1 por pantalla; solo se agrupan los números afines (precio+entrada; valor+balance+tasa en refi) y el contacto final.
2. **Auto-avance táctil**: en pantallas de selección, tocar una opción la marca y avanza tras ~300 ms de feedback. Solo con puntero/táctil: teclado y lector de pantalla seleccionan y confirman con «Continuar» (siempre visible). «Atrás» siempre disponible.
3. **Progreso**: «GET A QUOTE · PASO X DE Y» en uppercase micro + barra hairline 2px con relleno navy bajo el encabezado del quiz. Y se recalcula por flujo y respuestas (los saltos condicionales cambian el total). Barra `aria-hidden`; el texto es el accesible.
4. **Exigencia con escapes**: todo es obligatorio, pero las preguntas sensibles/estimadas ofrecen salida honesta — ingresos y credit score son rangos con «Prefiero comentarlo contigo»/«No lo sé»; entrada y tasa actual llevan «Aún no lo sé»/«No la recuerdo». El escape es un dato útil para David, no un campo vacío.
5. **Estatus migratorio**: enmarcado por beneficio («me ayuda a identificar los programas correctos — hay opciones con ITIN y para compradores extranjeros»), 5 opciones + escape, penúltimo paso.
6. **Submit pre-Fase 3 = simulación del estado final** (decisión del responsable): botón «enviando…» → pantalla de agradecimiento definitiva («recibido, te contacto en breve»), idéntica a cómo quedará con el pipeline conectado. `submitLead()` es un stub que en Fase 3 se sustituye por el POST real sin tocar UI. **Hasta Fase 3 los leads NO persisten en ningún sitio (modo demo para enseñar a David; producción sigue noindex con placeholders).** La pantalla de gracias incluye, como elemento permanente del diseño (no temporal), CTAs secundarios de WhatsApp/teléfono («si prefieres no esperar») — canal vivo para cualquier visitante real pre-Fase 3.
7. **Calculadora**: 4 campos (precio, entrada $ con % calculado al lado, tasa, plazo 30/20/15), recálculo en vivo sin botón; resultado = cuota P&I grande + barra CSS capital/interés del primer pago + total de intereses + coste total + disclaimer YMYL permanente.
8. **Secciones aimsmtg restantes**: programas + una página Learn/FAQ real (7 guías cortas propias). Pre-Qualify se cubre con Get a Quote (copy) y Apply Online (my1003app). Blog y reviews: propuesta post-lanzamiento para David.
9. **Tono**: voz personal de David, tuteo en ES (establecido en Fase 1). Redacción SIEMPRE propia — nunca copia de aimsmtg (en Fase 1 el review cazó una casi-copia; no repetir). Todo copy es borrador YMYL hasta validación del cliente.

## 3. Cuestionario

### 3.1 Flujo y pasos

Divergencia por `visible(respuestas)` sobre el objetivo (ADR-0007). Compra: 15-16 pantallas; refi: 14-15 (16/15 si militar=sí). El contacto es siempre el último paso.

| id | Tipo | Visible | Pregunta (EN / ES) | Opciones o campos |
|----|------|---------|--------------------|-------------------|
| `goal` | selección | ambos | What brings you here today? / ¿Qué quieres lograr? | Buy a home · Refinance my home / Comprar casa · Refinanciar mi casa |
| `location` | texto | ambos | compra: Where in Florida are you looking to buy? / ¿En qué zona de Florida estás buscando? · refi: Where's the property? / ¿Dónde está la propiedad? | Ciudad o ZIP (texto libre, mín. 2 caracteres) |
| `propertyType` | selección | ambos | What type of property? / ¿Qué tipo de propiedad? | Single-family home · Townhouse · Condo · Multi-unit (2–4) · Other / Casa unifamiliar · Townhouse · Condo · Multi-unidad (2–4) · Otro |
| `stage` | selección | compra | Where are you in the process? / ¿En qué punto del proceso estás? | Just starting to research · Actively looking at homes · Offer accepted · Under contract / Empezando a investigar · Buscando casa activamente · Oferta aceptada · Bajo contrato |
| `use` | selección | ambos | How will you use this property? / ¿Cómo usarás la propiedad? | Primary residence · Second home · Investment / Residencia principal · Segunda vivienda · Inversión |
| `military` | selección | ambos | Have you or your spouse served in the U.S. military? / ¿Tú o tu cónyuge han servido en las fuerzas armadas de EE. UU.? (helper: It can unlock VA loan benefits. / Puede darte acceso a los beneficios del préstamo VA.) | Yes · No / Sí · No |
| `militaryBranch` | selección | military=sí | Which branch? / ¿En qué rama? | Army · Navy · Air Force · Marines · Coast Guard · National Guard or Reserves (nombres propios iguales en ES, salvo «National Guard or Reserves» → «Guardia Nacional o Reservas»: exónimo español estándar; dejarlo en inglés metería un «or» en una lista en español) |
| `hasAgent` | selección | compra | Are you working with a real estate agent? / ¿Trabajas ya con un agente inmobiliario? | Yes · Not yet / Sí · Todavía no |
| `firstTime` | selección | compra | Is this your first home purchase? / ¿Es tu primera compra de casa? (helper: There are programs specifically for first-time buyers. / Hay programas pensados justo para primeros compradores.) | Yes · No / Sí · No |
| `purchaseNumbers` | money ×2 | compra | Your purchase numbers / Tus números de compra | Estimated price / Precio estimado ($) · Down payment available / Entrada disponible ($, escape «I'm not sure yet» / «Aún no lo sé») |
| `refiNumbers` | money ×2 + % | refi | Your current mortgage / Tu hipoteca actual | Estimated property value / Valor estimado ($) · Current loan balance / Balance actual ($) · Current interest rate / Tasa actual (%, escape «I don't remember» / «No la recuerdo») |
| `secondMortgage` | selección | refi | Do you have a second mortgage on the property? / ¿Tienes una segunda hipoteca sobre la propiedad? | Yes · No / Sí · No |
| `cashOut` | selección | refi | Are you looking to take cash out? / ¿Quieres sacar efectivo (cash-out)? (helper: Cash-out uses your equity for renovations, debt, or other goals. / El cash-out usa tu plusvalía para renovaciones, deudas u otras metas.) | Yes · No · Not sure yet / Sí · No · No estoy seguro |
| `employment` | selección | ambos | What's your employment situation? / ¿Cuál es tu situación laboral? | Employed · Self-employed or business owner · Retired · Other / Empleado · Negocio propio o independiente · Jubilado · Otra |
| `income` | selección | ambos | What's your annual household income? / ¿Cuáles son los ingresos anuales de tu hogar? (helper: A range is enough. / Con un rango es suficiente.) | Under $50,000 · $50,000–$100,000 · $100,000–$150,000 · Over $150,000 · I'd rather discuss it with you / Menos de $50,000 · $50,000–$100,000 · $100,000–$150,000 · Más de $150,000 · Prefiero comentarlo contigo |
| `credit` | selección | ambos | How's your credit? / ¿Cómo está tu crédito? (helper: An estimate is fine — nothing is checked here. / Con una estimación basta — aquí no se consulta tu crédito.) | Excellent (740+) · Good (680–739) · Fair (620–679) · Needs work (below 620) · I don't know / Excelente (740+) · Bueno (680–739) · Regular (620–679) · Necesita trabajo (menos de 620) · No lo sé |
| `history` | selección | ambos | Any bankruptcy or foreclosure in your past? / ¿Has tenido bancarrota o foreclosure? (helper: It doesn't disqualify you — it just changes which programs fit. / No te descalifica — solo cambia qué programas encajan.) | No · Yes, more than 4 years ago · Yes, within the last 4 years / No · Sí, hace más de 4 años · Sí, en los últimos 4 años |
| `status` | selección | ambos | Which best describes your status in the U.S.? / ¿Cuál describe mejor tu estatus en EE. UU.? (helper: This helps me match you with the right programs — there are options with ITIN and for foreign buyers. / Me ayuda a identificar los programas correctos — hay opciones con ITIN y para compradores extranjeros.) | U.S. citizen · Permanent resident · Work visa or permit · Other status (ITIN / foreign national) · I'd rather discuss it with you / Ciudadano de EE. UU. · Residente permanente · Visa o permiso de trabajo · Otro estatus (ITIN / extranjero) · Prefiero comentarlo contigo |
| `contact` | campos ×4 | ambos | Last step — where do I send your numbers? / Último paso — ¿dónde te mando tus números? | First name · Last name · Email · Phone / Nombre · Apellido · Email · Teléfono. CTA: Send my request / Enviar mi solicitud |

Bajo el submit, micro-línea de consentimiento (borrador legal, David valida): «By sending, you agree that David Herrera may contact you about your request by phone, text, or email.» / «Al enviar aceptas que David Herrera te contacte sobre tu solicitud por teléfono, mensaje o email.»

**Pantalla de gracias** (definitiva, no cambia en Fase 3): «Got it, {nombre}. Your request is in — I'll review your numbers and reach out shortly, usually the same day.» / «Recibido, {nombre}. Tu solicitud está dentro — reviso tus números y te contacto en breve, normalmente el mismo día.» + «If you'd rather not wait / Si prefieres no esperar»: CTAs WhatsApp (deep link) y teléfono + enlace a Loan Options. Tras éxito se limpia `sessionStorage`.

### 3.2 Motor (ADR-0007, sin desviaciones)

- `lib/quiz/steps.ts` — pasos declarativos `{ id, tipo, visible(respuestas), opciones }`. Ids estables (serán la serie histórica GA4 en Fase 4). Ajustar preguntas en rondas de revisión = editar este array.
- `lib/quiz/schema.ts` — Zod por paso; payload completo por composición. **Es el schema que reutilizará el servidor en Fase 3** (fuente única de validación). Valores = claves enum (`"buy"`, `"fha"`…), nunca textos → cambiar de idioma a mitad no resetea nada.
- `lib/quiz/engine.ts` + hook `useQuizEngine` — reducer `{ respuestas, pasoActual }`; lista de pasos visibles derivada; progreso X/Y por flujo.
- **Persistencia**: `sessionStorage` clave versionada `dhl-quiz-v1` tras cada respuesta; rehidratación silenciosa al montar. Storage corrupto o versión distinta → empezar de cero sin error visible. Storage inaccesible (modo privado estricto) → fallback en memoria (el quiz funciona, no persiste).
- **Un único client component** (`components/quiz/`) montado en `/quote`; la página sigue estática con `PageHero` (regla innegociable) y el quiz inmediatamente debajo, sustituyendo a las secciones-shell de Fase 1. El copy del hero de `/quote` se actualiza: desaparece «coming online shortly» y se nombra la precalificación (cobertura del concepto Pre-Qualify de aimsmtg).
- **Textos fuera del bundle**: la página servidor lee messages y pasa al quiz un objeto estructurado de textos como prop; el client component no importa next-intl. El copy viaja una vez en el HTML estático, no en JS. Los mensajes de error Zod se mapean por código a textos del mismo objeto.
- **Submit**: `lib/quiz/submit.ts` expone `submitLead(payload, transport?)`. Fase 2: valida con el schema completo, simula latencia (~600 ms) y resuelve éxito. La UI de fallo se construye ya (ADR-0007 §5: botón deshabilitado anti doble envío, timeout, mensaje claro + reintento, el error nunca borra respuestas) y se testea inyectando un transporte que falla. Fase 3 = cambiar el stub por el POST real.
- **A11y** (gate Lighthouse): radios/checks nativos estilizados como tarjetas (no divs clicables), foco al heading del paso en cada cambio, errores con `aria-live`, navegación completa por teclado.
- **Transiciones**: CSS ~200 ms (fade/slide sutil), `prefers-reduced-motion` → sin animación.
- GA4 queda fuera (Fase 4): no se añade `track()` ni wiring — el contrato son los ids estables de paso.

## 4. Form controls — primeros del ui kit

`components/ui/form/`, lenguaje Fachada estricto (radius 0, bordes 1px, sin sombras, tokens): `Field` (label + hint + error), `ChoiceCard` (radio-tarjeta; seleccionada = borde navy + fondo sand), `TextInput`, `MoneyInput` (formateo en vivo, `inputmode="numeric"`), `PercentInput`, `SelectField` (select nativo estilizado), `CheckEscape` (checkbox «Aún no lo sé» que deshabilita su campo; en el payload el escape viaja como valor enum propio — p. ej. `"unsure"` en lugar del número — nunca como null ambiguo). Tokens nuevos en `@theme`: `--color-error` (rojo ladrillo acorde a paleta, contraste AA ≥ 4.5:1 sobre paper — validar valor exacto en implementación) y estilo de foco visible navy. Estos controles son los que reutilizará el formulario de contacto en Fase 3: cero estilos ad hoc (ADR-0010).

## 5. Calculadora

- `lib/mortgage.ts` — funciones puras: cuota P&I (`M = P·r/(1−(1+r)^−n)`), desglose capital/interés del primer pago, total de intereses y coste total. **No existe fórmula testeada en el repo** (el shell de Fase 1 muestra valores estáticos en messages): función y tests son trabajo nuevo. Casos: valores conocidos, tasa 0 (degenera a lineal, sin división por cero), entrada ≥ precio.
- Client component `components/calculator/` en `/calculator` bajo el hero, reutilizando los form controls del §4. Recálculo en vivo; formateo `Intl.NumberFormat` por locale; entrada muestra el % equivalente junto al $.
- Resultado: cuota en display grande (Spectral), barra CSS capital/interés, total de intereses, coste total. Campos vacíos/incompletos → «—» (nunca NaN); entrada ≥ precio → error inline.
- Disclaimer permanente (YMYL): «Estimate for educational purposes only. Principal & interest — excludes taxes, insurance, and HOA. Not a loan offer or a pre-qualification.» / «Estimación educativa. Solo capital e intereses — no incluye taxes, seguro ni HOA. No es una oferta de préstamo ni una precalificación.»
- La sección «ejemplo» estática del shell se elimina (la sustituye la calculadora real); se conserva la sección explicativa.

## 6. Paridad de contenido con aimsmtg

### 6.1 Cinco programas nuevos (template existente, redacción propia)

Claves y slugs en `config/routes.mjs` (`programSlugs`), namespaces `programs.{key}` completos ×2 idiomas con el esquema de Fase 1 (hero beneficio-primero, intro, «¿Qué es?», «¿Qué se requiere?», «Cómo funciona» en bullets, `indexName`, `stat`):

| Clave | Slug EN / ES | Ángulo del copy | stat índice |
|-------|--------------|-----------------|-------------|
| `fixedRate` | `fixed-rate-mortgage` / `hipoteca-tasa-fija` | Previsibilidad: la misma cuota todo el plazo | 30 · 20 · 15 años |
| `usda` | `usda-loans` / `prestamos-usda` | 0% de entrada en zonas elegibles (rural/suburbano) | 0% entrada |
| `jumbo` | `jumbo-loans` / `prestamos-jumbo` | Montos por encima del límite conforming | Montos altos |
| `lowDownPayment` | `low-down-payment` / `entrada-baja` | Paraguas de opciones desde ~3% de entrada | Desde 3% |
| `investment` | `investment-property-loans` / `prestamos-de-inversion` | Financiar propiedades de renta; califica la propiedad, no solo el ingreso | Para inversores |

Cifras en genérico prudente (David valida). Home (itera `programSlugs` → 10 filas automáticas), índice loan-options, sitemap, `MortgageLoan` + `BreadcrumbList` JSON-LD y metadata OG derivan todo de la fuente única. OG PNGs: 26 → 38 (`npm run og`; la guardia de sincronía testeada de Fase 1 obliga).

### 6.2 Página Learn/FAQ

- Ruta nueva `/learn` (EN) · `/aprende` (ES) en `config/routes.mjs`; enlace «Learn / Aprende» en nav desktop, mobile-nav y footer.
- Estructura: `PageHero` + 7 guías cortas (patrón Container/SectionHeading de Fase 1, sin client components): el proceso de compra paso a paso · pre-qualified vs pre-approved · qué mira un lender en tu crédito · cuánta entrada necesitas de verdad · comprar con ITIN o siendo extranjero · cuándo tiene sentido refinanciar · qué son los costes de cierre.
- JSON-LD `FAQPage` (nuevo builder en `lib/jsonld.ts`). Metadata + OG como cualquier página.
- Es la semilla honesta del futuro Learning Center; cubre el concepto «Learn» de aimsmtg con contenido real.

## 7. Testing (ADR-0010: proporcional al riesgo)

- **Unit (Vitest)**: fórmula de hipoteca (valores conocidos, tasa 0, entrada ≥ precio) · engine (reducer, `visible()` ambos flujos, recálculo de progreso, rehidratación, storage corrupto, versión distinta) · schemas Zod por paso y payload (válidos/inválidos/maliciosos) · invariantes de `steps.ts` (ids únicos, contacto último en ambos flujos, todo paso alcanzable). Los tests existentes de paridad i18n, rutas, sitemap, metadata y OG se extienden solos con las claves/rutas nuevas.
- **E2E (Playwright)**: cuestionario completo ×4 (compra/refi × EN/ES) hasta la pantalla de gracias con submit simulado · recarga a mitad → retoma en el mismo paso con respuestas intactas · transporte que falla inyectado → mensaje de error + reintento sin perder respuestas · calculadora: teclear valores conocidos → cuota esperada · Learn y programas nuevos cubiertos por `check:static` + smoke existente.
- **Gates por PR** (sin cambios): lint · `next typegen` + `tsc` · unit · build · `check:static` (26 → 38 rutas) · e2e · Lighthouse ≥ 95 ×4 en preview. `skipAudits` no se tocan.

## 8. Presupuesto JS (ADR-0003 §7 + nota re-baseline)

- `/quote`: ≤ 170 KB gz First Load. Baseline actual 149 KB + código propio del quiz (motor ~150 líneas + controles + pantallas; estimación +8-14 KB gz) + Zod → estimación total ~163-169 KB: bajo el techo pero justo. **Se mide en el PR** con la metodología de la nota del ADR-0003 (suma gzip de los chunks referenciados por el HTML pre-renderizado). Si rozara el techo, el orden de recorte es: importar `zod/mini` en cliente → validadores propios por paso con la misma interfaz de schema (el servidor de Fase 3 seguiría usando Zod completo) → simplificar transiciones/formateo. Nunca pedir excepción al gate.
- **Zod es la única dependencia nueva del proyecto** (verificado: hoy no está en package.json). La eligieron los ADRs 0007/0010 como fuente única de validación cliente/servidor; se añade en el PR B y su coste en cliente (~6-14 KB gz según se importe `zod/mini` o el core) se contabiliza dentro del presupuesto de `/quote`.
- `/calculator`: fuera del presupuesto especial — debe quedar dentro del baseline operativo (~149-164 KB); su chunk es pequeño (fórmula + un componente, sin Zod).
- Páginas de contenido nuevas: cero client components → baseline intacto.

## 9. Entrega — 3 PRs secuenciales contra main (nada de ramas apiladas)

1. **PR A — Form controls + calculadora**: tokens nuevos, `components/ui/form/`, `lib/mortgage.ts` + unit, calculadora funcional + e2e. Establece el patrón de client component y mide su coste real de JS.
2. **PR B — Cuestionario**: `lib/quiz/*`, `components/quiz/*`, `/quote` real, submit simulado, unit + e2e completos. (Depende de los controles del PR A.)
3. **PR C — Paridad de contenido**: 5 programas + Learn/FAQ + rutas/OG/nav/JSON-LD. Independiente en código, secuencial en flujo.

Cada PR: rama feature → checks verdes (quality + preview Lighthouse) → squash merge → siguiente. Commits `tipo: descripción` en español. Ejecución con subagentes + review por task + review final de rama (proceso de Fase 1).

## 10. Riesgos y notas para David

- **Los leads del cuestionario no persisten hasta Fase 3** (decisión explícita: simular el estado final para la demo). Producción sigue noindex con teléfono/email placeholder; el riesgo de un lead real perdido se mitiga con los CTAs permanentes de WhatsApp/teléfono en la pantalla de gracias.
- Todo el copy nuevo (programas, Learn, preguntas del quiz, consentimiento, disclaimer de la calculadora) es **borrador YMYL** pendiente de validación del cliente; el consentimiento del submit es además texto legal que David debe validar con su compañía.
- La pregunta de estatus migratorio es sensible: framing por beneficio + escape, y la respuesta viaja como clave enum (nunca texto libre).
