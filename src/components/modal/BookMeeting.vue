<script setup lang="ts">
import { ref } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)

const openModal = () => {
  modalRef.value?.openModal()
}

const closeModal = () => {
  modalRef.value?.closeModal()
}

const openCalendar = (link: string, help: boolean = false) => {
  closeModal()
  if (link) window.open(link, '_blank')
  if (help) (window as any).showZen?.()
}

// Expose the open method to parent
defineExpose({ openModal })
</script>

<template>
  <ModalLayout 
    ref="modalRef"
    title="BOOK A MEETING"
    max-width="500px"
    @close="closeModal"
  >
    <p>What do you need help with? Please choose one of the following options</p>
    <a class="btn" @click="() => openCalendar('https://calendly.com/samuel-nixon/botsify-customer-success')">
      📞 Platform demo
    </a>
    <a class="btn" @click="() => openCalendar('', true)">
      🛠️ Bug or feature help
    </a>
    <a class="btn" @click="() => openCalendar('https://calendly.com/samuel-nixon/botsify-customer-success')">
      🤖 Chatbot discussion
    </a>
  </ModalLayout>
</template>

<style scoped>
.btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: var(--color-primary);
  border: none;
  border-radius: 6px;
  color: white;
  margin-bottom: 10px;
  text-decoration: none;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.btn:hover {
  background-color: #0056b3;
}
</style>