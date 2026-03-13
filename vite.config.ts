import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react')) return 'vendor-react';
          if (id.includes('recharts')) return 'vendor-charts';
          if (id.includes('three')) return 'vendor-three';
          if (id.includes('motion')) return 'vendor-motion';
          if (id.includes('jszip')) return 'vendor-jszip';
          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
      '/printer-images': 'http://localhost:3000',
    },
  },
});
