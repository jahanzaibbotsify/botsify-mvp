<script setup lang="ts">
import { ref, provide, computed } from "vue";
import { useBotStore } from "@/stores/botStore";
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import { usePublishStore } from "@/stores/publishStore";
import { useTabManagement } from "@/composables/useTabManagement";

// Define tabs
const tabs = [
  { id: 'publish-bot', label: 'Publish agent' },
  // { id: 'broadcast', label: 'Broadcast' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-bot');

// Stores
const botStore = useBotStore();
const publishStore = usePublishStore();

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
// const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);

const emit = defineEmits<{
  back: [];
}>();

// Local state - removed isLoading as it's not needed

const { currentTab, handleTabChange } = useTabManagement(tabs, 'publish-bot');

// Configuration checking
const isConfigured = computed(() => {
  const pages = publishStore.cache.instagramPages;
  if (pages && pages.pagesData && pages.pagesData.data) {
    const pagesData = pages.pagesData.data;
    // Check if any page is connected to the current bot
    return pagesData.some((page: any) => 
      page.connected_page_bot === botStore.botName
    );
  }
  return false;
});

// Override computedTabs to include disabled state based on configuration
const instagramComputedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-bot' && !isConfigured.value
  }));
});

const openModal = () => {
  modalRef.value?.openModal();
  // Load Instagram pages when modal opens
  publishStore.getInstagramPages();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  // Only allow tab change if Instagram is configured or if it's the publish agent tab
  if (tabId === 'publish-bot' || isConfigured.value) {
    currentActiveTab.value = tabId;
    handleTabChange(tabId);
  }
};

// Configuration updates automatically when store changes (computed property)

// Provide context for child components
provide('instagram-modal', {
  isConfigured,
  currentTab,
  botService: ref('instagram')
});

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Instagram integration"
    :tabs="instagramComputedTabs"
    icon="/bots/instagram.png"
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
      />

      <!-- Configuration Required Message -->
      <div v-if="activeTab !== 'publish-bot' && !isConfigured" class="configuration-required">
        <div class="configuration-message">
          <i class="pi pi-exclamation-triangle"></i>
          <h3>Configuration Required</h3>
          <p>Please connect an Instagram page in the "Publish agent" tab before accessing other features.</p>
        </div>
      </div>
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