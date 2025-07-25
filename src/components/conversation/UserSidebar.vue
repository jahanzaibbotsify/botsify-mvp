<template>
  <div class="user-sidebar">
    <!-- User Profile Header -->
    <div class="user-profile-header">
      <div class="user-avatar">
        <!-- Loading skeleton for avatar -->
        <div v-if="loading" class="avatar-skeleton"></div>
        <!-- Avatar when loaded -->
        <div v-else class="avatar-placeholder">
          <i class="pi pi-user"></i>
        </div>
      </div>
      <div class="user-info">
        <!-- Loading skeleton for user info -->
        <div v-if="loading" class="user-info-skeleton">
          <div class="skeleton-line name-skeleton"></div>
          <div class="skeleton-line email-skeleton"></div>
        </div>
        <!-- User info when loaded -->
        <template v-else>
        <div class="user-name">{{ user?.title || 'Select User' }}</div>
        <div class="user-email">{{ user?.email || 'user@example.com' }}</div>
        </template>
      </div>
      <!-- Notification button - only show when not loading -->
      <button 
        v-if="!loading"
        class="notification-button icon-button" 
        :class="{ enabled: notificationsEnabled, disabled: !notificationsEnabled }"
        @click="toggleNotifications"
      >
        <i v-if="notificationsEnabled" class="pi pi-bell"></i>
        <i v-else class="pi pi-bell-slash"></i>
      </button>
    </div>

    <!-- User Details Tabs - only show when not loading -->
    <div v-if="!loading" class="user-tabs">
      <button 
        class="user-tab" 
        :class="{ active: activeTab === 'profile', disabled: !user?.fbid }"
        @click="setActiveTab('profile')"
        :disabled="!user?.fbid"
      >
        <i class="pi pi-user"></i>
      </button>
      <button 
        class="user-tab" 
        :class="{ active: activeTab === 'data', disabled: !user?.fbid }"
        @click="setActiveTab('data')"
        :disabled="!user?.fbid"
      >
        <i class="pi pi-database"></i>
      </button>
    </div>

    <!-- User Details Content -->
    <div class="user-content">
      <!-- Loading skeleton for content -->
      <div v-if="loading" class="content-skeleton">
        <div class="skeleton-section" v-for="i in 3" :key="i">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
      <!-- Content when loaded -->
      <template v-else>
        <UserProfile v-if="activeTab === 'profile' && user?.fbid" :user="user" />
        <UserAttributes v-else-if="activeTab === 'data' && user?.fbid" :user="user" />
        <div v-else-if="!user?.fbid" class="no-user-selected">
          <i class="pi pi-user"></i>
          <p>Select a user to view details</p>
        </div>
      </template>
    </div>

    <!-- User Satisfaction - only show when not loading -->
    <div v-if="!loading" class="user-satisfaction">
      <div class="satisfaction-header">
        <span class="satisfaction-label">User Satisfaction</span>
      </div>
      <div class="satisfaction-bar">
        <div class="satisfaction-fill" :style="{ width: satisfactionPercentage + '%', backgroundColor: satisfactionFillColor }"></div>
        <div class="satisfaction-emoji sad">😞</div>
        <div class="satisfaction-emoji happy">😊</div>
      </div>
    </div>

    <!-- Action Buttons - only show when not loading -->
    <div v-if="!loading" class="user-actions">
      <div class="export-dropdown">
        <button class="user-action-button icon-button" @click="toggleExportDropdown">
        <i class="pi pi-file-export"></i>
      </button>
        <div v-if="showExportDropdown" class="export-dropdown-content">
          <button @click="exportChat('csv')" class="export-option">
            <i class="pi pi-file"></i> Export as CSV
          </button>
          <button @click="exportChat('txt')" class="export-option">
            <i class="pi pi-file"></i> Export as TXT
          </button>
        </div>
      </div>
      <button class="user-action-button delete-button" @click="deleteConversation">
        <i class="pi pi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import UserProfile from './UserProfile.vue'
import UserAttributes from './UserAttributes.vue'
import { useConversationStore } from '@/stores/conversationStore'

interface Props {
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})

const activeTab = ref('profile')

const notificationsEnabled = ref(true)
const showExportDropdown = ref(false)
const conversationStore = useConversationStore()

const user = computed(() => conversationStore.selectedConversation);

const satisfactionPercentage = computed(() => {
  return Number(conversationStore.selectedConversation?.csr ?? 25)
})

const satisfactionFillColor = computed(() => {
  const csr = Number(conversationStore.selectedConversation?.csr ?? 0)
  if (csr < 33) return 'var(--color-error)'
  if (csr >= 33 && csr <= 66) return 'var(--color-warning)'
  return 'var(--color-success)'
})

const toggleNotifications = async () => {
  try {
    if (notificationsEnabled.value) {
      // Disable notifications
      const result = await conversationStore.disableNotifications()
      if (result.success) {
        notificationsEnabled.value = false
        window.$toast.success(result.message || 'Notifications disabled')
      } else {
        window.$toast.error(result.message || 'Failed to disable notifications')
      }
    } else {
      // Enable notifications
      const result = await conversationStore.enableNotifications()
      if (result.success) {
        notificationsEnabled.value = true
        window.$toast.success(result.message || 'Notifications enabled')
      } else {
        window.$toast.error(result.message || 'Failed to enable notifications')
      }
    }
  } catch (error) {
    console.error('Error toggling notifications:', error)
    window.$toast.error('An error occurred while toggling notifications')
  }
}

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const exportChat = (extension: 'csv' | 'txt') => {
  conversationStore.exportConversation(extension)
  showExportDropdown.value = false
}

const deleteConversation = async () => {
  window.$confirm({}, async () => {
    try {
      const response = await conversationStore.deleteConversation()
      if (response?.success) {
        window.$toast.success(response.message || 'Conversation deleted successfully')
      } else {
        window.$toast.error(response?.message || 'Failed to delete conversation')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      window.$toast.error('An error occurred while deleting the conversation')
    }
  })
}

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.export-dropdown')) {
    showExportDropdown.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // Check initial notification status - only if notifications are supported
  if ('Notification' in window && 'serviceWorker' in navigator) {
    try {
      const status = await conversationStore.checkNotificationStatus()
      notificationsEnabled.value = status.subscribed
    } catch (error) {
      console.error('Error checking notification status:', error)
      // Default to disabled if there's an error
      notificationsEnabled.value = false
    }
  } else {
    // Notifications not supported, default to disabled
    notificationsEnabled.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-sidebar {
  width: 280px;
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

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
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

.notification-button.disabled {
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.notification-button.enabled {
  color: var(--color-primary);
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

.user-tab.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}

.user-tab.disabled:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}

.user-content {
  flex: 1;
  overflow: hidden;
}

.no-user-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  color: var(--color-text-secondary);
  text-align: center;
  height: 100%;
}

.no-user-selected i {
  font-size: 3rem;
  margin-bottom: var(--space-3);
  opacity: 0.6;
}

.no-user-selected p {
  margin: 0;
  font-size: 0.875rem;
  font-style: italic;
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
  margin: 12px 0;
}

.satisfaction-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal), background-color var(--transition-normal);
}

.satisfaction-emoji {
  position: absolute;
  top: -6px;
  font-size: 16px;
  z-index: 10;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.satisfaction-emoji.sad {
  left: -2px;
}

.satisfaction-emoji.happy {
  right: -2px;
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
  border: 1px solid var(--color-text-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  width: 100%;
  transition: all var(--transition-normal);
}

.user-action-button:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.user-action-button.delete-button{
  border: 1px solid var(--color-text-danger);
  color: var(--color-text-danger);
}

.user-action-button.delete-button:hover{
  background-color: var(--color-error);
  color: white;
}

/* Export Dropdown Styles */
.export-dropdown {
  flex: 1;
  position: relative;
}

.export-dropdown-content {
  position: absolute;
  bottom: 120%;
  left: 0;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: var(--z-dropdown);
  min-width: 180px;
  margin-top: var(--space-1);
}

.export-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: none;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color var(--transition-normal);
  text-align: left;
}

.export-option:hover {
  background-color: var(--color-bg-hover);
}

.export-option:first-child {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.export-option:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

/* Skeleton Styles */
.avatar-skeleton {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.user-info-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.name-skeleton {
  width: 80%;
}

.email-skeleton {
  width: 60%;
}

.content-skeleton {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-section .skeleton-line {
  height: 0.875rem;
}

.skeleton-section .skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@media (max-width: 1024px) {
  .user-sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .user-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
}
</style> 