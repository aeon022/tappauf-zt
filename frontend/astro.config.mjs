// Dateipfad: frontend/astro.config.mjs
import { defineConfig } from 'astro/config';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';

const site = process.env.SITE_URL || 'https://www.tappauf-zt.at';
const rawBase = process.env.BASE_PATH || '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;
const enableKeystatic = process.env.NODE_ENV !== 'production' || process.env.ENABLE_KEYSTATIC === 'true';

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [react(), markdoc(), ...(enableKeystatic ? [keystatic()] : [])],
});
