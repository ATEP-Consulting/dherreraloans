# ADR-0007 — Cuestionario multi-paso: motor declarativo, sessionStorage, analítica por paso

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0004 (flujo de leads)](0004-flujo-de-leads-y-resiliencia.md), [0009 (GA4)](0009-analitica-ga4.md), [0003 (presupuesto JS)](0003-arquitectura-seo-y-rendimiento.md)

> El cuestionario "Get a Quote" es **el componente más importante de la web**: su fiabilidad, velocidad y tasa de finalización son la métrica de éxito del proyecto. Todo trade-off de este ADR se resuelve a favor de la tasa de finalización.

## Contexto y problema

Cuestionario multi-paso, guiado, mobile-first, con lógica condicional (el flujo de compra pregunta distinto que el de refinanciación), preguntas de perfil (objetivo, ubicación, tipo de propiedad, fase, situación laboral, ingresos, credit score, estatus migratorio) y datos de contacto al final, bilingüe. Requisitos derivados: si el usuario recarga no pierde el progreso; cada paso valida antes de avanzar; cada paso emite eventos de analítica para medir el abandono (funnel completo, objetivo declarado del proyecto).

## Factores de decisión

1. **Tasa de finalización**: cada fricción (validación confusa, progreso perdido, latencia) cuesta leads reales.
2. La lógica condicional debe ser legible y modificable (el cliente pedirá ajustar preguntas en las rondas de revisión).
3. Presupuesto JS de la ruta ≤ 170 KB gzip (ADR-0003).
4. Medible: el abandono por paso debe verse en GA4 sin instrumentación ad hoc posterior.

## Opciones consideradas

### Motor del cuestionario

- **A. Configuración declarativa de pasos + `useReducer` (elegida)** — los pasos se definen como datos: `{ id, namespace de textos, schema Zod del paso, visible(estado) }`. La lógica condicional compra/refinancia es una función `visible()` sobre la respuesta "objetivo": añadir/quitar/reordenar preguntas = editar un array, no reescribir un flujo. Un hook propio (`useQuizEngine`) recorre los pasos visibles, valida y persiste. Sin dependencias.
- **B. XState (máquina de estados formal)** — potencia sobrada para un flujo lineal con saltos condicionales simples; añade ~15 KB y una curva conceptual que dificulta los ajustes rápidos en las rondas de revisión. Descartada.
- **C. react-hook-form + wizard** — excelente para formularios densos de una pantalla; el cuestionario es una pregunta (o pocas) por paso, donde el estado controlado simple es más directo y el bundle menor. Descartada.
- **D. Typeform / servicio embebido** — iframe de terceros: rompe Lighthouse, i18n propia, analítica fina, resiliencia del ADR-0004 y la propiedad del código. Descartada.

### Persistencia del progreso

- **A. `sessionStorage` (elegida)** — sobrevive a recargas y navegación interna (el caso real: usuario de Instagram que recarga o va a mirar una página de programa y vuelve); muere al cerrar la pestaña. Datos financieros y de contacto **no** permanecen en dispositivos compartidos/prestados: correcto para YMYL.
- **B. `localStorage`** — sobrevive días; PII financiera persistente en el dispositivo sin caducidad clara. El beneficio (retomar otro día) no compensa el riesgo de privacidad. Descartada.
- **C. Persistencia en servidor (draft)** — requiere almacenamiento e identidad de sesión: complejidad sin free tier claro para un beneficio marginal. Descartada.

## Decisión

1. **Un único client component** montado en la ruta Get a Quote (página estática, el componente hidrata en cliente); chunk propio de la ruta, dentro del presupuesto de 170 KB. La calculadora de hipoteca sigue el mismo patrón (client component puro, sin servidor) pero es independiente del motor del cuestionario.
2. **Pasos declarativos + `useReducer`**, estado `{ respuestas, pasoActual, flujo }`. Flujos: `compra` y `refinancia` comparten preguntas comunes y divergen por `visible()`. El contacto (nombre, apellido, email, teléfono) es **siempre el último paso**, cuando el usuario ya ha invertido esfuerzo (patrón estándar de maximización de finalización).
3. **Validación por paso con Zod**: cada paso tiene su schema; "Continuar" valida solo ese paso (errores localizados, en el idioma activo, sin sustos al final). El schema del payload completo = composición de los schemas de paso y **es el mismo que valida el servidor** (ADR-0004): una sola fuente de verdad de validación, imposible que cliente y servidor diverjan.
4. **Persistencia en `sessionStorage`** tras cada respuesta, con clave versionada (`dhl-quiz-v1`): recarga → rehidratación silenciosa en el paso donde estaba. Cambio de idioma **no** resetea el estado (las respuestas son valores, no textos). Tras envío con éxito se limpia; tras fallo total del envío (503, ADR-0004) se conserva para reintentar sin re-teclear.
5. **UX de resiliencia en el envío**: botón con estado "enviando…" y deshabilitado (anti doble envío), timeout de fetch de 25 s (por encima del peor caso del servidor, ≈ 17 s — ADR-0004) con mensaje claro y botón de reintento; el error nunca borra respuestas. Barra de progreso visible ("paso 3 de 8" recalculado por flujo) — la percepción de avance sostiene la finalización.
6. **Analítica por paso (GA4, ADR-0009)**: `quiz_start` (primer avance), `quiz_step_view {step_id, step_index, flow}`, `quiz_step_complete {…}`, `quiz_complete` (= conversión `generate_lead`). El abandono por paso se lee en GA4 como funnel `step_view` sin `step_complete` posterior: cubre el objetivo "visita → inicio → abandono por paso → lead" sin eventos exóticos. Los `step_id` son estables (renombrar una pregunta no rompe la serie histórica).
7. **Accesibilidad** (gate Lighthouse ≥ 95): inputs con label real, radios/checks nativos estilizados (no divs clicables), foco gestionado al cambiar de paso, `aria-live` para errores, navegable con teclado.

## Consecuencias

### Positivas

- Motor de ~150 líneas propias sin dependencias: cabe en el presupuesto JS, se entiende entero, y los ajustes de preguntas de las rondas de revisión son ediciones de datos, no refactors.
- Validación única cliente/servidor (Zod compartido): el endpoint nunca recibe sorpresas del formulario propio.
- El progreso sobrevive a recargas y al fallo total del backend: el peor caso operativo no cuesta re-teclear (protege la conversión incluso en el desastre).
- Funnel de abandono medible por paso y por flujo (compra vs refinancia) desde el primer día.

### Negativas

- Motor propio = mantenimiento propio (asumido: la alternativa con dependencias cuesta bundle y flexibilidad; el motor es pequeño y estará cubierto por tests unitarios — ADR-0010).
- `sessionStorage` no permite "volver mañana y seguir" (asumido a favor de la privacidad YMYL; el cuestionario dura 2–3 minutos).
- Los eventos por paso dependen de que GA4 cargue (bloqueadores de anuncios): el funnel es direccional, no censo exacto — limitación inherente a GA4, documentada para la lectura de informes (el recuento exacto de leads está en Sheets).
