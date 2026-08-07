// Genera las imágenes Open Graph 1200×630 (una por página × idioma) en build-time.
// Diseño: handoff «Fachada» — fondo navy, borde interior hairline, eyebrow + título Spectral + pie con logo.
// Uso: `npm run og` (o `node scripts/generate-og.mjs`).
//
// Las fuentes (Spectral 300, Instrument Sans 500) se descargan de Google Fonts la primera vez
// y se cachean en scripts/.fonts/ (gitignored) para no volver a pegarle a la red en runs siguientes.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { programSlugs } from '../config/routes.mjs';
import { defaultOgSlug } from './og-slug.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(__dirname, '.fonts');
const OUT_ROOT = path.join(ROOT, 'public', 'og');
const MAX_BYTES = 150 * 1024;

const WIDTH = 1200;
const HEIGHT = 630;

const COLOR_NAVY = '#10314A';
const COLOR_PAPER = '#F7F5F0';
const COLOR_AZURE_LIGHT = '#9BC4DF';
const COLOR_BORDER = 'rgba(247,245,240,0.25)';
const COLOR_FOOTER = 'rgba(247,245,240,0.75)';
const FOOTER_TEXT = 'NMLS #1459301 · MIAMI, FL';

const locales = ['en', 'es'];

// Namespaces de mensajes por página (mismo valor que pasa cada page.tsx a buildPageMetadata).
const namespaces = [
  'home',
  'loanOptions',
  ...Object.keys(programSlugs).map((key) => `programs.${key}`),
  'quote',
  'calculator',
  'about',
  'contact',
  'legal.privacy',
  'legal.accessibility',
];

function readMessages(locale) {
  const raw = readFileSync(path.join(ROOT, 'messages', `${locale}.json`), 'utf8');
  return JSON.parse(raw);
}

function getByPath(obj, dottedPath) {
  return dottedPath.split('.').reduce((acc, key) => acc?.[key], obj);
}

async function ensureFont({ cacheKey, family, weight }) {
  const cachePath = path.join(FONTS_DIR, `${cacheKey}.ttf`);
  if (existsSync(cachePath)) return readFileSync(cachePath);

  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  // UA de curl: Google Fonts responde con `format('truetype')` en vez de woff2.
  const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': 'curl/7.79.1' } });
  if (!cssRes.ok) throw new Error(`No se pudo obtener CSS de fuente ${family} ${weight}: HTTP ${cssRes.status}`);
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\((https:[^)]+\.ttf)\)\s*format\('truetype'\)/);
  if (!match) throw new Error(`No se encontró URL truetype para ${family} ${weight} en la respuesta de Google Fonts`);

  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`No se pudo descargar el archivo de fuente ${family} ${weight}: HTTP ${fontRes.status}`);
  const buffer = Buffer.from(await fontRes.arrayBuffer());

  mkdirSync(FONTS_DIR, { recursive: true });
  writeFileSync(cachePath, buffer);
  return buffer;
}

// Lee ancho/alto de un PNG desde su cabecera IHDR (bytes 16-24), sin dependencias.
function readPngSize(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function el(type, props, children) {
  return { type, props: { ...props, children } };
}

function buildMarkup({ eyebrow, title, logoDataUri, logoWidth, logoHeight }) {
  return el(
    'div',
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        position: 'relative',
        backgroundColor: COLOR_NAVY,
        fontFamily: 'Instrument Sans',
      },
    },
    [
      // Borde interior hairline, inset 24px.
      el('div', {
        style: {
          position: 'absolute',
          top: 24,
          left: 24,
          right: 24,
          bottom: 24,
          display: 'flex',
          border: `1px solid ${COLOR_BORDER}`,
        },
      }),
      // Contenido.
      el(
        'div',
        {
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '80px 96px',
          },
        },
        [
          el('div', { style: { display: 'flex', flexDirection: 'column' } }, [
            el(
              'div',
              {
                style: {
                  display: 'flex',
                  fontSize: 22,
                  fontWeight: 500,
                  color: COLOR_AZURE_LIGHT,
                  textTransform: 'uppercase',
                  letterSpacing: '0.26em',
                },
              },
              eyebrow,
            ),
            el(
              'div',
              {
                style: {
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 28,
                  fontFamily: 'Spectral',
                  fontWeight: 300,
                  fontSize: 64,
                  lineHeight: 1.08,
                  color: COLOR_PAPER,
                },
              },
              title,
            ),
          ]),
          el(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              },
            },
            [
              el(
                'div',
                { style: { display: 'flex', fontSize: 22, fontWeight: 500, color: COLOR_FOOTER } },
                FOOTER_TEXT,
              ),
              el('img', {
                src: logoDataUri,
                width: logoWidth,
                height: logoHeight,
                style: { display: 'flex' },
              }),
            ],
          ),
        ],
      ),
    ],
  );
}

async function main() {
  const [spectral300, instrumentSans500] = await Promise.all([
    ensureFont({ cacheKey: 'spectral-300', family: 'Spectral', weight: 300 }),
    ensureFont({ cacheKey: 'instrument-sans-500', family: 'Instrument Sans', weight: 500 }),
  ]);

  const logoBuffer = readFileSync(path.join(ROOT, 'assets', 'img', 'logo-light.png'));
  const logoDataUri = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  const logoNatural = readPngSize(logoBuffer);
  const logoHeight = 80;
  const logoWidth = Math.round(logoHeight * (logoNatural.width / logoNatural.height));

  const fonts = [
    { name: 'Spectral', data: spectral300, weight: 300, style: 'normal' },
    { name: 'Instrument Sans', data: instrumentSans500, weight: 500, style: 'normal' },
  ];

  const messagesByLocale = Object.fromEntries(locales.map((locale) => [locale, readMessages(locale)]));

  let generated = 0;
  const oversized = [];

  for (const locale of locales) {
    const outDir = path.join(OUT_ROOT, locale);
    mkdirSync(outDir, { recursive: true });
    const messages = messagesByLocale[locale];
    const localeLabel = getByPath(messages, 'common.localeSwitcher.' + locale);

    for (const namespace of namespaces) {
      const slug = defaultOgSlug(namespace);
      const title = getByPath(messages, `${namespace}.title`);
      if (!title) throw new Error(`Falta "${namespace}.title" en messages/${locale}.json`);

      const markup = buildMarkup({
        eyebrow: `DHERRERALOANS — ${localeLabel}`,
        title,
        logoDataUri,
        logoWidth,
        logoHeight,
      });

      const svg = await satori(markup, { width: WIDTH, height: HEIGHT, fonts });
      const png = new Resvg(svg, { background: COLOR_NAVY }).render().asPng();

      const outPath = path.join(outDir, `${slug}.png`);
      writeFileSync(outPath, png);
      generated += 1;
      if (png.byteLength > MAX_BYTES) oversized.push(`${locale}/${slug}.png (${(png.byteLength / 1024).toFixed(1)} KB)`);
      console.log(`✅ ${locale}/${slug}.png (${(png.byteLength / 1024).toFixed(1)} KB)`);
    }
  }

  console.log(`\n${generated} imágenes OG generadas en public/og/{en,es}/.`);
  if (oversized.length > 0) {
    console.error(`❌ ${oversized.length} imagen(es) superan ${MAX_BYTES / 1024} KB:`);
    for (const item of oversized) console.error(`  - ${item}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
