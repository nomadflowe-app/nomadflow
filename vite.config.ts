import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Removido GEMINI_API_KEY por solicitação do usuário
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Core React
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor';
              }
              // Supabase (Database)
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              // UI Libraries (Heavy)
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'ui-vendor';
              }
              // Others
              return 'vendor';
            }
          },
        },
      },
    }
  };
});
