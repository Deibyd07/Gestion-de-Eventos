import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@core': path.resolve(__dirname, './src/core'),
      '@events': path.resolve(__dirname, './src/modules/events'),
      '@auth': path.resolve(__dirname, './src/modules/authentication'),
      '@payments': path.resolve(__dirname, './src/modules/payments'),
      '@analytics': path.resolve(__dirname, './src/modules/analytics'),
      '@admin': path.resolve(__dirname, './src/modules/administration'),
      '@organizers': path.resolve(__dirname, './src/modules/organizers'),
      '@users': path.resolve(__dirname, './src/modules/users'),
      '@notifications': path.resolve(__dirname, './src/modules/notifications'),
    },
  },
});
