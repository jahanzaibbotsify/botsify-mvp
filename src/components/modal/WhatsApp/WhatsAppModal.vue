<script setup lang="ts">
import { ref, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { PublishModalLayout } from "@/components/ui";
import PublishAgentTab from "./PublishAgentTab.vue";
import TestBotTab from "./TestBotTab.vue";
import ProfileTab from "./ProfileTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import BroadcastReportTab from "./BroadcastReportTab.vue";
import TemplateTab from "./TemplateTab.vue";
import CatalogTab from "./CatalogTab.vue";
import CreateTemplateModal from "./Create/CreateTemplateModal.vue";
import { useTabManagement } from "@/composables/useTabManagement";

// Define tabs
const tabs = [
  { id: 'publish-agent', label: 'Publish agent' },
  // { id: 'profile', label: 'Profile' },
  { id: 'template', label: 'Templates' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'broadcast-report', label: 'Broadcast report' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'test-bot', label: 'Test bot' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);

// Stores
const publishStore = usePublishStore();

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
const profileTabRef = ref<InstanceType<typeof ProfileTab> | null>(null);
const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);
const broadcastReportTabRef = ref<InstanceType<typeof BroadcastReportTab> | null>(null);
const templateTabRef = ref<InstanceType<typeof TemplateTab> | null>(null);
const catalogTabRef = ref<InstanceType<typeof CatalogTab> | null>(null);
const createTemplateModalRef = ref<InstanceType<typeof CreateTemplateModal> | null>(null);

const emit = defineEmits<{
  back: [];
}>();

// Use the tab management composable
const { currentTab, handleTabChange } = useTabManagement(tabs, 'publish-agent');

// Computed configuration status
const isConfigured = ref(false);
const configure = ref<'meta' | 'dialog360' | null>(null);

// Check if WhatsApp is configured
const checkConfiguration = () => {
  const data = publishStore.whatsappConfig.data;
  if (data && data.data?.whatsapp) {
    configure.value = data.data?.whatsapp.type === 'cloud_whatsapp' ? 'meta' : 'dialog360';
    isConfigured.value = true;
  } else{
    isConfigured.value = false;
  }
};

// Override computedTabs to include disabled state based on configuration
const whatsappComputedTabs = computed(() => {
  return tabs.map(tab => {
    let disabled = false;
    
    if (tab.id === 'publish-agent' || tab.id === 'test-bot') {
      disabled = false; // Always enabled
    } else if (tab.id === 'profile') {
      // Profile tab is only enabled when Dialog360 is configured
      disabled = !isConfigured.value || configure.value === 'dialog360';
    } else {
      // Other tabs are disabled when WhatsApp is not configured
      disabled = !isConfigured.value;
    }
    return {
      ...tab,
      disabled
    };
  });
});

const openModal = async () => {
  modalRef.value?.openModal();
  
  // Only check configuration if we don't have valid cached data
  await publishStore.whatsappConfig.load();
  await checkConfiguration();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

// Template methods
const openCreateTemplateModal = () => {
  closeModal(); // Close WhatsApp modal
  createTemplateModalRef.value?.openModal();
};

// Template Tab Events
const handleTemplateOpenCreateModal = (clonedData?: any) => {
  if (clonedData) {
    // Open create template modal with cloned data
    createTemplateModalRef.value?.openModalWithData(clonedData);
  } else {
    createTemplateModalRef.value?.resetForm();
    // Open create template modal normally
    openCreateTemplateModal();
  }
};

const handleTemplateCloseWhatsAppModal = () => {
  closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  // Only allow tab change if WhatsApp is configured or if it's the publish agent tab
  if (tabId === 'publish-bot' || isConfigured.value) {
    currentTab.value = tabId;
    handleTabChange(tabId);
  }
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="WhatsApp integration"
    :tabs="whatsappComputedTabs"
    icon="/bots/whatsapp.png"
    max-width="1200px"
    default-tab="publish-agent"
    @back="handleBack"
    @tab-change="onTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Agent Tab -->
      <PublishAgentTab 
        v-show="activeTab === 'publish-agent'"
        ref="publishAgentTabRef"
        :is-loading="publishStore.whatsappConfig.loading"
        @check-config="checkConfiguration"
      />

      <!-- Test Bot Tab -->
      <TestBotTab v-if="activeTab === 'test-bot'" />


      <!-- Loading State -->
      <div v-if="publishStore.whatsappConfig.loading && activeTab !== 'publish-agent'" class="loading-state">
        <div class="loader-spinner"></div>
        <span>Loading WhatsApp settings...</span>
      </div>
      
        <!-- Profile Tab (only for Dialog360) -->
        <ProfileTab 
        v-if="activeTab === 'profile' && isConfigured && configure === 'dialog360'"
        ref="profileTabRef"
        :is-loading="publishStore.whatsappConfig.loading"
      />
      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast'"
        ref="broadcastTabRef"
        :is-loading="publishStore.whatsappConfig.loading"
      />

      <!-- Broadcast Report Tab -->
      <BroadcastReportTab 
        v-if="activeTab === 'broadcast-report' && isConfigured"
        ref="broadcastReportTabRef"
        :is-loading="publishStore.whatsappConfig.loading"
      />

      <!-- Template Tab -->
      <TemplateTab
        v-if="activeTab === 'template' && isConfigured"
        ref="templateTabRef"
        @open-create-modal="handleTemplateOpenCreateModal"
        @close-whatsapp-modal="handleTemplateCloseWhatsAppModal"
      />

      <!-- Catalog Tab -->
      <CatalogTab 
        v-if="activeTab === 'catalog' && isConfigured"
        ref="catalogTabRef"
        :is-loading="publishStore.whatsappConfig.loading"
      />

      <!-- Configuration Required Message -->
      <div v-if="activeTab !== 'publish-agent' && !isConfigured" class="configuration-required">
        <div class="configuration-message">
          <i class="pi pi-exclamation-triangle"></i>
          <h3>Configuration Required</h3>
          <p>Please complete the WhatsApp integration setup in the "Publish agent" tab before accessing other features.</p>
        </div>
      </div>
    </template>
  </PublishModalLayout>

  <!-- Create Template Modal -->
  <CreateTemplateModal
    ref="createTemplateModalRef"
    @modal-closed="openModal"
    :bot-service="configure === 'dialog360' ? 'dialog360' : 'facebookAPI'"
  />
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.loader-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>