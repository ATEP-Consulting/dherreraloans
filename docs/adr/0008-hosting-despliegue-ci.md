# ADR-0008 — Hosting y despliegue: Vercel free tier, previews por PR, CI con gate de Lighthouse

- Estado: Propuesto
- Fecha: 2026-08-06
- Decisores: ATEP Consulting
- ADRs relacionados: [0001 (stack)](0001-stack-y-framework.md), [0003 (SEO/CI)](0003-arquitectura-seo-y-rendimiento.md), [0009 (GA4)](0009-analitica-ga4.md)

## Contexto y problema

Hace falta hosting con: dominio custom del cliente, HTTPS, CDN para las páginas estáticas, funciones serverless para el flujo de leads, previews por PR (para enseñar avances al cliente durante las 2 rondas de revisión) y coste cero. Y una tubería de CI que haga cumplir los compromisos (Lighthouse > 95, paridad i18n) desde el primer deploy.

## Factores de decisión

1. Coste cero (restricción de la propuesta: el cliente solo paga dominio y Pipedrive).
2. DX con Next.js: deploy sin configuración, previews automáticas por PR con URL compartible.
3. Serverless para `POST /api/lead` con logs consultables (ADR-0004).
4. El gate de Lighthouse necesita una URL real desplegada por PR (ADR-0003).

## Opciones consideradas

- **A. Vercel (plan Hobby) (elegida)** — integración Next.js de referencia: build cero-config, previews por PR con URL única (perfectas para revisar con el cliente), dominio custom con HTTPS automático, funciones serverless con logs, image optimization incluida. ⚠️ Los términos del plan Hobby lo limitan a uso **no comercial**; ver consecuencias.
- **B. Netlify (plan free)** — permite uso comercial en free tier y soporta Next.js vía su runtime oficial, pero ese runtime va un paso por detrás del soporte nativo (App Router avanzado, image optimization) y las previews/funciones requieren más configuración. Es el **plan B designado**.
- **C. Cloudflare Pages (free)** — free tier generosísimo y CDN excelente, pero Next.js requiere el adaptador `next-on-pages`/OpenNext con limitaciones reales (runtime edge, APIs de Node parciales — afecta a googleapis del ADR-0004). Fricción técnica justo en el flujo crítico. Descartada.
- **D. VPS propio** — coste mensual > 0 y mantenimiento de servidor para una web estática: contradice presupuesto y proporcionalidad. Descartada.

## Decisión

1. **Vercel Hobby** como hosting: producción en `main`, preview automática en cada PR. Dominio custom del cliente apuntado a Vercel (DNS guiado en el alta); HTTPS automático.
2. **Riesgo de términos de uso asumido explícitamente**: el plan Hobby es formalmente para uso no comercial y esta es una web comercial de bajo tráfico. Riesgo real pero de impacto acotado: si Vercel lo señalase, la migración es (a) upgrade a Pro ($20/mes, decisión del cliente) o (b) **Netlify free** (permite comercial; mismo repo, cambios de configuración menores al no usarse ninguna API propietaria de Vercel en el código). Esta decisión se toma por presupuesto cerrado y se deja documentada para el cliente en la entrega — no se oculta.
3. **Sin APIs propietarias de Vercel en el código de aplicación** (ni KV, ni Blob, ni `waitUntil`): garantiza que el plan B (Netlify) es una migración de configuración, no de código. (Coherente con ADR-0004: cadena secuencial sin colas.)
4. **CI en GitHub Actions**, en cada PR y por este orden (rápido → lento):
   - `lint` + `typecheck` (ESLint, `tsc --noEmit`);
   - **paridad i18n**: script que compara claves de `messages/en.json` vs `messages/es.json` y falla si divergen (ADR-0002);
   - tests unitarios y E2E con mocks (ADR-0010);
   - build de producción con verificación de que las páginas de contenido son estáticas (ADR-0003 §1);
   - espera a la preview de Vercel y **Lighthouse CI contra la URL de preview**: ≥ 95 en las 4 categorías, móvil, 3 runs — **bloquea el merge** (ADR-0003 §8).
5. **Producción = merge a `main`**; sin entornos adicionales (YAGNI: preview + producción bastan para este tamaño).
6. **Secretos** (Sheets service account, Pipedrive token, Resend API key, HMAC secret anti-spam): variables de entorno en Vercel, con `.env.example` versionado documentando cada una. Nunca en el repo. Las previews usan credenciales de sandbox (hoja de Sheets de prueba, Resend en modo test, Pipedrive sandbox si el cliente lo tiene — o mock) para no ensuciar datos reales del cliente.
7. **Analytics de Vercel: no se activa.** GA4 (ADR-0009) es la analítica del proyecto; dos scripts de medición es pagar dos veces el coste de rendimiento.

## Consecuencias

### Positivas

- Coste cero, previews con URL compartible para las rondas de revisión del cliente, y el gate contractual de Lighthouse ejecutándose sobre infraestructura idéntica a producción desde el PR nº 1.
- El pipeline convierte los tres compromisos de calidad (Lighthouse, paridad bilingüe, páginas estáticas) en checks automáticos: no dependen de memoria ni disciplina.
- Migrabilidad real: repo en GitHub propiedad del cliente + cero APIs propietarias = ni lock-in de plataforma ni de proveedor.

### Negativas

- **El riesgo de términos del plan Hobby existe y queda asumido y documentado**; mitigación preparada (Netlify/Pro) y decisión final de pago trasladada al cliente si el caso se materializa.
- Límites del free tier (100 GB-h de funciones, 100 despliegues/día, duración máxima de función limitada): holgados para este proyecto. El endpoint de leads declara `maxDuration: 30` — dentro del plan gratuito — para acomodar el peor caso de la cadena (≈ 17 s, ADR-0004); si Vercel redujese ese límite, habría que recortar los timeouts por paso.
- Lighthouse CI sobre previews añade ~3–5 min por PR y algo de varianza (mitigada con 3 runs y mediana — ADR-0003).
- Las credenciales sandbox de preview exigen un pequeño setup doble (real + sandbox) documentado en el runbook de entrega.
