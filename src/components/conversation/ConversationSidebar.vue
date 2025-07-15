<template>
  <div class="conversation-sidebar">
    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <input 
          type="text" 
          placeholder="Search conversations..." 
          class="search-input"
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
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
        @click="$emit('update:activeFilter', 'all')"
      >
        All
      </button>
      <button 
        class="filter-tab" 
        :class="{ active: activeFilter === 'open' }"
        @click="$emit('update:activeFilter', 'open')"
      >
        Open
      </button>
      <button 
        class="filter-tab" 
        :class="{ active: activeFilter === 'closed' }"
        @click="$emit('update:activeFilter', 'closed')"
      >
        Closed
      </button>
    </div>

    <!-- Conversation List -->
    <div class="conversation-list">
      <div 
        v-for="conversation in conversations"
        :key="conversation.id"
        class="conversation-item"
        :class="{ 
          active: selectedConversation?.id === conversation.id,
          unread: conversation.unread 
        }"
        @click="$emit('select-conversation', conversation)"
      >
        <div class="conversation-content">
          <div class="conversation-header">
            <h3 class="conversation-title">{{ conversation.title }}</h3>
            <span v-if="conversation.unread" class="unread-indicator"></span>
          </div>
          <p class="conversation-preview">{{ conversation.lastMessage }}</p>
          <div class="conversation-meta">
            <span class="conversation-time">{{ formatTime(conversation.timestamp) }}</span>
            <span class="conversation-status" :class="conversation.status">{{ conversation.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExtendedChat } from '@/types'

interface Props {
  searchQuery: string
  activeFilter: string
  conversations: ExtendedChat[]
  selectedConversation?: ExtendedChat | null
}

defineProps<Props>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:activeFilter': [value: string]
  'select-conversation': [conversation: ExtendedChat]
}>()

const formatTime = (date: Date) => {
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style scoped>
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
}

.conversation-item {
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
}

.conversation-item:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border);
}

.conversation-item.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.conversation-item.unread {
  border-left: 3px solid var(--color-primary);
}

.conversation-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.conversation-item.active .conversation-title {
  color: white;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
}

.conversation-preview {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.conversation-item.active .conversation-preview {
  color: rgba(255, 255, 255, 0.8);
}

.conversation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.conversation-time {
  color: var(--color-text-tertiary);
}

.conversation-item.active .conversation-time {
  color: rgba(255, 255, 255, 0.6);
}

.conversation-status {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.conversation-status.open {
  background-color: var(--color-success);
  color: white;
}

.conversation-status.closed {
  background-color: var(--color-text-tertiary);
  color: white;
}

.conversation-item.active .conversation-status {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .conversation-sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .conversation-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
}
</style> 