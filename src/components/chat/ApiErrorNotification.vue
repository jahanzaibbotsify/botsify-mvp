<script setup lang="ts">
import { useOpenAIStore } from '../../stores/openaiStore';
import { computed } from 'vue';

const openAIStore = useOpenAIStore();

const hasError = computed(() => !!openAIStore.error);
const errorMessage = computed(() => openAIStore.error || '');

function goToSettings() {
  window.location.href = '/settings';
}
</script>

<template>
  <div v-if="hasError" class="api-error-notification">
    <div class="error-content">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="error-message">{{ errorMessage }}</div>
    </div>
    <button class="settings-button" @click="goToSettings">Go to Settings</button>
  </div>
</template>

<style scoped>
.api-error-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-modal);
  background-color: #FEF2F2;
  border: 1px solid #FEE2E2;
  border-left: 4px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 90%;
  width: 400px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.error-icon {
  color: var(--color-error);
  flex-shrink: 0;
}

.error-message {
  color: #991B1B;
  font-size: 0.9rem;
}

.settings-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: 0.9rem;
  cursor: pointer;
  align-self: flex-end;
}

.settings-button:hover {
  background-color: var(--color-primary-hover);
}

[data-theme="dark"] .api-error-notification {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

[data-theme="dark"] .error-message {
  color: #FCA5A5;
}
</style> 