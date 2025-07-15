<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApiKeyStore } from '@/stores/apiKeyStore'
import {
  ConversationSidebar,
  ChatHeader,
  ChatMessages,
  MessageInput,
  UserSidebar
} from '@/components/conversation'
import type { Message, Chat, ExtendedChat } from '@/types'

const route = useRoute()
const apiKeyStore = useApiKeyStore()

// Reactive data
const searchQuery = ref('')
const activeFilter = ref('all')
const activeUserTab = ref('profile')
const selectedConversation = ref<ExtendedChat | null>(null)
const newMessage = ref('')
const messages = ref<Message[]>([])

// Mock data for conversations (converted to Chat type)
const conversations = ref<ExtendedChat[]>([
  {
    id: '1',
    title: 'Ijaida James',
    timestamp: new Date('2024-01-15 14:30:00'),
    lastMessage: 'Hello, I need help with my order',
    unread: false,
    messages: [],
    // Additional properties for the UI
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
    source: 'Facebook',
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
    source: 'Facebook',
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
    source: 'Facebook',
    lastConverse: '2024-01-15 11:30:00',
    phone: '2222222222',
    country: 'Nigeria',
    os: 'Android',
    lastPage: '/contact',
    fbid: '8962630583802785',
    assignedTo: 'Agent 3'
  }
])

// Computed properties
const filteredConversations = computed(() => {
  let filtered = conversations.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (conv as any).email?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by status
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(conv => (conv as any).status === activeFilter.value)
  }

  return filtered
})

const satisfactionPercentage = computed(() => {
  return selectedConversation.value?.satisfaction || 25
})

// Methods
const selectConversation = (conversation: Chat) => {
  selectedConversation.value = conversation
  // In the future, load messages for this conversation
  messages.value = []
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return

  const message: Message = {
    id: Date.now().toString(),
    content: newMessage.value,
    sender: 'user',
    timestamp: new Date(),
    attachments: []
  }

  messages.value.push(message)
  newMessage.value = ''
}

// Lifecycle
onMounted(() => {
  // Set API key from route
  const chatId = route.params.id as string
  if (chatId) {
    apiKeyStore.setApiKey(chatId)
    console.log('Chat API Key set:', chatId)
  }

  // Select first conversation by default
  if (conversations.value.length > 0) {
    selectConversation(conversations.value[0])
  }
})
</script>

<template>
  <div class="chat-view">
    <!-- Left Sidebar - Conversation List -->
    <ConversationSidebar 
      :search-query="searchQuery"
      :active-filter="activeFilter"
      :conversations="filteredConversations"
      :selected-conversation="selectedConversation"
      @update:search-query="searchQuery = $event"
      @update:active-filter="activeFilter = $event"
      @select-conversation="selectConversation"
    />

    <!-- Main Chat Area -->
    <div class="chat-main">
      <!-- Chat Header -->
      <ChatHeader :user-name="selectedConversation?.title" />

      <!-- Chat Messages Area -->
      <ChatMessages 
        :has-selected-conversation="!!selectedConversation"
        :messages="messages"
      />

      <!-- Message Input -->
      <MessageInput 
        :message="newMessage"
        @update:message="newMessage = $event"
        @send="sendMessage"
      />
    </div>

    <!-- Right Sidebar - User Details -->
    <UserSidebar 
      :user="selectedConversation"
      :active-tab="activeUserTab"
      :satisfaction-percentage="satisfactionPercentage"
      @update:active-tab="activeUserTab = $event"
    />
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: var(--color-bg-primary);
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-view {
    flex-direction: column;
  }
  
  .chat-main {
    flex: 1;
  }
}
</style>
