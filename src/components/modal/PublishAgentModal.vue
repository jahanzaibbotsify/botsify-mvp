<script setup lang="ts">
import ModalLayout from "@/components/ui/ModalLayout.vue";
import { ref, defineAsyncComponent, onMounted } from "vue";
import { usePublishStore } from "@/stores/publishStore";

const WhatsAppModal = defineAsyncComponent(() => import('./WhatsApp/WhatsAppModal.vue'));
const SmsModal = defineAsyncComponent(() => import('./Sms/SmsModal.vue'));
const MessengerModal = defineAsyncComponent(() => import('./Messenger/MessengerModal.vue'));
const InstagramModal = defineAsyncComponent(() => import('./Instagram/InstagramModal.vue'));
const TelegramModal = defineAsyncComponent(() => import('./TelegramModal.vue'));
const WebsiteModal = defineAsyncComponent(() => import('./WebsiteModal.vue'));

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null);
const websiteModalRef = ref<InstanceType<typeof WebsiteModal> | null>(null);
const whatsappModalRef = ref<InstanceType<typeof WhatsAppModal> | null>(null);
const telegramModalRef = ref<InstanceType<typeof TelegramModal> | null>(null);
const smsModalRef = ref<InstanceType<typeof SmsModal> | null>(null);
const messengerModalRef = ref<InstanceType<typeof MessengerModal> | null>(null);
const instagramModalRef = ref<InstanceType<typeof InstagramModal> | null>(null);

const publishStore = usePublishStore();
const botDetails = ref<any>(null);
const isLoading = ref(false);

const agents = ref([
  { icon: 'portable-agent-icon.svg', label: 'Portable Agent', status: 'inactive' },
  { icon: 'website.png', label: 'Website', status: 'inactive' },
  { icon: 'whatsapp.png', label: 'WhatsApp', status: 'inactive' },
  { icon: 'instagram.png', label: 'Instagram', status: 'inactive' },
  { icon: 'messenger.png', label: 'Messenger', status: 'inactive' },
  { icon: 'telegram.png', label: 'Telegram', status: 'inactive' },
  { icon: 'sms.png', label: 'SMS', status: 'inactive' },
]);

const fetchBotDetails = async () => {
  isLoading.value = true;
  try {
    const result = await publishStore.getBotDetails();
    if (result.success && result.data) {
      botDetails.value = result.data;
      updateAgentStatus();
    }
  } catch (error) {
    console.error('Failed to fetch bot details:', error);
  } finally {
    isLoading.value = false;
  }
};

const updateAgentStatus = () => {
  if (!botDetails.value) return;

  // Update status based on API response
  agents.value.forEach(agent => {
    switch (agent.label) {
      case 'Telegram':
        agent.status = botDetails.value.telegramConf ? 'active' : 'inactive';
        break;
      case 'SMS':
        agent.status = botDetails.value.twilioConf ? 'active' : 'inactive';
        break;
      // Add other agents as needed
      default:
        agent.status = 'inactive';
    }
  });
};

const openModal = () => {
  modalRef.value?.openModal();
  fetchBotDetails(); // Fetch bot details when modal opens
};

const handleAgentClick = (agentLabel: string) => {
  if (agentLabel === 'Website') {
    websiteModalRef.value?.openModal();
  } else if (agentLabel === 'WhatsApp') {
    whatsappModalRef.value?.openModal();
  } else if (agentLabel === 'Telegram'){
    telegramModalRef.value?.openModal();
  } else if (agentLabel === 'SMS'){
    smsModalRef.value?.openModal();
  } else if (agentLabel === 'Messenger'){
    messengerModalRef.value?.openModal();
  } else if (agentLabel === 'Instagram'){
    instagramModalRef.value?.openModal();
  }
  modalRef.value?.closeModal();
};

const handleBackToMain = () => {
  modalRef.value?.openModal();
  fetchBotDetails(); // Refresh bot details when returning to main modal
};

defineExpose({ openModal });
</script>

<template>
  <!-- Main Agent Selection Modal -->
  <ModalLayout
    ref="modalRef"
    title="Publish agent"
    max-width="650px"
  >
    <div class="server-grid">
      <div
        class="server-card"
        v-for="agent in agents"
        :key="agent.icon"
        @click="handleAgentClick(agent.label)"
        :class="{ 'active': agent.status === 'active' }"
      >
        <div class="server-icon">
          <img :src="`/bots/${agent.icon}`" width="28" height="28" :alt="`${agent.label} icon`"/>
        </div>
        <div class="text-sm text-emphasis">
          <div>{{ agent.label }}</div>
        </div>
        <!-- Only show badge for active status -->
        <div v-if="agent.status === 'active'" class="status-badge active">
          <i class="pi pi-check"></i>
          Connected
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

<style>
/* Common Modal Styles - Centralized for all modal components */
.server-card {
  position: relative;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
}

.server-card .server-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

/* Active card styling */
.server-card.active {
  border: 2px solid var(--color-secondary, #10b981);
  background-color: var(--color-bg-secondary, #f9fafb);
}

/* Status Badge Styles */
.status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: var(--radius-sm, 4px);
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-secondary, #10b981);
  color: white;
  z-index: 1;
}

.status-badge.active {
  background: var(--color-secondary, #10b981);
  color: white;
}

.status-badge i {
  font-size: 10px;
}

/* Tab Panel Styles */
.tab-panel {
  padding: 0;
}

.tab-panel h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.tab-panel h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.description {
  margin: 0 0 20px 0;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.6;
  font-size: 14px;
}

/* Form Styles */
.form-section {
  margin: 24px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-primary, #111827);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-md, 8px);
  background: white;
  color: var(--color-text-primary);
  font-size: 14px;
  font-family: inherit;
  transition: border-color var(--transition-normal, 0.2s ease);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-tertiary, #9ca3af);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

select.form-input {
  cursor: pointer;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
  display: block;
}

/* Action Button Styles */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.action-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  font-family: inherit;
}

.action-button.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.action-button.delete {
  color: var(--color-error, #ef4444);
}

.action-button.clone {
  color: var(--color-primary, #3b82f6);
}

.action-button.preview {
  color: var(--color-info, #3b82f6);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Table Styles */
.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.header-cell {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  transition: background var(--transition-normal, 0.2s ease);
}

.table-row:hover {
  background: var(--color-bg-secondary, #f9fafb);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
  display: flex;
  align-items: center;
}

/* Code Block Styles */
.code-block {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  margin: 20px 0;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.code-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copy-button {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-button:hover {
  background: var(--color-primary-hover, #2563eb);
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  color: var(--color-text-primary, #111827);
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
  white-space: pre;
}

/* Search and Create Button Styles */
.search-create-section {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: end;
}

.create-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  border: none;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-button.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.create-button.primary:hover {
  background: var(--color-primary-hover, #2563eb);
}

/* Media List Styles */
.media-list {
  margin-top: 16px;
}

.media-table {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-create-section {
    flex-direction: column;
  }
  
  .media-table {
    font-size: 12px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  }
  
  .header-cell,
  .table-cell {
    padding: 8px 12px;
  }
  
  .action-buttons {
    gap: 4px;
  }
  
  .action-button {
    padding: 4px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

@media (max-width: 640px) {
  .color-picker-container {
    flex-wrap: wrap;
  }
  
  .url-display {
    flex-direction: column;
  }
  
  .copy-url-button {
    align-self: flex-start;
  }
  
  .radio-group {
    gap: 16px;
  }
}
</style>