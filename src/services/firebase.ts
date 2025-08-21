import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onChildAdded, onValue } from 'firebase/database'
import { BOTSIFY_FIREBASE_CONFIG } from '@/utils/config'
import { useBotStore } from '@/stores/botStore'
import type { Message } from '@/types'
import { currentTime } from '@/utils'

// Initialize Firebase
const app = initializeApp(BOTSIFY_FIREBASE_CONFIG)
const database = getDatabase(app)
export class FirebaseService {
  private static instance: FirebaseService
  private listeners: Map<string, () => void> = new Map()

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService()
    }
    return FirebaseService.instance
  }

  /**
   * Initialize real-time listener for live chat messages
   */
  initializeLiveChatListener(
    onMessageReceived: (fbId: string, data: any) => void,
    onError?: (error: Error) => void
  ) {
    const apiKeyStore = useBotStore()
    const botApiKey = apiKeyStore.apiKey
    
    if (!botApiKey) {
      console.error('❌ Bot API key not set. Cannot initialize live chat listener.')
      onError?.(new Error('Bot API key not set'))
      return
    }

    const liveChatPath = `botsify_live_chat/presence-agents-${botApiKey}`
    const liveChatRef = ref(database, liveChatPath)
    
    const unsubscribe = onChildAdded(liveChatRef, (snapshot) => {
      try {
        const data = snapshot.val()
        
        if (data) {
          // Parse message if it's a string
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data
          const fbId = parsedData.user?.fbId || parsedData.user_id || snapshot.key
          if (fbId) {
            onMessageReceived(fbId, parsedData)
          }
        }
      } catch (error) {
        console.error('❌ Error processing Firebase message:', error)
        onError?.(error as Error)
      }
    }, (error) => {
      console.error('❌ Firebase listener error:', error)
      onError?.(error)
    })

    // Store the unsubscribe function
    this.listeners.set('liveChat', unsubscribe)
    return unsubscribe
  }

  /**
   * Listen to a specific conversation
   */
  listenToConversation(
    fbId: string,
    onMessageReceived: (message: Message) => void,
    onError?: (error: Error) => void
  ) {
    const apiKeyStore = useBotStore()
    const botApiKey = apiKeyStore.apiKey
    
    if (!botApiKey) {
      console.error('Bot API key not set. Cannot listen to conversation.')
      return
    }

    const conversationPath = `botsify_live_chat/presence-agents-${botApiKey}/${fbId}`
    const conversationRef = ref(database, conversationPath)
    
    const unsubscribe = onValue(conversationRef, (snapshot) => {
      try {
        const data = snapshot.val()
        
        if (data && data.message) {
          const message: Message = {
            id: Date.now().toString(),
            content: data.message.text || '',
            sender: 'user',
            timestamp: currentTime(),
            status: 'sent'
          }
          onMessageReceived(message)
        }
      } catch (error) {
        console.error('❌ Error processing conversation message:', error)
        onError?.(error as Error)
      }
    }, (error) => {
      console.error('❌ Conversation listener error:', error)
      onError?.(error)
    })

    // Store the unsubscribe function
    this.listeners.set(`conversation-${fbId}`, unsubscribe)
    
    return unsubscribe
  }

  /**
   * Stop listening to a specific conversation
   */
  stopListeningToConversation(fbId: string) {
    const listenerKey = `conversation-${fbId}`
    const unsubscribe = this.listeners.get(listenerKey)
    
    if (unsubscribe) {
      unsubscribe()
      this.listeners.delete(listenerKey)
    }
  }

  /**
   * Stop all listeners
   */
  stopAllListeners() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe()
    })
    this.listeners.clear()
  }

  /**
   * Disconnect from Firebase
   */
  disconnect() {
    this.stopAllListeners()
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    const apiKeyStore = useBotStore()
    return {
      hasListeners: this.listeners.size > 0,
      listenerKeys: Array.from(this.listeners.keys()),
      databaseURL: database.app.options.databaseURL,
      botApiKey: apiKeyStore.apiKey ? 'Set' : 'Not set'
    }
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance() 