import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale, pathnames } from '@/config/routes.mjs';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // ADR-0002: rutas siempre prefijadas
  pathnames,
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
