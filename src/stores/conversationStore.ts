import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { conversationApi } from '@/services/conversationApi'
import { firebaseService } from '@/services/firebase'
import { NotificationService } from '@/utils/notification'
import type { FirebaseMessage } from '@/types/firebase'
import type { 
  ConversationMessage,
  ConversationData 
} from '@/types/conversation'
import type { ExtendedChat, Message } from '@/types'
import moment from 'moment-timezone'
import { currentTime } from '@/utils'

export const useConversationStore = defineStore('conversation', () => {
  // State
  const conversations = ref<ExtendedChat[]>([])
  const selectedConversation = ref<ExtendedChat | null>(null)
  const messages = ref<Message[]>([])
  const searchQuery = ref('')
  const activeFilter = ref('all')
  const activeTab = ref('all')
  const readFilter = ref<'all' | 'read' | 'unread'>('all')
  const chatTypeFilter = ref<'all' | 'my' | 'other'>('all')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const limitReached = ref(false)
  const isLoadingMore = ref(false)

  // Firebase real-time messaging state
  const isFirebaseConnected = ref(false)
  const firebaseError = ref<string | null>(null)

  // Message cache to reduce API calls
  const messageCache = ref<Map<string, {
    messages: Message[]
    timestamp: number
    lastMessageId?: number
  }>>(new Map())

  // Cache expiration time (5 minutes)
  const CACHE_EXPIRY_TIME = 5 * 60 * 1000

  // Helper function to check if cache is valid
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_EXPIRY_TIME
  }

  // Helper function to get cached messages
  const getCachedMessages = (conversationId: string) => {
    const cached = messageCache.value.get(conversationId)
    if (cached && isCacheValid(cached.timestamp)) {
      return cached
    }
    return null
  }

  // Helper function to set cached messages
  const setCachedMessages = (conversationId: string, messages: Message[], lastMessageId?: number) => {
    messageCache.value.set(conversationId, {
      messages,
      timestamp: Date.now(),
      lastMessageId
    })
  }

  // Helper function to clear cache for a conversation
  const clearConversationCache = (conversationId: string) => {
    messageCache.value.delete(conversationId)
  }

  // Helper function to clear all cache
  const clearAllCache = () => {
    messageCache.value.clear()
  }

  // Helper function to convert API conversation data to ExtendedChat
  const convertConversationDataToExtendedChat = (fbId: string, data: ConversationData): ExtendedChat => {
    const user = data.user
    return {
      id: fbId,
      title: user.name,
      timestamp: user.last_converse,
      lastMessage: data.last_msg || '',
      unread: data.unread > 0,
      messages: [],
      email: user.email,
      status: user.status === 1 ? 'open' : 'closed',
      source: user.type === 'facebook' ? 'Facebook' : user.type === 'whatsapp' ? 'WhatsApp' : 'Web',
      phone: user.phone_number || undefined,
      country: user.country,
      os: user.os || undefined,
      lastPage: user.last_page || undefined,
      fbid: user.fbId,
      assignedTo: user.csr || '',
      profilePic: user.profile_pic || undefined
    }
  }

  // Helper function to convert API message to Message
  const convertConversationMessageToMessage = (msg: ConversationMessage): Message => {
    // Handle different message content types
    let content = msg.message;
    
    // If message is an object, extract the text
    if (typeof msg.message === 'object') {
      console.log('Converting object message:', msg.message);
      const messageObj = msg.message as any;
      
      if (messageObj.text) {
        if (typeof messageObj.text === 'object') {
          // Handle double-nested text object
          content = messageObj.text.text || JSON.stringify(messageObj.text);
        } else {
          content = messageObj.text;
        }
      } else {
        // Try to find any text property or stringify the object
        content = JSON.stringify(msg.message);
      }
    }
    
    return {
      id: msg.id.toString(),
      content: content,
      sender: msg.direction === 'to' ? 'assistant' : 'user',
      timestamp: msg.created_at,
      attachments: []
    }
  }

  // Computed properties
  const filteredConversations = computed(() => {
    // Return conversations directly since filtering is now handled by API
    return conversations.value
  })

  const unreadCount = computed(() => {
    return conversations.value.filter(conv => conv.unread).length
  })

  const openCount = computed(() => {
    return conversations.value.filter(conv => conv.status === 'open').length
  })

  const closedCount = computed(() => {
    return conversations.value.filter(conv => conv.status === 'closed').length
  })

  // Firebase Methods
  const initializeFirebase = () => {
    try {
      console.log('🔥 Initializing Firebase from conversation store...')
      // Initialize live chat listener
      const unsubscribe = firebaseService.initializeLiveChatListener(
        (fbId: string, data: FirebaseMessage) => {
          handleFirebaseMessage(fbId, data)
        },
        (error: Error) => {
          console.error('Firebase live chat error:', error)
          firebaseError.value = error.message
          isFirebaseConnected.value = false
        }
      )
      
      if (unsubscribe) {
        isFirebaseConnected.value = true
        firebaseError.value = null
        console.log('✅ Firebase initialized successfully in conversation store')
      } else {
        console.warn('⚠️ Firebase listener not set up - check configuration')
        firebaseError.value = 'Firebase configuration incomplete'
        isFirebaseConnected.value = false
      }
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error)
      firebaseError.value = error instanceof Error ? error.message : 'Failed to initialize Firebase'
      isFirebaseConnected.value = false
    }
  }

  const handleFirebaseMessage = (fbId: string, data: FirebaseMessage) => {
    console.log('📨 Processing Firebase message for:', fbId, data)
    
    // Check if this is a human help request or bot stop
    if (data.message?.human_help !== undefined && data.message?.stop_bot) {
      console.log('🤖 Bot deactivated for conversation:', fbId)
      // Handle bot deactivation if needed
    }

    // Find existing conversation or create new one
    let conversation = conversations.value.find(conv => conv.fbid === fbId)
    
    if (!conversation) {
      // Create new conversation from Firebase data
      if (data.user) {
        const newConversation: ExtendedChat = {
          id: fbId,
          title: data.user.name,
          timestamp: currentTime(),
          lastMessage: data.message?.text || '',
          unread: true,
          messages: [],
          email: data.user.email,
          status: 'open',
          source: 'Web',
          fbid: fbId,
          profilePic: data.user.profile_pic
        }
        
        conversations.value.unshift(newConversation)
        conversation = newConversation
        console.log('🆕 New conversation created from Firebase:', newConversation)
      }
    } else {
      // Update existing conversation
      conversation.lastMessage = data.message?.text || 'Media message'
      conversation.timestamp = currentTime()
      
      // Mark as unread if not currently selected
      if (selectedConversation.value?.fbid !== fbId) {
        conversation.unread = true
      }
      
      // Move to top of list
      const index = conversations.value.findIndex(conv => conv.fbid === fbId)
      if (index > 0) {
        conversations.value.splice(index, 1)
        conversations.value.unshift(conversation)
      }
      
      console.log('📝 Updated existing conversation from Firebase:', conversation.title)
    }

    // If this conversation is currently selected, add message to chat
    if (selectedConversation.value?.fbid === fbId) {
      // Handle different message content types from Firebase
      let content = data.message?.text || '';
      
      if (typeof data.message?.text === 'object') {
        console.log('Firebase message text is an object:', data.message.text);
        const textObj = data.message.text as any;
        
        if (textObj.text) {
          if (typeof textObj.text === 'object') {
            // Handle double-nested text object
            content = textObj.text.text || JSON.stringify(textObj.text);
          } else {
            content = textObj.text;
          }
        } else {
          content = JSON.stringify(data.message.text);
        }
      }
      
      // Determine sender
      let sender: 'user' | 'assistant' = 'assistant';
      // Try to detect sender by from_user_id and selectedConversation user id
      const fromUserId = (data.message && (data.message as any).from_user_id) || null;
      const selectedUserId = (selectedConversation.value && (selectedConversation.value as any).user_id) || null;
      if (fromUserId && selectedUserId && fromUserId === selectedUserId) {
        sender = 'user';
      } else if (data.message && (data.message as any).direction === 'to') {
        sender = 'assistant';
      } else if (data.message && (data.message as any).direction === 'from') {
        sender = 'user';
      }
      
      // Duplicate check: Only add if not already present (by content and timestamp)
      const isDuplicate = messages.value.some(m => {
        // Check if content matches
        const contentMatches = m.content === content;
      
        // Check if timestamp is within 5 seconds using UTC
        const messageTime = moment.utc(m.timestamp); // parse as UTC
        const currentTime = moment.utc(); // current UTC time
        const timeDiff = Math.abs(currentTime.diff(messageTime));
      
        const timeMatches = timeDiff < 5000; // 5 seconds
        const senderMatches = m.sender === sender;
      
        return contentMatches && timeMatches && senderMatches;
      });
      
      
      if (!isDuplicate) {
        const newMessage: Message = {
          id: Date.now().toString(),
          content: content,
          timestamp: currentTime(),
          sender: sender,
          status: 'sent'
        }
        messages.value.push(newMessage)
        console.log('💬 Added message to current conversation:', newMessage)
      } else {
        console.log('⚠️ Duplicate message ignored:', { content, sender, timestamp: new Date() })
      }
    }
  }

  const listenToConversation = (fbId: string) => {
    if (!isFirebaseConnected.value) {
      console.warn('Firebase not connected. Cannot listen to conversation.')
      return
    }

    firebaseService.listenToConversation(
      fbId,
      (message: Message) => {
        // Add message to current conversation if it matches
        if (selectedConversation.value?.fbid === fbId) {
          messages.value.push(message)
          console.log('💬 Real-time message added:', message)
        }
      },
      (error: Error) => {
        console.error('Conversation listener error:', error)
        firebaseError.value = error.message
      }
    )
  }

  const stopListeningToConversation = (fbId: string) => {
    firebaseService.stopListeningToConversation(fbId)
  }

  const disconnectFirebase = () => {
    firebaseService.disconnect()
    isFirebaseConnected.value = false
    firebaseError.value = null
    console.log('🔌 Firebase disconnected')
  }

  const checkFirebaseStatus = () => {
    console.log('📊 Firebase Status Check:')
    console.log('- Firebase Connected:', isFirebaseConnected.value)
    console.log('- Firebase Error:', firebaseError.value)
    console.log('- Environment Config:', {
      apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      databaseURL: !!import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID
    })
    
    // Get Firebase service status
    const firebaseStatus = firebaseService.getConnectionStatus()
    console.log('- Firebase Service Status:', firebaseStatus)
  }

  // Actions
  const fetchConversations = async (isLoadMore = false, chatId?: string) => {
    if (isLoadMore) {
      isLoadingMore.value = true
    } else {
      loading.value = true
      limitReached.value = false
    }
    error.value = null
    
    try {
      // Build query parameters based on current filters
      const queryParams: Record<string, string> = {}
      
      if(chatId){
        queryParams.chatId = chatId;
      }
      // Search query
      if (searchQuery.value.trim()) {
        queryParams.query = searchQuery.value.trim()
      }
      
      // Status filter (open/closed)
      if (activeFilter.value !== 'all') {
        queryParams.requested = activeFilter.value
      }
      
      // Chat type filter (my chats)
      if (chatTypeFilter.value === 'my') {
        queryParams.open_chats = 'true'
      }
      
      // Read status filter
      if (readFilter.value !== 'all') {
        queryParams.unread = readFilter.value === 'read' ? 'false' : 'true'
      }
      
      // Platform filter
      if (activeTab.value !== 'all') {
        queryParams.type = activeTab.value
      }
      
      // Offset for pagination
      if (isLoadMore) {
        queryParams.offset = conversations.value.length.toString()
      }
      queryParams.sort = 'desc'
      const response = await conversationApi.getConversations(queryParams)
      if (response.success && response.data) {
        const conversationsList: ExtendedChat[] = []
        
        // Convert API response to ExtendedChat format
        Object.entries(response.data.conversations).forEach(([fbId, data]) => {
          conversationsList.push(convertConversationDataToExtendedChat(fbId, data))
        })
        
        if (isLoadMore) {
          // Append new conversations for load more
          conversations.value.push(...conversationsList)
        } else {
          // Replace conversations for new search/filter
          conversations.value = conversationsList
        }
        
        // Check if limit reached
        if (response.data.limit_reached === true) {
          limitReached.value = true
        }
      } else {
        error.value = response.message || 'Failed to fetch conversations'
      }
    } catch (err) {
      error.value = 'An error occurred while fetching conversations'
      console.error('Error fetching conversations:', err)
    } finally {
      if (isLoadMore) {
        isLoadingMore.value = false
      } else {
        loading.value = false
      }
    }
  }

  const loadMoreConversations = async () => {
    if (!limitReached.value && !isLoadingMore.value) {
      await fetchConversations(true)
    }
  }

  const fetchUserConversation = async (messengerUserId: string, forceRefresh = false, markAsRead = false) => {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cached = getCachedMessages(messengerUserId)
      if (cached) {
        messages.value = cached.messages
        console.log('Using cached messages for conversation:', messengerUserId)
        return
      }
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await conversationApi.getUserConversation(messengerUserId, markAsRead)
      if (response.success && response.data) {
        // Convert API messages to Message format
        const convertedMessages = response.data.conversations.map(convertConversationMessageToMessage)
        messages.value = convertedMessages
        
        // Cache the messages
        setCachedMessages(messengerUserId, convertedMessages, response.data.last_msg_key)
        
        // Update selected conversation with user data
        if (selectedConversation.value) {
          selectedConversation.value.id = response.data.user.id.toString()
          selectedConversation.value.active_for_bot = response.data.user.active_for_bot
          selectedConversation.value.csr = response.data.user.csr
          selectedConversation.value.email = response.data.user.email
          selectedConversation.value.assignedTo = response.data.agent_assigned
          selectedConversation.value.status = response.data.conv_status
        }
      } else {
        error.value = response.message || 'Failed to fetch user conversation'
      }
    } catch (err) {
      error.value = 'An error occurred while fetching user conversation'
      console.error('Error fetching user conversation:', err)
    } finally {
      loading.value = false
    }
  }

  const sendMessageToUser = async (content: string, to: string, type: 'text' | 'image' | 'whatsapp' = 'text') => {
    if (!content.trim()) return
    
    try {
      // Add the message immediately for better UX with a temporary ID
      const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('💬 Sending message to user:', currentTime())
      if (type !== 'image') {
        const message: Message = {
          id: tempMessageId,
          content: content,
          sender: 'assistant',
          timestamp: currentTime(),
          status: 'sending',
          attachments: []
        }
        messages.value.push(message)
      }

      let response
      if (type === 'text') {
        response = await conversationApi.sendTextMessage(to, content)
      } else if (type === 'whatsapp') {
        response = await conversationApi.sendWhatsAppMessage(to, content)
      } else {
        // For image type, content should be the image URL
        response = await conversationApi.sendImageMessage(to, content)
      }
      
      if (response.success) {
        // Update the message status to sent
        const sentMessage = messages.value.find(m => m.id === tempMessageId)
        if (sentMessage) {
          sentMessage.status = 'sent'
        }
        
        // Update the last message in the selected conversation
        if (selectedConversation.value) {
          selectedConversation.value.lastMessage = content
          selectedConversation.value.timestamp = currentTime()
        }
        
        console.log('✅ Message sent successfully')
      } else {
        // Remove the message if sending failed
        const messageIndex = messages.value.findIndex(m => m.id === tempMessageId)
        if (messageIndex > -1) {
          messages.value.splice(messageIndex, 1)
        }
        error.value = response.message || 'Failed to send message'
      }
    } catch (err) {
      // Remove the message if there was an error
      const messageIndex = messages.value.findIndex(m => m.id.startsWith('temp_'))
      if (messageIndex > -1) {
        messages.value.splice(messageIndex, 1)
      }
      error.value = 'An error occurred while sending message'
      console.error('Error sending message:', err)
    }
  }

  const setSearchQuery = async (query: string) => {
    searchQuery.value = query
    // Debounce search to avoid too many API calls
    clearTimeout((window as any).searchTimeout)
    ;(window as any).searchTimeout = setTimeout(() => {
      fetchConversations()
    }, 300)
  }

  const setActiveFilter = async (filter: string) => {
    activeFilter.value = filter
    await fetchConversations()
  }

  const setActiveTab = async (tab: string) => {
    activeTab.value = tab
    await fetchConversations()
  }

  const setReadFilter = async (filter: 'all' | 'read' | 'unread') => {
    readFilter.value = filter
    await fetchConversations()
  }

  const setChatTypeFilter = async (filter: 'all' | 'my' | 'other') => {
    chatTypeFilter.value = filter
    await fetchConversations()
  }

  const setSortOrder = async (order: 'asc' | 'desc') => {
    sortOrder.value = order
    await fetchConversations()
  }

  const selectConversation = async (conversation: ExtendedChat) => {
    // Stop listening to previous conversation
    if (selectedConversation.value?.fbid) {
      stopListeningToConversation(selectedConversation.value.fbid)
    }
    
    selectedConversation.value = conversation
    // Check if conversation has unread messages
    const hasUnreadMessages = conversation.unread
    
    // If unread, mark as read locally
    if (hasUnreadMessages) {
      conversation.unread = false
    }
    
    // Load messages for this conversation using API
    if (conversation.fbid) {
      // Pass markAsRead=true if conversation had unread messages
      await fetchUserConversation(conversation.fbid, false, hasUnreadMessages)
      // Start listening to real-time messages for this conversation
      if (isFirebaseConnected.value) {
        listenToConversation(conversation.fbid)
      }
    }
  }

  const sendMessage = async (content: string, fileUrls?: string[]) => {
    if (!content.trim() || !selectedConversation.value) return

    // Send message using API
    if (selectedConversation.value.fbid) {
      // If there are file URLs, send them as image messages
      if (fileUrls && fileUrls.length > 0) {
        for (const fileUrl of fileUrls) {
          await sendMessageToUser(fileUrl, selectedConversation.value.fbid, 'image')
        }

        if(content.trim() == 'Attachment'){
          clearConversationCache(selectedConversation.value.fbid)
          return;
        }
      }
      
      // Send the text message
      await sendMessageToUser(content, selectedConversation.value.fbid, 'text')
      
      // Clear cache for this conversation since we sent a new message
      clearConversationCache(selectedConversation.value.fbid)
    }
  }

  const markAsRead = (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      conversation.unread = false
    }
  }

  const markAsUnread = (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      conversation.unread = true
    }
  }

  const closeConversation = (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      conversation.status = 'closed'
    }
  }

  const openConversation = (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      conversation.status = 'open'
    }
  }

  const exportConversation = async (extension: 'csv' | 'txt') => {
    if (!selectedConversation.value?.fbid) {
      error.value = 'No conversation selected for export'
      return
    }

    try {
      const response = await conversationApi.exportChat(selectedConversation.value.fbid, extension)
      if (response.success) {
        console.log('✅ Chat exported successfully:', extension)
      } else {
        error.value = response.message || 'Failed to export chat'
      }
    } catch (err) {
      error.value = 'An error occurred while exporting chat'
      console.error('Error exporting chat:', err)
    }
  }

  const deleteConversation = async () => {
    try {
      if (!selectedConversation.value?.fbid) {
        error.value = 'No conversation selected for export'
        return
      }
      const response = await conversationApi.deleteConversation(selectedConversation.value.fbid)
      if (response.success) {
        // Find index of the conversation to delete
        const index = conversations.value.findIndex(c => c.fbid === selectedConversation.value?.fbid);
  
        if (index !== -1) {
          // Remove the deleted conversation
          conversations.value.splice(index, 1);
  
          // Determine next selected conversation (prioritize next, fallback to previous)
          const nextConversation =
            conversations.value[index] || conversations.value[index - 1] || null;
  
          selectedConversation.value = nextConversation;
  
          // Clear messages if nothing is selected
          if (!nextConversation) {
            messages.value = [];
          }
        }
  
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.message || 'Failed to delete conversation' };
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
      return { success: false, message: 'An error occurred while deleting conversation' }
    }
  }

  const changeBotActivation = async (status: number) => {
    try {
      const userId = selectedConversation.value?.id
      if (!userId) {
        return { success: false, message: 'No user selected for bot activation' }
      }
      const response = await conversationApi.changeBotActivation(userId, status)
      if (response.success) {
        return { success: true, message: response.data.message }
      } else {
        return { success: false, message: 'Internal Server Error, Please Contact team@botsify.com' }
      }
    } catch (err) {
      console.error('Error changing bot activation:', err)
      return { success: false, message: 'Internal Server Error, Please Contact team@botsify.com' }
    }
  }

  // Notification methods
  const enableNotifications = async () => {
    try {
      // Check if notifications are supported
      if (!NotificationService.isSupported()) {
        return { success: false, message: 'Push notifications are not supported in this browser' }
      }

      // Get user ID from selected conversation
      const userId = selectedConversation.value?.fbid
      if (!userId) {
        return { success: false, message: 'No user selected for notifications' }
      }

      // Register service worker
      const registration = await NotificationService.registerServiceWorker()
      if (!registration) {
        return { success: false, message: 'Failed to register service worker' }
      }

      // Ask for permission
      const permission = await NotificationService.askPermission()
      if (permission !== 'granted') {
        return { success: false, message: 'Notification permission denied' }
      }

      // Subscribe to push notifications
      const subscription = await NotificationService.subscribeUserToPush()
      if (!subscription) {
        return { success: false, message: 'Failed to subscribe to push notifications' }
      }

      // Save subscription to backend
      const response = await conversationApi.saveSubscription(subscription, userId)
      if (response.success) {
        console.log('✅ Notifications enabled successfully')
        return { success: true, message: 'Notifications enabled successfully' }
      } else {
        return { success: false, message: response.message || 'Failed to save subscription' }
      }
    } catch (err) {
      console.error('Error enabling notifications:', err)
      return { success: false, message: 'An error occurred while enabling notifications' }
    }
  }

  const disableNotifications = async () => {
    try {
      // Get user ID from selected conversation
      const userId = selectedConversation.value?.fbid
      if (!userId) {
        return { success: false, message: 'No user selected for notifications' }
      }

      // Unsubscribe from push notifications
      const unsubscribed = await NotificationService.unsubscribeUserFromPush()
      if (!unsubscribed) {
        return { success: false, message: 'No active subscription found' }
      }

      // Get current subscription to send to backend for deletion
      const registration = await NotificationService.getSWRegistration()
      if (!registration) {
        return { success: false, message: 'No service worker registration available' }
      }
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        // Delete subscription from backend
        const response = await conversationApi.deleteSubscription(subscription, userId)
        if (response.success) {
          console.log('✅ Notifications disabled successfully')
          return { success: true, message: 'Notifications disabled successfully' }
        } else {
          return { success: false, message: response.message || 'Failed to delete subscription' }
        }
      }

      return { success: true, message: 'Notifications disabled successfully' }
    } catch (err) {
      console.error('Error disabling notifications:', err)
      return { success: false, message: 'An error occurred while disabling notifications' }
    }
  }

  const checkNotificationStatus = async () => {
    try {
      const isSupported = NotificationService.isSupported()
      const permission = NotificationService.getPermissionStatus()
      
      // Only check subscription if notifications are supported and permission is granted
      let isSubscribed = false
      if (isSupported && permission === 'granted') {
        isSubscribed = await NotificationService.isSubscribed()
      }
      
      return {
        supported: isSupported,
        permission: permission,
        subscribed: isSubscribed
      }
    } catch (err) {
      console.error('Error checking notification status:', err)
      return {
        supported: false,
        permission: 'denied' as NotificationPermission,
        subscribed: false
      }
    }
  }

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    searchQuery,
    activeFilter,
    activeTab,
    readFilter,
    chatTypeFilter,
    sortOrder,
    loading,
    error,
    limitReached,
    isLoadingMore,
    
    // Computed
    filteredConversations,
    unreadCount,
    openCount,
    closedCount,
    
    // Actions
    fetchConversations,
    loadMoreConversations,
    fetchUserConversation,
    setSearchQuery,
    setActiveFilter,
    setActiveTab,
    setReadFilter,
    setChatTypeFilter,
    setSortOrder,
    selectConversation,
    sendMessage,
    markAsRead,
    markAsUnread,
    closeConversation,
    openConversation,
    
    // Cache management
    clearConversationCache,
    clearAllCache,
    
    // Firebase methods
    initializeFirebase,
    disconnectFirebase,
    checkFirebaseStatus,
    isFirebaseConnected,
    firebaseError,
    
    // Export method
    exportConversation,
    
    // Delete method
    deleteConversation,
    
      // Bot activation method
  changeBotActivation,
  
  // Notification methods
  enableNotifications,
  disableNotifications,
  checkNotificationStatus
  }
}) 