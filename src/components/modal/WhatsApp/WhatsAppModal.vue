<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";
import {PublishModalLayout } from "@/components/ui";
import PublishAgentTab from "./PublishAgentTab.vue";
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
  { id: 'profile', label: 'Profile' },
  { id: 'template', label: 'Templates' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'broadcast-report', label: 'Broadcast report' },
  { id: 'catalog', label: 'Catalog' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);

// Stores
const publishStore = usePublishStore();
const botStore = useBotStore();

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

// Local reactive data
const isLoading = ref(false);
const isWhatsAppConfigured = ref(false);
const isCheckingConfiguration = ref(false);

// Use the tab management composable
const { currentTab, handleTabChange } = useTabManagement(tabs, 'publish-agent');

// Determine bot service based on configuration
const botService = computed(() => {
  if (publishStore.cache.botDetails?.dialog360) {
    return 'dialog360';
  } else if (publishStore.cache.botDetails?.whatsapp_cloud) {
    return 'facebookAPI';
  }
  return 'facebookAPI'; // Default to Meta Cloud
});

// Check if WhatsApp is configured
const checkWhatsAppConfiguration = async () => {
  // Only check if we don't have valid cached data
  if (publishStore.cacheValid.botDetails && publishStore.cache.botDetails) {
    // Use cached data to determine configuration
    isWhatsAppConfigured.value = !!(publishStore.cache.botDetails.dialog360 || publishStore.cache.botDetails.whatsapp_cloud);
    return;
  }
  
  isCheckingConfiguration.value = true;
  try {
    const result = await publishStore.getBotDetails();
    if (result.success && result.data) {
      // Check if either Dialog360 or WhatsApp Cloud is configured
      isWhatsAppConfigured.value = !!(result.data.dialog360 || result.data.whatsapp_cloud);
    }
  } catch (error) {
    console.error('Failed to check WhatsApp configuration:', error);
    isWhatsAppConfigured.value = false;
  } finally {
    isCheckingConfiguration.value = false;
  }
};

// Load profile data for Dialog360
const loadProfileData = () => {
  if (profileTabRef.value && publishStore.cache.botDetails?.dialog360) {
    profileTabRef.value.loadProfileData();
  }
};

// Override computedTabs to include disabled state based on configuration
const whatsappComputedTabs = computed(() => {
  return tabs.map(tab => {
    let disabled = false;
    
    if (tab.id === 'publish-agent') {
      disabled = false; // Always enabled
    } else if (tab.id === 'profile') {
      // Profile tab is only enabled when Dialog360 is configured
      disabled = !isWhatsAppConfigured.value || !publishStore.cache.botDetails?.dialog360;
    } else {
      // Other tabs are disabled when WhatsApp is not configured
      disabled = !isWhatsAppConfigured.value;
    }
    
    return {
      ...tab,
      disabled
    };
  });
});

const openModal = () => {
  modalRef.value?.openModal();
  
  // Only check configuration if we don't have valid cached data
  if (!publishStore.cacheValid.botDetails || !publishStore.cache.botDetails) {
    checkWhatsAppConfiguration();
  } else {
    // Use cached data to determine configuration
    isWhatsAppConfigured.value = !!(publishStore.cache.botDetails.dialog360 || publishStore.cache.botDetails.whatsapp_cloud);
  }
  
  // Ensure we're on the correct tab and initialize it
  nextTick(() => {
    handleTabChange(currentTab.value);
  });
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
const handleTemplateOpenCreateModal = () => {
  openCreateTemplateModal();
};

const handleTemplateCloseWhatsAppModal = () => {
  closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  console.log('WhatsAppModal - Tab changed to:', tabId);
  
  // Only allow tab change if WhatsApp is configured or if it's the publish agent tab
  if (tabId === 'publish-agent' || isWhatsAppConfigured.value) {
    handleTabChange(tabId);
    
    // Load profile data when profile tab is selected
    if (tabId === 'profile' && publishStore.cache.botDetails?.dialog360) {
      nextTick(() => {
        loadProfileData();
        // Also initialize the profile tab component if it has a ref
        if (profileTabRef.value) {
          profileTabRef.value.loadProfileData();
        }
      });
    }
    
    // Initialize templates when broadcast tab is selected
    if (tabId === 'broadcast' && broadcastTabRef.value) {
      nextTick(() => {
        broadcastTabRef.value?.initializeTemplates();
      });
    }
    
    // Initialize templates when template tab is selected
    if (tabId === 'template' && templateTabRef.value) {
      // Add a small delay to ensure the component is fully rendered
      nextTick(() => {
        // Always fetch templates when template tab is selected to ensure fresh data
        templateTabRef.value?.fetchTemplates(1, 20);
      });
    }
    
    // Refresh broadcast report data when broadcast report tab is selected
    if (tabId === 'broadcast-report' && broadcastReportTabRef.value) {
      nextTick(() => {
        broadcastReportTabRef.value?.refreshData();
      });
    }
    
    // Initialize catalog when catalog tab is selected
    if (tabId === 'catalog' && catalogTabRef.value) {
      nextTick(() => {
        catalogTabRef.value?.initializeCatalog();
      });
    }
  }
};

// Publish Bot Tab Events
const handleTestBot = async () => {
  // Open WhatsApp with test message
  const whatsappUrl = `https://web.whatsapp.com/send?phone=923313014733&text=Start%20Bot%${botStore.botId}`;
  window.open(whatsappUrl, '_blank');
};

const handleFilterReport = (filters: any) => {
  console.log('Filtering report:', filters);
};

const handleUpdateProduct = (product: any) => {
  console.log('Updating product:', product);
};

const handleDeleteProduct = (id: number) => {
  console.log('Deleting product:', id);
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
        :is-loading="isLoading"
        @test-bot="handleTestBot"
      />

      <!-- Profile Tab (only for Dialog360) -->
      <ProfileTab 
        v-if="activeTab === 'profile' && isWhatsAppConfigured && publishStore.cache.botDetails?.dialog360"
        ref="profileTabRef"
        :is-loading="isLoading"
      />

      <!-- Loading State -->
      <div v-if="isCheckingConfiguration || publishStore.loadingStates.botDetails" class="loading-state">
        <div class="loader-spinner"></div>
        <span>Loading WhatsApp settings...</span>
      </div>
      
      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-show="activeTab === 'broadcast' && isWhatsAppConfigured"
        ref="broadcastTabRef"
        :is-loading="isLoading"
      />

      <!-- Broadcast Report Tab -->
      <BroadcastReportTab 
        v-show="activeTab === 'broadcast-report' && isWhatsAppConfigured"
        ref="broadcastReportTabRef"
        :is-loading="isLoading"
        @filter-report="handleFilterReport"
      />

      <!-- Template Tab -->
      <TemplateTab
        v-show="activeTab === 'template' && isWhatsAppConfigured"
        ref="templateTabRef"
        @open-create-modal="handleTemplateOpenCreateModal"
        @close-whatsapp-modal="handleTemplateCloseWhatsAppModal"
      />

      <!-- Catalog Tab -->
      <CatalogTab 
        v-show="activeTab === 'catalog' && isWhatsAppConfigured"
        ref="catalogTabRef"
        :is-loading="isLoading"
        @update-product="handleUpdateProduct"
        @delete-product="handleDeleteProduct"
      />

      <!-- Configuration Required Message -->
      <div v-if="activeTab !== 'publish-agent' && !isWhatsAppConfigured" class="configuration-required">
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
    :bot-service="botService"
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