<script setup lang="ts">
import {Button, PublishModalLayout, Pagination} from "@/components/ui";
import { ref, computed, nextTick } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import BroadcastReportTab from "./BroadcastReportTab.vue";
import TemplateTab from "./TemplateTab.vue";
import CreateTemplateModal from "./CreateTemplateModal.vue";
import { usePublishStore } from "@/stores/publishStore";

// Define tabs
const tabs = [
  { id: 'publish-agent', label: 'Publish agent' },
  { id: 'template', label: 'Templates' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'broadcast-report', label: 'Broadcast report' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const createTemplateModalRef = ref<InstanceType<typeof CreateTemplateModal> | null>(null);
const currentActiveTab = ref('publish-agent');
const publishStore = usePublishStore();

// Store the previous tab when opening CreateTemplateModal
const previousTab = ref<string | null>(null);

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);
const broadcastReportTabRef = ref<InstanceType<typeof BroadcastReportTab> | null>(null);
const templateTabRef = ref<InstanceType<typeof TemplateTab> | null>(null);

const emit = defineEmits<{
  back: [];
}>();

// Reactive data
const isLoading = ref(false);
const isSmsConfigured = ref(false);
const isCheckingConfiguration = ref(false);

// Check if SMS is configured
const checkSmsConfiguration = async () => {
  isCheckingConfiguration.value = true;
  try {
    const result = await publishStore.getThirdPartyConfig();
    if (result.success && result.data?.twilioConf) {
      const twilioConfig = result.data.twilioConf;
      // Check if all required Twilio fields are filled
      isSmsConfigured.value = !!(twilioConfig.sid && twilioConfig.auth_token && twilioConfig.number);
    } else {
      isSmsConfigured.value = false;
    }
  } catch (error) {
    console.error('Failed to check SMS configuration:', error);
    isSmsConfigured.value = false;
  } finally {
    isCheckingConfiguration.value = false;
  }
};

// Computed tabs with disabled state
const computedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-agent' && !isSmsConfigured.value
  }));
});

// Computed active tab from modal ref
const currentActiveTabFromModal = computed(() => modalRef.value?.activeTab || 'publish-agent');

const openModal = () => {
  modalRef.value?.openModal();
  checkSmsConfiguration();
  
  // Restore the previous tab if available, otherwise default to 'publish-agent'
  const tabToOpen = previousTab.value || 'publish-agent';
  console.log('Opening SMS modal with tab:', tabToOpen);
  
  // Use nextTick to ensure the modal is fully mounted before changing tabs
  nextTick(() => {
    handleTabChange(tabToOpen);
    currentActiveTab.value = tabToOpen; // Ensure currentActiveTab is updated
  });
  
  // Clear the stored tab after using it
  previousTab.value = null;
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const handleTabChange = (tabId: string) => {
  console.log('Tab changed to:', tabId);
  
  // Only allow tab change if SMS is configured or if it's the publish agent tab
  if (tabId === 'publish-agent' || isSmsConfigured.value) {
    currentActiveTab.value = tabId;
  }
};

// Publish Agent Tab Events
const handleTestBot = () => {
  isLoading.value = true;
  try {
    console.log('Testing bot...');
    // Add actual test bot logic here
  } catch (error) {
    console.error('Failed to test bot:', error);
  } finally {
    isLoading.value = false;
  }
};

// Template Tab Events
const handleCreateTemplate = (block: any) => {
  publishStore.createTemplate(block, "sms");
};

const handleUpdateTemplate = (templateData: any) => {
  publishStore.updateSmsTemplate(templateData.id, templateData);
};

const handleDeleteTemplate = (id: number) => {
  publishStore.deleteSmsTemplate(id);
};

// Clone template is handled directly in TemplateTab

// Template methods
const openCreateTemplateModal = () => {
  // Store the current tab before opening the modal
  previousTab.value = currentActiveTab.value;
  console.log('Storing previous tab:', previousTab.value);
  
  closeModal(); // Close SMS modal
  createTemplateModalRef.value?.openModal();
};

const handleTemplateOpenCreateModal = () => {
  openCreateTemplateModal();
};

const handleTemplateCloseSmsModal = () => {
  closeModal();
};

const handleFilterReport = (filters: any) => {
  console.log('Filtering report:', filters);
};

const handleSaveSettings = async (settings: any) => {
  isLoading.value = true;
  try {
    const result = await publishStore.saveTwilioSettings(settings);
    if (result.success) {
      console.log('Twilio settings saved successfully');
      // Recheck configuration after saving
      await checkSmsConfiguration();
    } else {
      console.error('Failed to save Twilio settings:', result.error);
    }
  } catch (error) {
    console.error('Failed to save Twilio settings:', error);
  } finally {
    isLoading.value = false;
  }
};

// Pagination handler for broadcast report tab
const handleBroadcastReportPageChange = (page: number) => {
  if (broadcastReportTabRef.value) {
    broadcastReportTabRef.value.fetchSmsReport(page);
  }
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Sms integration"
    :tabs="computedTabs"
    icon="/bots/sms.png"
    max-width="1200px"
    default-tab="publish-agent"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Agent Tab -->
      <PublishAgentTab 
        v-if="activeTab === 'publish-agent'"
        ref="publishAgentTabRef"
        :is-loading="isLoading"
        :is-checking-configuration="isCheckingConfiguration"
        @save-settings="handleSaveSettings"
      />

      <!-- Template Tab -->
      <TemplateTab
        v-if="activeTab === 'template' && isSmsConfigured"
        ref="templateTabRef"
        :is-loading="isLoading"
        @create-template="handleCreateTemplate"
        @update-template="handleUpdateTemplate"
        @delete-template="handleDeleteTemplate"
        @open-create-modal="handleTemplateOpenCreateModal"
        @close-sms-modal="handleTemplateCloseSmsModal"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast' && isSmsConfigured"
        ref="broadcastTabRef"
        :is-loading="isLoading"
      />

      <!-- Broadcast Report Tab -->
      <BroadcastReportTab 
        v-if="activeTab === 'broadcast-report' && isSmsConfigured"
        ref="broadcastReportTabRef"
        :is-loading="isLoading"
        @filter-report="handleFilterReport"
      />

      <!-- Configuration Required Message -->
      <div v-if="activeTab !== 'publish-agent' && !isSmsConfigured" class="configuration-required">
        <div class="configuration-message">
          <i class="pi pi-exclamation-triangle"></i>
          <h3>Configuration Required</h3>
          <p>Please complete the SMS integration setup in the "Publish agent" tab before accessing other features.</p>
        </div>
      </div>
    </template>
    
    <template #actions>
      <!-- Test Bot Button for Publish Agent Tab -->
      <Button 
        v-if="currentActiveTabFromModal === 'publish-agent'" 
        variant="secondary"
        size="medium"
        :loading="isLoading"
        @click="handleTestBot"
      >
        {{ isLoading ? 'Testing...' : 'Test Agent' }}
      </Button>
      
      <!-- Save Settings Button for Publish Agent Tab -->
      <Button 
        v-if="currentActiveTabFromModal === 'publish-agent'" 
        variant="primary"
        size="medium"
        :loading="isLoading"
        @click="publishAgentTabRef?.saveSettings()"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </Button>

      <!-- Send Message Button for Broadcast Tab -->
      <Button 
        v-if="currentActiveTabFromModal === 'broadcast'" 
        variant="primary"
        size="medium"
        :loading="broadcastTabRef?.isSendingBroadcast || isLoading"
        :disabled="broadcastTabRef?.isSendingBroadcast || isLoading"
        @click="broadcastTabRef?.sendBroadcast()"
      >
        {{ (broadcastTabRef?.isSendingBroadcast || isLoading) ? 'Sending...' : 'Send Message' }}
      </Button>

      <!-- Pagination for Broadcast Report Tab -->
      <Pagination
        v-if="currentActiveTabFromModal === 'broadcast-report' && isSmsConfigured && (broadcastReportTabRef?.totalPages || 0) > 1"
        :current-page="broadcastReportTabRef?.currentPage || 1"
        :total-pages="broadcastReportTabRef?.totalPages || 1"
        :total-items="broadcastReportTabRef?.totalItems || 0"
        :items-per-page="20"
        :show-page-info="false"
        :disabled="isLoading"
        @page-change="handleBroadcastReportPageChange"
      />
    </template>
  </PublishModalLayout>

  <!-- Create Template Modal -->
  <CreateTemplateModal
    ref="createTemplateModalRef"
    @modal-closed="openModal"
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
</style> 