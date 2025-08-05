<script setup lang="ts">
import ModalLayout from "@/components/ui/ModalLayout.vue";
import { ref, defineAsyncComponent } from "vue";

const WhatsAppModal = defineAsyncComponent(() => import('./WhatsApp/WhatsAppModal.vue'));
const SmsModal = defineAsyncComponent(() => import('./Sms/SmsModal.vue'));
const MessengerModal = defineAsyncComponent(() => import('./Messenger/MessengerModal.vue'));
const InstagramModal = defineAsyncComponent(() => import('./Instagram/InstagramModal.vue'));
const TelegramModal = defineAsyncComponent(() => import('./TelegramModal.vue'));
const WebsiteModal = defineAsyncComponent(() => import('./WebsiteModal.vue'));

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

<style>
/* Common Modal Styles - Centralized for all modal components */

/* Server Grid and Cards */
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
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
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

/* Status Badge Styles */
.status-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background: var(--color-secondary, #10b981);
  color: white;
}

.status-badge.inactive {
  background: var(--color-text-tertiary, #9ca3af);
  color: white;
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
  gap: 12px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary, #6b7280);
  font-size: 14px;
}

.create-button {
  padding: 12px 16px;
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