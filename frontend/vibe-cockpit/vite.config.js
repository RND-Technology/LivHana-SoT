import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'sunburst', 'treemap', 'network'
    }),
  ],

  build: {
    // Target modern browsers for smaller bundles
    target: 'es2015',

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },

    // Chunk size warning limit
    chunkSizeWarningLimit: 800,

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunk - React ecosystem
          'vendor-react': [
            'react',
            'react-dom',
            'react-router-dom',
          ],

          // MUI Core - Material UI library
          'vendor-mui-core': [
            '@mui/material',
            '@mui/system',
            '@emotion/react',
            '@emotion/styled',
          ],

          // MUI Icons - Separate due to size
          'vendor-mui-icons': [
            '@mui/icons-material',
          ],

          // Charts - Large visualization libraries
          'vendor-charts': [
            'chart.js',
            'react-chartjs-2',
            'recharts',
          ],

          // Animation libraries
          'vendor-animation': [
            'framer-motion',
          ],

          // HTTP client
          'vendor-http': [
            'axios',
          ],
        },

        // Naming pattern for chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/[name]-[hash].js`;
        },

        // Separate CSS files
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    // Source map for production debugging (can disable for smaller builds)
    sourcemap: false,

    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
    exclude: ['@mui/icons-material'],
  },

  // Server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // Preview server configuration
  preview: {
    port: 3000,
    open: true,
  },
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02
