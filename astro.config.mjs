// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://jrtransportesmorochucos.com',
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['jwks-rsa', 'firebase-admin']
    }
  },

  adapter: vercel(),
  integrations: [react()]
});
