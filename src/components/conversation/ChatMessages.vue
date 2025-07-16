<template>
  <div class="chat-messages">
    <div v-if="!hasSelectedConversation" class="no-conversation">
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
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '@/types'

interface Props {
  hasSelectedConversation: boolean
  messages: Message[]
}

defineProps<Props>()
</script>

<style scoped>
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
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style> 