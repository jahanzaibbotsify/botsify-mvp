<script setup lang="ts">
import { ref, onMounted } from 'vue';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 4000
});

const emit = defineEmits<{
  close: [];
}>();

const visible = ref(false);

onMounted(() => {
  visible.value = true;
  
  if (props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
});

const close = () => {
  visible.value = false;
  setTimeout(() => {
    emit('close');
  }, 300); // Wait for animation to complete
};
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="[`toast-${type}`]">
      <div class="toast-content">
        <div class="toast-icon">
          <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="toast-message">{{ message }}</div>
        <button class="toast-close" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-toast, 1000);
  min-width: 300px;
  max-width: 500px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(8px);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.toast-icon {
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  opacity: 0.7;
  transition: opacity var(--transition-normal);
}

.toast-close:hover {
  opacity: 1;
}

/* Toast variants */
.toast-success {
  background-color: rgba(34, 197, 94, 0.95);
  color: white;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.toast-error {
  background-color: rgba(239, 68, 68, 0.95);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.toast-warning {
  background-color: rgba(245, 158, 11, 0.95);
  color: white;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.toast-info {
  background-color: rgba(59, 130, 246, 0.95);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

/* Mobile styles */
@media (max-width: 767px) {
  .toast {
    top: var(--space-3);
    right: var(--space-3);
    left: var(--space-3);
    min-width: auto;
  }
  
  .toast-content {
    padding: var(--space-2) var(--space-3);
  }
  
  .toast-message {
    font-size: 0.8rem;
  }
}
</style> 