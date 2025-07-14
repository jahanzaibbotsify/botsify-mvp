<script setup lang="ts">
import { computed } from 'vue';
import type { Chat } from '@/types';

const props = defineProps<{
  chat: Chat;
  isActive: boolean;
}>();

// Truncate message if it's too long
const truncatedMessage = computed(() => {
  if (!props.chat.lastMessage) return '';
  return props.chat.lastMessage.length > 40
    ? props.chat.lastMessage.substring(0, 40) + '...'
    : props.chat.lastMessage;
});
</script>

<template>
  <div 
    class="chat-list-item" 
    :class="{ active: isActive, unread: chat.unread }"
  >
    <div class="content">
      <div class="title-row">
        <h3 class="title">{{ chat.title }}</h3>
      </div>
      <p class="preview">{{ truncatedMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.chat-list-item {
  padding: var(--space-2) var(--space-3);
  margin: var(--space-1) 0;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color var(--transition-normal);
  position: relative;
}

.chat-list-item:hover {
  background-color: var(--color-bg-hover);
}

.chat-list-item.active {
  background-color: var(--color-bg-active);
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .chat-list-item:hover {
  background-color: rgba(42, 42, 42, 0.8);
  background-image: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(42, 42, 42, 0.8) 100%);
}

[data-theme="dark"] .chat-list-item.active {
  background-color: rgba(42, 42, 42, 0.9);
  background-image: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(42, 42, 42, 0.9) 100%);
  border-left: 2px solid rgba(59, 130, 246, 0.4);
}

/* Light mode with subtle blue tints */
[data-theme="light"] .chat-list-item:hover {
  background-color: rgba(248, 250, 252, 0.8);
  background-image: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(248, 250, 252, 0.8) 100%);
}

[data-theme="light"] .chat-list-item.active {
  background-color: rgba(241, 245, 249, 0.9);
  background-image: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(241, 245, 249, 0.9) 100%);
  border-left: 2px solid rgba(59, 130, 246, 0.3);
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread .title {
  font-weight: 500;
  color: var(--color-text-primary);
}

.unread .preview {
  color: var(--color-text-secondary);
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .title {
  color: #e5e5e5;
}

[data-theme="dark"] .preview {
  color: #a3a3a3;
}

[data-theme="dark"] .unread .title {
  color: #ffffff;
}

[data-theme="dark"] .unread .preview {
  color: #d4d4d4;
}

.unread::after {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-success);
  position: absolute;
  top: 50%;
  right: var(--space-3);
  transform: translateY(-50%);
}

/* Override for ChatGPT-style dark mode */
[data-theme="dark"] .unread::after {
  background-color: #10b981;
}
</style>