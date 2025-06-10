import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: {
      overlay: false
    }
  },
  define: {
    // Fix for crypto.getRandomValues issue with Node.js v16
    __VITE_SKIP_NODE_POLYFILLS__: true
  }
})
