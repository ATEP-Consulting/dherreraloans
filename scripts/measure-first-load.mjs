// First Load JS gz de una página prerenderizada (metodología ADR-0003, nota 2026-08-07):
// suma el gzip de los chunks <script src> del HTML, excluyendo el polyfill noModule.
// Uso: node scripts/measure-first-load.mjs .next/server/app/en/quote.html
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('Uso: node scripts/measure-first-load.mjs <ruta .next/server/app/**.html>');
  process.exit(1);
}
const html = readFileSync(htmlPath, 'utf8');
const tags = [...html.matchAll(/<script[^>]*src="(\/_next\/static\/[^"]+\.js)"[^>]*>/g)];
let total = 0;
for (const [tag, src] of tags) {
  if (/nomodule/i.test(tag)) continue; // polyfills: solo navegadores legacy
  const bytes = gzipSync(readFileSync(src.replace('/_next/', '.next/'))).length;
  total += bytes;
  console.log(`${(bytes / 1024).toFixed(1).padStart(7)} KB gz  ${src}`);
}
console.log(`\nTOTAL First Load: ${(total / 1024).toFixed(1)} KB gz`);
