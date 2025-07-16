<template>
  <div class="user-sidebar">
    <!-- User Profile Header -->
    <div class="user-profile-header">
      <div class="user-avatar">
        <div class="avatar-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
      <div class="user-info">
        <div class="user-name">{{ user?.title || 'Select User' }}</div>
        <div class="user-email">{{ user?.email || 'user@example.com' }}</div>
      </div>
      <button 
        class="notification-button icon-button" 
        :class="{ enabled: notificationsEnabled, disabled: !notificationsEnabled }"
        @click="toggleNotifications"
      >
        <svg v-if="notificationsEnabled" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
          <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14a17.89 17.89 0 0 0 1.63-5"></path>
          <line x1="18" y1="8" x2="6" y2="8"></line>
          <line x1="18" y1="8" x2="6" y2="8"></line>
        </svg>
      </button>
    </div>

    <!-- User Details Tabs -->
    <div class="user-tabs">
      <button 
        class="user-tab" 
        :class="{ active: activeTab === 'profile' }"
        @click="$emit('update:activeTab', 'profile')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </button>
      <button 
        class="user-tab" 
        :class="{ active: activeTab === 'data' }"
        @click="$emit('update:activeTab', 'data')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
      </button>
    </div>

    <!-- User Details Content -->
    <div class="user-content">
      <UserProfile v-if="activeTab === 'profile'" :user="user" />
      <UserAttributes v-else-if="activeTab === 'data'" />
    </div>

    <!-- User Satisfaction -->
    <div class="user-satisfaction">
      <div class="satisfaction-header">
        <span class="satisfaction-label">User Satisfaction</span>
      </div>
      <div class="satisfaction-bar">
        <div class="satisfaction-fill" :style="{ width: satisfactionPercentage + '%' }"></div>
        <div class="satisfaction-emoji sad">😞</div>
        <div class="satisfaction-emoji happy">😊</div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="user-actions">
      <button class="user-action-button icon-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </button>
      <button class="user-action-button icon-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserProfile from './UserProfile.vue'
import UserAttributes from './UserAttributes.vue'
import type { ExtendedChat } from '@/types'

interface Props {
  user?: ExtendedChat | null
  activeTab: string
  satisfactionPercentage: number
}

defineProps<Props>()

defineEmits<{
  'update:activeTab': [value: string]
}>()

const notificationsEnabled = ref(true)

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value
}
</script>

<style scoped>
.user-sidebar {
  width: 320px;
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

.user-content {
  flex: 1;
  overflow: hidden;
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
  background-color: var(--color-error);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
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
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.user-action-button:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .user-sidebar {
    width: 280px;
  }
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