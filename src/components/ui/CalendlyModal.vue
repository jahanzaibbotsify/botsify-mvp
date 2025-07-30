<script setup lang="ts">
import { ref } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)

const openModal = () => {
  modalRef.value?.openModal()
}

// Expose the open method to parent
defineExpose({ openModal })
</script>

<template>
  <ModalLayout 
    ref="modalRef"
    title="Book a Consultation"
    max-width="800px"
  >
    <div class="calendly-container">
      <iframe 
        src="https://calendly.com/samuel-nixon/agentic-ai-consultation-session"
        width="100%" 
        height="600px" 
        frameborder="0"
        title="Book a consultation"
      ></iframe>
    </div>
  </ModalLayout>
</template>

<style scoped>
.calendly-container {
  width: 100%;
  height: 600px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.calendly-container iframe {
  border: none;
  border-radius: var(--radius-md);
}
</style>