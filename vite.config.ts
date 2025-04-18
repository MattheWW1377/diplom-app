import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mimePlugin from './vite-plugin-mime';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    mimePlugin(),
  ],
  server: {
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
  define: {
    'process.env': {}, // Для совместимости, если где-то ещё используется process.env
  },
});