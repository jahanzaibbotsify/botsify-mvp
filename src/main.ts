
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import './style.css'
import 'primeicons/primeicons.css'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'
import ToastPlugin, { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-bootstrap.css'
import Swal from 'sweetalert2'

// Import stores
import { useBotStore } from './stores/botStore'
import { useConversationStore } from './stores/conversationStore'
import { useChatStore } from './stores/chatStore'
import { useRoleStore } from './stores/roleStore'
import { useWhitelabelStore } from './stores/whitelabelStore'

// Import utilities
import { installPermissions } from './utils/permissions'
import { apiKeyManager, apiOperations } from './utils/api'
import { chatStorage, messageManager } from './utils/storage'
import { performanceMonitor } from './utils/performance'

// Import routes and config
import routes from '@/router'

// Make Swal available globally
(window as any).Swal = Swal

// Initialize API key from URL
const initializeApiKey = (): void => {
  const apiKey = apiKeyManager.extractFromUrl()
  if (apiKey) {
    apiKeyManager.set(apiKey)
  }
}

// Check localStorage availability
const checkLocalStorage = (): boolean => {
  try {
    const testKey = 'botsify_storage_test'
    localStorage.setItem(testKey, 'test')
    const result = localStorage.getItem(testKey) === 'test'
    localStorage.removeItem(testKey)
    return result
  } catch {
    return false
  }
}

// Show localStorage warning if not available
const showStorageWarning = (): void => {
  const warningDiv = document.createElement('div')
  warningDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #f44336;
    color: white;
    padding: 10px;
    text-align: center;
    z-index: 9999;
  `
  warningDiv.textContent = 'Warning: Local storage is not available. Your chat history may not be saved.'
  document.body.appendChild(warningDiv)
}

// Bot details cache
const botDetailsCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

// Get bot details with caching
const getBotDetails = async (apiKey: string): Promise<unknown> => {
  const cached = botDetailsCache.get(apiKey)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }

  try {
    const data = await apiOperations.getBotDetails()
    
    // Set user role and permissions
    if (data.data?.user) {
      const roleStore = useRoleStore()
      const whitelabelStore = useWhitelabelStore()
      
      roleStore.setCurrentUser(data.data.user)
      
      // Handle whitelabel data
      if (data.data.user.is_whitelabel_client) {
        whitelabelStore.setWhitelabelData(data.data.user)
        
        // Set favicon if present
        if (data.data.user.whitelabel?.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = data.data.user.whitelabel.favicon
        }
      }
    }
    
    // Update bot store
    const botStore = useBotStore()
    botStore.setApiKeyConfirmed(true)
    botStore.setBotId(data.data.bot.id)
    botStore.setUser(data.data.user)
    botStore.setBotName(data.data.bot.name)
    
    // Cache the result
    botDetailsCache.set(apiKey, { data: data.data, timestamp: now })
    
    return data.data
  } catch (error) {
    console.error('Error fetching bot details:', error)
    throw error
  }
}

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard for authentication and permissions
router.beforeEach(async (to, from, next) => {
  // Allow unauthenticated and not found routes
  if (to.name === 'Unauthenticated' || to.name === 'NotFound') {
    return next()
  }

  // Handle protected routes
  if (to.name === 'agent' || to.name === 'conversation' || to.name === 'users') {
    const apiKey = apiKeyManager.getCurrent()
    
    // Extract API key from route params if needed
    if (to.name === 'agent' && to.params.id) {
      const routeApiKey = to.params.id as string
      if (apiKeyManager.isValidFormat(routeApiKey)) {
        apiKeyManager.set(routeApiKey)
      }
    }
    
    const currentApiKey = apiKeyManager.getCurrent()
    
    if (!currentApiKey) {
      console.error('No API key found')
      return next({ name: 'Unauthenticated' })
    }
    
    try {
      const data = await getBotDetails(currentApiKey)
      if (!data) {
        return next({ name: 'Unauthenticated' })
      }
      
      const roleStore = useRoleStore()
      const chatStore = useChatStore()
      const conversationStore = useConversationStore()
      
      // Handle subscription requirements
      if (to.name === 'users' && !roleStore.hasSubscription) {
        return next({ name: 'agent', params: { id: 'default' } })
      }
      
      if (to.name === 'conversation' && !roleStore.hasSubscription) {
        return next({ name: 'agent', params: { id: currentApiKey } })
      }
      
      // Handle live chat agent restrictions
      if (roleStore.isLiveChatAgent && to.name !== 'conversation') {
        return next({ name: 'conversation' })
      }
      
      // Load chat data if needed
      if ((to.name === 'agent' || to.name === 'conversation') && 
          (!chatStore.chats.length || from.name !== to.name)) {
        const botData = data as { bot: { chat_flow: string }; versions: unknown }
        chatStore.loadFromStorage(botData.bot.chat_flow, botData.versions)
      }
      
      // Initialize Firebase for conversation
      if (to.name === 'conversation' && !conversationStore.isFirebaseConnected) {
        try {
          conversationStore.initializeFirebase()
        } catch (error) {
          console.error('Error initializing Firebase:', error)
        }
      }
      
      return next()
    } catch (error) {
      console.error('Error in route guard:', error)
      return next({ name: 'Unauthenticated' })
    }
  }
  
  return next()
})

// Create app and plugins
const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(ToastPlugin)
installPermissions(app)

// Global utilities
window.$toast = useToast({ position: 'top-right' })
window.$confirm = function (overrideOpt = {}, callback = () => {}) {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCloseButton: true,
    showCancelButton: true,
    confirmButtonColor: "#6D3ADB",
    cancelButtonColor: "#e7515a",
    confirmButtonText: "Yes, Delete it!",
    cancelButtonText: "No, Keep it!",
    animation: false,
    ...overrideOpt,
  }).then((result) => {
    if (result.isConfirmed) {
      callback()
    }
  })
}

// Development tools
if (import.meta.env.DEV) {
  // Performance debugging tools
  (window as any).$performance = {
    report: () => performanceMonitor.logPerformanceReport(),
    clearCaches: () => {
      botDetailsCache.clear()
      chatStorage.clear()
    },
    messageQueue: () => messageManager.getQueueSize()
  }
  
  console.log('🔧 Performance tools available: window.$performance')
}

// Initialize application
const initializeApp = (): void => {
  // Initialize API key
  initializeApiKey()
  
  // Check localStorage
  const localStorageAvailable = checkLocalStorage()
  if (!localStorageAvailable) {
    showStorageWarning()
  }
  
  // Mount app
  app.mount('#app')
}

// Start the application
initializeApp() 
