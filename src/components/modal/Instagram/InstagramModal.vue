<script setup lang="ts">
import {PublishModalLayout} from "@/components/ui";
import { ref, computed } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";

// Define tabs
const tabs = [
  { id: 'publish-bot', label: 'Publish agent' },
  // { id: 'broadcast', label: 'Broadcast' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-bot');

// Stores
const publishStore = usePublishStore();
const botStore = useBotStore();

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
// const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const isLoading = ref(false);
const isInstagramConfigured = ref(false);

// Check if Instagram is configured (has connected pages)
const checkInstagramConfiguration = () => {
  const pages = publishStore.instagramPagesCache;
  if (pages && pages.pagesData && pages.pagesData.data) {
    const pagesData = pages.pagesData.data;
    // Check if any page is connected to the current bot
    isInstagramConfigured.value = pagesData.some((page: any) => 
      page.connected_page_bot === botStore.botName
    );
  } else {
    isInstagramConfigured.value = false;
  }
};

// Computed tabs with disabled state
const computedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-bot' && !isInstagramConfigured.value
  }));
});

const openModal = () => {
  modalRef.value?.openModal();
  // Load Instagram pages when modal opens (store handles caching)
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

const handleTabChange = (tabId: string) => {
  console.log('Tab changed to:', tabId);
  
  // Only allow tab change if Instagram is configured or if it's the publish agent tab
  if (tabId === 'publish-bot' || isInstagramConfigured.value) {
    currentActiveTab.value = tabId;
  }
};

// Handle page connection/disconnection to update configuration status
const handlePageConnectionChange = () => {
  // Recheck configuration after page connection changes
  setTimeout(() => {
    checkInstagramConfiguration();
  }, 1000); // Small delay to allow store to update
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Instagram integration"
    :tabs="computedTabs"
    icon="/bots/instagram.png"
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
        @page-connection-change="handlePageConnectionChange"
      />

      <!-- Configuration Required Message -->
      <div v-if="activeTab !== 'publish-bot' && !isInstagramConfigured" class="configuration-required">
        <div class="configuration-message">
          <i class="pi pi-exclamation-triangle"></i>
          <h3>Configuration Required</h3>
          <p>Please connect an Instagram page in the "Publish agent" tab before accessing other features.</p>
        </div>
      </div>
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