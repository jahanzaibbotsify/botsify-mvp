<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Input, Badge, Button, ModalLayout, Pagination } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import MessagePreview from "./Create/MessagePreview.vue";
import { PaginationData } from "@/types";
import { publishApi } from "@/services/publishApi";
import { useWhatsAppTemplate } from "@/composables/useWhatsappTemplate";
import { formatDate } from "@/utils";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Store
const publishStore = usePublishStore();

// Emits
const emit = defineEmits<{
  'open-create-modal': [clonedData?: any];
  'close-whatsapp-modal': [];
}>();

const { cloneTemplate, previewTemplate, copyPayload, previewModalRef, selectedPreviewTemplate, previewTemplateData } = useWhatsAppTemplate();

const deleteTemplateId = ref<number | null>(null);
const searchQuery = ref('');
// Local pagination state since it's now managed internally
const currentPage = ref(1);
const itemsPerPage = 20; // Match the API per_page default

// Add local pagination data
const paginationData = ref<PaginationData | null>(null);

// Computed properties for SMS templates resource
const whatsappTemplatesData = computed(() => publishStore.whatsappTemplates.data?.data?.templates?.data || []);

const totalPages = computed(() => {
  if (paginationData.value) {
    return Math.ceil(paginationData.value.total / paginationData.value.perPage);
  }
  return 1;
});

// Debounce search function
let searchTimeout: NodeJS.Timeout | null = null;
const debouncedSearch = (callback: () => void, delay: number = 500) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(callback, delay);
};

// Methods
const loadTemplates = async (page: number = 1) => { 
  try {
    const result = await publishStore.whatsappTemplates.load(page, itemsPerPage, searchQuery.value);
    if (result?.templates) {
      paginationData.value = {
        page: result.templates.page || page,
        perPage: result.templates.per_page || itemsPerPage,
        total: result.templates.total || 0,
        to: result.templates.to || 0,
        prev_page_url: result.templates.prev_page_url || null,
      };

      currentPage.value = result.templates.page || page;
    } else {
      console.warn('No templates data or invalid format:', result);
      paginationData.value = null;
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    paginationData.value = null;
  }
};

const openCreateModal = (clonedData?: any) => {
  // Emit to close WhatsApp modal and open create modal
  emit('close-whatsapp-modal');
  emit('open-create-modal', clonedData);
};

const handleDeleteTemplate = async (id: number) => {
  window.$confirm({
    text: 'Are you sure you want to delete this template?'
  },
    async () => {
      deleteTemplateId.value = id;
      try {
        const result = await publishApi.deleteWhatsAppTemplate(id);
        
        if (result.success) {
          // Remove from local state instead of refreshing
          const index = whatsappTemplatesData.value.findIndex((t: any) => t.id === id);
          if (index !== -1) {
            whatsappTemplatesData.value.splice(index, 1);
            // Update pagination data
            if (paginationData.value) {
              paginationData.value.total = Math.max(0, paginationData.value.total - 1);
              paginationData.value.to = Math.max(0, paginationData.value.to - 1);
            }
          }
          publishStore.smsTemplates.invalidate();
          window.$toast.success('SMS template deleted successfully!');
        } else {
          console.error('Delete failed:', result.message);
          window.$toast.error(result.message || 'Failed to delete template');
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
        window.$toast.error('Failed to delete template');
      } finally {
        deleteTemplateId.value = null;
      }
    }
  );
};

// Handle page change from pagination component
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadTemplates(page);
};
const handleSearch = () => {
  // Use debounced search to avoid excessive API calls
  debouncedSearch(() => {
    currentPage.value = 1;
    publishStore.smsTemplates.invalidate(); // Invalidate SMS templates resource to force fresh fetch
    // Fetch templates with the current search query
    loadTemplates(1);
  }, 500); // 500ms delay
};

// Initialize templates when component is mounted
// Load templates on mount
onMounted(async () => {
  // Use cached data from resource - the resource already handles loading
  loadTemplates(1);
});
</script>

<template>
  <div class="tab-panel">
    <div class="search-section">
      <div class="search-create-wrapper">
        <Input 
          v-model="searchQuery" 
          placeholder="Search templates..."
          @input="handleSearch"
          searchable
        />
        
        <Button 
          variant="primary"
          icon="pi pi-plus"
          @click="openCreateModal"
        >
          Create
        </Button>
      </div>
    </div>

    <div class="table-section">
      <Table>
        <TableHead>
          <TableHeader>Name</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Language</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Date</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableHead>
        
        <TableBody>
          <!-- Loading skeleton -->
          <TableRow v-if="publishStore.whatsappTemplates.loading" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="badge"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="actions"></TableCell>
          </TableRow>
          
          <!-- Empty state -->
          <TableRow v-else-if="whatsappTemplatesData.length === 0" noData>
            <TableCell noData colspan="6">
              <div class="empty-state">
                <i class="pi pi-file-o"></i>
                <p>No templates found</p>
              </div>
            </TableCell>
          </TableRow>
          
          <!-- Template rows -->
          <TableRow v-else v-for="template in whatsappTemplatesData" :key="template.id">
            <TableCell>{{ template.template_name || template.name }}</TableCell>
            <TableCell>{{ template.type }}</TableCell>
            <TableCell>{{ template.language || 'en' }}</TableCell>
            <TableCell>
              <Badge 
                :variant="template.status === 1 ? 'success' : 'warning'"
                size="small"
              >
                {{ template.status === 1 ? 'Approved' : 'Not Approved' }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(template.created_at) }}</TableCell>
            <TableCell>
              <div class="action-buttons">
                <Button
                  variant="primary-outline"
                  size="small"
                  icon="pi pi-copy"
                  iconOnly
                  @click="cloneTemplate(template, emit)"
                  title="Clone template"
                />
                <Button
                  variant="success-outline"
                  size="small"
                  icon="pi pi-eye"
                  iconOnly
                  @click="previewTemplate(template)"
                  title="Preview template"
                />
                <Button
                  variant="warning-outline"
                  size="small"
                  icon="pi pi-id-card"
                  iconOnly
                  @click="copyPayload(template.id)"
                  title="Copy payload"
                />
                <Button
                  variant="error-outline"
                  size="small"
                  icon="pi pi-trash"
                  iconOnly
                  @click="handleDeleteTemplate(template.id)"
                  title="Delete template"
                  :loading="deleteTemplateId === template.id"
                  :disabled="deleteTemplateId === template.id"
                />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <!-- Pagination -->
      <div v-if="!publishStore.whatsappTemplates.loading && whatsappTemplatesData.length > 0 && paginationData?.total && paginationData.total > 0" class="agent-pagination-section">
        <Pagination
          :current-page="currentPage || 1"
          :total-pages="totalPages || 1"
          :total-items="paginationData?.total || 0"
          :items-per-page="itemsPerPage || 20"
                      :disabled="publishStore.whatsappTemplates.loading || false"
          @page-change="handlePageChange"
        />
      </div>
    </div>



    <!-- Template Preview Modal -->
    <ModalLayout
      ref="previewModalRef"
      title="Template Preview"
      :max-width="'600px'"
    >
      <div v-if="selectedPreviewTemplate" class="template-info">
        <div class="template-details">
          <h4>{{ selectedPreviewTemplate.template_name || selectedPreviewTemplate.name }}</h4>
          <div class="template-meta">
            <span class="template-type">{{ selectedPreviewTemplate.type }}</span>
            <span class="template-language">{{ selectedPreviewTemplate.language || 'en' }}</span>
            <Badge 
              :variant="selectedPreviewTemplate.status === 1 ? 'success' : 'warning'"
              size="small"
            >
              {{ selectedPreviewTemplate.status === 1 ? 'Approved' : 'Not Approved' }}
            </Badge>
          </div>
        </div>
      </div>
      
      <div class="preview-content">
        <MessagePreview 
          v-if="previewTemplateData"
          :template="previewTemplateData"
          :block="{ 
            text: previewTemplateData.body_text || '', 
            buttons: previewTemplateData.buttons || []
          }"
          :slides="previewTemplateData.slides || []"
          :show-title="false"
        />
      </div>
    </ModalLayout>
  </div>
</template>

<style scoped>
.search-section {
  margin-bottom: var(--space-4);
}

.search-create-wrapper {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: end;
}

.table-section {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: var(--space-1);
  align-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--color-text-tertiary);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}



.template-info {
  margin-bottom: var(--space-4);
}

.template-details h4 {
  margin: 0 0 var(--space-2) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.template-meta {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.template-type,
.template-language {
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.preview-content {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  /* padding: var(--space-4); */
  /* background: var(--color-bg-secondary); */
}
</style> 