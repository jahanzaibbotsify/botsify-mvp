<template>
  <div class="chat-header">
    <div class="chat-user-info">
      <h2 class="chat-user-name">{{ userName || 'Select a conversation' }}</h2>
    </div>
    <div class="chat-actions">
      <select 
        class="status-select" 
        :class="{ 'status-active': selectedStatus === 'active', 'status-inactive': selectedStatus === 'inactive' }"
        v-model="selectedStatus"
        @change="handleStatusChange"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button class="translate-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.01-4.65.83-6.67l2.16-2.16c-.56-.56-1.47-.56-2.03 0L9.5 5.5c-.56.56-.56 1.47 0 2.03l.03.03c-2.02 1.18-4.73.91-6.67-.83l-.03-.03c-.56-.56-1.47-.56-2.03 0L.5 5.5c-.56.56-.56 1.47 0 2.03l2.16 2.16c1.74 1.94 2.01 4.65.83 6.67l-.03.03c-.56-.56-.56 1.47 0 2.03l2.16 2.16c.56.56 1.47.56 2.03 0l2.16-2.16c.56-.56.56-1.47 0-2.03l-.03-.03z"/>
        </svg>
        G Translate
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConversationStore } from '@/stores/conversationStore'

interface Props {
  userName?: string
  userId?: string
}

const props = defineProps<Props>()
const conversationStore = useConversationStore()

const selectedStatus = ref('active')

const handleStatusChange = async () => {
  if (!props.userId) {
    window.$toast.error('No user selected for status change')
    return
  }

  try {
    const status = selectedStatus.value === 'active' ? 1 : 0
    const response = await conversationStore.changeBotActivation(props.userId, status)
    
    if (response?.success) {
      window.$toast.success(response.message || 'Bot status updated successfully')
    } else {
      window.$toast.error(response?.message || 'Failed to update bot status')
    }
  } catch (error) {
    console.error('Error changing bot status:', error)
    window.$toast.error('An error occurred while updating bot status')
  }
}
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.chat-user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.chat-actions {
  display: flex;
  gap: var(--space-3);
}

.status-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 100px;
}

.status-select:hover {
  background-color: var(--color-bg-hover);
}

.status-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.status-select.status-active {
  border-color: var(--color-success);
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-select.status-inactive {
  border-color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.translate-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.translate-button:hover {
  background-color: var(--color-bg-hover);
}
</style> 