<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import ChatMessage from './ChatMessage.vue'
import MessageSkeleton from './MessageSkeleton.vue'
import type { Message } from '@/types'

const props = defineProps<{
  hasSelectedConversation: boolean
  messages: Message[]
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'retry': []
}>()

const messagesContainer = ref<HTMLDivElement>()

// Auto-scroll to bottom when new messages are added
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Watch for messages changes to auto-scroll
watch(() => props.messages.length, () => {
  scrollToBottom()
})

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-messages">
    <div 
      v-if="!hasSelectedConversation" 
      class="no-conversation"
    >
      <div class="no-conversation-content">
        <div class="no-conversation-icon">💬</div>
        <h3>No Conversation Selected</h3>
        <p>Select a conversation from the sidebar to start chatting.</p>
      </div>
    </div>
    
    <div 
      v-else-if="loading" 
      class="loading-messages"
    >
      <div class="messages-skeleton-list">
        <MessageSkeleton v-for="i in 6" :key="`skeleton-${i}`" :lines="Math.floor(Math.random() * 3) + 1" :is-user="i % 2 === 0" />
      </div>
    </div>
    
    <div 
      v-else-if="error" 
      class="error-messages"
    >
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <p class="error-text">Failed to load messages</p>
      <p class="error-subtext">{{ error }}</p>
      <button class="retry-btn" @click="emit('retry')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M3 21v-5h5"></path>
        </svg>
        Retry
      </button>
    </div>
    
    <div 
      v-else 
      ref="messagesContainer"
      class="messages-container"
    >
      <div v-if="messages.length === 0" class="no-messages">
        <div class="no-messages-content">
          <div class="no-messages-icon">📝</div>
          <h3>No Messages Yet</h3>
          <p>Start the conversation by sending a message.</p>
        </div>
      </div>
      
      <div v-else class="messages-list">
        <ChatMessage 
          v-for="message in messages" 
          :key="message.id" 
          :message="message" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  overflow: hidden;
}

.no-conversation,
.no-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.no-conversation-content,
.no-messages-content {
  text-align: center;
  max-width: 400px;
}

.no-conversation-icon,
.no-messages-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.no-conversation-content h3,
.no-messages-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.no-conversation-content p,
.no-messages-content p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-6);
  scroll-behavior: smooth;
  background: linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 800px;
  margin: 0 auto;
}

/* Custom scrollbar */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--color-bg-tertiary);
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

/* Loading Messages */
.loading-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-4) var(--space-6);
}

.messages-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 800px;
  margin: 0 auto;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Error Messages */
.error-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  text-align: center;
}

.error-icon {
  margin-bottom: var(--space-3);
  opacity: 0.5;
  color: var(--color-error);
}

.error-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-1) 0;
}

.error-subtext {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  margin: 0 0 var(--space-3) 0;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.retry-btn:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .messages-container {
    padding: var(--space-3);
  }
  
  .no-conversation,
  .no-messages,
  .loading-messages,
  .error-messages {
    padding: var(--space-4);
  }
  
  .no-conversation-icon,
  .no-messages-icon {
    font-size: 3rem;
  }
}
</style> 