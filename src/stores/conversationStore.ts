import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExtendedChat, Message } from '@/types'

export const useConversationStore = defineStore('conversation', () => {
  // State
  const conversations = ref<ExtendedChat[]>([])
  const selectedConversation = ref<ExtendedChat | null>(null)
  const messages = ref<Message[]>([])
  const searchQuery = ref('')
  const activeFilter = ref('all')
  const activeTab = ref('all')
  const readFilter = ref<'all' | 'read' | 'unread'>('all')
  const loading = ref(false)

  // Mock data for conversations
  const mockConversations: ExtendedChat[] = [
    {
      id: '1',
      title: 'Ijaida James',
      timestamp: new Date('2024-01-15 14:30:00'),
      lastMessage: 'Hello, I need help with my order',
      unread: false,
      messages: [],
      email: 'ijaida_james@test.com',
      status: 'open',
      source: 'Facebook',
      lastConverse: '2024-01-15 14:30:00',
      phone: '1234567890',
      country: 'United States',
      os: 'iOS',
      lastPage: '/home',
      fbid: '8962630583802781',
      assignedTo: 'Agent 1'
    },
    {
      id: '2',
      title: 'Jaiden Anderson',
      timestamp: new Date('2024-01-15 13:45:00'),
      lastMessage: 'Can you help me with the payment?',
      unread: true,
      messages: [],
      email: 'jaiden.anderson@test.com',
      status: 'open',
      source: 'WhatsApp',
      lastConverse: '2024-01-15 13:45:00',
      phone: '0987654321',
      country: 'Canada',
      os: 'Android',
      lastPage: '/products',
      fbid: '8962630583802782',
      assignedTo: 'Agent 2'
    },
    {
      id: '3',
      title: 'Ibrahim Ib',
      timestamp: new Date('2024-01-14 16:20:00'),
      lastMessage: 'Thank you for your help',
      unread: false,
      messages: [],
      email: 'ibrahim.ib@test.com',
      status: 'closed',
      source: 'Web',
      lastConverse: '2024-01-14 16:20:00',
      phone: '5555555555',
      country: 'Nigeria',
      os: 'Windows',
      lastPage: '/support',
      fbid: '8962630583802783',
      assignedTo: ''
    },
    {
      id: '4',
      title: 'King Kado Kroon',
      timestamp: new Date('2024-01-15 12:15:00'),
      lastMessage: 'I have a question about shipping',
      unread: false,
      messages: [],
      email: 'king.kroon@test.com',
      status: 'open',
      source: 'Facebook',
      lastConverse: '2024-01-15 12:15:00',
      phone: '1111111111',
      country: 'South Africa',
      os: 'macOS',
      lastPage: '/about',
      fbid: '8962630583802784',
      assignedTo: 'Agent 1'
    },
    {
      id: '5',
      title: 'Starboy Okon',
      timestamp: new Date('2024-01-15 11:30:00'),
      lastMessage: 'When will my order arrive?',
      unread: true,
      messages: [],
      email: 'starboy.okon@test.com',
      status: 'open',
      source: 'WhatsApp',
      lastConverse: '2024-01-15 11:30:00',
      phone: '2222222222',
      country: 'Nigeria',
      os: 'Android',
      lastPage: '/contact',
      fbid: '8962630583802785',
      assignedTo: 'Agent 3'
    },
    {
      id: '6',
      title: 'Sarah Johnson',
      timestamp: new Date('2024-01-15 10:00:00'),
      lastMessage: 'How do I reset my password?',
      unread: true,
      messages: [],
      email: 'sarah.johnson@test.com',
      status: 'open',
      source: 'Web',
      lastConverse: '2024-01-15 10:00:00',
      phone: '3333333333',
      country: 'United Kingdom',
      os: 'macOS',
      lastPage: '/login',
      fbid: '8962630583802786',
      assignedTo: 'Agent 1'
    }
  ]

  // Initialize with mock data
  conversations.value = mockConversations

  // Computed properties
  const filteredConversations = computed(() => {
    let filtered = conversations.value

    // Filter by search query
    if (searchQuery.value) {
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        conv.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }

    // Filter by status (All, Open, Closed)
    if (activeFilter.value !== 'all') {
      filtered = filtered.filter(conv => conv.status === activeFilter.value)
    }

    // Filter by source (All, Facebook, WhatsApp, Web)
    if (activeTab.value !== 'all') {
      filtered = filtered.filter(conv => conv.source?.toLowerCase() === activeTab.value.toLowerCase())
    }

    // Filter by read status
    if (readFilter.value !== 'all') {
      filtered = filtered.filter(conv => 
        readFilter.value === 'unread' ? conv.unread : !conv.unread
      )
    }

    return filtered
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

  // Actions
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setActiveFilter = (filter: string) => {
    activeFilter.value = filter
  }

  const setActiveTab = (tab: string) => {
    activeTab.value = tab
  }

  const setReadFilter = (filter: 'all' | 'read' | 'unread') => {
    readFilter.value = filter
  }

  const selectConversation = (conversation: ExtendedChat) => {
    selectedConversation.value = conversation
    // Mark as read when selected
    if (conversation.unread) {
      conversation.unread = false
    }
    // Load messages for this conversation (mock)
    messages.value = [
      {
        id: '1',
        content: `Hello! I'm ${conversation.title || 'User'}. How can you help me today?`,
        sender: 'assistant',
        timestamp: new Date(Date.now() - 60000), // 1 minute ago
        attachments: []
      },
      {
        id: '2',
        content: conversation.lastMessage || 'No message content',
        sender: 'user',
        timestamp: new Date(Date.now() - 30000), // 30 seconds ago
        attachments: []
      }
    ]
  }

  const sendMessage = (content: string) => {
    if (!content.trim() || !selectedConversation.value) return

    const message: Message = {
      id: Date.now().toString(),
      content: content,
      sender: 'user',
      timestamp: new Date(),
      attachments: []
    }

    messages.value.push(message)
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

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    searchQuery,
    activeFilter,
    activeTab,
    readFilter,
    loading,
    
    // Computed
    filteredConversations,
    unreadCount,
    openCount,
    closedCount,
    
    // Actions
    setSearchQuery,
    setActiveFilter,
    setActiveTab,
    setReadFilter,
    selectConversation,
    sendMessage,
    markAsRead,
    markAsUnread,
    closeConversation,
    openConversation
  }
}) 