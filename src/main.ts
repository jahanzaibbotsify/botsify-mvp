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

// Check localStorage availability
function checkLocalStorage() {
  try {
    const testKey = 'botsify_storage_test';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    const isAvailable = testValue === 'test';
    console.log('📦 localStorage availability check:', isAvailable ? 'Available' : 'Not available');
    
    if (!isAvailable) {
      console.error('⚠️ localStorage is not working properly. Chat history may not be saved.');
    }
    
    // Check for private browsing mode
    const remainingSpace = 5 * 1024 * 1024; // 5MB
    const testData = '0'.repeat(remainingSpace);
    try {
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      console.log('✅ localStorage has sufficient space');
    } catch (e) {
      console.warn('⚠️ localStorage may be in private browsing mode or has limited space');
      console.error(e);
    }
    
    return isAvailable;
  } catch (e) {
    console.error('❌ Error accessing localStorage:', e);
    return false;
  }
}

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

// Check localStorage before mounting
const localStorageAvailable = checkLocalStorage();
if (!localStorageAvailable) {
  // Display warning in UI
  const warningDiv = document.createElement('div');
  warningDiv.style.position = 'fixed';
  warningDiv.style.top = '0';
  warningDiv.style.left = '0';
  warningDiv.style.right = '0';
  warningDiv.style.backgroundColor = '#f44336';
  warningDiv.style.color = 'white';
  warningDiv.style.padding = '10px';
  warningDiv.style.textAlign = 'center';
  warningDiv.style.zIndex = '9999';
  warningDiv.textContent = 'Warning: Local storage is not available. Your chat history may not be saved.';
  document.body.appendChild(warningDiv);
}

// Mount app
app.mount('#app')