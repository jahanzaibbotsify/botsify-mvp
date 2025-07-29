<script setup lang="ts">
import { ref } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'

// Accept a boolean prop named `demoOnly`
const props = defineProps<{
  demoOnly?: boolean
}>()

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)

const openModal = () => {
  modalRef.value?.openModal()
}

const openCalendar = (link: string, help: boolean = false) => {
  modalRef.value?.closeModal()
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
  >
    <template v-if="props.demoOnly">
      <p>We’d love to show you around! Click below to book your personalized demo.</p>
      <a class="btn" @click="() => openCalendar('https://calendly.com/samuel-nixon/agentic-ai-consultation-session')">
        📞 Book a demo
      </a>
    </template>

    <template v-else>
      <p>What do you need help with? Please choose one of the following options</p>
      <a class="btn" @click="() => openCalendar('https://calendly.com/samuel-nixon/agentic-ai-consultation-session')">
        📞 Platform demo
      </a>
      <a class="btn" @click="() => openCalendar('', true)">
        🛠️ Bug or feature help
      </a>
      <a class="btn" @click="() => openCalendar('https://calendly.com/samuel-nixon/agentic-ai-consultation-session')">
        🤖 Agent discussion
      </a>
    </template>
  </ModalLayout>
</template>


<style scoped>
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 16px;
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
  background-color: var(--color-primary-hover);
}
</style>