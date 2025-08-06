<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import Pagination from "@/components/ui/Pagination.vue";
import { ref } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import CommentAutoResponderTab from "./CommentAutoResponderTab.vue";
import BroadcastTab from "./BroadcastTab.vue";

// Define tabs
const tabs = [
  { id: 'publish-bot', label: 'Publish agent' },
  { id: 'comment-auto-responder', label: 'Comment auto responder' },
  { id: 'broadcast', label: 'Broadcast' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-bot');

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
const commentAutoResponderTabRef = ref<InstanceType<typeof CommentAutoResponderTab> | null>(null);
const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);

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

const handleNoTestUser = () => {
  console.log('No test user action');
};

const handleSendMessage = (message: any) => {
  console.log('Sending message:', message);
};

// Broadcast Tab Events
const handleSendBroadcast = (data: any) => {
  console.log('Sending broadcast:', data);
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Instagram integration"
    :tabs="tabs"
    icon="/bots/instagram.png"
    max-width="1200px"
    default-tab="publish-bot"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Agent Tab -->
      <PublishAgentTab 
        v-if="activeTab === 'publish-bot'"
        ref="publishAgentTabRef"
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
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast'"
        ref="broadcastTabRef"
        :is-loading="isLoading"
        @send-broadcast="handleSendBroadcast"
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
      />

    </template>
    
    <template #actions>
      <!-- Send Message Button for Comment Auto Responder Tab -->
      <button 
        v-if="currentActiveTab === 'comment-auto-responder'" 
        class="action-button primary"
        @click="commentAutoResponderTabRef?.sendMessage()"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Sending...' : 'Send Message' }}
      </button>

      <!-- No Test User Button for Broadcast Tab -->
      <button 
        v-if="currentActiveTab === 'broadcast'" 
        class="action-button"
        @click="broadcastTabRef?.noTestUser()"
        :disabled="isLoading"
      >
        No Test User
      </button>

      <!-- Send Message Button for Broadcast Tab -->
      <button 
        v-if="currentActiveTab === 'broadcast'" 
        class="action-button primary"
        @click="broadcastTabRef?.sendMessage()"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Sending...' : 'Send Message' }}
      </button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */
</style> 