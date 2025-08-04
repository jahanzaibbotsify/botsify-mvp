<script setup lang="ts">
import PublishModalLayout from "@/components/ui/PublishModalLayout.vue";
import Pagination from "@/components/ui/Pagination.vue";
import { ref } from "vue";
import PublishBotTab from "./PublishBotTab.vue";
import MediaBlockTab from "./MediaBlockTab.vue";
import BroadcastTab from "./BroadcastTab.vue";
import BroadcastReportTab from "./BroadcastReportTab.vue";
import CatalogTab from "./CatalogTab.vue";

// Define tabs
const tabs = [
  { id: 'publish-bot', label: 'Publish Bot' },
  { id: 'greeting', label: 'Greeting Message' },
  { id: 'comment-auto-responder', label: 'Comment Auto Responder' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'schedule-messages', label: 'Schedule Messages' },
  { id: 'facebook-checkbox', label: 'Facebook Checkbox' },
];

const modalRef = ref<InstanceType<typeof PublishModalLayout> | null>(null);
const currentActiveTab = ref('publish-bot');

// Tab component refs
const publishBotTabRef = ref<InstanceType<typeof PublishBotTab> | null>(null);
const mediaBlockTabRef = ref<InstanceType<typeof MediaBlockTab> | null>(null);
const broadcastTabRef = ref<InstanceType<typeof BroadcastTab> | null>(null);
const broadcastReportTabRef = ref<InstanceType<typeof BroadcastReportTab> | null>(null);

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

// Publish Bot Tab Events
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

// Media Block Tab Events
const handleCreateMediaBlock = (block: any) => {
  console.log('Creating media block:', block);
};

const handleDeleteMediaBlock = (id: number) => {
  console.log('Deleting media block:', id);
};

const handleCloneMediaBlock = (block: any) => {
  console.log('Cloning media block:', block);
};

const handlePreviewMediaBlock = (block: any) => {
  console.log('Previewing media block:', block);
};

const handleCopyPayload = (block: any) => {
  console.log('Copying payload:', block);
};

// Broadcast Tab Events
const handleSendBroadcast = (data: any) => {
  console.log('Sending broadcast:', data);
};


const handleFilterReport = (filters: any) => {
  console.log('Filtering report:', filters);
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

const handleExportCatalog = (format: string) => {
  console.log('Exporting catalog:', format);
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

// Pagination handler for media block tab
const handleMediaBlockPageChange = (page: number) => {
  if (mediaBlockTabRef.value) {
    mediaBlockTabRef.value.currentPage = page;
  }
};

defineExpose({ openModal, closeModal });
</script>

<template>
  <PublishModalLayout
    ref="modalRef"
    title="WhatsApp Integration"
    :tabs="tabs"
    max-width="650px"
    default-tab="publish-bot"
    @back="handleBack"
    @tab-change="handleTabChange"
  >
    <template #default="{ activeTab }">
      <!-- Publish Bot Tab -->
      <PublishBotTab 
        v-if="activeTab === 'publish-bot'"
        ref="publishBotTabRef"
        :is-loading="isLoading"
        @save-settings="handleSaveSettings"
      />

      <!-- Media Block Tab -->
      <MediaBlockTab 
        v-if="activeTab === 'media-block'"
        ref="mediaBlockTabRef"
        :is-loading="isLoading"
        @create-media-block="handleCreateMediaBlock"
        @delete-media-block="handleDeleteMediaBlock"
        @clone-media-block="handleCloneMediaBlock"
        @preview-media-block="handlePreviewMediaBlock"
        @copy-payload="handleCopyPayload"
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
      <!-- Test Bot Button for Publish Bot Tab -->
      <button 
        v-if="currentActiveTab === 'publish-bot'" 
        class="action-button"
        @click="handleTestBot"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Testing...' : 'Test Bot' }}
      </button>
      
      <!-- Save Settings Button for Publish Bot Tab -->
      <button 
        v-if="currentActiveTab === 'publish-bot'" 
        class="action-button primary" 
        @click="handleSaveSettings"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </button>

      <!-- Pagination for Media Block Tab -->
      <Pagination
        v-if="currentActiveTab === 'media-block' && (mediaBlockTabRef?.totalPages || 0) > 1"
        :current-page="mediaBlockTabRef?.currentPage || 1"
        :total-pages="mediaBlockTabRef?.totalPages || 1"
        :total-items="mediaBlockTabRef?.filteredMediaBlocks?.length || 0"
        :items-per-page="5"
        :show-page-info="false"
        :disabled="isLoading"
        @page-change="handleMediaBlockPageChange"
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
.action-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  font-family: inherit;
}

.action-button.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #2563eb);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 