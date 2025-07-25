import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

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
    // Pre-bundle OpenAI SDK to avoid issues
    include: ['openai']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate OpenAI SDK into its own chunk for better caching
          'openai-sdk': ['openai']
        }
      }
    },
    // Increase chunk size warning limit for OpenAI SDK
    chunkSizeWarningLimit: 1000,
    // Target modern browsers that support crypto.getRandomValues
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
