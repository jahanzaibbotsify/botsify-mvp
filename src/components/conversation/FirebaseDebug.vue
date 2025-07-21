<template>
  <div v-if="showDebug" class="firebase-debug">
    <div class="debug-header">
      <span class="debug-title">Firebase Debug</span>
      <button @click="toggleDebug" class="debug-toggle">×</button>
    </div>
    <div class="debug-content">
      <div class="debug-item">
        <span class="debug-label">Status:</span>
        <span class="debug-value" :class="{ 'connected': isConnected, 'error': hasError }">
          {{ statusText }}
        </span>
      </div>
      <div class="debug-item">
        <span class="debug-label">Bot API Key:</span>
        <span class="debug-value">{{ botApiKey ? 'Set' : 'Not set' }}</span>
      </div>
      <div v-if="hasError" class="debug-item">
        <span class="debug-label">Error:</span>
        <span class="debug-value error">{{ errorMessage }}</span>
      </div>
      <div class="debug-actions">
        <button @click="checkStatus" class="debug-btn">Check Status</button>
        <button @click="reconnect" class="debug-btn">Reconnect</button>
      </div>
    </div>
  </div>
  <button v-else @click="toggleDebug" class="debug-toggle-btn">
    🔥 Debug
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConversationStore } from '@/stores/conversationStore'
import { useApiKeyStore } from '@/stores/apiKeyStore'

const conversationStore = useConversationStore()
const showDebug = ref(false)

// Computed properties
const isConnected = computed(() => conversationStore.isFirebaseConnected)
const hasError = computed(() => !!conversationStore.firebaseError)
const errorMessage = computed(() => conversationStore.firebaseError)
const botApiKey = useApiKeyStore().apiKey

const statusText = computed(() => {
  if (hasError.value) return 'Error'
  if (isConnected.value) return 'Connected'
  return 'Disconnected'
})

// Methods
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

const checkStatus = () => {
  conversationStore.checkFirebaseStatus()
}

const reconnect = () => {
  conversationStore.initializeFirebase()
}
</script>

<style scoped>
.firebase-debug {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.debug-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.debug-toggle {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-toggle:hover {
  color: var(--color-text-secondary);
}

.debug-content {
  padding: var(--space-3);
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.debug-item:last-child {
  margin-bottom: 0;
}

.debug-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.debug-value {
  font-size: 0.75rem;
  color: var(--color-text-primary);
  font-weight: 600;
}

.debug-value.connected {
  color: var(--color-success);
}

.debug-value.error {
  color: var(--color-error);
}

.debug-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.debug-btn {
  flex: 1;
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.debug-btn:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.debug-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  z-index: 999;
  transition: all var(--transition-normal);
}

.debug-toggle-btn:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}
</style> 