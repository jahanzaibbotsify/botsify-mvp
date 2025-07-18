
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ExtendedChat } from '@/types'
import ConversationSkeleton from './ConversationSkeleton.vue'
import FilterSection from './Filter.vue'
import { getPlatformClass, getPlatformIcon } from '@/utils'

interface Props {
  searchQuery: string
  activeFilter: string
  activeTab: string
  readFilter: 'all' | 'read' | 'unread'
  chatTypeFilter: 'all' | 'my' | 'other'
  sortOrder: 'asc' | 'desc'
  conversations: ExtendedChat[]
  selectedConversation?: ExtendedChat | null
  isLoadingMore?: boolean
  loading?: boolean
  error?: string | null
  isSearching?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoadingMore: false,
  isSearching: false
})

const conversationList = ref<HTMLDivElement>()
const filtersExpanded = ref(false)
const currentQuickFilter = ref<string | null>(null)

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:activeFilter': [value: string]
  'update:activeTab': [value: string]
  'update:readFilter': [value: 'all' | 'read' | 'unread']
  'update:chatTypeFilter': [value: 'all' | 'my' | 'other']
  'update:sortOrder': [value: 'asc' | 'desc']
  'select-conversation': [conversation: ExtendedChat]
  'load-more-conversations': []
  'retry': []
  'search': [query: string]
}>()

// Filter Options
const quickFilterOptions = [
  { value: 'all', label: 'All', icon: 'pi pi-comments' },
  { value: 'open', label: 'Open', icon: 'pi pi-check-circle' },
  { value: 'closed', label: 'Closed', icon: 'pi pi-times-circle' }
];

const readStatusOptions = [
  { value: 'all', label: 'All', icon: 'pi pi-eye' },
  { value: 'read', label: 'Read', icon: 'pi pi-eye' },
  { value: 'unread', label: 'Unread', icon: 'pi pi-eye-slash' }
];

const platformOptions = [
  { value: 'all', label: 'All', icon: 'pi pi-globe' },
  { value: 'facebook', label: 'Facebook', icon: 'pi pi-facebook' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'pi pi-whatsapp' },
  { value: 'web', label: 'Website', icon: 'pi pi-globe' },
  { value: 'instagram', label: 'Instagram', icon: 'pi pi-instagram' },
  { value: 'telegram', label: 'Telegram', icon: 'pi pi-telegram' }
];

// Computed Properties
const activeFiltersCount = computed(() => {
  let count = 0
  if (props.activeFilter !== 'all') count++
  if (props.readFilter !== 'all') count++
  if (props.activeTab !== 'all') count++
  return count
})

const hasActiveFilters = computed(() => activeFiltersCount.value > 0)

const activeFiltersList = computed(() => {
  const filters = []
  
  if (props.activeFilter !== 'all') {
    filters.push({
      key: 'activeFilter',
      label: 'Status',
      value: quickFilterOptions.find(opt => opt.value === props.activeFilter)?.label || props.activeFilter
    })
  }
  
  if (props.readFilter !== 'all') {
    filters.push({
      key: 'readFilter',
      label: 'Read Status',
      value: readStatusOptions.find(opt => opt.value === props.readFilter)?.label || props.readFilter
    })
  }
  
  if (props.activeTab !== 'all') {
    filters.push({
      key: 'activeTab',
      label: 'Platform',
      value: platformOptions.find(opt => opt.value === props.activeTab)?.label || props.activeTab
    })
  }
  
  return filters
})

// Methods
const toggleFilters = () => {
  filtersExpanded.value = !filtersExpanded.value
}

const clearAllFilters = () => {
  emit('update:activeFilter', 'all')
  emit('update:readFilter', 'all')
  emit('update:activeTab', 'all')
  currentQuickFilter.value = null
}

const removeFilter = (filterKey: string) => {
  switch (filterKey) {
    case 'activeFilter':
      emit('update:activeFilter', 'all')
      break
    case 'readFilter':
      emit('update:readFilter', 'all')
      break
    case 'activeTab':
      emit('update:activeTab', 'all')
      break
  }
}

const applyQuickFilter = (value: string) => {
  currentQuickFilter.value = value
  emit('update:activeFilter', value)
}

// Event handlers for FilterSection components
const handleReadFilterUpdate = (value: string | string[]) => {
  const finalValue = Array.isArray(value) ? value[0] || 'all' : value
  emit('update:readFilter', finalValue as 'all' | 'read' | 'unread')
}

const handleActiveTabUpdate = (value: string | string[]) => {
  const finalValue = Array.isArray(value) ? value[0] || 'all' : value
  emit('update:activeTab', finalValue)
}

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  const query = target.value
  emit('update:searchQuery', query)
  emit('search', query)
}

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

<template>
  <div class="conversation-sidebar">
    <!-- Header with Search -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">Conversations</h2>
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">
            <i v-if="!isSearching" class="pi pi-search"></i>
            <i v-else class="pi pi-spin pi-spinner"></i>
          </span>
          <input 
            type="text" 
            placeholder="Search conversations..." 
            class="search-input"
            :value="searchQuery"
            @input="handleSearch"
            :disabled="isSearching"
          />
          <div v-if="isSearching" class="search-loading-indicator">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Filters Section -->
    <div class="filters-section">
      <!-- Filter Header -->
      <div class="filters-header">
        <div class="filters-title">
          <i class="pi pi-filter"></i>
          <span>Filters</span>
          <div v-if="activeFiltersCount > 0" class="active-filters-badge">
            {{ activeFiltersCount }}
          </div>
        </div>
        <div class="filter-actions">
          <button 
            v-if="hasActiveFilters" 
            @click="clearAllFilters" 
            class="clear-all-btn"
            title="Clear all filters"
          >
            <i class="pi pi-times"></i>
            Clear
          </button>
          <button 
            @click="toggleFilters" 
            class="toggle-filters-btn"
            :class="{ 'expanded': filtersExpanded }"
          >
            <i class="pi pi-chevron-down"></i>
          </button>
        </div>
      </div>
      
      <!-- Collapsible Filters Container -->
      <Transition name="filters-collapse">
        <div v-show="filtersExpanded" class="filters-container">
          <!-- Quick Filter Chips -->
          <div class="quick-filters">
            <div class="quick-filter-label">Quick Filters</div>
            <div class="quick-filter-chips">
              <button 
                v-for="option in quickFilterOptions" 
                :key="option.value"
                @click="applyQuickFilter(option.value)"
                class="quick-filter-chip"
                :class="{ 'active': currentQuickFilter === option.value }"
              >
                <i :class="['filter-icon', option.icon]" />
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Individual Filter Sections -->
          <div class="filter-sections">
            <!-- Read Status Filter -->
            <FilterSection 
              title="Read Status"
              icon="pi pi-eye"
              :options="readStatusOptions"
              :selected="readFilter"
              @update="handleReadFilterUpdate"
            />

            <!-- Platform Filter -->
            <FilterSection 
              title="Platform"
              icon="pi pi-mobile"
              :options="platformOptions"
              :selected="activeTab"
              @update="handleActiveTabUpdate"
            />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="active-filters-display">
      <div class="active-filters-label">Active Filters:</div>
      <div class="active-filters-list">
        <div 
          v-for="filter in activeFiltersList" 
          :key="filter.key"
          class="active-filter-tag"
        >
          <span class="filter-label">{{ filter.label }}:</span>
          <span class="filter-value">{{ filter.value }}</span>
          <button 
            @click="removeFilter(filter.key)"
            class="remove-filter-btn"
            :title="`Remove ${filter.label} filter`"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
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
          <div v-if="conversation.profilePic" class="avatar-image">
            <img :src="conversation.profilePic" :alt="conversation.title" />
          </div>
          <div v-else class="avatar-placeholder">
            {{ getInitials(conversation.title) }}
          </div>

          <!-- Platform Icon Badge -->
          <span
            class="avatar-platform-icon"
            :class="getPlatformClass(conversation.source)"
          >
            <i :class="getPlatformIcon(conversation.source)"></i>
          </span>

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
        </div>
      </div>

      <!-- Loading More Skeleton -->
      <div v-if="isLoadingMore" class="loading-more-skeletons">
        <ConversationSkeleton v-for="i in 3" :key="`skeleton-${i}`" />
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-state">
        <div class="error-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <p class="error-text">Failed to load conversations</p>
        <p class="error-subtext">{{ error }}</p>
        <button class="retry-btn" @click="$emit('retry')">
          <i class="pi pi-refresh retry-icon"></i>
          Retry
        </button>
      </div>

      <!-- Initial Loading State -->
      <div v-else-if="loading && conversations.length === 0" class="initial-loading-skeletons">
        <ConversationSkeleton v-for="i in 8" :key="`initial-skeleton-${i}`" />
      </div>

      <!-- Empty State -->
      <div v-else-if="conversations.length === 0 && !isLoadingMore" class="empty-state">
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
  padding-right: 48px;
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

.search-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.search-loading-indicator {
  position: absolute;
  right: var(--space-3);
  z-index: 1;
}

.loading-dots {
  display: flex;
  gap: 2px;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  background-color: var(--color-primary);
  border-radius: 50%;
  animation: loading-dots 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-dots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Enhanced Filters Section */
.filters-section {
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition-normal);
}

.filters-header:hover {
  background-color: var(--color-bg-hover);
}

.filters-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.active-filters-badge {
  background-color: var(--color-primary);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  min-width: 18px;
  text-align: center;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-error);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.clear-all-btn:hover {
  background-color: var(--color-error);
  opacity: 0.9;
}

.toggle-filters-btn {
  padding: var(--space-1);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
}

.toggle-filters-btn:hover {
  color: var(--color-text-primary);
}

.toggle-filters-btn.expanded i {
  transform: rotate(180deg);
}

/* Filter Collapse Animation */
.filters-collapse-enter-active,
.filters-collapse-leave-active {
  transition: all var(--transition-normal);
  max-height: 500px;
  opacity: 1;
}

.filters-collapse-enter-from,
.filters-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.filters-container {
  padding: var(--space-4);
  background-color: var(--color-bg-tertiary);
  border-top: 1px solid var(--color-border);
}

/* Quick Filters */
.quick-filters {
  margin-bottom: var(--space-4);
}

.quick-filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-filter-chips {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.quick-filter-chip {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.quick-filter-chip:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.quick-filter-chip.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Filter Sections */
.filter-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Active Filters Display */
.active-filters-display {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.active-filters-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.active-filter-tag {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  color: var(--color-text-primary);
}

.filter-label {
  font-weight: 600;
}

.filter-value {
  font-weight: 400;
}

.remove-filter-btn {
  padding: var(--space-1);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: color var(--transition-normal);
}

.remove-filter-btn:hover {
  color: var(--color-error);
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
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.avatar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
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

.avatar-platform-icon {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  font-size: 0.75rem;
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

/* Loading More Skeletons */
.loading-more-skeletons {
  padding: var(--space-2);
}

.initial-loading-skeletons {
  padding: var(--space-2);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-tertiary);
}

.error-icon {
  margin-bottom: var(--space-3);
  opacity: 0.5;
  color: var(--color-error);
}

.error-text {
  margin: 0 0 var(--space-1) 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.error-subtext {
  margin: 0 0 var(--space-3) 0;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
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