<script setup lang="ts">
import {PublishModalLayout} from "@/components/ui";
import { ref } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
// import BroadcastTab from "./BroadcastTab.vue";

// Define tabs
const tabs = [
  { id: 'publish-bot', label: 'Publish agent' },
  // { id: 'broadcast', label: 'Broadcast' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-bot');

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
// const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const isLoading = ref(false);

const openModal = () => {
  modalRef.value?.openModal();
  // Load Facebook pages when modal opens (store handles caching)
  if (publishAgentTabRef.value) {
    publishAgentTabRef.value.loadInstaPages();
  }
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
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
  >
    <template #default="{ activeTab }">
      <!-- Publish Agent Tab -->
      <PublishAgentTab 
        v-show="activeTab === 'publish-bot'"
        ref="publishAgentTabRef"
        :is-loading="isLoading"
      />

      <!-- Broadcast Tab -->
      <!-- <BroadcastTab 
        v-show="activeTab === 'broadcast'"
        ref="broadcastTabRef"
        :is-loading="isLoading"
        @send-broadcast="handleSendBroadcast"
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
      /> -->

    </template>
    
    <!-- <template #actions> -->
      <!-- No actions needed for Comment Auto Responder Tab -->
      
      <!-- No Test User Button for Broadcast Tab -->
      <!-- <Button 
        v-if="currentActiveTab === 'broadcast'" 
        variant="secondary"
        @click="handleNoTestUser"
        :disabled="isLoading"
      >
        No test user
      </Button> -->

      <!-- Send Message Button for Broadcast Tab -->
      <!-- <Button 
        v-if="currentActiveTab === 'broadcast'" 
        variant="primary"
        @click="handleSendMessage"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Sending...' : 'Send message' }}
      </Button> -->
    <!-- </template> -->
  </PublishModalLayout>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */
</style> 