<template>
  <div class="user-attributes-content">
    <div class="attributes-header">
      <div class="attributes-title">
        <span class="title-line"></span>
        <h3 class="attributes-heading">User Attributes</h3>
        <span class="title-line"></span>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <!-- Skeleton Loading -->
      <div class="skeleton-container">
        <div class="skeleton-item" v-for="i in 5" :key="i">
          <div class="skeleton-tag"></div>
          <div class="skeleton-value"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="() => fetchAttributes(true)" class="retry-button">
        <i class="pi pi-refresh"></i> Retry
      </button>
    </div>

    <!-- Attributes List -->
    <div v-if="attributes.length === 0" class="no-attributes">
      <i class="pi pi-info-circle"></i>
      <p>No attributes found for this user.</p>
    </div>
    <div v-else class="attributes-list" v-for="attribute in attributes" :key="attribute.id">
      <div class="attribute-item">
        <span class="attribute-tag">{{ formatAttributeKey(attribute.key) }}</span>
        <span class="attribute-value">{{ attribute.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import type { UserAttribute } from '@/types/user'
import type { ExtendedChat } from '@/types'

interface Props {
  user?: ExtendedChat | null
}

const props = defineProps<Props>()

const attributes = ref<UserAttribute[]>([])
const loading = ref(false)
const error = ref<string>('')
const userStore = useUserStore()

// Function to format attribute key (replace underscores with spaces and capitalize)
const formatAttributeKey = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const fetchAttributes = async (forceRefresh = false) => {
  if (!props.user?.fbid) {
    console.warn('No user ID provided for fetching attributes')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await userStore.fetchUserAttributes(props.user.fbid, forceRefresh)
    
    if (response.success && response.data) {
      attributes.value = response.data
      if (response.fromCache) {
        console.log('✅ User attributes loaded from cache for user:', props.user.fbid)
      } else {
        console.log('✅ User attributes fetched from API for user:', props.user.fbid)
      }
    } else {
      error.value = response.message || 'Failed to fetch user attributes'
      console.error('❌ Failed to fetch user attributes:', response.message)
    }
  } catch (err) {
    console.error('❌ Error fetching user attributes:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch user attributes'
  } finally {
    loading.value = false
  }
}

// Watch for changes in user prop and fetch attributes
watch(() => props.user?.fbid, (newUserId, oldUserId) => {
  if (newUserId && newUserId !== oldUserId) {
    fetchAttributes()
  } else if (!newUserId) {
    attributes.value = []
    error.value = ''
  }
}, { immediate: true })
</script>

<style scoped>
.user-attributes-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.user-attributes-content::-webkit-scrollbar {
  width: 6px;
}

.user-attributes-content::-webkit-scrollbar-track {
  background: transparent;
}

.user-attributes-content::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 3px;
}

.user-attributes-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-tertiary);
}

.attributes-header {
  margin-bottom: var(--space-4);
}

.attributes-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.title-line {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    var(--color-border) 0,
    var(--color-border) 4px,
    transparent 4px,
    transparent 8px
  );
}

.attributes-heading {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
}

.attributes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.attribute-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
}

.attribute-item:last-child {
  border-bottom: none;
}

.attribute-tag {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.attribute-value {
  color: var(--color-text-primary);
  font-size: 0.75rem;
  text-align: right;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  color: var(--color-text-secondary);
}

/* Skeleton Loading */
.skeleton-container {
  width: 100%;
  margin-top: var(--space-4);
}

.skeleton-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.skeleton-item:last-child {
  border-bottom: none;
}

.skeleton-tag {
  height: 20px;
  background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton-value {
  height: 20px;
  background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  color: var(--color-error);
  text-align: center;
}

.error-state i {
  font-size: 2rem;
  margin-bottom: var(--space-2);
}

.error-state p {
  margin: 0 0 var(--space-3) 0;
  font-size: 0.875rem;
}

.retry-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.retry-button:hover {
  background-color: var(--color-primary-hover);
}

/* No Attributes State */
.no-attributes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  color: var(--color-text-secondary);
  text-align: center;
}

.no-attributes i {
  font-size: 2rem;
  margin-bottom: var(--space-2);
  opacity: 0.6;
}

.no-attributes p {
  margin: 0;
  font-size: 0.875rem;
  font-style: italic;
}
</style> 