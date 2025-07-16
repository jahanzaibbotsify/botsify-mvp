<template>
  <div class="message-input-container">
    <div class="input-actions">
      <button class="action-button icon-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      </button>
    </div>
    <div class="input-wrapper">
      <input 
        type="text" 
        placeholder="Message" 
        class="message-input"
        :value="message"
        @input="$emit('update:message', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('send')"
      />
    </div>
    <button class="send-button icon-button" @click="$emit('send')">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
}

defineProps<Props>()

defineEmits<{
  'update:message': [value: string]
  'send': []
}>()
</script>

<style scoped>
.message-input-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.input-actions {
  display: flex;
  gap: var(--space-2);
}

.action-button {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--transition-normal);
}

.action-button:hover {
  color: var(--color-text-primary);
}

.input-wrapper {
  flex: 1;
}

.message-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  resize: none;
}

.message-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.send-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.send-button:hover {
  background-color: var(--color-primary-hover);
}
</style> 