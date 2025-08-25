<template>
  <div class="chat-header">
    <div class="chat-user-info">
      <!-- Loading skeleton for user name -->
      <div v-if="conversationStore.loading" class="user-name-skeleton">
        <div class="skeleton-line"></div>
      </div>
      <!-- User name when loaded -->
      <h2 v-else class="chat-user-name">{{ userName || 'Select a conversation' }}</h2>
    </div>
    <div class="chat-actions">
      <!-- Loading skeleton for actions -->
      <div v-if="conversationStore.loading" class="actions-skeleton">
        <div class="skeleton-button"></div>
        <div class="skeleton-button"></div>
      </div>
      <!-- Actions when loaded -->
      <template v-else>
        <div class="status-dropdown" :class="{ 'status-active': selectedStatus === 1, 'status-inactive': selectedStatus === 0 }">
          <VueSelect
            :model-value="selectedStatus"
            @update:model-value="handleStatusChange"
            :options="statusOptions"
            placeholder="Select status"
            :multiple="false"
          />
        </div>
        <Button variant="secondary" @click="openTranslateModal">
          G Translate
        </Button>
      </template>
    </div>
    <TranslateModal ref="translateModalRef" @select-language="handleLanguageSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useConversationStore } from '@/stores/conversationStore'
import TranslateModal from './TranslateModal.vue'
import VueSelect from "vue3-select-component"
import { Button } from '../ui'

const conversationStore = useConversationStore()
const userName = computed(() => conversationStore.selectedConversation?.title)
const status = computed(() => conversationStore.selectedConversation?.active_for_bot ?? 1)
const selectedStatus = ref(status.value)

// Status options for VueSelect
const statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 }
]

watch(() => status.value, (newVal) => {
  selectedStatus.value = newVal
})

const handleStatusChange = async (value: number | (number | undefined)[] | undefined) => {
  const statusValue = Array.isArray(value) ? value[0] : value
  if (statusValue === undefined) return
  
  selectedStatus.value = statusValue
  
  try {
    const response = await conversationStore.changeBotActivation(statusValue)
    if (response?.success) {
      // Success - status updated
      window.$toast.success('Status updated successfully')
    } else {
      // Error - status will be shown in red text
      window.$toast.error('Status update failed')
    }
  } catch (error) {
    console.error('Error changing bot status:', error)
    // Error - status will be shown in red text
  }
}

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

.status-dropdown ::v-deep(.clear-button){
  display: none;
}
/* Active status styling */
.status-dropdown.status-active ::v-deep(.control) {
  border-color: var(--color-success) !important;
  background-color: rgba(16, 185, 129, 0.1) !important;
}

.status-dropdown.status-inactive ::v-deep(.control) {
  border-color: var(--color-error) !important;
  background-color: rgba(239, 68, 68, 0.1) !important;
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