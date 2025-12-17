import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',  // IMPORTANT pour Vercel
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
  },
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Augmenter la limite d'avertissement
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Séparation intelligente des chunks
        manualChunks: (id) => {
          // Vendors React
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          
          // PDF et export
          if (id.includes('jspdf') || 
              id.includes('html2canvas') ||
              id.includes('dompurify')) {
            return 'vendor-pdf';
          }
          
          // Charts et visualisation
          if (id.includes('chart.js') || 
              id.includes('recharts') ||
              id.includes('d3')) {
            return 'vendor-charts';
          }
          
          // Autres vendors
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
    exclude: ['jspdf', 'html2canvas'],
  },
});
