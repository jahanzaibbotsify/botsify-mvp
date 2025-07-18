<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  imageUrl: string
}>()

const emit = defineEmits<{
  close: []
}>()

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = props.imageUrl
  link.download = 'image'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="image-modal-overlay" @click="handleBackdropClick">
    <div class="image-modal">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-actions">
          <button class="action-btn download-btn" @click="downloadImage" title="Download image">
            <i class="pi pi-download action-icon"></i>
          </button>
          <button class="action-btn close-btn" @click="emit('close')" title="Close">
            <i class="pi pi-times action-icon"></i>
          </button>
        </div>
      </div>
      
      <!-- Image -->
      <div class="image-container">
        <img :src="imageUrl" alt="Full size image" class="modal-image" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.image-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: modalEnter 0.3s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.download-btn:hover {
  background: rgba(34, 197, 94, 0.8);
  border-color: rgba(34, 197, 94, 1);
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  border-color: rgba(239, 68, 68, 1);
}

.action-icon {
  width: 20px;
  height: 20px;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .image-modal-overlay {
    padding: 1rem;
  }
  
  .image-modal {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 0.75rem;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
  }
  
  .action-icon {
    width: 18px;
    height: 18px;
  }
}
</style>