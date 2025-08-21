
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import './style.css'
import 'primeicons/primeicons.css'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'
import ToastPlugin, { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import { installPermissions } from './utils/permissions';
import { extractApiKey } from './utils/apiKeyUtils';
// @ts-ignore
import VueTelInput from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';
import Swal from 'sweetalert2';

// Import router
import router from '@/router'
(window as any).Swal = Swal;

// Extract and store API key
const apiKey = extractApiKey();
if (apiKey) {
  localStorage.setItem('bot_api_key', apiKey);
}

// Import OpenAI debug utility in development
// if (import.meta.env.DEV) {
//   import('./utils/openai-debug').then(({ OpenAIDebugger }) => {
//     // Make debugger available globally in development
//     (window as any).OpenAIDebugger = OpenAIDebugger;
//     console.log('🔧 OpenAI Debugger available globally as window.OpenAIDebugger');
//   });
// }

const swalOption = {
  title: "Are you sure?",
  text: "Are you sure you want to perform this action?",
  icon: "warning", // updated from `type`
  showCloseButton: true,
  showCancelButton: true,
  confirmButtonColor: "#6D3ADB",
  cancelButtonColor: "#e7515a",
  confirmButtonText: "Yes, Delete it!",
  cancelButtonText: "No, Keep it",
  // customClass: {
  //   cancelButton: 'custom-cancel-btn',
  // },
  animation: false,
};

// Check localStorage availability
function checkLocalStorage() {
  try {
    const testKey = 'botsify_storage_test';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    const isAvailable = testValue === 'test';
    
    // Check for private browsing mode with a smaller test size
    const testData = '0'.repeat(1024); // 1KB instead of 5MB
    try {
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage quota exceeded - may be in private browsing mode or has limited space');
      } else {
        console.warn('⚠️ localStorage may be in private browsing mode or has limited space');
        console.error(e);
      }
      // Don't return false here - localStorage is still functional, just limited
    }
    
    return isAvailable;
  } catch (e) {
    console.error('❌ Error accessing localStorage:', e);
    return false;
  }
}

// Create pinia store
const pinia = createPinia()

// Create app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)
app.use(ToastPlugin);
app.use(VueTelInput);
installPermissions(app);

window.$toast = useToast({position:'top-right'});
window.$confirm = function (overrideOpt = {}, confirmCallback = () => {}, cancelCallback = () => {}) {
  // Handle backward compatibility - if only 2 parameters are passed, treat the second as confirmCallback
  if (typeof confirmCallback === 'function' && typeof cancelCallback !== 'function') {
    // Old signature: (overrideOpt, callback)
    cancelCallback = () => {};
  } else if (typeof confirmCallback !== 'function') {
    // Only one parameter passed: (overrideOpt)
    confirmCallback = () => {};
    cancelCallback = () => {};
  }
  
  Swal.fire({
    ...swalOption,
    ...overrideOpt,
  }).then((result) => {
    if (result.isConfirmed) {
      confirmCallback();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      cancelCallback();
    }
  });
};

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

// mount app
app.mount('#app'); 
