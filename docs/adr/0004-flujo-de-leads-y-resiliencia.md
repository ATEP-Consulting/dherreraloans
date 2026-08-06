# ADR-0004 — Flujo de leads y resiliencia: Sheets primero, nada bloquea, ningún lead se pierde

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0005 (Resend)](0005-email-transaccional-resend.md), [0006 (Pipedrive)](0006-integracion-pipedrive.md), [0007 (cuestionario)](0007-cuestionario-multi-paso.md)

## Contexto y problema

Cada lead (cuestionario o formulario de contacto) debe registrarse en Google Sheets (fuente de verdad), crearse en Pipedrive, generar email de confirmación al lead y de aviso al propietario, y terminar en pantalla de agradecimiento. **El orden es obligatorio por el anexo técnico de la propuesta y el principio es innegociable: ningún lead se pierde jamás, aunque falle cualquier servicio externo.** Hay que decidir dónde vive la lógica, cómo se manejan los fallos parciales, reintentos, validación, anti-spam y logging. Un lead perdido es, literalmente, el fracaso de la métrica nº 1 del proyecto.

## Factores de decisión

1. Resiliencia: la probabilidad de perder un lead debe ser prácticamente nula incluso con servicios externos caídos.
2. Conversión: la respuesta al usuario debe ser rápida (pantalla de agradecimiento en pocos segundos) y sin fricción anti-spam visible.
3. Free tier: sin colas gestionadas, sin base de datos, sin servicios adicionales (confirmado por el responsable del proyecto).
4. Simplicidad operable por una persona: el fallo debe ser diagnosticable con los logs de Vercel y recuperable a mano desde Sheets.

## Opciones consideradas

### Dónde vive la lógica

- **A. Un route handler serverless `POST /api/lead` (runtime Node) que ejecuta la cadena secuencialmente (elegida)** — un solo lugar, orden garantizado, logs correlacionados, testeable de punta a punta. Ambos formularios (cuestionario y contacto) lo usan con un campo `source` (`quiz` | `contact`).
- **B. Server Action de Next** — equivalente funcional, pero un endpoint HTTP explícito es más fácil de probar (curl/Playwright), de proteger (rate limit) y de mantener agnóstico del árbol de componentes. Descartada.
- **C. Orquestación por colas/eventos (QStash, Inngest, webhooks)** — resiliencia teórica superior (reintentos asíncronos), pero añade un servicio externo más que puede fallar, otra credencial, y complejidad de depuración desproporcionada para ≤ decenas de leads/día. Contradice el factor 3 y 4. Descartada (reevaluable si el volumen lo exige).
- **D. Cliente llama directo a los servicios** — expondría credenciales y perdería el orden y la resiliencia. Inviable.

### Manejo del fallo de Google Sheets (la fuente de verdad)

- **A. Reintentos síncronos y, si aun así falla, continuar la cadena y apoyarse en el email al propietario como persistencia de respaldo (elegida)** — el email de aviso al propietario contiene **siempre el 100% de los datos del lead**, de modo que es en sí mismo un registro duradero. Abortar al fallar Sheets (opción B) perdería el lead con total seguridad; continuar lo conserva por dos canales alternativos (Pipedrive + email).
- **B. Abortar si Sheets falla** — convierte la "fuente de verdad" en un punto único de fallo: exactamente lo contrario del principio. Descartada.

## Decisión

### Cadena (orden obligatorio del anexo técnico)

`POST /api/lead` ejecuta secuencialmente. La función declara `maxDuration: 30` (dentro del límite del plan gratuito de Vercel — ADR-0008); el peor caso teórico con todos los timeouts agotados es ≈ 17 s y el caso típico 2–4 s:

1. **Validación y sanitización** — schema Zod compartido con el cliente (ADR-0007): tipos, enums del cuestionario, formato email/teléfono, longitudes máximas, trim y eliminación de caracteres de control. Payload máximo 32 KB. Entrada inválida → 400 sin tocar servicios (los bots alimentan mucho de este tráfico).
2. **Google Sheets — SIEMPRE primero** — append a la hoja de leads (una fila por lead: timestamp ISO, `lead_id` corto generado, `source`, idioma, todas las respuestas, UTM si llegan). Servicio: cuenta de servicio de Google Cloud (free) con la hoja compartida; **hasta 3 intentos en total, con timeout de 2,5 s por intento y backoff de 0,5 s / 1,5 s entre intentos** (peor caso del paso: 9,5 s). Es el único paso con reintento síncrono: es la fuente de verdad.
3. **Pipedrive** — creación de Person + Deal (detalle en ADR-0006). Timeout 2,5 s, **sin reintento y sin bloquear**: su fallo se loguea (`PIPEDRIVE_FAILED` + `lead_id`) y la cadena continúa. Recuperación: alta manual desde Sheets (fuente de verdad).
4. **Email de confirmación al lead** — Resend, en el idioma del formulario (ADR-0005). Timeout 2,5 s, fallo no bloquea.
5. **Email de aviso al propietario** — Resend, **con el 100% de los datos del lead** y el estado de cada paso anterior; si Sheets falló pese a los reintentos, el asunto lo marca (`⚠️ LEAD NO REGISTRADO EN SHEETS`). Este email es la red de seguridad del sistema: mientras llegue, ningún lead se pierde. Timeout 2,5 s.
6. **Respuesta** → el cliente muestra la pantalla de agradecimiento.

### Contrato de éxito hacia el usuario

- **200 OK** si el lead quedó persistido en **al menos un** canal (Sheets, Pipedrive o email al propietario). El usuario ve agradecimiento; los fallos parciales son problema nuestro, no suyo.
- **Fallo total (los tres canales caídos)** — caso extremo (implica Google, Pipedrive y Resend caídos a la vez): **503 honesto**. La pantalla de error muestra teléfono y botón de WhatsApp ("no pudimos procesar tu solicitud — escríbenos por WhatsApp") y el cliente del cuestionario **conserva las respuestas** (sessionStorage, ADR-0007) para reintentar sin re-teclear. Nunca se finge éxito sin persistencia.

### Anti-spam (sin CAPTCHA visible — la conversión manda)

Confirmado con el responsable: **cero servicios adicionales**. Capas, de fuera adentro:

1. **Honeypot**: campo oculto (CSS, sin `display:none` ingenuo) que los bots rellenan → 200 falso (no se procesa, no se le enseña al bot que falló).
2. **Tiempo mínimo de envío**: el formulario incluye un token firmado (HMAC con secret de servidor) con timestamp de render; envíos < 3 s o con token inválido/caducado (> 24 h) se descartan. Sin estado en servidor.
3. **Validación estricta de dominio de datos** (paso 1): los payloads que no salen de nuestro formulario real rara vez pasan los enums.
4. **Rate limit best-effort en memoria** por IP (5 envíos / 10 min por instancia). En serverless no es fiable entre instancias — se acepta: es una capa, no la defensa.
5. **Escalada documentada** (solo si aparece spam real): primero Upstash Redis para rate limit distribuido; después Cloudflare Turnstile invisible. No se instala nada de esto preventivamente (coste en JS/terceros contra Lighthouse y conversión).

### Logging y observabilidad

- Por lead: `lead_id`, `source`, idioma, resultado y latencia de cada paso (`sheets=ok(1.2s) pipedrive=fail(timeout) email_lead=ok email_owner=ok`). Logs de Vercel.
- **PII**: los logs de operación normal no incluyen respuestas ni datos de contacto (el `lead_id` correlaciona con la fila de Sheets). **Excepción deliberada**: en fallo de persistencia (Sheets KO), el log de error incluye el payload completo — perder un lead es peor que PII en logs privados de acceso restringido. Trade-off explícito y documentado.
- Los reenvíos dobles se mitigan en cliente (botón deshabilitado tras submit) y con dedupe best-effort en memoria (mismo email en < 60 s → se marca `duplicate_suspect` en Sheets en vez de descartarse: ante la duda, un lead duplicado es infinitamente mejor que un lead perdido).

## Consecuencias

### Positivas

- Triple canal de persistencia (Sheets + Pipedrive + email con datos completos): perder un lead exige tres proveedores caídos simultáneamente, y aun entonces el usuario recibe una vía de contacto directa y conserva sus respuestas.
- Cadena secuencial en un solo handler: orden contractual garantizado, un solo sitio que leer cuando algo falla, testeable en E2E con mocks (ADR-0010).
- Anti-spam de coste cero en conversión, JS y servicios.
- Operable por una persona: Sheets es la consola de recuperación; el email marcado en asunto es la alarma.

### Negativas

- Sin cola asíncrona, un fallo de Pipedrive exige alta manual desde Sheets (aceptado: es infrecuente, barato y la fuente de verdad lo cubre; automatizarlo hoy es YAGNI).
- La latencia percibida suma pasos secuenciales (típico 2–4 s; peor caso ≈ 17 s solo si todos los servicios agotan sus timeouts a la vez, escenario rarísimo); mitigación: timeouts agresivos por paso y estado de "enviando…" con feedback en la UI del cuestionario, cuyo fetch espera hasta 25 s antes de ofrecer reintento (ADR-0007).
- El rate limit en memoria es débil por diseño; se asume conscientemente con la escalada documentada.
- El 200 falso del honeypot puede "tragarse" un envío legítimo si un autofill agresivo rellena el campo oculto; mitigación: nombre de campo no autocompletable y test manual con autofill de Chrome/Safari antes de la entrega.
