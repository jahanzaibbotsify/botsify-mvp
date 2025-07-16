<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import ChatMessage from './ChatMessage.vue'
import type { Message } from '@/types'

const props = defineProps<{
  hasSelectedConversation: boolean
  messages: Message[]
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

/* Responsive Design */
@media (max-width: 768px) {
  .messages-container {
    padding: var(--space-3);
  }
  
  .no-conversation,
  .no-messages {
    padding: var(--space-4);
  }
  
  .no-conversation-icon,
  .no-messages-icon {
    font-size: 3rem;
  }
}
</style> 