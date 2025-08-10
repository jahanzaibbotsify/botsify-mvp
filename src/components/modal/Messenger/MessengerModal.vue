<script setup lang="ts">
import { ref, provide, computed } from "vue";
import { Button, PublishModalLayout } from "@/components/ui";
import PublishAgentTab from "./PublishAgentTab.vue";
import CommentAutoResponderTab from "./CommentAutoResponderTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";
import { useTabManagement } from "@/composables/publishbot/useTabManagement";

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

// Stores
const publishStore = usePublishStore();
const botStore = useBotStore();

// Computed configuration status
const isConfigured = ref(false);

// Loading state from store
const isLoading = computed(() => publishStore.isLoadingFacebookPages);

// Configuration check function
const checkConfiguration = () => {
  const pages = publishStore.facebookPagesCache;
  if (pages && pages.pagesData && pages.pagesData.data) {
    const pagesData = pages.pagesData.data;
    // Check if any page is connected to the current bot
    isConfigured.value = pagesData.some((page: any) => 
      page.connected_page_bot === botStore.botName
    );
  } else {
    isConfigured.value = false;
  }
};

// Load Facebook pages function
const loadFacebookPages = async () => {
  try {
    const result = await publishStore.getFbPages();
    if (result.success) {
      checkConfiguration();
    }
  } catch (error) {
    console.error('Failed to load Facebook pages:', error);
  }
};

const { currentTab, handleTabChange } = useTabManagement(tabs, 'publish-bot');

// Override computedTabs to include disabled state based on configuration
const messengerComputedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-bot' && !isConfigured.value
  }));
});

const openModal = async () => {
  modalRef.value?.openModal();
  // Load Facebook pages when modal opens
  await loadFacebookPages();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  console.log('MessengerModal - Tab changed to:', tabId);
  
  // Only allow tab change if Messenger is configured or if it's the publish agent tab
  if (tabId === 'publish-bot' || isConfigured.value) {
    currentActiveTab.value = tabId;
    handleTabChange(tabId);
  }
};

// Comment Auto Responder Tab Events
const handleSaveAutoResponder = (settings: any) => {
  console.log('Saving auto responder settings:', settings);
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

// Provide context for child components
provide('messenger-modal', {
  isConfigured,
  currentTab,
  botService: ref('messenger')
});

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Messenger integration"
    :tabs="messengerComputedTabs"
    icon="/bots/messenger.png"
    max-width="1200px"
    default-tab="publish-bot"
    @back="handleBack"
    @tab-change="onTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Agent Tab -->
      <PublishAgentTab 
        v-show="activeTab === 'publish-bot'"
        ref="publishAgentTabRef"
        :is-loading="isLoading"
        @page-connection-change="checkConfiguration"
      />

      <!-- Comment Auto Responder Tab -->
      <CommentAutoResponderTab 
        v-show="activeTab === 'comment-auto-responder' && isConfigured"
        ref="commentAutoResponderTabRef"
        :is-loading="isLoading"
        @save-settings="handleSaveAutoResponder"
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-show="activeTab === 'broadcast' && isConfigured"
        ref="broadcastTabRef"
        @no-test-user="handleNoTestUser"
        @send-message="handleSendMessage"
      />

      <!-- Configuration Required Message -->
      <div v-if="activeTab !== 'publish-bot' && !isConfigured" class="configuration-required">
        <div class="configuration-message">
          <i class="pi pi-exclamation-triangle"></i>
          <h3>Configuration Required</h3>
          <p>Please connect a Facebook page in the "Publish agent" tab before accessing other features.</p>
        </div>
      </div>
    </template>
    
    <template #actions>
      <!-- No Test User Button for Broadcast Tab -->
      <!-- <Button 
        v-if="currentActiveTab === 'broadcast' && isConfigured" 
        variant="secondary"
        @click="handleNoTestUser"
        :disabled="isLoading"
      >
        No test user
      </Button> -->
      <!-- Send Message Button for Broadcast Tab -->
      <Button 
        v-if="currentActiveTab === 'broadcast' && isConfigured" 
        variant="primary"
        @click="handleSendMessage"
        :disabled="broadcastTabRef?.isLoading"
        :loading="broadcastTabRef?.isLoading"
      >
        {{ broadcastTabRef?.isLoading ? 'Sending...' : 'Send Broadcast' }}
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