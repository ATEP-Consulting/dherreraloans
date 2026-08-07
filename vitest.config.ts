import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // `buildPageMetadata` llama a `getTranslations` de `next-intl/server`, cuyo export
      // condicional resuelve a un shim de cliente ("not supported in Client Components")
      // salvo bajo la condición `react-server` (la real, que usa Next en RSC). Fijar esa
      // condición de forma global (`ssr.resolve.conditions`) rompe `next/navigation`
      // (usado por `i18n/routing.ts`): bajo `react-server`, `react` resuelve a su build
      // sin `createContext`, que `next/navigation` sí necesita. En vez de eso, apuntamos
      // este specifier directamente al build react-server de next-intl, sin tocar cómo
      // resuelve el resto del árbol (`react`, `next`).
      'next-intl/server': path.resolve(
        __dirname,
        'node_modules/next-intl/dist/esm/development/server.react-server.js',
      ),
      // En build real, `createNextIntlPlugin('./i18n/request.ts')` (next.config.ts) alía
      // `next-intl/config` a ese archivo vía webpack/turbopack (`getNextConfig.js`).
      // Fuera de Next, `next-intl/server` no encuentra esa config; replicamos el alias.
      'next-intl/config': path.resolve(__dirname, 'i18n/request.ts'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // `app/sitemap.ts` → `lib/metadata.ts` → `i18n/routing.ts` importa `createNavigation`
    // de next-intl, que re-exporta `next/navigation`. El paquete `next` no declara
    // `exports` en su package.json, así que la resolución ESM nativa de Node (usada
    // cuando Vitest externaliza el módulo) falla exigiendo la extensión exacta.
    // Forzamos que Vite transforme (inline) estos paquetes en vez de externalizarlos.
    server: { deps: { inline: ['next-intl', 'next'] } },
  },
});
