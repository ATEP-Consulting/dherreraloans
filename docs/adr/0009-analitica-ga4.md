# ADR-0009 — Analítica GA4: funnel de captación completo sin sacrificar Lighthouse

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0007 (eventos del cuestionario)](0007-cuestionario-multi-paso.md), [0003 (Lighthouse)](0003-arquitectura-seo-y-rendimiento.md)

## Contexto y problema

La analítica debe medir el funnel de captación de punta a punta — visita → inicio del cuestionario → abandono por paso → lead completado — y las conversiones secundarias (contacto, Apply Online, WhatsApp). Sobre ella se apoyan el informe mensual del plan de mantenimiento y las decisiones de optimización de conversión. La propuesta fija Google Analytics. El problema técnico: el script de GA es de los terceros más pesados que cargará la web y el Lighthouse > 95 es contractual — hay que decidir cómo se carga y qué se mide.

## Factores de decisión

1. El funnel por pasos del cuestionario es el instrumento de mejora de la métrica nº 1 (tasa de finalización).
2. Lighthouse > 95 con GA activo (se mide la realidad — ADR-0003 §8).
3. Atribución del tráfico de Instagram (UTM) para que el cliente sepa qué publicaciones generan leads.
4. Free tier: GA4 estándar es gratuito; Search Console es gratuito.

## Opciones consideradas

### Herramienta

- **A. GA4 (elegida)** — fijado en la propuesta; funnels por pasos (Explorations), conversiones, atribución UTM, integración con Search Console, y es lo que el informe mensual necesita. Se valida que no hay razón para contradecir la propuesta: no la hay.
- **B. Plausible/Umami (ligeros, privacy-first)** — scripts 45× menores, pero de pago o auto-hospedados (rompe free tier), sin funnels equivalentes ni ecosistema que el cliente pueda heredar con cualquier agencia de marketing futura. Descartada.
- **C. GA4 + servidor propio de tags (server-side tagging)** — elimina el peso del cliente, pero requiere infraestructura de pago y complejidad de agencia grande. Descartada.

### Estrategia de carga del script

- **A. `@next/third-parties` (`<GoogleAnalytics>`), carga tras la hidratación (elegida)** — el componente oficial de Next inyecta gtag.js con `strategy="afterInteractive"`: no compite con el contenido en el arranque; el impacto residual en TBT se mide en el gate de CI con GA activo, que es quien tiene la última palabra.
- **B. Partytown (GA en un web worker)** — TBT ~0, pero es un mecanismo frágil (proxying de APIs, bugs conocidos con gtag) que puede corromper silenciosamente la medición: riesgo inaceptable justo en la instrumentación del funnel. Descartada.
- **C. Carga tras primera interacción/idle (lazy manual)** — máximo margen Lighthouse, pero pierde page_views de rebotes rápidos y ensucia la atribución de sesión. **Reserva**: solo si el gate de CI cayese por GA y no hubiese otro recorte posible (mitigación documentada, no default).

## Decisión

1. **GA4** con el componente oficial `@next/third-parties`, cargado en el layout raíz, `afterInteractive`. El ID de medición en variable de entorno pública.
2. **Eventos** (nombres estables, definidos en un módulo tipado único — no strings sueltos por el código):
   - Funnel del cuestionario (ADR-0007): `quiz_start`, `quiz_step_view`, `quiz_step_complete` (params: `step_id`, `step_index`, `flow`), `quiz_complete`.
   - `contact_submit` (formulario de contacto enviado con éxito).
   - `apply_online_click` (cada botón hacia my1003app, con param `placement`: header, home-hero, programa…).
   - `whatsapp_click` (param `placement`).
   - `calculator_use` (primer cálculo en la sesión — señal de intención, alimenta el informe mensual).
3. **Conversiones marcadas en GA4**: `quiz_complete` (mapeado además al evento recomendado `generate_lead`), `contact_submit`, `apply_online_click`, `whatsapp_click`. El funnel visita → `quiz_start` → pasos → `quiz_complete` se monta en Explorations sobre los eventos de paso; el abandono por paso sale de `step_view` sin `step_complete` (ADR-0007 §6).
4. **Atribución Instagram**: convención de UTM documentada para el cliente (`utm_source=instagram&utm_medium=social&utm_campaign={post}`) en los enlaces de bio/posts; GA4 la recoge sin código adicional. Los UTM presentes al enviar el formulario se adjuntan también al lead (Sheets/Pipedrive — ADR-0004): la atribución llega hasta el CRM, no se queda en la analítica.
5. **Privacidad**: audiencia EE. UU. (Florida) — sin banner de consentimiento (no hay GDPR aplicable; GA4 no almacena IP). La Privacy Policy (texto validado por el cliente) declara el uso de GA4. **Condición de revisión explícita**: si el negocio se abriese a tráfico UE/UK o una ley estatal aplicable lo exigiese, se añadiría gestión de consentimiento (Consent Mode) — decisión consciente de no pagar hoy el coste de conversión de un banner que la ley no exige aquí.
6. **Search Console** verificado y enlazado a GA4; sitemaps enviados a Google y Bing (ADR-0003 §3) — cierra el compromiso 2.9 de la propuesta y alimenta el informe mensual de SEO.

## Consecuencias

### Positivas

- Funnel completo de captación medible desde el día uno, por paso y por flujo (compra/refinancia), con conversiones alineadas con los objetivos del cliente.
- La atribución UTM conecta cada lead con la publicación de Instagram que lo trajo — el dato que un negocio de marca personal más agradece.
- El coste de rendimiento de GA está bajo vigilancia contractual permanente (el gate mide con GA activo): si algún día GA rompe el 95, se sabrá en el PR, con la mitigación (carga lazy) ya diseñada.

### Negativas

- gtag.js añade ~75–100 KB comprimidos fuera del bundle propio y algo de TBT: es el mayor coste de rendimiento aceptado del proyecto, y la razón de que el resto de la web tenga presupuestos tan estrictos (ADR-0003 §7).
- Bloqueadores de anuncios silencian GA4 (10–25% del tráfico típico): los números del funnel son direccionales; el censo exacto de leads vive en Sheets (ADR-0007 — limitación documentada para leer el informe mensual con criterio).
- Sin banner de consentimiento, la cobertura legal depende de que la audiencia siga siendo estadounidense — condición de revisión explícita apuntada arriba y en la Privacy Policy.
