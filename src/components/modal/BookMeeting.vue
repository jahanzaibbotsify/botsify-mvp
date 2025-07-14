<script setup lang="ts">
import { ref, defineExpose, watchEffect } from 'vue'

const showModal = ref(false)
watchEffect(() => {
  console.log('🎯 Modal changed:', showModal.value)
})

const openModal = () => {
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
}

// Close when clicked outside
// const handleClickOutside = (event: MouseEvent) => {
//   const modalContent = document.querySelector('.modal-content')
//   if (showModal.value && modalContent && !modalContent.contains(event.target as Node)) {
//     closeModal()
//   }
// }

const openCalendar = (link: string, help: boolean = false) => {
  closeModal()
  if (link) window.open(link, '_blank')
  if (help) window.showZen()
}

// onMounted(() => {
//   window.addEventListener('click', handleClickOutside)
// })
// onUnmounted(() => {
//   window.removeEventListener('click', handleClickOutside)
// })

// window.addEventListener('click', handleClickOutside)

// ✅ Expose the open method to parent
defineExpose({ openModal })
</script>

<template>
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h4>BOOK A MEETING</h4>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
  
        <div class="modal-body">
          <p>What do you need help with? Please choose one of the following options</p>
          <a class="btn" @click="() => openCalendar('https://calendly.com/samuel-nixon/botsify-customer-success')">📞 Platform demo</a>
          <a class="btn" @click="() => openCalendar('', true)">🛠️ Bug or feature help</a>
          <a class="btn" @click="() => openCalendar('https://calendly.com/samuel-nixon/botsify-customer-success')">🤖 Chatbot discussion</a>
        </div>
      </div>
    </div>
  </template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  padding: 24px;
  position: relative;
  animation: fadeIn 0.2s ease-in-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-button {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

.modal-body .btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  color: white;
  margin-bottom: 10px;
  text-decoration: none;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.modal-body .btn:hover {
  background-color: #0056b3;
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
