<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApiKeyStore } from '@/stores/apiKeyStore'
import ChatMessage from '@/components/agent/ChatMessage.vue'
import ChatListItem from '@/components/agent/ChatListItem.vue'
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
    <div class="conversation-sidebar">
      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Search conversations..." 
            class="search-input"
            v-model="searchQuery"
          />
          <button class="search-button icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          All
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'open' }"
          @click="activeFilter = 'open'"
        >
          Open
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeFilter === 'closed' }"
          @click="activeFilter = 'closed'"
        >
          Closed
        </button>
      </div>

      <!-- Conversation List -->
      <div class="conversation-list">
        <ChatListItem
          v-for="conversation in filteredConversations" 
          :key="conversation.id"
          :chat="conversation"
          :is-active="selectedConversation?.id === conversation.id"
          @click="selectConversation(conversation)"
        />
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="chat-main">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-user-info">
          <h2 class="chat-user-name">{{ selectedConversation?.title || 'Select a conversation' }}</h2>
        </div>
        <div class="chat-actions">
          <button class="status-button">
            <span class="status-dot active"></span>
            <span class="status-text">Active</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <button class="translate-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.01-4.65.83-6.67l2.16-2.16c-.56-.56-1.47-.56-2.03 0L9.5 5.5c-.56.56-.56 1.47 0 2.03l.03.03c-2.02 1.18-4.73.91-6.67-.83l-.03-.03c-.56-.56-1.47-.56-2.03 0L.5 5.5c-.56.56-.56 1.47 0 2.03l2.16 2.16c1.74 1.94 2.01 4.65.83 6.67l-.03.03c-.56.56-.56 1.47 0 2.03l2.16 2.16c.56.56 1.47.56 2.03 0l2.16-2.16c.56-.56.56-1.47 0-2.03l-.03-.03z"/>
            </svg>
            G Translate
          </button>
        </div>
      </div>

      <!-- Chat Messages Area -->
      <div class="chat-messages">
        <div v-if="!selectedConversation" class="no-conversation">
          <div class="no-conversation-illustration">
            <div class="sign">No messages in conversation for this user</div>
          </div>
          <p class="no-message-text">
            No message in this user's conversation, this may be because messages have been deleted by the user or the system
          </p>
        </div>
        
        <div v-else-if="messages.length === 0" class="no-messages">
          <div class="no-messages-illustration">
            <div class="sign">No messages in conversation for this user</div>
          </div>
          <p class="no-message-text">
            No message in this user's conversation, this may be because messages have been deleted by the user or the system
          </p>
        </div>

        <div v-else class="messages-container">
          <div class="messages-wrapper">
            <ChatMessage
              v-for="message in messages" 
              :key="message.id"
              :message="message"
            />
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <div class="input-actions">
          <button class="action-button icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </button>
          <button class="action-button icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button class="action-button icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>
        </div>
        <div class="input-wrapper">
          <input 
            type="text" 
            placeholder="Message" 
            class="message-input"
            v-model="newMessage"
            @keyup.enter="sendMessage"
          />
        </div>
        <button class="send-button icon-button" @click="sendMessage">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>

    <!-- Right Sidebar - User Details -->
    <div class="user-sidebar">
      <!-- User Profile Header -->
      <div class="user-profile-header">
        <div class="user-avatar">
          <div class="avatar-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
        <div class="user-info">
          <div class="user-name">{{ selectedConversation?.title || 'Select User' }}</div>
          <div class="user-email">{{ selectedConversation?.email || 'user@example.com' }}</div>
        </div>
        <button class="notification-button icon-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
        </button>
      </div>

      <!-- User Details Tabs -->
      <div class="user-tabs">
        <button 
          class="user-tab" 
          :class="{ active: activeUserTab === 'profile' }"
          @click="activeUserTab = 'profile'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
        <button 
          class="user-tab" 
          :class="{ active: activeUserTab === 'data' }"
          @click="activeUserTab = 'data'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
        </button>
      </div>

      <!-- User Details Content -->
      <div v-if="activeUserTab === 'profile'" class="user-details-content">
        <div class="detail-item">
          <span class="detail-label">Source:</span>
          <span class="detail-value">{{ selectedConversation?.source || 'Facebook' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Last Converse:</span>
          <span class="detail-value">{{ selectedConversation?.lastConverse || '0000-00-00 00:00:00' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Phone:</span>
          <span class="detail-value">{{ selectedConversation?.phone || '1234567890' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Country:</span>
          <span class="detail-value">{{ selectedConversation?.country || 'United States' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">OS:</span>
          <span class="detail-value">{{ selectedConversation?.os || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Last Page:</span>
          <span class="detail-value">{{ selectedConversation?.lastPage || '' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">fbid:</span>
          <span class="detail-value">{{ selectedConversation?.fbid || '8962630583802781' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Currently Assigned To:</span>
          <span class="detail-value">{{ selectedConversation?.assignedTo || '' }}</span>
        </div>
      </div>

      <!-- User Attributes Content -->
      <div v-if="activeUserTab === 'data'" class="user-attributes-content">
        <div class="attributes-header">
          <div class="attributes-title">
            <span class="title-line"></span>
            <h3 class="attributes-heading">User Attributes</h3>
            <span class="title-line"></span>
          </div>
        </div>
        
        <div class="attributes-list">
          <div class="attribute-item">
            <span class="attribute-tag">referrer_domain</span>
            <span class="attribute-value">csv</span>
          </div>
          <div class="attribute-item">
            <span class="attribute-tag">session_id</span>
            <span class="attribute-value">sess_1234567890abcdef</span>
          </div>
          <div class="attribute-item">
            <span class="attribute-tag">ip_address</span>
            <span class="attribute-value">192.168.1.100</span>
          </div>
          <div class="attribute-item">
            <span class="attribute-tag">language</span>
            <span class="attribute-value">en-US</span>
          </div>
          <div class="attribute-item">
            <span class="attribute-tag">timezone</span>
            <span class="attribute-value">America/New_York</span>
          </div>
          <div class="attribute-item">
            <span class="attribute-tag">screen_resolution</span>
            <span class="attribute-value">1920x1080</span>
          </div>
          <div class="attribute-item">
            <span class="attribute-tag">device_type</span>
            <span class="attribute-value">desktop</span>
          </div>
        </div>
      </div>

      <!-- User Satisfaction -->
      <div class="user-satisfaction">
        <div class="satisfaction-header">
          <span class="satisfaction-label">User Satisfaction</span>
        </div>
        <div class="satisfaction-bar">
          <div class="satisfaction-fill" :style="{ width: satisfactionPercentage + '%' }"></div>
          <div class="satisfaction-emoji sad">😞</div>
          <div class="satisfaction-emoji happy">😊</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="user-actions">
        <button class="user-action-button icon-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
        <button class="user-action-button icon-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
        <button class="user-action-button icon-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: var(--color-bg-primary);
}

/* Left Sidebar - Conversation List */
.conversation-sidebar {
  width: 280px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-container {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  padding-right: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.search-button {
  position: absolute;
  right: var(--space-2);
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
}

.filter-tabs {
  display: flex;
  padding: var(--space-3) var(--space-4);
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.filter-tab {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.filter-tab:hover {
  background-color: var(--color-bg-hover);
}

.filter-tab.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}



/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.chat-user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.chat-actions {
  display: flex;
  gap: var(--space-3);
}

.status-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.status-button:hover {
  background-color: var(--color-bg-hover);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-text-tertiary);
}

.status-dot.active {
  background-color: var(--color-success);
}

.translate-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.translate-button:hover {
  background-color: var(--color-bg-hover);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.no-conversation,
.no-messages {
  text-align: center;
  color: var(--color-text-tertiary);
}

.no-conversation-illustration,
.no-messages-illustration {
  position: relative;
  width: 300px;
  height: 200px;
  margin-bottom: var(--space-4);
}

.sign {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.no-message-text {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  max-width: 400px;
  text-align: center;
  line-height: 1.5;
}

.messages-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.message-input-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.input-actions {
  display: flex;
  gap: var(--space-2);
}

.action-button {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--transition-normal);
}

.action-button:hover {
  color: var(--color-text-primary);
}

.input-wrapper {
  flex: 1;
}

.message-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  resize: none;
}

.message-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.send-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.send-button:hover {
  background-color: var(--color-primary-hover);
}

/* Right Sidebar - User Details */
.user-sidebar {
  width: 320px;
  background-color: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.user-avatar {
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-button {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--transition-normal);
}

.notification-button:hover {
  color: var(--color-text-primary);
}

.user-tabs {
  display: flex;
  padding: var(--space-3) var(--space-4);
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.user-tab {
  flex: 1;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-tab:hover {
  background-color: var(--color-bg-hover);
}

.user-tab.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.user-details-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.detail-value {
  color: var(--color-text-primary);
  font-size: 0.875rem;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

/* User Attributes Styles */
.user-attributes-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.attributes-header {
  margin-bottom: var(--space-4);
}

.attributes-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.title-line {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    var(--color-border) 0,
    var(--color-border) 4px,
    transparent 4px,
    transparent 8px
  );
}

.attributes-heading {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
}

.attributes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}

.attribute-tag {
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.attribute-value {
  color: var(--color-text-primary);
  font-size: 0.875rem;
  word-break: break-word;
  flex: 1;
}

.user-satisfaction {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.satisfaction-header {
  margin-bottom: var(--space-3);
}

.satisfaction-label {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.satisfaction-bar {
  position: relative;
  height: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.satisfaction-fill {
  height: 100%;
  background-color: var(--color-error);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.satisfaction-emoji {
  position: absolute;
  top: -8px;
  font-size: 16px;
}

.satisfaction-emoji.sad {
  left: 0;
}

.satisfaction-emoji.happy {
  right: 0;
}

.user-actions {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.user-action-button {
  flex: 1;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.user-action-button:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .user-sidebar {
    width: 280px;
  }
}

@media (max-width: 1024px) {
  .conversation-sidebar {
    width: 240px;
  }
  
  .user-sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .chat-view {
    flex-direction: column;
  }
  
  .conversation-sidebar,
  .user-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
  
  .chat-main {
    flex: 1;
  }
}
</style>