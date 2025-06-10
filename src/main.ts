import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'

// Import routes
import routes from './router'

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create pinia store
const pinia = createPinia()

// Create app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)

// Mount app
app.mount('#app')