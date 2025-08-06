<script setup lang="ts">
import { ref } from "vue";
import { usePublishStore } from "@/stores/publishStore";
import {Pagination, Button, PublishModalLayout} from "@/components/ui";
import PublishAgentTab from "./PublishAgentTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import BroadcastReportTab from "./BroadcastReportTab.vue";
import TemplateTab from "./TemplateTab.vue";
import CatalogTab from "./CatalogTab.vue";
import CreateTemplateModal from "./Create/CreateTemplateModal.vue";

// Define tabs
const tabs = [
  { id: 'publish-agent', label: 'Publish Agent' },
  { id: 'template', label: 'Template' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'broadcast-report', label: 'Broadcast Report' },
  { id: 'catalog', label: 'Catalog' }
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-agent');

// Store
const publishStore = usePublishStore();

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

// Reactive data
const isLoading = ref(false);

const openModal = () => {
  // Fetch templates when modal opens
  fetchTemplates();
  modalRef.value?.openModal();
};

const closeModal = () => {
  modalRef.value?.closeModal();
};

// Template methods
const fetchTemplates = async () => {
  try {
    isLoading.value = true;
    const result = await publishStore.fetchTemplates();
    if (result.success && result.data.status === 'success') {
      // Pass templates to TemplateTab
      if (templateTabRef.value) {
        templateTabRef.value.setTemplates(result.data.templates.data);
        isLoading.value = false;
      }
    }
  } catch (error) {
    console.error('Failed to fetch templates:', error);
  }
};

const openCreateTemplateModal = () => {
  closeModal(); // Close WhatsApp modal
  createTemplateModalRef.value?.openModal();
};

const closeCreateTemplateModal = () => {
  createTemplateModalRef.value?.closeModal();
  openModal(); // Reopen WhatsApp modal
};

const handleCreateTemplate = (templateData: any) => {
  console.log('Creating template:', templateData);
  // Handle template creation
  closeCreateTemplateModal();
  fetchTemplates(); // Refresh templates
};

const handleDeleteTemplate = async (id: number) => {
  try {
    window.$confirm({
      text: "Are you sure you want to delete this template?",
    }, async () => {
      const result = await publishStore.deleteTemplate(id);
      if (result.success) {
        fetchTemplates()
      }
    })
  } catch (error) {
    console.error('Failed to delete template:', error);
  }
};

const handleCloneTemplate = (template: any) => {
  closeModal(); // Close WhatsApp modal
  createTemplateModalRef.value?.openModalWithData(template);
};

const handlePreviewTemplate = (template: any) => {
  console.log('Previewing template:', template);
  // Handle template preview using template.data.components
};

const handleCopyPayload = (template: any) => {
  const payload = JSON.stringify(template, null, 2);
  navigator.clipboard.writeText(payload);
  window.$toast?.success('Payload copied to clipboard');
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
  currentActiveTab.value = tabId;
};

// Publish Bot Tab Events
const handleTestBot = async () => {
  isLoading.value = true;
  try {
    console.log('Testing bot...');
    // Add actual test bot logic here
    window.$toast?.success('Bot test completed successfully!');
  } catch (error) {
    console.error('Failed to test bot:', error);
    window.$toast?.error('Failed to test bot');
  } finally {
    isLoading.value = false;
  }
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
    }
  } catch (error) {
    console.error('Failed to save Meta Cloud settings:', error);
    window.$toast?.error('Failed to save Meta Cloud settings');
  } finally {
    isLoading.value = false;
  }
};

const handleSaveDialog360Settings = async (settings: any) => {
  isLoading.value = true;
  try {
    console.log('Saving Dialog360 settings:', settings);
    const result = await publishStore.saveDialog360Settings({
      whatsappNumber: settings.whatsappNumber,
      apiKey: settings.apiKey,
      phoneNumberId: settings.phoneNumberId,
      whatsappBusinessAccountId: settings.whatsappBusinessAccountId
    });
    
    if (result.success) {
      window.$toast?.success('Dialog360 settings saved successfully!');
    }
  } catch (error) {
    console.error('Failed to save Dialog360 settings:', error);
    window.$toast?.error('Failed to save Dialog360 settings');
  } finally {
    isLoading.value = false;
  }
};

// Broadcast Tab Events
const handleSendBroadcast = (data: any) => {
  console.log('Sending broadcast:', data);
};


const handleFilterReport = (filters: any) => {
  console.log('Filtering report:', filters);
};

// Message Template Tab Events
const handleSendMessage = (data: any) => {
  console.log('Sending message:', data);
  window.$toast?.success('Message sent successfully!');
};

// Catalog Tab Events
const handleCreateProduct = (product: any) => {
  console.log('Creating product:', product);
};

const handleUpdateProduct = (product: any) => {
  console.log('Updating product:', product);
};

const handleDeleteProduct = (id: number) => {
  console.log('Deleting product:', id);
};

const handleSaveSettings = () => {
  const selectedProvider = publishAgentTabRef.value?.selectedProvider?.();
  if (selectedProvider === 'meta') {
    publishAgentTabRef.value?.saveMetaSettings();
  } else if (selectedProvider === 'dialog360') {
    publishAgentTabRef.value?.saveDialog360Settings();
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
    title="WhatsApp Integration"
    :tabs="tabs"
    max-width="1000px"
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
        @test-bot="handleTestBot"
        @save-meta-settings="handleSaveMetaSettings"
        @save-dialog360-settings="handleSaveDialog360Settings"
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

      <!-- Template Tab -->
      <TemplateTab
        v-if="activeTab === 'template'"
        ref="templateTabRef"
        :is-loading="publishStore.isLoading"
        @create-template="handleCreateTemplate"
        @delete-template="handleDeleteTemplate"
        @clone-template="handleCloneTemplate"
        @preview-template="handlePreviewTemplate"
        @copy-payload="handleCopyPayload"
        @open-create-modal="handleTemplateOpenCreateModal"
        @close-whatsapp-modal="handleTemplateCloseWhatsAppModal"
      />

      <!-- Catalog Tab -->
      <CatalogTab 
        v-if="activeTab === 'catalog'"
        ref="catalogTabRef"
        :is-loading="isLoading"
        @create-product="handleCreateProduct"
        @update-product="handleUpdateProduct"
        @delete-product="handleDeleteProduct"
      />
    </template>
    
    <template #actions>
      <!-- Test Bot Button for Publish Bot Tab -->
      <Button 
        v-if="currentActiveTab === 'publish-agent'" 
        variant="secondary"
        size="medium"
        :loading="isLoading"
        @click="handleTestBot"
      >
        {{ isLoading ? 'Testing...' : 'Test Agent' }}
      </Button>
      
      <!-- Save Settings Button for Publish Bot Tab -->
      <Button 
        v-if="currentActiveTab === 'publish-agent' && publishAgentTabRef?.selectedProvider?.()" 
        variant="primary"
        size="medium"
        :loading="isLoading"
        @click="handleSaveSettings"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </Button>



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
      <Button 
        v-if="currentActiveTab === 'broadcast'" 
        variant="primary"
        size="medium"
        :loading="isLoading"
        @click="broadcastTabRef?.sendBroadcast()"
      >
        {{ isLoading ? 'Sending...' : 'Send Message' }}
      </Button>
    </template>
  </PublishModalLayout>

  <!-- Create Template Modal -->
  <CreateTemplateModal
    ref="createTemplateModalRef"
    @create-template="handleCreateTemplate"
    @modal-closed="openModal"
  />
</template>