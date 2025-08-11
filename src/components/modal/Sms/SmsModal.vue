<script setup lang="ts">
import {PublishModalLayout} from "@/components/ui";
import { ref } from "vue";
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
// Removed createTemplateModalRef as CreateTemplateModal is no longer imported
const currentActiveTab = ref('publish-agent');
const publishStore = usePublishStore();

// Removed previousTab as CreateTemplateModal is no longer used

// Tab component refs
const publishAgentTabRef = ref<InstanceType<typeof PublishAgentTab> | null>(null);
const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);
const broadcastReportTabRef = ref<InstanceType<typeof BroadcastReportTab> | null>(null);
const templateTabRef = ref<InstanceType<typeof TemplateTab> | null>(null);

// Template modal ref
const createTemplateModalRef = ref<InstanceType<typeof CreateTemplateModal> | null>(null);

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
const computedTabs = tabs.map(tab => ({
  ...tab,
  disabled: false
}));

// Removed currentActiveTabFromModal as it's no longer needed

const openModal = () => {
  modalRef.value?.openModal();
  checkSmsConfiguration();
  
  // Default to 'publish-agent' tab
  const tabToOpen = 'publish-agent';
  console.log('Opening SMS modal with tab:', tabToOpen);
  
  // Change tab directly
  handleTabChange(tabToOpen);
  currentActiveTab.value = tabToOpen; // Ensure currentActiveTab is updated
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

// Publish Agent Tab Events - removed handleTestBot as it's not needed

// Template Tab Events
const handleCreateTemplate = () => {
  createTemplateModalRef.value?.openModal();
};

const handleEditTemplate = (template: any) => {
  console.log('Opening edit modal for template:', template);
  createTemplateModalRef.value?.openModalWithData(template);
};

const handleTemplateCreated = (template: any) => {
  console.log('Template created:', template);
  // Refresh templates in TemplateTab
  if (templateTabRef.value) {
    templateTabRef.value.fetchTemplates(1, 20);
  }
};

const handleTemplateUpdated = (template: any) => {
  console.log('Template updated:', template);
  // Refresh templates in TemplateTab
  if (templateTabRef.value) {
    templateTabRef.value.fetchTemplates(1, 20);
  }
};

// Filter report - removed as it's handled directly in BroadcastReportTab

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

// Pagination handler removed - handled directly in BroadcastReportTab

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
        @edit-template="handleEditTemplate"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast' && isSmsConfigured"
        ref="broadcastTabRef"
      />

      <!-- Broadcast Report Tab -->
      <BroadcastReportTab 
        v-if="activeTab === 'broadcast-report' && isSmsConfigured"
        ref="broadcastReportTabRef"
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
  </PublishModalLayout>

  <!-- Create/Edit Template Modal -->
  <CreateTemplateModal
    ref="createTemplateModalRef"
    @create-template="handleTemplateCreated"
    @update-template="handleTemplateUpdated"
    @modal-closed="() => console.log('Template modal closed')"
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