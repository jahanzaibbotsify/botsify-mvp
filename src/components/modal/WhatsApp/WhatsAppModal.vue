<script setup lang="ts">
import { ref, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import { useBotStore } from "@/stores/botStore";
import {Button, PublishModalLayout} from "@/components/ui";
import PublishAgentTab from "./PublishAgentTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import BroadcastReportTab from "./BroadcastReportTab.vue";
import TemplateTab from "./TemplateTab.vue";
import CatalogTab from "./CatalogTab.vue";
import CreateTemplateModal from "./Create/CreateTemplateModal.vue";
import Pagination from "@/components/ui/Pagination.vue";

// Define tabs
const tabs = [
  { id: 'publish-agent', label: 'Publish agent' },
  { id: 'template', label: 'Templates' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'broadcast-report', label: 'Broadcast report' },
  { id: 'catalog', label: 'Catalog' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-agent');

// Stores
const publishStore = usePublishStore();
const botStore = useBotStore();

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
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

// Pagination variables for TemplateTab
const currentPage = ref(1);
const totalPages = ref(1);
const paginationData = ref<{
  page: number;
  perPage: number;
  total: number;
  to: number;
  prev_page_url: string | null;
} | null>(null);
const itemsPerPage = 20;
const isLoadingTemplates = ref(false);

// Pagination variables for BroadcastReportTab
const broadcastCurrentPage = ref(1);
const broadcastTotalPages = ref(1);
const broadcastPaginationData = ref<{
  page: number;
  perPage: number;
  total: number;
  to: number;
  prev_page_url: string | null;
} | null>(null);
const broadcastItemsPerPage = 20;
const isLoadingBroadcastReports = ref(false);

// Determine bot service based on configuration
const botService = computed(() => {
  if (publishStore.botDetailsCache?.dialog360) {
    return 'dialog360';
  } else if (publishStore.botDetailsCache?.whatsapp_cloud) {
    return 'facebookAPI';
  }
  return 'facebookAPI'; // Default to Meta Cloud
});

// Check if WhatsApp is configured
const checkWhatsAppConfiguration = async () => {
  try {
    const result = await publishStore.getBotDetails();
    if (result.success && result.data) {
      // Check if either Dialog360 or WhatsApp Cloud is configured
      isWhatsAppConfigured.value = !!(result.data.dialog360 || result.data.whatsapp_cloud);
    }
  } catch (error) {
    console.error('Failed to check WhatsApp configuration:', error);
    isWhatsAppConfigured.value = false;
  }
};

// Computed tabs with disabled state
const computedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-agent' && !isWhatsAppConfigured.value
  }));
});

const openModal = () => {
  modalRef.value?.openModal();
  checkWhatsAppConfiguration();
  handleTabChange(currentActiveTab.value);
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

const handleTabChange = (tabId: string) => {
  console.log('Tab changed to:', tabId);
  
  // Only allow tab change if WhatsApp is configured or if it's the publish agent tab
  if (tabId === 'publish-agent' || isWhatsAppConfigured.value) {
    currentActiveTab.value = tabId;
    
    // Initialize templates when broadcast tab is selected
    if (tabId === 'broadcast' && broadcastTabRef.value) {
      broadcastTabRef.value.initializeTemplates();
    }
    
    // Initialize templates when template tab is selected
    if (tabId === 'template' && templateTabRef.value) {
      templateTabRef.value.fetchTemplates(1, itemsPerPage);
    }
    
    // Refresh broadcast report data when broadcast report tab is selected
    if (tabId === 'broadcast-report' && broadcastReportTabRef.value) {
      broadcastReportTabRef.value.refreshData();
      // Reset pagination state for broadcast reports
      broadcastCurrentPage.value = 1;
      broadcastTotalPages.value = 1;
      broadcastPaginationData.value = null;
    }
  }
};

// Pagination handler for TemplateTab
const handlePageChange = (page: number) => {
  if (templateTabRef.value) {
    templateTabRef.value.fetchTemplates(page, itemsPerPage);
  }
};

// Pagination handler for BroadcastReportTab
const handleBroadcastPageChange = (page: number) => {
  if (broadcastReportTabRef.value) {
    // Update the current page in the parent state
    broadcastCurrentPage.value = page;
    // Call fetchReportData to get data for the new page
    broadcastReportTabRef.value.fetchReportData();
  }
};

// Handle broadcast pagination updates
const handleBroadcastPaginationUpdate = (data: { page: number; perPage: number; total: number; to: number; prev_page_url: string | null } | null) => {
  if (data) {
    broadcastPaginationData.value = data;
    broadcastTotalPages.value = Math.ceil(data.total / data.perPage);
    broadcastCurrentPage.value = data.page;
  } else {
    broadcastPaginationData.value = null;
    broadcastTotalPages.value = 1;
    broadcastCurrentPage.value = 1;
  }
};

// Handle broadcast loading state updates
const handleBroadcastLoadingUpdate = (loading: boolean) => {
  isLoadingBroadcastReports.value = loading;
};

// Handle template pagination updates
const handleTemplatePaginationUpdate = (data: { page: number; perPage: number; total: number; to: number; prev_page_url: string | null } | null) => {
  if (data) {
    paginationData.value = data;
    totalPages.value = Math.ceil(data.total / data.perPage);
    currentPage.value = data.page;
  } else {
    paginationData.value = null;
    totalPages.value = 1;
    currentPage.value = 1;
  }
};

// Handle template loading state updates
const handleTemplateLoadingUpdate = (loading: boolean) => {
  isLoadingTemplates.value = loading;
};

// Publish Bot Tab Events
const handleTestBot = async () => {
  // Open WhatsApp with test message
  const whatsappUrl = `https://web.whatsapp.com/send?phone=923313014733&text=Start%20Bot%${botStore.botId}`;
  window.open(whatsappUrl, '_blank');
};

const handleSaveMetaSettings = async (settings: any) => {
  isLoading.value = true;
  try {
    console.log('Saving Meta Cloud settings:', settings);
    const result = await publishStore.saveWhatsAppCloudSettings({
      temporaryToken: settings.temporaryToken,
      phoneNumber: settings.phoneNumber,
      phoneNumberId: settings.phoneNumberId,
      whatsappBusinessAccountId: settings.whatsappBusinessAccountId,
      clientId: settings.clientId,
      clientSecret: settings.clientSecret
    });
    
    if (result.success) {
      window.$toast?.success('Meta Cloud settings saved successfully!');
      // Recheck configuration after saving
      await checkWhatsAppConfiguration();
    }
  } catch (error) {
    console.error('Failed to save Meta Cloud settings:', error);
    window.$toast.error('Failed to save Meta Cloud settings');
  } finally {
    isLoading.value = false;
  }
};

const handleSaveDialog360Settings = async (settings: any) => {
  isLoading.value = true;
  try {
    console.log('Saving Dialog360 settings:', settings);
    // The settings object now contains the full payload with all existing data
    const result = await publishStore.saveDialog360Settings(settings);
    
    if (result.success) {
      window.$toast?.success('Dialog360 settings saved successfully!');
      // Recheck configuration after saving
      await checkWhatsAppConfiguration();
    }
  } catch (error) {
    console.error('Failed to save Dialog360 settings:', error);
    window.$toast?.error('Failed to save Dialog360 settings');
  } finally {
    isLoading.value = false;
  }
};

// Broadcast Tab Events
const handleSendBroadcast = async (data: any) => {
  console.log('Sending broadcast:', data);
  isLoading.value = true;
  
  try {
    // Call the API to create broadcast task
    const result = await publishStore.createWhatsappBroadcastTask(data);
    
    if (result.success) {
      window.$toast?.success('Broadcast scheduled successfully!');
      
      // Revalidate broadcast report cache after successful broadcast
      if (publishStore.broadcastReportCache) {
        publishStore.broadcastReportLoaded = false;
        publishStore.broadcastReportCache = null;
        console.log('Broadcast report cache cleared for revalidation');
      }
      
      // Refresh the broadcast report tab if it's currently active
      if (broadcastReportTabRef.value && currentActiveTab.value === 'broadcast-report') {
        broadcastReportTabRef.value.refreshData();
      }
    } else {
      window.$toast?.error(result.error || 'Failed to schedule broadcast');
    }
  } catch (error) {
    console.error('Failed to send broadcast:', error);
    window.$toast?.error('Failed to schedule broadcast');
  } finally {
    isLoading.value = false;
  }
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

const handleSaveSettings = () => {
  const selectedProvider = publishAgentTabRef.value?.selectedProvider();
  if (selectedProvider === 'meta') {
    publishAgentTabRef.value?.saveMetaSettings();
  } else if (selectedProvider === 'dialog360') {
    publishAgentTabRef.value?.saveDialog360Settings();
  }
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="WhatsApp integration"
    :tabs="computedTabs"
    icon="/bots/whatsapp.png"
    max-width="1200px"
    default-tab="publish-agent"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
             <!-- Publish Agent Tab -->
       <PublishAgentTab 
         v-show="activeTab === 'publish-agent'"
         ref="publishAgentTabRef"
         :is-loading="isLoading"
         @test-bot="handleTestBot"
         @save-meta-settings="handleSaveMetaSettings"
         @save-dialog360-settings="handleSaveDialog360Settings"
       />

         <!-- Loading State -->
        <div v-if="publishStore.isLoadingBotDetails" class="loading-state">
          <div class="loader-spinner"></div>
          <span>Loading WhatsApp settings...</span>
        </div>
        
       <!-- Broadcast Tab -->
       <BroadcastTab 
         v-show="activeTab === 'broadcast' && isWhatsAppConfigured"
         ref="broadcastTabRef"
         :is-loading="isLoading"
         @send-broadcast="handleSendBroadcast"
       />

       <!-- Broadcast Report Tab -->
       <BroadcastReportTab 
         v-show="activeTab === 'broadcast-report' && isWhatsAppConfigured"
         ref="broadcastReportTabRef"
         :is-loading="isLoading"
         :current-page="broadcastCurrentPage"
         :total-pages="broadcastTotalPages"
         :pagination-data="broadcastPaginationData"
         :items-per-page="broadcastItemsPerPage"
         :is-loading-broadcast-reports="isLoadingBroadcastReports"
         @filter-report="handleFilterReport"
         @page-change="handleBroadcastPageChange"
         @pagination-update="handleBroadcastPaginationUpdate"
         @set-loading="(loading: boolean) => handleBroadcastLoadingUpdate(loading)"
       />

       <!-- Template Tab -->
       <TemplateTab
         v-show="activeTab === 'template' && isWhatsAppConfigured"
         ref="templateTabRef"
         :is-loading="isLoading"
         :current-page="currentPage"
         :total-pages="totalPages"
         :pagination-data="paginationData"
         :items-per-page="itemsPerPage"
         :is-loading-templates="isLoadingTemplates"
         @open-create-modal="handleTemplateOpenCreateModal"
         @close-whatsapp-modal="handleTemplateCloseWhatsAppModal"
         @page-change="handlePageChange"
         @pagination-update="handleTemplatePaginationUpdate"
         @set-loading="handleTemplateLoadingUpdate"
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
    
    <template #actions>
      <!-- Test Bot Button for Publish Bot Tab -->
      <Button 
        v-if="currentActiveTab === 'publish-agent'" 
        variant="success"
        size="medium"
        @click="handleTestBot"
        icon="pi pi-whatsapp"
      >
        Test now on WhatsApp
      </Button>
      <!-- Save Settings Button for Publish Agent Tab (only when configured) -->
      <Button 
        v-if="currentActiveTab === 'publish-agent' && isWhatsAppConfigured" 
        variant="primary"
        size="medium"
        :loading="isLoading"
        @click="handleSaveSettings"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </Button>
      <!-- Send Message Button for Broadcast Tab -->
      <Button 
        v-if="currentActiveTab === 'broadcast' && isWhatsAppConfigured" 
        variant="primary"
        size="medium"
        :loading="isLoading"
        :disabled="isLoading"
        @click="broadcastTabRef?.sendBroadcast()"
      >
        {{ isLoading ? 'Sending...' : 'Send Message' }}
      </Button>

      
      <Pagination
        v-if="currentActiveTab === 'broadcast-report'"
        :current-page="broadcastCurrentPage"
        :total-pages="broadcastTotalPages"
        :total-items="broadcastPaginationData?.total || 0"
        :items-per-page="broadcastItemsPerPage"
        :disabled="isLoadingBroadcastReports"
        @page-change="handleBroadcastPageChange"
      />
      
      <Pagination
        v-if="currentActiveTab === 'template'"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="paginationData?.total || 0"
        :items-per-page="itemsPerPage"
        :disabled="isLoadingTemplates"
        @page-change="handlePageChange"
      />
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
</style>