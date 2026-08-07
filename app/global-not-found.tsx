import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import { routing } from '@/i18n/routing';
import './globals.css';

// Next 16: app/[locale]/not-found.tsx (route-level) SOLO captura llamadas
// explícitas a notFound() dentro de una página que ya matcheó dentro del
// árbol [locale] (p.ej. slug de programa inválido). Para una URL que no
// matchea NINGUNA ruta (p.ej. /en/no-existe), Next nunca entra al árbol
// [locale] — usa el 404 global. global-not-found.js es la convención Next 16
// para ese caso (ver node_modules/next/dist/docs/.../not-found.md, sección
// "global-not-found.js"), pero se renderiza FUERA del layout normal (sin
// NextIntlClientProvider, sin contexto de request de next-intl), así que no
// puede reusar componentes que dependan de next-intl (`Link`, `PageHero`,
// `getTranslations`). Se lee el locale directamente de la cookie NEXT_LOCALE
// que ya fija el middleware de next-intl, y los mensajes se importan
// directamente (mismo patrón que tests/unit/*.test.ts).
const messagesByLocale = { en, es } satisfies Record<string, typeof en>;
type SupportedLocale = keyof typeof messagesByLocale;

async function resolveLocale(): Promise<SupportedLocale> {
  const cookieValue = (await cookies()).get('NEXT_LOCALE')?.value;
  if (cookieValue && Object.hasOwn(messagesByLocale, cookieValue)) {
    return cookieValue as SupportedLocale;
  }
  // Sin cookie válida: intenta Accept-Language (parseo simple, ignora q-values —
  // basta con el primer locale soportado que aparezca en la cabecera).
  const acceptLanguage = (await headers()).get('accept-language') ?? '';
  const preferred = acceptLanguage
    .split(',')
    .map((tag) => tag.trim().split(';')[0]?.split('-')[0]?.toLowerCase())
    .find((lang) => lang && routing.locales.includes(lang));
  if (preferred) return preferred as SupportedLocale;
  return routing.defaultLocale as SupportedLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  return { title: messagesByLocale[locale].notFound.title };
}

export default async function GlobalNotFound() {
  const locale = await resolveLocale();
  const t = messagesByLocale[locale].notFound;

  return (
    <html lang={locale}>
      <body className="min-h-svh bg-navy text-paper antialiased">
        <div className="mx-auto flex min-h-svh w-full max-w-[var(--container-max)] flex-col items-start justify-center gap-6 px-5 lg:px-[72px]">
          <p className="font-sans text-micro font-medium uppercase tracking-label text-azure-light">{t.title}</p>
          <h1 className="max-w-[860px] font-display text-display font-light text-paper [text-wrap:pretty]">{t.heading}</h1>
          <p className="max-w-[560px] font-sans text-[15px] leading-relaxed text-paper-a85 lg:text-lede">{t.body}</p>
          <a
            href={`/${locale}`}
            className="mt-2 inline-flex items-center justify-center font-sans text-btn font-semibold uppercase tracking-button transition hover:brightness-95 bg-paper text-navy px-[26px] py-3.5"
          >
            {t.cta}
          </a>
        </div>
      </body>
    </html>
  );
}
