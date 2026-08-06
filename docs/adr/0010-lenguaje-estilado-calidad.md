# ADR-0010 — TypeScript estricto, Tailwind CSS y estrategia de calidad proporcional

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0001 (stack)](0001-stack-y-framework.md), [0003 (presupuesto JS/CSS)](0003-arquitectura-seo-y-rendimiento.md), [0008 (CI)](0008-hosting-despliegue-ci.md)

## Contexto y problema

Quedan tres decisiones transversales que los demás ADRs presuponen: lenguaje y rigor de tipos, sistema de estilado (con impacto directo en Lighthouse y en la velocidad de construir mobile-first), y qué se testea en un proyecto de 2 semanas donde no todo puede tener la misma cobertura.

## Factores de decisión

1. Lighthouse > 95: el estilado no puede añadir runtime JS ni CSS muerto.
2. Mobile-first real (el tráfico llega de Instagram en móvil).
3. El flujo de leads no puede romperse en silencio: es donde un bug cuesta leads, la métrica del proyecto.
4. Plazo 1–2 semanas: la calidad se concentra donde el riesgo de negocio está, no se reparte uniforme.

## Opciones consideradas

### Estilado

- **A. Tailwind CSS v4 (elegida)** — CSS final purgado y mínimo (típicamente < 15 KB), cero JS en runtime, mobile-first nativo (breakpoints ascendentes), y es el sistema con mejor DX asistida por IA. Sin librería de componentes encima: los componentes (botones, inputs del cuestionario, tarjetas) son propios, accesibles y pocos.
- **B. CSS Modules** — sin dependencias, pero más lento de escribir para un diseño responsive completo en el plazo dado y sin sistema de diseño implícito (espaciados/colores consistentes). Descartada.
- **C. CSS-in-JS runtime (styled-components/Emotion)** — coste de JS y de render en cliente incompatible con el presupuesto del ADR-0003. Descartada.
- **D. Librería de componentes (MUI, Mantine, DaisyUI…)** — decenas de KB y estética genérica para una web cuyo look es la marca personal del cliente. Descartada; si algún control del cuestionario exigiese accesibilidad compleja (no se prevé: radios, selects e inputs nativos la traen gratis), se evaluaría puntualmente un primitivo headless.

### Tipos y validación

- **A. TypeScript `strict` + Zod en las fronteras (elegida)** — tipos estrictos en todo el código; Zod valida las dos fronteras reales del sistema: entrada del formulario/API (schema compartido cliente-servidor, ADRs 0004/0007) y variables de entorno en el arranque (fallo temprano y explícito si falta una credencial, no un lead perdido en runtime).
- **B. JavaScript + JSDoc** — inaceptable el riesgo de errores tontos en el flujo de leads. Descartada.

### Testing

- **A. Pirámide mínima centrada en el flujo de leads (elegida)** — detalle en la decisión.
- **B. Cobertura amplia con umbral %** — en 2 semanas, testear páginas estáticas roba tiempo al cuestionario y al pipeline; el % global incentiva tests de relleno. Descartada.
- **C. Solo tests manuales** — el flujo de leads cambiará en las rondas de revisión; sin red automática, cada cambio re-arriesga la métrica nº 1. Descartada.

## Decisión

1. **TypeScript `strict: true`** en todo el proyecto; `tsc --noEmit` en CI (ADR-0008). ESLint con `next/core-web-vitals` + Prettier (formato no negociado en PRs).
2. **Tailwind CSS v4**, tokens del diseño (colores de marca del logo, tipografías del ADR-0003 §6, espaciados) definidos una vez en la configuración del tema. Componentes propios y pocos; nada de UI kit.
3. **Zod en las fronteras**: schemas de paso y de payload del cuestionario (compartidos con el servidor) y schema de variables de entorno validado al arrancar cada función.
4. **Testing proporcional al riesgo**, todo en CI (ADR-0008):
   - **Unit (Vitest)**: motor del cuestionario (visibilidad condicional de pasos, reducer, rehidratación), schemas Zod (casos válidos/inválidos/maliciosos), construcción de fila de Sheets, payload de Pipedrive y plantillas de email (funciones puras fáciles de testear por diseño), calculadora de hipoteca (fórmula contra valores conocidos).
   - **E2E (Playwright)**: los caminos que valen dinero — cuestionario completo flujo compra y flujo refinancia (EN y ES) hasta pantalla de agradecimiento, formulario de contacto, y el caso de resiliencia "Sheets caído → el usuario aún ve agradecimiento" con los servicios externos mockeados (interceptación de red; nunca contra servicios reales en CI).
   - **Sin tests** de páginas estáticas de contenido (las cubren el build, Lighthouse CI y la revisión humana YMYL).
5. **Definición de hecho** para cualquier PR: lint + tipos + paridad i18n + tests + build estático + Lighthouse ≥ 95 en verde (la cadena completa del ADR-0008).

## Nota post-aprobación (2026-08-06): componentización obligatoria

Directriz del responsable del proyecto que endurece la decisión 2: **todo elemento visual repetible vive en un componente compartido y todo valor de estilo vive en un token del tema** — botones, inputs, tarjetas, CTAs, secciones, colores, tipografía, espaciados. Ninguna página define estilos ad hoc: un cambio en el token o en el componente debe propagarse a toda la web desde un único punto. Estructura: tokens en la configuración del tema de Tailwind (`@theme` / CSS custom properties) y componentes en `components/ui/`. Los reviewers de cada tarea tratan un botón "suelto" (clases utilitarias repetidas fuera de un componente) como defecto Important.

## Consecuencias

### Positivas

- El estilado aporta ~0 al presupuesto de JS y un CSS mínimo: Lighthouse deja de depender del sistema de estilos.
- Las fronteras validadas con Zod + env-check convierten los errores de configuración (la causa nº 1 de fallos silenciosos en integraciones) en fallos ruidosos de arranque.
- La batería E2E protege exactamente la promesa del proyecto: "el cuestionario convierte y ningún lead se pierde", también durante las rondas de cambios del cliente.
- Tests concentrados = suite rápida (< 2 min) que no frena el ciclo de PRs.

### Negativas

- Sin librería de componentes, cada control se construye (y se hace accesible) a mano — asumido: son pocos y el gate de accesibilidad ≥ 95 los vigila.
- La cobertura deliberadamente desigual deja las páginas de contenido sin tests automáticos propios (riesgo aceptado: su fallo típico — texto/estructura — lo detectan build, Lighthouse y revisión humana).
- Tailwind acopla el markup al estilado (clases utilitarias en JSX): quien herede el código necesita conocer Tailwind — mitigado por ser el estándar de facto actual.
