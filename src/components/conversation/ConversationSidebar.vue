<template>
  <div class="conversation-sidebar">
    <!-- Header with Search -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">Conversations</h2>
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search conversations..." 
            class="search-input"
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          />
        </div>
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

    <!-- Platform Filter -->
    <div class="platform-filter">
      <button 
        class="platform-btn" 
        :class="{ active: activeTab === 'all' }"
        @click="$emit('update:activeTab', 'all')"
      >
        All
      </button>
      <button 
        class="platform-btn" 
        :class="{ active: activeTab === 'facebook' }"
        @click="$emit('update:activeTab', 'facebook')"
      >
        <i class="pi pi-facebook"></i>
      </button>
      <button 
        class="platform-btn" 
        :class="{ active: activeTab === 'whatsapp' }"
        @click="$emit('update:activeTab', 'whatsapp')"
      >
        <i class="pi pi-whatsapp"></i>
      </button>
      <button 
        class="platform-btn" 
        :class="{ active: activeTab === 'web' }"
        @click="$emit('update:activeTab', 'web')"
      >
        <i class="pi pi-globe"></i>
      </button>
    </div>

    <!-- Conversation List -->
    <div 
      ref="conversationList"
      class="conversation-list"
      @scroll="handleScroll"
    >
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
        <!-- Avatar -->
        <div class="conversation-avatar">
          <div class="avatar-placeholder">
            {{ getInitials(conversation.title) }}
          </div>
          <div v-if="conversation.unread" class="unread-badge">
            {{ getUnreadCount(conversation) }}
          </div>
        </div>

        <!-- Content -->
        <div class="conversation-content">
          <div class="conversation-header">
            <h3 class="conversation-title">{{ conversation.title }}</h3>
            <span class="conversation-time">{{ formatTime(conversation.timestamp) }}</span>
          </div>
          <p class="conversation-preview">{{ conversation.lastMessage }}</p>
          <div class="conversation-meta">
            <span class="conversation-platform">{{ conversation.source || 'Unknown' }}</span>
          </div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoadingMore" class="loading-indicator">
        <div class="loading-spinner"></div>
        <span>Loading more conversations...</span>
      </div>

      <!-- Empty State -->
      <div v-if="conversations.length === 0 && !isLoadingMore" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <p class="empty-text">No conversations found</p>
        <p class="empty-subtext">Try adjusting your filters</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ExtendedChat } from '@/types'

interface Props {
  searchQuery: string
  activeFilter: string
  activeTab: string
  readFilter: 'all' | 'read' | 'unread'
  conversations: ExtendedChat[]
  selectedConversation?: ExtendedChat | null
  isLoadingMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoadingMore: false
})

const conversationList = ref<HTMLDivElement>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:activeFilter': [value: string]
  'update:activeTab': [value: string]
  'update:readFilter': [value: 'all' | 'read' | 'unread']
  'select-conversation': [conversation: ExtendedChat]
  'load-more-conversations': []
}>()

const handleScroll = (event: Event) => {
  const target = event.target as HTMLDivElement
  const { scrollTop, scrollHeight, clientHeight } = target
  
  // Load more when user scrolls to bottom (with 50px threshold)
  if (scrollHeight - scrollTop - clientHeight < 50 && !props.isLoadingMore) {
    emit('load-more-conversations')
  }
}

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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getUnreadCount = (conversation: ExtendedChat) => {
  // Mock unread count - in real app this would come from the conversation data
  return conversation.unread ? Math.floor(Math.random() * 10) + 1 : 0
}
</script>

<style scoped>
.conversation-sidebar {
  width: 320px;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.sidebar-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.sidebar-title {
  margin: 0 0 var(--space-3) 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-tertiary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  padding-left: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  transition: border-color var(--transition-normal);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  padding: var(--space-3) var(--space-4);
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
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
  border-color: var(--color-primary);
}

.filter-tab.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Platform Filter */
.platform-filter {
  display: flex;
  padding: var(--space-3) var(--space-4);
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.platform-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.platform-btn:first-child {
  width: auto;
  padding: 0 var(--space-3);
  font-size: 0.875rem;
  font-weight: 500;
}

.platform-btn:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.platform-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* .platform-icon {
  width: 16px;
  height: 16px;
} */

/* Conversation List */
.conversation-list {
  flex: 1;
  overflow-y: auto;
  background-color: var(--color-bg-primary);
}

.conversation-item {
  display: flex;
  align-items: flex-start;
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.conversation-item:hover {
  background-color: var(--color-bg-hover);
}

.conversation-item.active {
  background-color: var(--color-primary);
  color: white;
}

.conversation-item.unread {
  background-color: var(--color-bg-secondary);
}

.conversation-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--color-primary);
}

/* Avatar */
.conversation-avatar {
  position: relative;
  margin-right: var(--space-3);
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background-color: var(--color-error);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-1);
}

/* Content */
.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-1);
}

.conversation-title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.conversation-item.active .conversation-title {
  color: white;
}

.conversation-time {
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  margin-left: var(--space-2);
}

.conversation-item.active .conversation-time {
  color: rgba(255, 255, 255, 0.7);
}

.conversation-preview {
  margin: 0 0 var(--space-1) 0;
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
  font-size: 0.7rem;
}

.conversation-platform {
  color: var(--color-text-tertiary);
  text-transform: capitalize;
  font-size: 0.7rem;
}

.conversation-item.active .conversation-platform {
  color: rgba(255, 255, 255, 0.7);
}

/* Loading Indicator */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.loading-indicator .loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-tertiary);
}

.empty-icon {
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.empty-text {
  margin: 0 0 var(--space-1) 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.empty-subtext {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .conversation-sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .conversation-sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
  }
  
  .conversation-item {
    padding: var(--space-2) var(--space-3);
  }
  
  .avatar-placeholder {
    width: 40px;
    height: 40px;
    font-size: 0.75rem;
  }
}
</style> 