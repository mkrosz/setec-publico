import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    isr: false, // Desativa o Incremental Static Regeneration (força SSR em tempo real)
  }),
});