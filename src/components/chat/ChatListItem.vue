<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Chat } from '../../types';

dayjs.extend(relativeTime);

const props = defineProps<{
  chat: Chat;
  isActive: boolean;
}>();

// Format timestamp as relative time (e.g. "5m ago", "2h ago")
const formattedTime = computed(() => {
  return dayjs(props.chat.timestamp).fromNow();
});

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
        <span class="timestamp">{{ formattedTime }}</span>
      </div>
      <p class="preview">{{ truncatedMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.chat-list-item {
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: background-color var(--transition-normal);
}

.chat-list-item:hover {
  background-color: var(--color-bg-hover);
}

.chat-list-item.active {
  background-color: var(--color-bg-active);
  border-left: 3px solid var(--color-primary);
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
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.timestamp {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.preview {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread .title {
  font-weight: 600;
}

.unread .preview {
  color: var(--color-text-primary);
}

.unread::after {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary);
  position: absolute;
  top: 50%;
  right: var(--space-4);
  transform: translateY(-50%);
}
</style>