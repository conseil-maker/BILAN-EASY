import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  base: '/',  // IMPORTANT pour Vercel
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: 'all',
  },
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Augmenter la limite d'avertissement
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Séparation intelligente des chunks
        // IMPORTANT: lucide-react doit être avec React pour éviter la dépendance circulaire
        manualChunks: (id) => {
          // Vendors React + lucide-react (même chunk pour éviter dépendance circulaire)
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules/lucide-react')) {
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
    include: ['react', 'react-dom', '@supabase/supabase-js', 'lucide-react'],
    exclude: ['jspdf', 'html2canvas'],
  },
  }
});
