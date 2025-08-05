<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import Pagination from "@/components/ui/Pagination.vue";
import { ref, computed } from "vue";
import PublishAgentTab from "./PublishAgentTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import BroadcastReportTab from "./BroadcastReportTab.vue";
import TemplateTab from "./TemplateTab.vue";

// Define tabs
const tabs = [
  { id: 'publish-agent', label: 'Publish Agent' },
  { id: 'template', label: 'Template' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'broadcast-report', label: 'Broadcast Report' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-agent');

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

const openModal = () => {
  modalRef.value?.openModal();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

const handleBack = () => {
  emit('back');
};

const handleTabChange = (tabId: string) => {
  console.log('Tab changed to:', tabId);
  currentActiveTab.value = tabId;
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

const handleSaveSettings = () => {
  isLoading.value = true;
  try {
    console.log('Saving Meta Cloud settings:');
    // Add actual save logic here
  } catch (error) {
    console.error('Failed to save Meta Cloud settings:', error);
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

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="Sms Integration"
    :tabs="tabs"
    max-width="650px"
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
        v-if="activeTab === 'template'"
        ref="templateTabRef"
        :is-loading="isLoading"
        @create-template="handleCreateTemplate"
        @delete-template="handleDeleteTemplate"
        @clone-template="handleCloneTemplate"
        @preview-template="handlePreviewTemplate"
      />

      <!-- Broadcast Tab -->
      <BroadcastTab 
        v-if="activeTab === 'broadcast'"
        ref="broadcastTabRef"
        :is-loading="isLoading"
        @send-broadcast="handleSendBroadcast"
      />

      <!-- Broadcast Report Tab -->
      <BroadcastReportTab 
        v-if="activeTab === 'broadcast-report'"
        ref="broadcastReportTabRef"
        :is-loading="isLoading"
        @filter-report="handleFilterReport"
      />

    </template>
    
    <template #actions>
      <!-- Test Bot Button for Publish Agent Tab -->
      <button 
        v-if="currentActiveTab === 'publish-agent'" 
        class="action-button"
        @click="handleTestBot"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Testing...' : 'Test Agent' }}
      </button>
      
      <!-- Save Settings Button for Publish Agent Tab -->
      <button 
        v-if="currentActiveTab === 'publish-agent'" 
        class="action-button primary" 
        @click="handleSaveSettings"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </button>

      <!-- Pagination for Template Tab -->
      <Pagination
        v-if="currentActiveTab === 'template' && (templateTabRef?.totalPages || 0) > 1"
        :current-page="templateTabRef?.currentPage || 1"
        :total-pages="templateTabRef?.totalPages || 1"
        :total-items="templateTabRef?.filteredTemplates?.length || 0"
        :items-per-page="5"
        :show-page-info="false"
        :disabled="isLoading"
        @page-change="handleTemplatePageChange"
      />

      <!-- Send Message Button for Broadcast Tab -->
      <button 
        v-if="currentActiveTab === 'broadcast'" 
        class="action-button primary"
        @click="broadcastTabRef?.sendBroadcast()"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Sending...' : 'Send Message' }}
      </button>
    </template>
  </PublishModalLayout>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */
</style> 