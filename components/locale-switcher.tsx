'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';

export function LocaleSwitcher() {
  const t = useTranslations('common.localeSwitcher');
  const locale = useLocale();
  const other = locale === 'en' ? 'es' : 'en';
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={t('label')}
      className="rounded border border-slate-300 px-2 py-1 text-sm"
      onClick={() =>
        // pathname es la ruta interna; router la traduce al slug del otro idioma.
        // params conserva [program]; el slug localizado del programa se corrige en Fase 1.
        router.replace({ pathname, params } as never, { locale: other })
      }
    >
      {t(other)}
    </button>
  );
}
