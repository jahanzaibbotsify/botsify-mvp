import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: {
      overlay: false
    }
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'dayjs',
      'marked',
      'highlight.js'
    ],
    exclude: [
      'firebase',
      'sweetalert2',
      'vue-toast-notification'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core Vue libraries
          'vue-core': ['vue', 'vue-router', 'pinia'],
          
          // UI and styling libraries
          'ui-libs': ['primeicons', '@fontsource/ubuntu'],
          
          // Utility libraries
          'utils': ['axios', 'dayjs', 'marked', 'highlight.js'],
          
          // Heavy libraries (separate chunks)
          'firebase': ['firebase'],
          'sweetalert': ['sweetalert2'],
          'toast': ['vue-toast-notification'],
          
          // OpenAI SDK (if used)
          'openai': ['openai']
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            if (facadeModuleId.includes('node_modules')) {
              return 'vendor/[name]-[hash].js'
            }
            return 'chunks/[name]-[hash].js'
          }
          return 'chunks/[name]-[hash].js'
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && /\.(css)$/.test(assetInfo.name)) {
            return 'assets/[name]-[hash].[ext]'
          }
          if (assetInfo.name && /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      },
      // External dependencies that shouldn't be bundled
      external: [],
      // Tree shaking optimization
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Target modern browsers
    target: 'es2020',
    // Enable source maps for debugging
    sourcemap: false,
    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
        pure_funcs: ['console.log'] // Remove console.log in production
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // CSS optimization
  css: {
    postcss: {
      plugins: [
        // Add autoprefixer for better browser compatibility
        require('autoprefixer')
      ]
    }
  }
})
