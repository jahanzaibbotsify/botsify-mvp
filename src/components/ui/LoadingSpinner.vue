<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'var(--color-primary)',
  overlay: false
})

const sizeClasses = {
  sm: 'spinner-sm',
  md: 'spinner-md', 
  lg: 'spinner-lg'
}
</script>

<template>
  <div class="loading-spinner-container" :class="{ overlay: props.overlay }">
    <div 
      class="loading-spinner" 
      :class="sizeClasses[props.size]"
      :style="{ '--spinner-color': props.color }"
    >
      <div class="spinner"></div>
      <div v-if="props.text" class="spinner-text">{{ props.text }}</div>
    </div>
  </div>
</template>

<style scoped>
.loading-spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner-container.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  backdrop-filter: blur(2px);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--spinner-color);
  animation: spin 1s linear infinite;
}

.spinner-sm .spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-md .spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.spinner-lg .spinner {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

.spinner-text {
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
}

.overlay .spinner-text {
  color: white;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark theme support */
[data-theme="dark"] .spinner {
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: var(--spinner-color);
}
</style> 