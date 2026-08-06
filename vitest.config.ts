import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
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
