import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  integrations: [tailwind()],
  adapter: vercel({
    isr: false, // Desativa o Incremental Static Regeneration (força SSR em tempo real)
  }),
});