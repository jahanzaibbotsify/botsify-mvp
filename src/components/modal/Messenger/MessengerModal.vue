<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import Pagination from "@/components/ui/Pagination.vue";
import { ref } from "vue";
import PublishBotTab from "./PublishBotTab.vue";
import CommentAutoResponderTab from "./CommentAutoResponderTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import ScheduleMessagesTab from "./ScheduleMessagesTab.vue";
import FacebookCheckboxTab from "./FacebookCheckboxTab.vue";

// Define tabs
const tabs = [
  { id: 'publish-bot', label: 'Publish Bot' },
  { id: 'comment-auto-responder', label: 'Comment Auto Responder' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'schedule-messages', label: 'Schedule Messages' },
  { id: 'facebook-checkbox', label: 'Facebook Checkbox' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-bot');

// Tab component refs
const publishBotTabRef = ref<InstanceType<typeof PublishBotTab> | null>(null);
const commentAutoResponderTabRef = ref<InstanceType<typeof CommentAutoResponderTab> | null>(null);
const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);
const scheduleMessagesTabRef = ref<InstanceType<typeof ScheduleMessagesTab> | null>(null);
const facebookCheckboxTabRef = ref<InstanceType<typeof FacebookCheckboxTab> | null>(null);

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const isLoading = ref(false);

const openModal = () => {
  modalRef.value?.openModal();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const handleTabChange = (tabId: string) => {
  console.log('Tab changed to:', tabId);
  currentActiveTab.value = tabId;
};

// Publish Bot Tab Events
const handleCreateNewPage = () => {
  console.log('Creating new page');
};

const handleRefreshPagePermission = () => {
  console.log('Refreshing page permission');
};

const handleRemovePagePermission = () => {
  console.log('Removing page permission');
};

const handleConnectAccount = () => {
  console.log('Connecting account');
};

// Comment Auto Responder Tab Events
const handleSaveAutoResponder = (settings: any) => {
  console.log('Saving auto responder settings:', settings);
};

// Broadcast Tab Events
const handleSendBroadcast = (data: any) => {
  console.log('Sending broadcast:', data);
};

// Schedule Messages Tab Events
const handleScheduleMessage = (message: any) => {
  console.log('Scheduling message:', message);
};

const handleDeleteScheduled = (id: number) => {
  console.log('Deleting scheduled message:', id);
};

// Facebook Checkbox Tab Events
const handleSaveCheckbox = (settings: any) => {
  console.log('Saving checkbox settings:', settings);
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Messenger Integration"
    :tabs="tabs"
    max-width="650px"
    default-tab="publish-bot"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Bot Tab -->
      <PublishBotTab 
        v-if="activeTab === 'publish-bot'"
        ref="publishBotTabRef"
        :is-loading="isLoading"
        @create-new-page="handleCreateNewPage"
        @refresh-page-permission="handleRefreshPagePermission"
        @remove-page-permission="handleRemovePagePermission"
        @connect-account="handleConnectAccount"
      />

      <!-- Comment Auto Responder Tab -->
      <CommentAutoResponderTab 
        v-if="activeTab === 'comment-auto-responder'"
        ref="commentAutoResponderTabRef"
        :is-loading="isLoading"
        @save-settings="handleSaveAutoResponder"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast'"
        ref="broadcastTabRef"
        :is-loading="isLoading"
        @send-broadcast="handleSendBroadcast"
      />

      <!-- Schedule Messages Tab -->
      <ScheduleMessagesTab 
        v-if="activeTab === 'schedule-messages'"
        ref="scheduleMessagesTabRef"
        :is-loading="isLoading"
        @schedule-message="handleScheduleMessage"
        @delete-scheduled="handleDeleteScheduled"
      />

      <!-- Facebook Checkbox Tab -->
      <FacebookCheckboxTab 
        v-if="activeTab === 'facebook-checkbox'"
        ref="facebookCheckboxTabRef"
        :is-loading="isLoading"
        @save-checkbox="handleSaveCheckbox"
      />

    </template>
    
    <template #actions>
      <!-- Save Settings Button for Comment Auto Responder Tab -->
      <button 
        v-if="currentActiveTab === 'comment-auto-responder'" 
        class="action-button primary" 
        @click="commentAutoResponderTabRef?.saveSettings()"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </button>

      <!-- Send Message Button for Broadcast Tab -->
      <button 
        v-if="currentActiveTab === 'broadcast'" 
        class="action-button primary"
        @click="broadcastTabRef?.sendBroadcast()"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Sending...' : 'Send Message' }}
      </button>

      <!-- Save Settings Button for Facebook Checkbox Tab -->
      <button 
        v-if="currentActiveTab === 'facebook-checkbox'" 
        class="action-button primary" 
        @click="facebookCheckboxTabRef?.saveSettings()"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
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

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 