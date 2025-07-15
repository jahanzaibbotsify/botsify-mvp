<template>
  <div class="chat-header">
    <div class="chat-user-info">
      <h2 class="chat-user-name">{{ userName || 'Select a conversation' }}</h2>
    </div>
    <div class="chat-actions">
      <button class="status-button">
        <span class="status-dot active"></span>
        <span class="status-text">Active</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
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
interface Props {
  userName?: string
}

defineProps<Props>()
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

.status-button {
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

.status-button:hover {
  background-color: var(--color-bg-hover);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-text-tertiary);
}

.status-dot.active {
  background-color: var(--color-success);
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