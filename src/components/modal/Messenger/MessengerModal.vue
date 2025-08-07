<script setup lang="ts">
import {PublishModalLayout, Button} from "@/components/ui";
import Pagination from "@/components/ui/Pagination.vue";
import { ref } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import CommentAutoResponderTab from "./CommentAutoResponderTab.vue";
import BroadcastTab from "./BroadcastTab.vue";

// Define tabs
const tabs = [
  { id: 'publish-bot', label: 'Publish agent' },
  { id: 'comment-auto-responder', label: 'Comment Auto Responder' },
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
  // Load Facebook pages when modal opens (store handles caching)
  if (publishAgentTabRef.value) {
    publishAgentTabRef.value.loadFbPages();
  }
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
  
  // Load data based on the selected tab
  if (tabId === 'comment-auto-responder' && commentAutoResponderTabRef.value) {
    // Load comment responders when the tab is selected
    commentAutoResponderTabRef.value.loadCommentResponders();
  }
  
  // No need to reload Facebook pages on tab change since store handles caching
  // The data will be available from the store cache
};

// Comment Auto Responder Tab Events
const handleSaveAutoResponder = (settings: any) => {
  console.log('Saving auto responder settings:', settings);
};

// Broadcast Tab Events
const handleSendBroadcast = (data: any) => {
  console.log('Sending broadcast:', data);
};

const handleSendMessage = async () => {
  if (currentActiveTab.value === 'broadcast' && broadcastTabRef.value) {
    await broadcastTabRef.value.sendMessage();
  } else {
    console.log('Sending message');
  }
};

const handleNoTestUser = () => {
  if (currentActiveTab.value === 'broadcast' && broadcastTabRef.value) {
    broadcastTabRef.value.noTestUser();
  } else {
    console.log('No test user action');
  }
};

// Handle loading state from BroadcastTab
const handleLoadingChange = (loading: boolean) => {
  isLoading.value = loading;
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Messenger integration"
    :tabs="tabs"
    icon="/bots/messenger.png"
    max-width="1200px"
    default-tab="publish-bot"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Agent Tab -->
      <PublishAgentTab 
        v-show="activeTab === 'publish-bot'"
        ref="publishAgentTabRef"
        :is-loading="isLoading"
      />

      <!-- Comment Auto Responder Tab -->
      <CommentAutoResponderTab 
        v-show="activeTab === 'comment-auto-responder'"
        ref="commentAutoResponderTabRef"
        :is-loading="isLoading"
        @save-settings="handleSaveAutoResponder"
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-show="activeTab === 'broadcast'"
        ref="broadcastTabRef"
        :is-loading="isLoading"
        @send-broadcast="handleSendBroadcast"
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
        @loading-change="handleLoadingChange"
      />

    </template>
    
    <template #actions>
      <!-- No Test User Button for Broadcast Tab -->
      <Button 
        v-if="currentActiveTab === 'broadcast'" 
        variant="secondary"
        @click="handleNoTestUser"
        :disabled="isLoading"
      >
        No test user
      </Button>

      <!-- Send Message Button for Broadcast Tab -->
      <Button 
        v-if="currentActiveTab === 'broadcast'" 
        variant="primary"
        @click="handleSendMessage"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Sending...' : 'Send Broadcast' }}
      </Button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */
</style> 