import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import './style.css'
import 'primeicons/primeicons.css'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'
import axios from 'axios';
import ToastPlugin, { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import { useApiKeyStore } from './stores/apiKeyStore';
import { useConversationStore } from './stores/conversationStore';
import { useChatStore, useUserStore } from './stores/modules';
import { useRoleStore } from './stores/roleStore';
import { installPermissions } from './utils/permissions';
import { errorMonitoringService } from './services/errorMonitoringService';

import Swal from 'sweetalert2';

// Import routes
import routes from '@/router'
import { BOTSIFY_AUTH_TOKEN, BOTSIFY_BASE_URL } from './utils/config'
(window as any).Swal = Swal;

// set api key to localStorage
localStorage.setItem('bot_api_key', window.location.pathname.split('/')[2]);


// Import OpenAI debug utility in development
if (import.meta.env.DEV) {
  import('./utils/openai-debug').then(({ OpenAIDebugger }) => {
    // Make debugger available globally in development
    (window as any).OpenAIDebugger = OpenAIDebugger;
    console.log('🔧 OpenAI Debugger available globally as window.OpenAIDebugger');
  });
}


const swalOption = {
  title: "Are you sure?",
  text: "This action is irreversible. Are you sure you want to perform this action?",
  icon: "warning", // updated from `type`
  showCloseButton: true,
  showCancelButton: true,
  confirmButtonColor: "#4473F6",
  cancelButtonColor: "#e7515a",
  confirmButtonText: "Yes, Delete it!",
  cancelButtonText: "No, Keep it",
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
    console.log('📦 localStorage availability check:', isAvailable ? 'Available' : 'Not available');
    
    if (!isAvailable) {
      console.error('⚠️ localStorage is not working properly. Chat history may not be saved.');
    }
    
    // Check for private browsing mode with a smaller test size
    const testData = '0'.repeat(1024); // 1KB instead of 5MB
    try {
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      console.log('✅ localStorage has sufficient space');
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


// Reusable function to make an authenticated GET request with axios
function getBotDetails(apikey: string) {
  return axios.get(
    BOTSIFY_BASE_URL + `/v1/bot/get-data?apikey=${apikey}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOTSIFY_AUTH_TOKEN}`
      }
    }
  )
  .then(response => {
    console.log('ressssss ', response.data);
    
    const apiKeyStore = useApiKeyStore();
    const roleStore = useRoleStore();
    const userStore = useUserStore();
    
    apiKeyStore.setApiKeyConfirmed(true);
    apiKeyStore.setUserId(response.data.data.user.id);

    // Set user role and permissions
    if (response.data.data.user) {
      roleStore.setCurrentUser(response.data.data.user);
      
      // Set whitelabel data if user is a whitelabel client
      if (response.data.data.user.is_whitelabel_client) {
        console.log('🎨 Setting whitelabel data:', response.data.data.user.whitelabel);
        userStore.setWhitelabelData(response.data.data.user);
        // Set favicon if present
        if (response.data.data.user.whitelabel && response.data.data.user.whitelabel.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = response.data.data.user.whitelabel.favicon;
        }
      }
    }

    return response.data.data;
  })
  .catch(error => {
    console.error('API request error:', error);
    return false;
  });
}

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})


router.beforeEach(async (to, from, next) => {
  console.log('Route change:', from.name, '->', to.name);
  
  // Get API key first for role-based routing
  let apikey = localStorage.getItem('bot_api_key') ?? '';
  
  // If we have an API key, get bot details to determine role
  if (apikey && (to.name === 'agent' || to.name === 'conversation' || to.name === 'users')) {
    try {
      const bot = await getBotDetails(apikey);
      if (bot && bot.user) {
        const roleStore = useRoleStore();
        roleStore.setCurrentUser(bot.user);
        
        // Role-based routing logic for live chat agents
        if (roleStore.isLiveChatAgent) {
          // Live chat agents can only access conversation page
          if (to.name === 'agent' || to.name === 'users') {
            console.log('🔄 Live chat agent redirected to conversation page');
            return next({ name: 'conversation' });
          }
          
          // Additional check: if live chat agent tries to access any other page, redirect to conversation
          if (to.name !== 'conversation' && to.name !== 'default') {
            console.log('🔄 Live chat agent redirected to conversation page (general redirect)');
            return next({ name: 'conversation' });
          }
        }
        
        // For agent and conversation pages, load chat data and initialize Firebase
        if (to.name === 'agent' || to.name === 'conversation') {
          // Only load chat data if not already loaded or if coming from a different page
          const chatStore = useChatStore();
          if (!chatStore.chats.length || from.name !== to.name) {
            // Load chats and messages from storage
            if (bot.chat_flow) {
              chatStore.loadChatsFromStorage(bot.chat_flow);
            }
            if (bot.bot_flow) {
              chatStore.loadTemplatesFromStorage(bot.bot_flow);
            }
          }
          
          // Initialize Firebase only once
          const conversationStore = useConversationStore();
          if (!conversationStore.isFirebaseConnected) {
            console.log('🔥 Initializing Firebase in main.ts...');
            try {
              conversationStore.initializeFirebase();
              console.log('✅ Firebase initialized successfully in main.ts');
            } catch (error) {
              console.error('❌ Error initializing Firebase in main.ts:', error);
            }
          }
        }
        
        return next();
      }
    } catch (error) {
      console.error('❌ Error getting bot details:', error);
    }
  }
  
  if (typeof to.name === 'undefined') {    
    return next({ name: 'NotFound' });
  } else {
    return next();
  }
});

// Create pinia store
const pinia = createPinia()

// Create app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)
app.use(ToastPlugin);
installPermissions(app);

window.$toast = useToast({position:'top-right'});
window.$confirm = function (overrideOpt = {}, callback = () => {}) {
  Swal.fire({
    ...swalOption,
    ...overrideOpt,
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
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




// Initialize error monitoring service
errorMonitoringService.initialize();

// mount app
app.mount('#app'); 