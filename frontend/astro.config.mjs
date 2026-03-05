// Dateipfad: frontend/astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';

export default defineConfig({
  // Keystatic braucht SSR oder Hybrid Mode für das Admin-UI
  output: 'hybrid', 
  integrations: [keystatic()],
  vite: {
    plugins: [tailwindcss()],
  },
});