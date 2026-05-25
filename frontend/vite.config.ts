import { defineConfig } from 'vitest/config'; 
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss() as any], 
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    silent: true,
    onConsoleLog(log) {
      if (log.includes('React Router Future Flag Warning')) {
        return false;
      }
    },
  },
});