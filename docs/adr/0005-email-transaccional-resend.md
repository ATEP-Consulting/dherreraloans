# ADR-0005 — Email transaccional: Resend con dominio verificado (SPF/DKIM/DMARC)

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0004 (flujo de leads)](0004-flujo-de-leads-y-resiliencia.md), [0002 (i18n)](0002-estrategia-i18n.md)

## Contexto y problema

El flujo de leads envía dos emails por lead: confirmación al lead (bilingüe, en el idioma en que rellenó el formulario) y aviso al propietario con los datos completos. La propuesta fija Resend en free tier con dominio verificado. Quedan por decidir: configuración de entregabilidad, cómo se construyen las plantillas, idioma y remitentes, y el comportamiento ante fallo.

## Factores de decisión

1. **Entregabilidad**: el email de aviso al propietario es la red de seguridad del principio "ningún lead se pierde" (ADR-0004) — no puede caer en spam.
2. Free tier suficiente: Resend gratuito = 100 emails/día, 3.000/mes → 50 leads/día. Volumen esperado muy por debajo.
3. Bilingüe con los mismos archivos de mensajes que la web (una sola fuente de textos, revisable — YMYL).
4. Mínima superficie: son 2 plantillas; el tooling debe ser proporcional.

## Opciones consideradas

### Proveedor

- **A. Resend (elegida)** — fijado en la propuesta; free tier suficiente; API simple; verificación de dominio con SPF/DKIM guiada. Se valida aquí que no hay razón técnica para contradecir la propuesta: no la hay.
- **B. Amazon SES** — más barato a escala, pero setup (sandbox, IAM) desproporcionado para 2 plantillas y salir del sandbox exige justificación a AWS. Descartada.
- **C. SMTP del proveedor de dominio / Gmail** — entregabilidad y límites imprevisibles; sin API decente. Descartada.

### Construcción de plantillas

- **A. Funciones TypeScript que devuelven HTML (template literals) + versión texto plano (elegida)** — dos plantillas sencillas (tabla de datos + branding mínimo) no justifican un toolchain. HTML de email conservador (tablas, estilos inline, sin imágenes remotas críticas), textos desde `messages/{en,es}.json` namespace `emails`.
- **B. `react-email`** — DX agradable, pero añade dependencia y paso de build para exactamente 2 plantillas estables. YAGNI. Descartada (reevaluable si la Fase 2 multiplica las plantillas).

## Decisión

1. **Resend, SDK oficial**, clave API en variable de entorno de servidor.
2. **Dominio verificado** en Resend sobre el dominio del cliente con **SPF + DKIM** (registros DNS gestionados en el alta, guiando al cliente que aporta el acceso DNS) y **DMARC** (`p=none` la primera semana para observar; luego `p=quarantine`). Sin esto no se lanza: la entregabilidad del aviso al propietario es parte de la resiliencia.
3. **Remitentes**: `From: David Herrera <leads@{dominio}>`; el email al lead lleva `Reply-To` al email real de David (responder al email = hablar con David: cada respuesta es una oportunidad de conversión). El aviso al propietario se envía al email de David con `Reply-To: {email del lead}` — un clic en "Responder" para contactar al lead.
4. **Plantilla al lead** (idioma del formulario): agradecimiento, resumen breve de lo enviado, qué pasará después ("te contactaré en X horas"), datos de contacto y WhatsApp, NMLS + disclaimers del sector en el pie (YMYL también en el email). Texto final validado por el cliente como el resto del contenido.
5. **Plantilla al propietario** (en español, idioma de trabajo de David): asunto `Nuevo lead — {nombre} ({Cuestionario|Contacto}, {EN|ES})` con **todos** los campos en tabla, `lead_id`, y estado de la cadena (Sheets/Pipedrive ok/fallo — ADR-0004). Si Sheets falló: asunto prefijado `⚠️ LEAD NO REGISTRADO EN SHEETS`.
6. **Fallos**: timeout 2,5 s por envío, sin reintento síncrono, no bloquean la cadena; se loguean con `lead_id`. El caso "email al propietario falla" está cubierto porque Sheets ya persistió (y viceversa — ADR-0004).

## Consecuencias

### Positivas

- Cero dependencias de build para email; las plantillas se revisan como texto (flujo YMYL) y viven junto al resto de traducciones.
- Entregabilidad tratada como requisito de resiliencia, no como detalle: SPF/DKIM/DMARC desde el día uno.
- El par Reply-To convierte cada email en un canal de conversación inmediato en ambas direcciones.

### Negativas

- HTML a mano: menos vistoso que plantillas generadas; asumido — el valor del email de confirmación es informativo y de confianza, no estético.
- Dependencia del DNS del cliente para el alta (material requerido antes de activar el flujo real; hasta entonces, se desarrolla con el dominio sandbox de Resend).
- El límite de 100 emails/día (≈50 leads/día) es holgado hoy; si una campaña lo superase, Resend degrada con 429 — el fallo no bloquea la cadena (ADR-0004) y Sheets sigue registrando cada lead, pero se documentará el upgrade de plan como primera acción de escala.
