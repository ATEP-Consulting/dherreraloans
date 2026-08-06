# Propuesta de desarrollo web — DherreraLoans

**Cliente:** David Herrera · Loan Originator (NMLS) · Miami, FL (EE. UU.)
**Elaborada por:** ATEP Consulting · www.atepconsulting.com
**Marca:** DherreraLoans (marca personal, no empresa) · IG: @dherrera_loans
**Web de referencia funcional:** https://aimsmtg.com/ (compañía donde el cliente tiene su licencia)
**Plataforma externa de aplicación:** https://aimsmtg.my1003app.com/1459301/register

---

## 1. Resumen del proyecto

Sitio web profesional y bilingüe (inglés / español) para la marca personal DherreraLoans, orientado a la captación de clientes interesados en financiamiento hipotecario en Florida. La web ofrece información sobre programas de préstamo, herramientas para el visitante (calculadora de hipoteca) y un sistema de captación de leads mediante cuestionario interactivo, con integración directa al CRM.

El código es propiedad del cliente. Sin plantillas de terceros ni suscripciones obligatorias.

**Objetivo del cliente:** 1) Lead generation (inicialmente). 2) Service reviews (más adelante, Fase 2).

## 2. Alcance — Fase 1

### 2.1. Páginas (todas en EN y ES)

1. **Home / Inicio** — CTAs destacadas (Apply Online, Get a Quote), servicios, bloques Compra / Refinanciamiento, acceso al cuestionario.
2. **Loan Options** — índice de programas.
3. **5 páginas de programas** — FHA, Convencional, VA, First Time Homebuyer, Refinanciamiento.
4. **Get a Quote** — cuestionario interactivo de captación.
5. **Calculadora de hipoteca** — cuota mensual con desglose principal/intereses.
6. **Sobre mí / About** — perfil profesional, licencia NMLS, IG.
7. **Contacto** — teléfono, email, formulario simple, botón WhatsApp.
8. **Legales** — Privacy Policy, disclaimers del sector, accesibilidad.

El botón **Apply Online** (menú + puntos estratégicos) enlaza a la plataforma externa my1003app. No hay login ni área de cliente: la aplicación de hipoteca ocurre fuera de esta web.

### 2.2. Cuestionario de captación (core del proyecto)

- Multi-paso, guiado, mobile-first, con **lógica condicional** (flujo distinto para comprar vs. refinanciar).
- Preguntas de perfil: objetivo, ubicación, tipo de propiedad, fase del proceso, situación laboral, ingresos anuales, credit score, estatus (residente / ciudadano / extranjero).
- Datos de contacto: nombre, apellido, email, teléfono.
- Bilingüe.

### 2.3. Integraciones y gestión de leads

Ambos formularios (cuestionario y contacto) alimentan el mismo sistema, con etiqueta de origen:

- **Pipedrive (CRM):** creación automática de contacto + negocio vía API oficial.
- **Google Sheets:** registro paralelo permanente de todos los leads.
- **Email de aviso al propietario** por cada lead, con resumen de datos.

### 2.4. Confirmación al cliente final

- Pantalla de agradecimiento tras enviar el formulario.
- **Email automático de confirmación** al lead, desde dominio propio (p. ej. leads@dherreraloans.com).

### 2.5. Bilingüe EN/ES

Selector de idioma visible. Todo el contenido, cuestionario y calculadora en ambos idiomas.

### 2.6. SEO, rendimiento y experiencia móvil — CRÍTICO

- Responsive **mobile-first** (gran parte del tráfico llega desde Instagram, en móvil).
- Pruebas en Chrome, Safari, Edge, iOS y Android.
- SEO on-page bilingüe: títulos, descripciones, encabezados, URLs limpias.
- Carga optimizada: imágenes comprimidas, código ligero.
- Google Analytics.
- **Compromiso de calidad contractual: Lighthouse > 95 en las 4 categorías** (rendimiento, accesibilidad, buenas prácticas, SEO).

### 2.7. Compliance (sector hipotecario EE. UU.)

- Número NMLS individual visible.
- Logo Equal Housing Opportunity.
- Disclaimers legales del sector + Privacy Policy.
- Enlace a NMLS Consumer Access.
- Textos legales proporcionados y validados por el cliente (con su compañía licenciante). Contenido de préstamos = YMYL: validación humana obligatoria antes de publicar.

### 2.8. Google Business Profile (incluido)

Alta y configuración de ficha como "David Herrera — Mortgage Loan Originator": categoría, área de servicio Miami, enlaces a web y aplicación. Base para las reseñas de la Fase 2. La verificación de identidad la completa el titular con nuestra guía.

### 2.9. Medición y seguimiento

- Google Analytics con **seguimiento de conversiones** (cuestionario completado, formulario enviado, clic en Apply Online).
- Google Search Console: alta y verificación.
- Sitemaps enviados a Google y Bing (ambos idiomas).
- Auditoría Lighthouse documentada en la entrega.
- Sobre esta infraestructura se apoya el informe mensual de rendimiento y SEO del plan de mantenimiento (análisis periódico, detección de oportunidades, mejoras mensuales).

## 3. Metodología

- Nosotros redactamos el primer borrador completo de contenidos (ambos idiomas); el cliente revisa sobre la web construida.
- 2 rondas de revisión incluidas.
- Todo contenido sobre préstamos validado por el cliente antes de publicar.

**Materiales del cliente:** dominio, logo y marca, foto profesional, textos legales/disclaimers, accesos (Pipedrive, Google Drive, DNS).

## 4. Fase 2 (futura, no incluida)

Blog · Sección de reseñas de Google · Learning Center · Páginas adicionales de programas (Jumbo, Investment, Low Down Payment).

## 5. Condiciones relevantes para el desarrollo

- Precio cerrado: $1,800 USD (50% inicio / 50% entrega). Mantenimiento: $100/mes (incluye informe mensual SEO) o bolsa 5 h / $200.
- Plazo de desarrollo comprometido: **1-2 semanas** desde inicio + materiales recibidos.
- my1003app es externo: solo se enlaza.
- Servicios en free tier: Resend (email transaccional, dominio verificado), Google Sheets, API Pipedrive (cuenta del cliente).

## 6. Anexo técnico — Flujo de un lead (orden obligatorio)

1. **Registro en Google Sheets** (fuente de verdad: se escribe SIEMPRE, primero).
2. Creación en Pipedrive (con etiqueta de origen; si falla, no bloquea el flujo).
3. Email de confirmación al lead (Resend, dominio verificado).
4. Email de aviso al propietario.
5. Pantalla de agradecimiento.

Principio: **ningún lead se pierde jamás**, aunque falle cualquier servicio externo.
