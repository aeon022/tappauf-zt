// Dateipfad: frontend/astro.config.mjs
// Statisch gebaut; Inhalte liest der Build aus Lander (PUBLIC_LANDER_URL). BASE_PATH/OUT_DIR nur für Testserver.
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL || 'https://www.tappauf-zt.at';
const rawBase = process.env.BASE_PATH || '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  site,
  base,
  outDir: process.env.OUT_DIR || './dist',
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
