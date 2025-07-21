<template>
  <div class="chat-header">
    <div class="chat-user-info">
      <!-- Loading skeleton for user name -->
      <div v-if="loading" class="user-name-skeleton">
        <div class="skeleton-line"></div>
      </div>
      <!-- User name when loaded -->
      <h2 v-else class="chat-user-name">{{ userName || 'Select a conversation' }}</h2>
    </div>
    <div class="chat-actions">
      <!-- Loading skeleton for actions -->
      <div v-if="loading" class="actions-skeleton">
        <div class="skeleton-button"></div>
        <div class="skeleton-button"></div>
      </div>
      <!-- Actions when loaded -->
      <template v-else>
        <select 
          class="status-select" 
          :class="{ 'status-active': selectedStatus === 1, 'status-inactive': selectedStatus === 0 }"
          v-model="selectedStatus"
          @change="handleStatusChange"
        >
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <button class="translate-button" @click="openTranslateModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.01-4.65.83-6.67l2.16-2.16c-.56-.56-1.47-.56-2.03 0L9.5 5.5c-.56.56-.56 1.47 0 2.03l.03.03c-2.02 1.18-4.73.91-6.67-.83l-.03-.03c-.56-.56-1.47-.56-2.03 0L.5 5.5c-.56.56-.56 1.47 0 2.03l2.16 2.16c1.74 1.94 2.01 4.65.83 6.67l-.03.03c-.56-.56-.56 1.47 0 2.03l2.16 2.16c.56.56 1.47.56 2.03 0l2.16-2.16c.56-.56.56-1.47 0-2.03l-.03-.03z"/>
          </svg>
          G Translate
        </button>
      </template>
    </div>
    <TranslateModal ref="translateModalRef" @select-language="handleLanguageSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConversationStore } from '@/stores/conversationStore'
import TranslateModal from './TranslateModal.vue'

interface Props {
  userName?: string
  status?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const conversationStore = useConversationStore()

const selectedStatus = ref(props.status)

watch(() => props.status, (newVal) => {
  selectedStatus.value = newVal
})


const handleStatusChange = async () => {
  try {
    const response = await conversationStore.changeBotActivation(selectedStatus.value ?? 0)
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

const showTranslateModal = ref(false)
const translateModalRef = ref<InstanceType<typeof TranslateModal> | null>(null)

const openTranslateModal = () => {
  translateModalRef.value?.openModal()
}

const emit = defineEmits(['translate-language'])

const handleLanguageSelect = (lang: string) => {
  emit('translate-language', lang)
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

/* Skeleton Styles */
.user-name-skeleton {
  min-width: 200px;
}

.skeleton-line {
  height: 1.5rem;
  background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.actions-skeleton {
  display: flex;
  gap: var(--space-3);
}

.skeleton-button {
  width: 100px;
  height: 36px;
  background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style> 