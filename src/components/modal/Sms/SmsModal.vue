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

// Loading state from store
const isLoading = computed(() => publishStore.thirdPartyConfig.loading);
const isConfigured = ref(false);

// Override computedTabs to include disabled state based on configuration
const smsComputedTabs = computed(() => {
  return tabs.map(tab => ({
    ...tab,
    disabled: tab.id !== 'publish-agent' && !isConfigured.value
  }));
});
// Configuration check
const checkConfiguration = () => {
  const config = publishStore.thirdPartyConfig.data?.data;
  if (config && config.twilioConf) {
    const twilioConfig = config.twilioConf;
    isConfigured.value = !!(twilioConfig.sid && twilioConfig.auth_token && twilioConfig.number);
  } else {
    isConfigured.value = false;
  }
};


const openModal = async () => {
  modalRef.value?.openModal();
  await publishStore.thirdPartyConfig.load();
  await checkConfiguration();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const onTabChange = (tabId: string) => {
  // Only allow tab change if SMS is configured or if it's the publish agent tab
  if (tabId === 'publish-agent' || isConfigured.value) {
    handleTabChange(tabId);
  }
};

// Template Tab Events
const handleCreateTemplate = () => {
  createTemplateModalRef.value?.openModal();
};

const handleEditTemplate = (template: any) => {
  createTemplateModalRef.value?.openModalWithData(template);
};

const handleTemplateCreated = () => {
  // Invalidate SMS templates resource to force refresh
  publishStore.smsTemplates.invalidate();
  // Refresh templates in TemplateTab
  if (templateTabRef.value) {
    templateTabRef.value.loadTemplates(1);
  }
};

const handleTemplateUpdated = () => {
  // Invalidate SMS templates resource to force refresh
  publishStore.smsTemplates.invalidate();
  // Refresh templates in TemplateTab
  if (templateTabRef.value) {
    templateTabRef.value.loadTemplates(1);
  }
};


defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="SMS integration"
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
        :is-checking-configuration="isLoading"
        @check-configuration="checkConfiguration"
      />

      <!-- Template Tab -->
      <TemplateTab
        v-if="activeTab === 'template' && isConfigured"
        ref="templateTabRef"
        :is-loading="isLoading"
        @create-template="handleCreateTemplate"
        @edit-template="handleEditTemplate"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast' && isConfigured"
        ref="broadcastTabRef"
      />

      <!-- Broadcast Report Tab -->
      <BroadcastReportTab 
        v-if="activeTab === 'broadcast-report' && isConfigured"
        ref="broadcastReportTabRef"
      />

      <!-- Configuration Required Message -->
      <div v-if="activeTab !== 'publish-agent' && !isConfigured" class="configuration-required">
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