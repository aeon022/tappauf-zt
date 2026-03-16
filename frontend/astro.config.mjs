// Dateipfad: frontend/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

import node from '@astrojs/node';

import markdoc from '@astrojs/markdoc';

export default defineConfig({
  site: 'https://www.tappauf-zt.at',
  // Keystatic braucht SSR oder Hybrid Mode für das Admin-UI
  integrations: [react(), keystatic(), markdoc()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: 'standalone',
  }),
});
