
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import './style.css'
import 'primeicons/primeicons.css'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'
import ToastPlugin, { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import { useBotStore } from './stores/botStore';
import { useConversationStore } from './stores/conversationStore';
import { useChatStore } from './stores/chatStore';
import { useRoleStore } from './stores/roleStore';
import { useWhitelabelStore } from './stores/whitelabelStore';
import { installPermissions } from './utils/permissions';
import { extractApiKey, getCurrentApiKey } from './utils/apiKeyUtils';

import Swal from 'sweetalert2';

// Import routes
import routes from '@/router'
import { axiosInstance } from './utils/axiosInstance'
(window as any).Swal = Swal;

// Extract and store API key
const apiKey = extractApiKey();
if (apiKey) {
  localStorage.setItem('bot_api_key', apiKey);
}

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
    // console.log('📦 localStorage availability check:', isAvailable ? 'Available' : 'Not available');
    
    if (!isAvailable) {
      console.error('⚠️ localStorage is not working properly. Chat history may not be saved.');
    }
    
    // Check for private browsing mode with a smaller test size
    const testData = '0'.repeat(1024); // 1KB instead of 5MB
    try {
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      // console.log('✅ localStorage has sufficient space');
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
  return axiosInstance.get(`/v1/bot/get-data?apikey=${apikey}`)
  .then(response => {
    // console.log('ressssss ', response.data);
    
    const roleStore = useRoleStore();
    const whitelabelStore = useWhitelabelStore();
    
    // Set user role and permissions
    if (response.data.data.user) {
      roleStore.setCurrentUser(response.data.data.user);
      
      // Set whitelabel data if user is a whitelabel client
      if (response.data.data.user.is_whitelabel_client) {
        // console.log('🎨 Setting whitelabel data:', response.data.data.user.whitelabel);
        whitelabelStore.setWhitelabelData(response.data.data.user);
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
    const botStore = useBotStore();
    botStore.setApiKeyConfirmed(true);
    botStore.setBotId(response.data.data.bot.id);
    botStore.setUser(response.data.data.user);  
    botStore.setBotName(response.data.data.bot.name);

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
  // Handle Unauthenticated route - allow it to render without any checks
  if (to.name === 'Unauthenticated') {
    console.log('🔓 Rendering Unauthenticated page');
    return next();
  }

  // Handle NotFound route - allow it to render without any checks
  if (to.name === 'NotFound') {
    console.log('❌ Rendering NotFound page');
    return next();
  }

  if (to.name === 'agent' || to.name === 'conversation') {
    const botStore = useBotStore();
    const roleStore = useRoleStore();
    const storeApiKey = botStore.getApiKey;
    const localApiKey = getCurrentApiKey();
    
    console.log('🔍 API Key Debug:', {
      storeApiKey,
      localApiKey,
      routeName: to.name,
      routeParams: to.params
    });
    
    let apikey = storeApiKey || localApiKey || '';
    
    // Check if route has a different API key than localStorage
    if (to.name === 'agent' && to.params.id) {
      const routeApiKey = to.params.id as string;
      const currentApiKey = localApiKey || storeApiKey || '';
      
      // If route API key is different from current API key, update it
      if (routeApiKey && routeApiKey !== currentApiKey && routeApiKey !== 'undefined' && routeApiKey !== 'null') {
        console.log('🔄 Route API key differs from localStorage, updating...', {
          routeApiKey,
          currentApiKey
        });
        apikey = routeApiKey;
        botStore.setApiKey(routeApiKey);
        console.log('✅ API key updated from route params:', routeApiKey);
      } else if (routeApiKey && (routeApiKey === currentApiKey || !currentApiKey)) {
        // If route API key is the same or no current API key, use route API key
        apikey = routeApiKey;
        if (!currentApiKey) {
          botStore.setApiKey(routeApiKey);
          console.log('🔑 API key set from route params:', routeApiKey);
        }
      }
    }
    
    // If no API key found, try to extract from URL or route params
    // if (!apikey || apikey === 'undefined' || apikey === 'null') {
    //   // console.log('🔍 No valid API key found, extracting from URL/route params...');
      
      // For /agent/:id route, extract API key from route params
      if (to.name === 'agent' && to.params.id) {
        apikey = to.params.id as string;
        botStore.setApiKey(apikey);
        // console.log('🔑 API key extracted from route params:', apikey);
      } else {
        // Try to extract from URL path
        apikey = botStore.extractApiKeyFromUrl();
      }
    // }    
    
    // console.log('🔑 Final API key:', apikey);
    
    if (apikey && apikey !== 'undefined' && apikey !== 'null') {
      try {
        const data = await getBotDetails(apikey);
        if (data) {
          roleStore.setCurrentUser(data.user);

          const chatStore = useChatStore();
          const conversationStore = useConversationStore();

          // Check subscription requirements for restricted pages
          if (to.name === 'conversation' && !roleStore.hasSubscription) {
            // console.log('🔒 Conversation page requires subscription, redirecting to agent');
            return next({ name: 'agent', params: { id: apikey } });
          }

          // Role-based restriction for live chat agents
          if (roleStore.isLiveChatAgent) {
            if (to.name !== 'conversation') {
              // console.log('🔄 Live chat agent redirected to conversation page');
              return next({ name: 'conversation' });
            }
          }

          // Load chat data if not already loaded or if navigating to a different page
          if (!chatStore.chats.length || from.name !== to.name) {
            chatStore.loadFromStorage(data.bot.chat_flow, data.versions);
          }

          // Initialize Firebase if not already connected
          if (!conversationStore.isFirebaseConnected) {
            try {
              console.log('🔥 Initializing Firebase...');
              conversationStore.initializeFirebase();
              console.log('✅ Firebase initialized successfully');
            } catch (error) {
              console.error('❌ Error initializing Firebase:', error);
            }
          }

          return next();
        } else {
          console.error('❌ Failed to get bot details');
          return next({ name: 'Unauthenticated' });
        }
      } catch (error) {
        console.error('❌ Error fetching bot details:', error);
        return next({ name: 'Unauthenticated' });
      }
    } else {
      console.error('❌ No API key found');
      return next({ name: 'Unauthenticated' });
    }
  }

  // Handle users page - redirect if no subscription
  if (to.name === 'users') {
    const roleStore = useRoleStore();
    if (!roleStore.hasSubscription) {
      // console.log('🔒 Users page requires subscription, redirecting to agent');
      return next({ name: 'agent', params: { id: 'default' } });
    }
  }

  // Redirect to 404 if route name is undefined
  if (typeof to.name === 'undefined') {
    return next({ name: 'NotFound' });
  }

  return next();
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




// mount app
app.mount('#app'); 
