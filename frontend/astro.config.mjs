// Dateipfad: frontend/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';

import node from '@astrojs/node';

import markdoc from '@astrojs/markdoc';

export default defineConfig({
  // Keystatic braucht SSR oder Hybrid Mode für das Admin-UI
  integrations: [keystatic(), markdoc()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: 'standalone',
  }),
});