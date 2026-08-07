import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Dev-only API proxy: mirrors the old next.config.js rewrites() so
      // /api/* calls made against the dev server reach the backend without
      // CORS preflight issues. In production the app calls VITE_API_URL
      // directly (see src/services/api.js), so this is a no-op there.
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          // Split heavy, infrequently-changing vendor libs into their own
          // chunks. They're pulled in by different routes (charts only on
          // Skills/admin pages, markdown only on the blog), so on top of
          // route-level lazy-loading this keeps any single chunk well
          // under the 500kB warning threshold and lets browsers cache
          // each vendor bundle independently of app code changes.
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-charts': ['recharts'],
            'vendor-markdown': ['react-markdown', 'remark-gfm'],
          },
        },
      },
    },
  };
});
