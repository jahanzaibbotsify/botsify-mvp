<script setup lang="ts">
import {Button, PublishModalLayout, Pagination} from "@/components/ui";
import { ref, computed, watch } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import BroadcastReportTab from "./BroadcastReportTab.vue";
import TemplateTab from "./TemplateTab.vue";
import { usePublishStore } from "@/stores/publishStore";

// Define tabs
const tabs = [
  { id: 'publish-agent', label: 'Publish agent' },
  { id: 'template', label: 'Template' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'broadcast-report', label: 'Broadcast Report' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-agent');
const publishStore = usePublishStore();

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

// Check if SMS is configured
const checkSmsConfiguration = async () => {
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
  }
};

// Computed tabs with disabled state
const computedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-agent' && !isSmsConfigured.value
  }));
});

const openModal = () => {
  modalRef.value?.openModal();
  checkSmsConfiguration();
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
  console.log('Creating template:', block);
  // Handle template creation
};

const handleDeleteTemplate = (id: number) => {
  console.log('Deleting template:', id);
  // Handle template deletion
};

const handleCloneTemplate = (block: any) => {
  console.log('Cloning template:', block);
  // Handle template cloning
};

const handlePreviewTemplate = (block: any) => {
  console.log('Previewing template:', block);
  // Handle template preview
};

// Broadcast Tab Events
const handleSendBroadcast = (data: any) => {
  console.log('Sending broadcast:', data);
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

// Pagination handler for template tab
const handleTemplatePageChange = (page: number) => {
  if (templateTabRef.value) {
    templateTabRef.value.currentPage = page;
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
        @save-settings="handleSaveSettings"
      />

      <!-- Template Tab -->
      <TemplateTab
        v-if="activeTab === 'template' && isSmsConfigured"
        ref="templateTabRef"
        :is-loading="isLoading"
        @create-template="handleCreateTemplate"
        @delete-template="handleDeleteTemplate"
        @clone-template="handleCloneTemplate"
        @preview-template="handlePreviewTemplate"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast' && isSmsConfigured"
        ref="broadcastTabRef"
        :is-loading="isLoading"
        @send-broadcast="handleSendBroadcast"
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
        v-if="currentActiveTab === 'publish-agent'" 
        variant="secondary"
        size="medium"
        :loading="isLoading"
        @click="handleTestBot"
      >
        {{ isLoading ? 'Testing...' : 'Test Agent' }}
      </Button>
      
      <!-- Save Settings Button for Publish Agent Tab -->
      <Button 
        v-if="currentActiveTab === 'publish-agent'" 
        variant="primary"
        size="medium"
        :loading="isLoading"
        @click="publishAgentTabRef?.saveSettings()"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </Button>

      <!-- Pagination for Template Tab -->
      <Pagination
        v-if="currentActiveTab === 'template' && isSmsConfigured && (templateTabRef?.totalPages || 0) > 1"
        :current-page="templateTabRef?.currentPage || 1"
        :total-pages="templateTabRef?.totalPages || 1"
        :total-items="templateTabRef?.filteredTemplates?.length || 0"
        :items-per-page="5"
        :show-page-info="false"
        :disabled="isLoading"
        @page-change="handleTemplatePageChange"
      />

      <!-- Send Message Button for Broadcast Tab -->
      <Button 
        v-if="currentActiveTab === 'broadcast' && isSmsConfigured" 
        variant="primary"
        size="medium"
        :loading="isLoading"
        @click="broadcastTabRef?.sendBroadcast()"
      >
        {{ isLoading ? 'Sending...' : 'Send Message' }}
      </Button>

      <!-- Pagination for Broadcast Report Tab -->
      <Pagination
        v-if="currentActiveTab === 'broadcast-report' && isSmsConfigured && (broadcastReportTabRef?.totalPages || 0) > 1"
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