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
        <svg class="platform-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>
      <button 
        class="platform-btn" 
        :class="{ active: activeTab === 'whatsapp' }"
        @click="$emit('update:activeTab', 'whatsapp')"
      >
        <svg class="platform-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </button>
      <button 
        class="platform-btn" 
        :class="{ active: activeTab === 'web' }"
        @click="$emit('update:activeTab', 'web')"
      >
        <svg class="platform-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
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

.platform-icon {
  width: 16px;
  height: 16px;
}

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