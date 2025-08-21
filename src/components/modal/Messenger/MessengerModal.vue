<script setup lang="ts">
import { ref, provide, computed } from "vue";
import { PublishModalLayout } from "@/components/ui";
import PublishAgentTab from "./PublishAgentTab.vue";
import CommentAutoResponderTab from "./CommentAutoResponderTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";
import { useTabManagement } from "@/composables/useTabManagement";
import type { FacebookPage } from "@/types";

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

// Stores
const publishStore = usePublishStore();
const botStore = useBotStore();

const { currentTab, handleTabChange } = useTabManagement(tabs, 'publish-bot');


// Override computedTabs to include disabled state based on configuration
const messengerComputedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-bot' && !isConfigured.value
  }));
});


// Computed configuration status
const isConfigured = ref(false);

// Configuration check
const checkConfiguration = () => {
  const pages = publishStore.facebookPages.data;
  if (pages && pages.data?.pagesData?.data) {
    const pagesData = pages.data.pagesData.data;
    isConfigured.value = pagesData.some(
      (page: FacebookPage) => page.connected_page_bot === botStore.botName
    );
  } else {
    isConfigured.value = false;
  }
};


const openModal = async () => {
  modalRef.value?.openModal();
  // Load Facebook pages when modal opens
  await publishStore.facebookPages.load();
  await checkConfiguration();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  // Only allow tab change if Messenger is configured or if it's the publish agent tab
  if (tabId === 'publish-bot' || isConfigured.value) {
    currentActiveTab.value = tabId;
    handleTabChange(tabId);
  }
};

const pageDisconnect = () => {
  isConfigured.value = false;
}

const pageConnect = () => {
  isConfigured.value = true;
} 

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
        :is-loading="publishStore.facebookPages.loading"
        @page-disconnect="pageDisconnect"
        @page-connect="pageConnect"
      />

      <!-- Comment Auto Responder Tab -->
      <CommentAutoResponderTab 
        v-if="activeTab === 'comment-auto-responder' && isConfigured"
        ref="commentAutoResponderTabRef"
        :is-loading="publishStore.facebookPages.loading"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast' && isConfigured"
        ref="broadcastTabRef"
        :is-loading="publishStore.facebookPages.loading"
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