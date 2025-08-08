<script setup lang="ts">
import {PublishModalLayout, Button} from "@/components/ui";
import Pagination from "@/components/ui/Pagination.vue";
import { ref, computed } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import CommentAutoResponderTab from "./CommentAutoResponderTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";

// Define tabs
const tabs = [
  { id: 'publish-bot', label: 'Publish agent' },
  { id: 'comment-auto-responder', label: 'Comment Auto Responder' },
  { id: 'broadcast', label: 'Broadcast' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-bot');

// Stores
const publishStore = usePublishStore();
const botStore = useBotStore();

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
const commentAutoResponderTabRef = ref<InstanceType<typeof CommentAutoResponderTab> | null>(null);
const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const isLoading = ref(false);
const isMessengerConfigured = ref(false);

// Check if Messenger is configured (has connected pages)
const checkMessengerConfiguration = () => {
  const pages = publishStore.facebookPagesCache;
  console.log('pages', pages);
  if (pages && pages.pagesData && pages.pagesData.data) {
    console.log('pagesData', pages.pagesData.data);
    const pagesData = pages.pagesData.data;
    // Check if any page is connected to the current bot
    isMessengerConfigured.value = pagesData.some((page: any) => 
      page.connected_page_bot === botStore.botName
    );
  } else {
    isMessengerConfigured.value = false;
  }
};

// Computed tabs with disabled state
const computedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-bot' && !isMessengerConfigured.value
  }));
});

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
  
  // Only allow tab change if Messenger is configured or if it's the publish agent tab
  if (tabId === 'publish-bot' || isMessengerConfigured.value) {
    currentActiveTab.value = tabId;
  }
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
    :tabs="computedTabs"
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
        @page-connection-change="checkMessengerConfiguration"
      />

      <!-- Comment Auto Responder Tab -->
      <CommentAutoResponderTab 
        v-show="activeTab === 'comment-auto-responder' && isMessengerConfigured"
        ref="commentAutoResponderTabRef"
        :is-loading="isLoading"
        @save-settings="handleSaveAutoResponder"
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-show="activeTab === 'broadcast' && isMessengerConfigured"
        ref="broadcastTabRef"
        :is-loading="isLoading"
        @send-broadcast="handleSendBroadcast"
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
        @loading-change="handleLoadingChange"
      />

      <!-- Configuration Required Message -->
      <div v-if="activeTab !== 'publish-bot' && !isMessengerConfigured" class="configuration-required">
        <div class="configuration-message">
          <i class="pi pi-exclamation-triangle"></i>
          <h3>Configuration Required</h3>
          <p>Please connect a Facebook page in the "Publish agent" tab before accessing other features.</p>
        </div>
      </div>
    </template>
    
    <template #actions>
      <!-- No Test User Button for Broadcast Tab -->
      <Button 
        v-if="currentActiveTab === 'broadcast' && isMessengerConfigured" 
        variant="secondary"
        @click="handleNoTestUser"
        :disabled="isLoading"
      >
        No test user
      </Button>

      <!-- Send Message Button for Broadcast Tab -->
      <Button 
        v-if="currentActiveTab === 'broadcast' && isMessengerConfigured" 
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
.configuration-required {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px;
}

.configuration-message {
  text-align: center;
  max-width: 400px;
}

.configuration-message i {
  font-size: 48px;
  color: var(--color-warning, #f59e0b);
  margin-bottom: 16px;
}

.configuration-message h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.configuration-message p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.5;
}
</style> 