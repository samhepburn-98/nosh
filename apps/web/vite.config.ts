import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 5174, so it doesn't clash with other Vite apps on the default 5173. Fails rather than moving.
  server: {
    port: 5174,
    strictPort: true,
    // The API runs separately (apps/api). Same default port as its server.ts.
    proxy: { '/api': `http://localhost:${process.env.API_PORT ?? 3002}` },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
