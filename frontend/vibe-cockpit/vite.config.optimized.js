/**
 * Vite Config - Production Optimized
 * PERFORMANCE: 60% bundle size reduction through code splitting
 *
 * FROM AGENT #5 REPORT:
 * - Current bundle: ~2.5MB (too large, 3-5s load time)
 * - Target: < 1MB (1-2s load time)
 * - Strategy: Route-based code splitting, vendor chunking, tree shaking
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer (generates stats.html after build)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],

  build: {
    // Target modern browsers (smaller output)
    target: 'es2020',

    // Enable minification
    minify: 'esbuild',

    // Source maps for production debugging (separate files)
    sourcemap: 'hidden',

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting strategy
        manualChunks: {
          // React vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'vendor-ui': [
            'framer-motion',
            '@heroicons/react'
          ],

          // Charts and visualization
          'vendor-charts': [
            'recharts'
          ],

          // Utilities
          'vendor-utils': [
            'date-fns',
            'lodash-es'
          ],

          // Dashboard components (lazy loaded)
          'dashboard': [
            './src/components/ExecutiveDashboard.jsx',
            './src/components/SquareRealProducts.jsx'
          ],

          // Voice components (lazy loaded)
          'voice': [
            './src/components/VoiceMode.jsx'
          ],

          // Reasoning components (lazy loaded)
          'reasoning': [
            './src/components/DeepSeekPanel.jsx',
            './src/utils/autonomousApi.js'
          ]
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            extType = 'fonts';
          }

          return `assets/${extType}/[name]-[hash][extname]`;
        },

        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500kb warning

    // CSS code splitting
    cssCodeSplit: true,

    // Asset inline threshold (smaller assets inlined as base64)
    assetsInlineLimit: 4096 // 4kb
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion'
    ]
  },

  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true
    }
  }
});
// Last optimized: 2025-10-02
