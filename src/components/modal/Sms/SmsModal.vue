<script setup lang="ts">
import {PublishModalLayout} from "@/components/ui";
import { ref, computed } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import BroadcastReportTab from "./BroadcastReportTab.vue";
import TemplateTab from "./TemplateTab.vue";
import CreateTemplateModal from "./CreateTemplateModal.vue";
import { usePublishStore } from "@/stores/publishStore";
import { useTabManagement } from "@/composables/useTabManagement";

// Define tabs
const tabs = [
  { id: 'publish-agent', label: 'Publish agent' },
  { id: 'template', label: 'Templates' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'broadcast-report', label: 'Broadcast report' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const publishStore = usePublishStore();

// Use the tab management composable
const { handleTabChange } = useTabManagement(tabs, 'publish-agent');

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

// Override computedTabs to include disabled state based on configuration
const smsComputedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-agent' && !isSmsConfigured.value
  }));
});

const openModal = () => {
  modalRef.value?.openModal();
  checkSmsConfiguration();
  
  // Default to 'publish-agent' tab
  const tabToOpen = 'publish-agent';
  console.log('Opening SMS modal with tab:', tabToOpen);
  
  // Change tab directly
  handleTabChange(tabToOpen);
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  console.log('SmsModal - Tab changed to:', tabId);
  
  // Only allow tab change if SMS is configured or if it's the publish agent tab
  if (tabId === 'publish-agent' || isSmsConfigured.value) {
    handleTabChange(tabId);
  }
};

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

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Sms integration"
    :tabs="smsComputedTabs"
    icon="/bots/sms.png"
    max-width="1200px"
    default-tab="publish-agent"
    @back="handleBack"
    @tab-change="onTabChange"
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