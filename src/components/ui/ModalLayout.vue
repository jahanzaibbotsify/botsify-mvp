<script setup lang="ts">
import { ref, watchEffect, onUnmounted } from 'vue'
import Button from './Button.vue'

interface Props {
  title: string
  maxWidth?: string
  showCloseButton?: boolean
  closable?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: '500px',
  showCloseButton: true,
  closable: true
})

const emit = defineEmits<{
  close: []
  open: []
}>()

const showModal = ref(false)

watchEffect(() => {
  console.log('🎯 Modal changed:', showModal.value)
})

const openModal = () => {
  showModal.value = true
  emit('open')
}

const closeModal = () => {
  if (!props.closable) return
  showModal.value = false
  emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (!props.closable) return
  const target = event.target as HTMLElement
  if (target.classList.contains('modal-overlay')) {
    closeModal()
  }
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable && showModal.value) {
    closeModal()
  }
}

// Add/remove escape key listener when modal opens/closes
watchEffect(() => {
  if (showModal.value) {
    document.addEventListener('keydown', handleEscapeKey)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEscapeKey)
    // Restore body scroll when modal is closed
    document.body.style.overflow = ''
  }
})

// Cleanup on component unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.body.style.overflow = ''
})

// Expose methods to parent component
defineExpose({ 
  openModal, 
  closeModal,
  isOpen: showModal
})
</script>

<template>
  <div v-if="showModal" class="modal-overlay" @click="handleOverlayClick">
    <div 
      class="modal-content" 
      :style="{ maxWidth: props.maxWidth }"
      @click.stop
    >
      <div class="modal-header">
        <div class="modal-header-left">
          <img v-if="icon" :src="icon" width="28" height="28" alt="logo" class="modal-logo" />
          <h2>{{ props.title }}</h2>
        </div>
        <Button 
          v-if="showCloseButton" 
          variant="secondary"
          size="small"
          icon="pi pi-times"
          icon-only
          @click="closeModal"
        />
      </div>
      
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  background-image: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(to right, rgba(0, 163, 255, 0.05), transparent);
  gap: var(--space-3);
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>