# Architecture Decision Records — DherreraLoans

Registro de decisiones de arquitectura del proyecto DherreraLoans (web de captación de leads hipotecarios, bilingüe EN/ES). Formato [MADR](https://adr.github.io/madr/): contexto y problema → factores de decisión → opciones consideradas → decisión → consecuencias.

**Principio rector de todas las decisiones:** el objetivo nº 1 de esta versión es *lead generation*. El cuestionario "Get a Quote" es el componente más importante de la web; ningún lead se pierde jamás; SEO y Lighthouse > 95 (compromiso contractual) importan porque traen y convierten tráfico. Cualquier trade-off técnico se resuelve a favor del cuestionario y de la captación.

**Restricciones globales:** free tiers en todos los servicios (el cliente solo paga dominio y su Pipedrive) · contenido YMYL con validación humana obligatoria · plazo de desarrollo 1–2 semanas · el código es propiedad del cliente.

| ADR | Título | Estado |
|---|---|---|
| [0001](0001-stack-y-framework.md) | Stack y framework: Next.js 15 (App Router) | Propuesto |
| [0002](0002-estrategia-i18n.md) | Estrategia i18n EN/ES: rutas prefijadas + next-intl | Propuesto |
| [0003](0003-arquitectura-seo-y-rendimiento.md) | Arquitectura SEO y rendimiento (Lighthouse > 95 contractual) | Propuesto |
| [0004](0004-flujo-de-leads-y-resiliencia.md) | Flujo de leads y resiliencia: Sheets primero, nada bloquea | Propuesto |
| [0005](0005-email-transaccional-resend.md) | Email transaccional: Resend con dominio verificado | Propuesto |
| [0006](0006-integracion-pipedrive.md) | Integración Pipedrive: Person + Deal, no bloqueante | Propuesto |
| [0007](0007-cuestionario-multi-paso.md) | Cuestionario multi-paso: motor declarativo + sessionStorage | Propuesto |
| [0008](0008-hosting-despliegue-ci.md) | Hosting y despliegue: Vercel + previews + Lighthouse CI | Propuesto |
| [0009](0009-analitica-ga4.md) | Analítica GA4: funnel completo de captación | Propuesto |
| [0010](0010-lenguaje-estilado-calidad.md) | TypeScript, Tailwind CSS y estrategia de calidad | Propuesto |

Los estados pasan a «Aceptado» cuando el responsable del proyecto apruebe el conjunto. Las decisiones que dependan de materiales del cliente (dominio definitivo, accesos) se anotan en cada ADR.

**Fuera de alcance de estos ADRs (Fase 2, declarada por el cliente):** blog, sección de reseñas de Google, Learning Center, páginas adicionales de programas. Ninguna decisión de esta fase los bloquea; ninguna arquitectura se diseña "por si acaso" para ellos (YAGNI).
