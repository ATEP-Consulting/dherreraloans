# Fase 2.5 — Paridad funcional con aimsmtg: envoltorios de conversión y suite de calculadoras

**Fuente normativa:** `docs/referencia-aimsmtg-desglose-completo.md` (inventario exhaustivo de aimsmtg.com, 2026-08-07). Toda referencia «§desglose» en esta spec y en el plan apunta a ese documento. Los ejecutores DEBEN leerlo antes de implementar: contiene cada campo, default, opción y output de la web de referencia.

## 1. Objetivo

Cerrar la distancia funcional restante con aimsmtg.com antes del pulido de diseño y de la primera demo a David. Tras la Fase 2 (cuestionario real, calculadora P&I, 12 programas, Learn) quedan dos bloques: **envoltorios de conversión** (Pre-Qualify, cuestionario embebido en home y contacto, trío de tarjetas CTA) y **la suite de calculadoras** (aimsmtg tiene 8 pestañas + 5 subvariantes; nosotros 1). Al terminar esta fase, la web tiene paridad funcional con la referencia salvo lo excluido en §7, y el flujo pasa a: pulido de diseño → demo → recortes de David → Fase 3 (pipeline).

## 2. Qué falta exactamente (mapa contra el desglose)

| aimsmtg (§desglose) | Estado nuestro | Esta fase |
|---|---|---|
| `/mortgage-prequalified/` — landing educativa + cuestionario | No existe | **PR D**: ruta `/pre-qualify` · `/precalificacion` |
| Cuestionario embebido en home («Tell Us Your Story») | Home enlaza a `/quote` | **PR D**: sección con `Quiz` embebido |
| Cuestionario embebido en contacto | `/contact` tiene `quoteNudge` (enlace) | **PR D**: `Quiz` embebido bajo los datos directos |
| Trío de tarjetas cierre (Request A Quote · Ready To Apply · Calculator) | No existe | **PR D**: componente `ui/action-cards` en home |
| «Apply Online» → POS 1003 externo | No existe | **PR D**: `APPLY_URL` placeholder en `lib/site.ts` (el real, pendiente de David) |
| Callout pre-footer universal | ✅ `CtaBand` ya en todas las páginas | Nada |
| Calculadora Affordability (5 subvariantes por programa, DTI) | No existe | **PR E** |
| Calculadora Refinance (comparativa + break-even) | No existe | **PR E** |
| Calculadora Rent vs Buy | No existe | **PR E** |
| Calculadora Purchase (con extra payment / early payoff) | Parcial (P&I sin extras) | **PR E**: ampliar la existente |
| Calculadoras VA Purchase y VA Refinance (funding fee por tiers) | No existen | **PR F** |
| Calculadoras DSCR y Fix & Flip (inversor) | No existen | **PR F** |
| Catálogo 11 productos, Learn, footer compliance, legales | ✅ Fase 1/2 (12 programas) | Nada |

## 3. Decisiones de diseño (cerradas)

1. **Un solo motor de cuestionario, N envoltorios** (patrón exacto de aimsmtg, §desglose «Un motor, tres envoltorios»): `components/quiz/quiz.tsx` se reutiliza tal cual en `/quote`, `/pre-qualify`, home y contacto. Cero forks del quiz. La persistencia en `sessionStorage` (`dhl-quiz-v1`) es compartida: empezar en home y seguir en /quote conserva el progreso — es feature, se testea.
2. **Calculadora: una página, pestañas, configuración declarativa.** `/calculator` gana una barra de pestañas (client component, estado local; sin rutas nuevas). Cada variante es (a) funciones puras en `lib/calc/*.ts` con tests, (b) un objeto de configuración de campos, (c) un renderizador común de formulario+resultados. Mismo patrón declarativo que `lib/quiz/steps.ts`. Prohibido duplicar componentes por variante.
3. **Cero dependencias nuevas.** Nada de Chart.js: el donut «Payment Breakdown» de aimsmtg se replica con SVG puro (stroke-dasharray sobre `<circle>`) alimentado por los mismos valores; las barras comparativas, con divs como la barra interés/principal actual. Los sliders espejo de aimsmtg NO se replican (los inputs Money/Percent ya cubren la entrada; decisión de simplicidad).
4. **Defaults y constantes de negocio = los del desglose**, adaptados: property tax 0.6 %, insurance $1 200/año (defaults Florida de aimsmtg, §desglose «Config inyectada»); tiers de VA funding fee (§desglose tabla VA); factores PMI por credit score y ratios DTI permitidos (§desglose Affordability). Los MIP de FHA no confirmados en la referencia se toman del estándar de mercado (upfront 1.75 %, anual 0.55 %) — TODO marcado para validación de David. Todas estas constantes viven en `lib/calc/constants.ts`, un solo archivo, comentadas como «configuración del broker, validar con David».
5. **Copy**: redacción propia EN/ES (paridad de claves testeada), borrador YMYL. Los patrones de copy que sí se imitan (con palabras nuestras): «(it's OK to estimate)», resumen en prosa del resultado, definiciones didácticas (DSCR, cap rate), disclaimer de calculadora (§desglose «Disclaimer de la calculadora»).
6. **`APPLY_URL`** entra en `lib/site.ts` como placeholder obvio (`https://example.com/apply-PENDIENTE`) igual que teléfono/email; la tarjeta «Aplicar online» lo consume. El enlace real de David (`aimsmtg.my1003app.com/1459301/register`, sin confirmar) se documenta en comentario.
7. **La home no se reestructura**: el handoff Fachada sigue siendo la fuente visual. Quiz embebido y trío de tarjetas son secciones ADITIVAS entre el bloque about y el `CtaBand`, con los componentes existentes (`Band`, `SectionHeading`, `Container`).

## 4. Las 8 variantes de calculadora (contratos)

Numeración y datos completos en §desglose «Variantes». Resumen de contratos:

| # | Variante | Módulo `lib/calc/` | Función principal → retorno |
|---|---|---|---|
| 1 | Affordability (Conventional/FHA/VA/USDA/Jumbo) | `affordability.ts` | `affordability(input, program)` → pago mensual desglosado, DTI actual vs permitido, fee del programa |
| 2 | Purchase (+ extra payment) | `purchase.ts` (reusa `mortgage.ts`) | `purchaseBreakdown(input)` → PITI mensual + totales + `earlyPayoff(extra)` → meses ahorrados |
| 3 | Refinance | `refinance.ts` | `refinanceComparison(current, next)` → Δcuota, Δinterés total, meses de break-even |
| 4 | Rent vs Buy | `rent-vs-buy.ts` | `rentVsBuy(input, years)` → serie anual {cashBuy, cashRent, equity, netGain} y año de cruce |
| 5 | VA Purchase | `va.ts` + `purchase.ts` | `vaFundingFeePct(use, downPct, purpose)` → % fee; se financia sobre el principal |
| 6 | VA Refinance | `va.ts` + `refinance.ts` | igual que 3 con fee VA (IRRRL 0.5 %) |
| 7 | DSCR | `dscr.ts` | `dscrMetrics(input)` → {cashFlow, capRate, cashOnCash, dscr, noi, …} |
| 8 | Fix & Flip | `flip.ts` | `flipMetrics(input)` → {equityNeeded, netProfit, roi, ltarv, …} |

Todas puras, sin redondeo interno (regla de `lib/mortgage.ts`), `null` ante input inválido, unit tests con casos numéricos verificados a mano.

## 5. Testing (ADR-0010: proporcional al riesgo)

- **Unit**: cada módulo de `lib/calc/` con casos calculados a mano documentados en el test (una hipoteca de $200 000 al 5 %/30 se comprueba contra $1 073.64, etc.). Paridad i18n cubre los namespaces nuevos automáticamente.
- **e2e**: `prequalify.spec.ts` (envoltorio + quiz responde), ampliar `home.spec.ts` (quiz embebido funciona y comparte progreso con /quote; tarjetas navegan), ampliar `calculator.spec.ts` (cambio de pestaña, un cálculo correcto por variante nueva).
- **Presupuesto JS** (`scripts/measure-first-load.mjs`, metodología ADR-0003): `/quote` sigue ≤ 170 · `/`, `/contact` y `/pre-qualify` ≤ 170 (pagan el chunk del quiz) · `/calculator` ≤ 175 (paga la suite entera). Si `/calculator` excede: separar las variantes de inversor (7-8) a un chunk diferido — única excepción admitida, y se mide igual. Nunca pedir excepción al gate Lighthouse.

## 6. Entrega — 3 PRs secuenciales contra main

1. **PR D — Envoltorios de conversión** (`feat/fase-2-5-envoltorios`): ruta `/pre-qualify`, quiz en home y contacto, `ActionCards`, `APPLY_URL`, messages, e2e. Sin dependencia de PR E/F.
2. **PR E — Calculadoras núcleo** (`feat/fase-2-5-calculadoras-nucleo`): infraestructura declarativa (tabs + renderer + constants) + Affordability + Purchase ampliada + Refinance + Rent vs Buy.
3. **PR F — Calculadoras VA e inversor** (`feat/fase-2-5-calculadoras-avanzadas`): VA Purchase, VA Refinance, DSCR, Fix & Flip. Depende de PR E.

Cada PR: rama → checks verdes (quality + preview Lighthouse ≥ 95 ×4) → squash merge. Commits `tipo: descripción` en español. Ejecución con subagentes + review por task + review final (proceso de Fases 1-2).

## 7. Fuera de alcance (explícito)

- **Reviews**: exige reseñas reales del perfil de Google de David (no existen aún; inventarlas = riesgo YMYL). Entra tras la demo con sus datos. El patrón a seguir quedó en §desglose (estático + `schema.org/Review`, nunca widget).
- **Blog, Learning Center ampliado, newsletter**: acuerdo previo con el cliente.
- **Páginas de equipo/staff**: web personal de David; su ficha es `/about`.
- **Sliders espejo y «Email me this»** de la calculadora aimsmtg (el segundo está muerto incluso en la referencia).
- **Rediseño de home**: solo secciones aditivas (§3.7).

## 8. Riesgos y notas para David (demo)

- Ratios DTI (50/50, 65/65, 29/41), factores PMI, MIP FHA y tarifas DSCR/Flip son **configuración del broker copiada de la referencia o estándar de mercado** — David debe validarlos antes de Fase 4; hasta entonces el disclaimer de la calculadora (borrador propio del patrón §desglose) acompaña a todas las variantes.
- Las calculadoras de inversor (DSCR, Fix & Flip) son las más recortables: si David no atiende ese público, PR F se reduce a las dos VA.
- `APPLY_URL` y las reseñas son los dos datos que bloquean paridad total — preguntar en la demo (lista completa de preguntas: §desglose «Orden sugerido de conversación con el cliente»).
