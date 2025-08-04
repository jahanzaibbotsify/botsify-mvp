<script setup lang="ts">
import ModalLayout from "@/components/ui/ModalLayout.vue";
import WebsiteModal from "./WebsiteModal.vue"; // Import the WebsiteModal
import TelegramModal from "./TelegramModal.vue"; // Import the WebsiteModal
import WhatsAppModal from "./WhatsApp/WhatsAppModal.vue"; // Import the WhatsAppModal
import SmsModal from "./Sms/SmsModal.vue"; // Import the WhatsAppModal
import MessengerModal from "./Messenger/MessengerModal.vue"; // Import the WhatsAppModal
import InstagramModal from "./Instagram/InstagramModal.vue"; // Import the InstagramModal
import { ref } from "vue";

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null);
const websiteModalRef = ref<InstanceType<typeof WebsiteModal> | null>(null); // Create ref for WebsiteModal
const whatsappModalRef = ref<InstanceType<typeof WhatsAppModal> | null>(null); // Create ref for WhatsAppModal
const telegramModalRef = ref<InstanceType<typeof TelegramModal> | null>(null); // Create ref for WhatsAppModal
const smsModalRef = ref<InstanceType<typeof SmsModal> | null>(null); // Create ref for WhatsAppModal
const messengerModalRef = ref<InstanceType<typeof MessengerModal> | null>(null); // Create ref for WhatsAppModal
const instagramModalRef = ref<InstanceType<typeof InstagramModal> | null>(null); // Create ref for InstagramModal

const openModal = () => {
  modalRef.value?.openModal();
};

const handleAgentClick = (agentLabel: string) => {
  if (agentLabel === 'Website') {
    websiteModalRef.value?.openModal(); // Open website modal
  } else if (agentLabel === 'WhatsApp') {
    whatsappModalRef.value?.openModal(); // Open WhatsApp modal
  } else if (agentLabel === 'Telegram'){
    telegramModalRef.value?.openModal()
  } else if (agentLabel === 'SMS'){
    smsModalRef.value?.openModal()
  } else if (agentLabel === 'Messenger'){
    messengerModalRef.value?.openModal()
  } else if (agentLabel === 'Instagram'){
    instagramModalRef.value?.openModal()
  }
  modalRef.value?.closeModal(); // Close main modal
  // Add handlers for other agent types here
};

const handleBackToMain = () => {
  modalRef.value?.openModal(); // Reopen main modal when back is clicked
};

const agents = [
  { icon: 'website.png', label: 'Website' },
  { icon: 'whatsapp.png', label: 'WhatsApp' },
  { icon: 'instagram.png', label: 'Instagram' },
  { icon: 'messenger.png', label: 'Messenger' },
  { icon: 'telegram.png', label: 'Telegram' },
  { icon: 'sms.png', label: 'SMS' },
  { icon: 'portable-agent-icon.svg', label: 'Portable Agent' },
];

defineExpose({ openModal });
</script>

<template>
  <!-- Main Agent Selection Modal -->
  <ModalLayout
    ref="modalRef"
    title="Publish Agent"
    max-width="650px"
  >
    <div class="server-grid">
      <div
        class="server-card"
        v-for="agent in agents"
        :key="agent.icon"
        @click="handleAgentClick(agent.label)"
      >
        <div class="server-icon">
          <img :src="`/bots/${agent.icon}`" width="28" height="28" :alt="`${agent.label} icon`"/>
        </div>
        <div class="text-sm text-emphasis">
          <div>{{ agent.label }}</div>
        </div>
      </div>
    </div>
  </ModalLayout>

  <!-- Website Modal Component -->
  <WebsiteModal 
    ref="websiteModalRef" 
    @back="handleBackToMain" 
  />

  <!-- WhatsApp Modal Component -->
  <WhatsAppModal 
    ref="whatsappModalRef" 
    @back="handleBackToMain" 
  />

   <!-- Telegram Modal Component -->
   <TelegramModal 
    ref="telegramModalRef" 
    @back="handleBackToMain" 
  />

  
   <!-- Sms Modal Component -->
   <SmsModal 
    ref="smsModalRef" 
    @back="handleBackToMain" 
  />

  <MessengerModal 
    ref="messengerModalRef" 
    @back="handleBackToMain" 
  />

  <InstagramModal 
    ref="instagramModalRef" 
    @back="handleBackToMain" 
  />
</template>

<style scoped>
/* Your existing styles */
.server-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.server-card {
  background: var(--color-bg-secondary);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 12px 12px 16px;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 80px;
  height: 100px;
  min-width: 0;
  box-sizing: border-box;
  position: relative;
}

.server-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.server-card .server-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 6px;
}

.server-card .server-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.server-card .text-sm {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-primary);
  text-align: left;
  margin-top: 0;
  margin-left: 0;
  padding-left: 0;
}
</style>