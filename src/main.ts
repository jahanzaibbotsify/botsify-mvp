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
import { useBotStore } from './stores/botStore';
import { useConversationStore } from './stores/conversationStore';
import { useChatStore } from './stores/chatStore';
import { useRoleStore } from './stores/roleStore';
import { useWhitelabelStore } from './stores/whitelabelStore';
import { installPermissions } from './utils/permissions';
import { extractApiKey, getCurrentApiKey } from './utils/apiKeyUtils';
import { performanceMonitor, lazyLoader, memoryManager } from './utils/performance';

import Swal from 'sweetalert2';

// Import routes
import routes from '@/router'
import { BOTSIFY_AUTH_TOKEN, BOTSIFY_BASE_URL } from './utils/config'
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
  // text: "Are you sure you want to perform this action?",
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


// Cache for bot details to avoid repeated API calls
const botDetailsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Reusable function to make an authenticated GET request with axios
async function getBotDetails(apikey: string) {
  // Check cache first
  const cached = botDetailsCache.get(apikey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('📦 Using cached bot details for:', apikey);
    return cached.data;
  }
  
  try {
    const response = await axios.get(
      BOTSIFY_BASE_URL + `/v1/bot/get-data?apikey=${apikey}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOTSIFY_AUTH_TOKEN}`
        }
      }
    );
    
    console.log('📡 Fetched fresh bot details for:', apikey);
    
    const roleStore = useRoleStore();
    const whitelabelStore = useWhitelabelStore();
    
    // Set user role and permissions
    if (response.data.data.user) {
      roleStore.setCurrentUser(response.data.data.user);
      
      // Set whitelabel data if user is a whitelabel client
      if (response.data.data.user.is_whitelabel_client) {
        console.log('🎨 Setting whitelabel data:', response.data.data.user.whitelabel);
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

    // Cache the result
    botDetailsCache.set(apikey, { data: response.data.data, timestamp: now });
    
    return response.data.data;
  } catch (error) {
    console.error('API request error:', error);
    return false;
  }
}

// Function to clear bot details cache
export function clearBotDetailsCache() {
  botDetailsCache.clear();
}

// Function to clear navigation cache
export function clearNavigationCache() {
  navigationCache.clear();
}

// Function to clear all caches
export function clearAllCaches() {
  botDetailsCache.clear();
  navigationCache.clear();
  componentCache.clear();
  // Import and call the role cache clear function
  import('./utils/apiKeyUtils').then(({ clearRoleCache }) => {
    clearRoleCache();
  });
}

// Store cache for better performance
const storeCache = new Map<string, { data: any; timestamp: number }>();
const STORE_CACHE_DURATION = 15000; // 15 seconds

// Cached store getter
function getCachedStore<T>(storeName: string, getter: () => T): T {
  const now = Date.now();
  const cached = storeCache.get(storeName);
  
  if (cached && (now - cached.timestamp) < STORE_CACHE_DURATION) {
    performanceMonitor.recordCacheHit(storeName, true);
    return cached.data;
  }
  
  performanceMonitor.recordCacheHit(storeName, false);
  const data = getter();
  storeCache.set(storeName, { data, timestamp: now });
  
  return data;
}

// Function to clear store cache
export function clearStoreCache() {
  storeCache.clear();
}

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Component cache for better performance
const componentCache = new Map<string, any>();
const COMPONENT_CACHE_DURATION = 60000; // 1 minute

// Lazy load and cache components
function getCachedComponent(componentPath: string) {
  const now = Date.now();
  const cached = componentCache.get(componentPath);
  
  if (cached && (now - cached.timestamp) < COMPONENT_CACHE_DURATION) {
    console.log('📦 Using cached component:', componentPath);
    return cached.component;
  }
  
  // Load and cache the component
  const component = () => import(componentPath);
  componentCache.set(componentPath, { component, timestamp: now });
  console.log('📡 Loading fresh component:', componentPath);
  
  return component;
}

// Note: Route prefetching is handled automatically by Vue Router

// Add loading state for better perceived performance
router.beforeEach((to, from, next) => {
  // Start performance monitoring
  const routeName = String(to.name || 'unknown');
  performanceMonitor.startTimer(`route-${routeName}`);
  
  // Show loading indicator for slow routes
  if (to.name === 'agent' || to.name === 'conversation') {
    console.log('🔄 Loading route:', to.name);
  }
  next();
})

// Monitor route completion
router.afterEach((to) => {
  const routeName = String(to.name || 'unknown');
  performanceMonitor.endTimer(`route-${routeName}`);
  
  // Check memory usage periodically
  if (Math.random() < 0.1) { // 10% chance on each route
    memoryManager.checkMemoryUsage();
  }
})

// Preload critical components
function preloadCriticalComponents() {
  const criticalComponents = [
    '../views/ChatView.vue',
    '../views/ConversationView.vue',
    '../views/UserView.vue'
  ];
  
  criticalComponents.forEach(componentPath => {
    getCachedComponent(componentPath);
  });
}

// Preload components after initial load
setTimeout(preloadCriticalComponents, 2000);


// Cache for navigation state to avoid repeated checks
const navigationCache = new Map<string, { timestamp: number; data: any }>();
const NAVIGATION_CACHE_DURATION = 10000; // 10 seconds

router.beforeEach(async (to, from, next) => {
  // Skip navigation guard for certain routes to improve performance
  if (to.name === 'Unauthenticated' || to.name === 'NotFound') {
    return next();
  }

  if (to.name === 'agent' || to.name === 'conversation') {
    // Use cached store data for better performance
    const botStore = useBotStore();
    const storeApiKey = getCachedStore('botStore-apiKey', () => botStore.getApiKey);
    const localApiKey = getCurrentApiKey();
    
    let apikey = storeApiKey || localApiKey || '';
    
    // If no API key found, try to extract from URL or route params
    if (!apikey || apikey === 'undefined' || apikey === 'null') {
      // For /agent/:id route, extract API key from route params
      if (to.name === 'agent' && to.params.id) {
        apikey = to.params.id as string;
        botStore.setApiKey(apikey);
      } else {
        // Try to extract from URL path
        apikey = botStore.extractApiKeyFromUrl();
      }
    }    
    
    if (apikey && apikey !== 'undefined' && apikey !== 'null') {
      // Check navigation cache first
      const cacheKey = `${apikey}-${to.name}`;
      const cached = navigationCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < NAVIGATION_CACHE_DURATION) {
        console.log('📦 Using cached navigation data for:', cacheKey);
        return next();
      }
      
      try {
        const data = await getBotDetails(apikey);
        if (data) {
          const roleStore = useRoleStore();
          roleStore.setCurrentUser(data.user);

          const chatStore = useChatStore();
          const conversationStore = useConversationStore();

          // Check subscription requirements for restricted pages (cached)
          const hasSubscription = getCachedStore('roleStore-hasSubscription', () => roleStore.hasSubscription);
          if (to.name === 'conversation' && !hasSubscription) {
            console.log('🔒 Conversation page requires subscription, redirecting to agent');
            return next({ name: 'agent', params: { id: apikey } });
          }

          // Role-based restriction for live chat agents (cached)
          const isLiveChatAgent = getCachedStore('roleStore-isLiveChatAgent', () => roleStore.isLiveChatAgent);
          if (isLiveChatAgent) {
            if (to.name !== 'conversation') {
              console.log('🔄 Live chat agent redirected to conversation page');
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

          // Cache the navigation result
          navigationCache.set(cacheKey, { timestamp: now, data: data });
          
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

  // Handle users page - redirect if no subscription (cached)
  if (to.name === 'users') {
    const roleStore = useRoleStore();
    const hasSubscription = getCachedStore('roleStore-hasSubscription-users', () => roleStore.hasSubscription);
    if (!hasSubscription) {
      console.log('🔒 Users page requires subscription, redirecting to agent');
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

// Performance debugging tools (development only)
if (import.meta.env.DEV) {
  (window as any).$performance = {
    report: () => performanceMonitor.logPerformanceReport(),
    clearCaches: () => clearAllCaches(),
    clearMemory: () => memoryManager.clearMemory(),
    preloadComponents: () => preloadCriticalComponents()
  };
  
  console.log('🔧 Performance tools available: window.$performance');
}


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