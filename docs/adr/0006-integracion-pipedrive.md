# ADR-0006 — Integración Pipedrive: Person + Deal con campos custom, estrictamente no bloqueante

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0004 (flujo de leads)](0004-flujo-de-leads-y-resiliencia.md), [0007 (cuestionario)](0007-cuestionario-multi-paso.md)

## Contexto y problema

Cada lead debe crear automáticamente en el Pipedrive del cliente un contacto (Person) y un negocio (Deal) con los datos del cuestionario y una etiqueta de origen (Cuestionario / Contacto), vía API oficial. Pipedrive es la herramienta de trabajo diaria de David: aquí es donde el lead se convierte en gestión comercial. Hay que decidir el modelado, el mapeo de campos, la gestión del token y el comportamiento ante fallos — siempre subordinado al ADR-0004: Pipedrive **nunca** bloquea la cadena.

## Factores de decisión

1. El lead debe llegar a Pipedrive listo para trabajar: sin abrir Sheets para ver las respuestas.
2. Evitar duplicados: la misma persona puede enviar el cuestionario y el contacto, o repetir.
3. Cuenta y datos son del cliente: mínima invasión en su configuración, credencial revocable.
4. Fallo tolerable: Sheets es la fuente de verdad (ADR-0004); Pipedrive es conveniencia comercial crítica pero recuperable a mano.

## Opciones consideradas

### Modelado en Pipedrive

- **A. Person + Deal con campos custom en el Deal (elegida)** — patrón nativo de Pipedrive: la Person lleva identidad y contacto; el Deal lleva la oportunidad concreta (respuestas del cuestionario) y entra en el pipeline donde David trabaja. Repetir cuestionario = nuevo Deal sobre la misma Person (historial correcto).
- **B. Solo Person con notas** — sin Deal no hay pipeline, sin pipeline no hay gestión comercial: rompe el flujo de trabajo del CRM. Descartada.
- **C. Entidad Lead de Pipedrive (Leads Inbox)** — pensada justo para leads sin cualificar, pero con API más limitada para campos custom y un paso extra de conversión manual a Deal; el cuestionario ya cualifica lo suficiente para entrar como Deal. Descartada (reevaluable si David prefiriese su Leads Inbox al usarlo).

### Mapeo de las respuestas del cuestionario

- **A. Campos custom en el Deal + nota resumen legible (elegida)** — campos custom (filtrables, visibles en la ficha) para los datos estructurados y una nota con el resumen completo formateado (lectura rápida en móvil).
- **B. Todo en una nota** — ilegible para filtros e informes ("¿cuántos leads FHA este mes?"). Descartada.
- **C. Todo en campos custom sin nota** — pierde la lectura de un vistazo. Descartada: la nota cuesta una llamada más y aporta mucho.

## Decisión

1. **API REST oficial de Pipedrive** (v2 donde esté disponible, v1 donde no), llamada directa con `fetch` — sin SDK de terceros (superficie mínima, control de timeouts del ADR-0004).
2. **Credencial**: API token de la cuenta del cliente (quien lo genera y puede revocarlo), en variable de entorno de servidor. Nunca en cliente, nunca en el repo. Documentado en el runbook de entrega cómo rotarlo.
3. **Secuencia por lead** (dentro del paso 3 del ADR-0004, timeout global 2,5 s):
   a. Buscar Person por email (`/persons/search`); si existe, se reutiliza (anti-duplicados). Si no, se crea con nombre, apellido, email, teléfono e idioma.
   b. Crear Deal vinculado: título `{Objetivo} — {Nombre} ({Ciudad})` (p. ej. "Compra — María García (Miami)"), en la primera etapa del pipeline por defecto del cliente.
   c. Campos custom del Deal: objetivo (compra/refinancia), ubicación, tipo de propiedad, fase del proceso, situación laboral, ingresos anuales, credit score (rango), estatus migratorio, idioma del formulario, **origen** (`Cuestionario` / `Contacto`), `lead_id` (correlación con Sheets y logs).
   d. Nota en el Deal con el resumen completo formateado.
4. **Campos custom**: se crean **una sola vez a mano** en el admin de Pipedrive durante el setup (no por API en runtime); sus claves (hashes que asigna Pipedrive) se guardan en un módulo de configuración versionado. El formulario de contacto usa el mismo flujo con los campos que apliquen.
5. **Fallos**: cualquier error (red, 4xx/5xx, timeout) → `catch`, log `PIPEDRIVE_FAILED` con `lead_id` y causa, la cadena continúa (ADR-0004). El email al propietario indica que Pipedrive falló para ese lead → recuperación: alta manual desde Sheets. Sin reintentos automáticos (YAGNI con este volumen; Sheets cubre).
6. **Rate limits**: irrelevantes al volumen esperado (Pipedrive permite miles de peticiones/día); el timeout de 2,5 s protege la cadena si Pipedrive degrada.

## Consecuencias

### Positivas

- El lead llega a Pipedrive listo para trabajar y filtrable (campos custom) y legible (nota), con la Person deduplicada por email.
- `lead_id` en Deal, Sheets, logs y emails: trazabilidad completa de cada lead por los cuatro canales.
- Token del cliente, revocable por el cliente: propiedad y seguridad alineadas con "el código es del cliente".

### Negativas

- Los campos custom creados a mano son un paso de setup manual documentado; si el cliente los borra o renombra, la integración degrada (el error se loguea y Sheets cubre — y el fallo es visible en el email de aviso).
- La búsqueda previa de Person añade una llamada (latencia) por lead; asumido dentro del timeout global.
- Dos llamadas + nota implican que un fallo parcial puede dejar Person sin Deal; el log lo indica y la recuperación manual es trivial (el caso contrario — Deal huérfano — no puede darse por el orden).
- Sin webhook de vuelta ni sincronización bidireccional: lo que David edite en Pipedrive no vuelve a Sheets. Correcto por diseño: Sheets es registro de captación (append-only), Pipedrive es gestión.
