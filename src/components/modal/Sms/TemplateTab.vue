<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Input, Badge, Button, Pagination } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { formatDate } from "@/utils";
import type { SmsTemplate } from "@/types/publish";
import { publishApi } from "@/services/publishApi";
import type { PaginationData } from "@/types/publish";

// Props removed - not needed

// Emits
const emit = defineEmits<{
  'create-template': [];
  'edit-template': [template: SmsTemplate];
}>();

const publishStore = usePublishStore();

// Local state
const searchQuery = ref('');
const deleteTemplateId = ref<number | null>(null);
const cloneTemplateId = ref<number | null>(null);
const currentPage = ref(1);
const itemsPerPage = 20; // Match the API per_page default

// Add local pagination data
const paginationData = ref<PaginationData | null>(null);

// Computed properties for SMS templates resource
const smsTemplatesData = computed(() => publishStore.smsTemplates.data?.data?.templates?.data || []);

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
const openCreateModal = () => {
  // Emit to parent SmsModal to open create modal
  emit('create-template');
};

const openEditModal = (template: SmsTemplate) => {
  // Emit event to parent SmsModal to open edit modal
  emit('edit-template', template);
};

const handleDeleteTemplate = async (id: number) => {
  window.$confirm({
    text: 'Are you sure you want to delete this template?'
  },
    async () => {
      deleteTemplateId.value = id;
      try {
        const result = await publishApi.deleteSmsTemplate(id);
        
        if (result.success) {
          // Remove from local state instead of refreshing
          const index = smsTemplatesData.value.findIndex((t: SmsTemplate) => t.id === id);
          if (index !== -1) {
            smsTemplatesData.value.splice(index, 1);
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

const handleCloneTemplate = async (id: number) => {
  window.$confirm({
    text: 'Are you sure you want to clone this template?',
    confirmButtonText: "Yes, Clone it!",
  },
    async () => {
      cloneTemplateId.value = id;
      try {
        const result = await publishApi.cloneSmsTemplate(id);
        if (result.success) {
          loadTemplates(1)
          window.$toast.success('SMS template cloned successfully!');
        } else {
          console.error('Clone failed:', result.message);
          window.$toast.error(result.message || 'Failed to clone template');
        }
      } catch (error) {
        console.error('Failed to clone template:', error);
        window.$toast.error('Failed to clone template');
      } finally {
        cloneTemplateId.value = null;
      }
    }
  );
};

// Fetch templates function
const loadTemplates = async (page: number = 1) => { 
  try {
    const result = await publishStore.smsTemplates.load(page, itemsPerPage, searchQuery.value);
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

// Load templates on mount
onMounted(async () => {
  // Use cached data from resource - the resource already handles loading
  loadTemplates(1);
});

defineExpose({
  loadTemplates
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
          <TableHeader>Message</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Date</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableHead>
        
        <TableBody>
          <!-- Loading skeleton -->
          <TableRow v-if="publishStore.smsTemplates.loading" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="badge"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="actions"></TableCell>
          </TableRow>
          
          <!-- Empty state -->
          <TableRow v-else-if="smsTemplatesData.length === 0" noData>
            <TableCell noData colspan="6">
              <div class="empty-state">
                <i class="pi pi-file-o"></i>
                <p>No templates found</p>
              </div>
            </TableCell>
          </TableRow>
          
          <!-- Template rows -->
          <TableRow v-else v-for="template in smsTemplatesData" :key="template.id || `template-${Math.random()}`">
            <TableCell>{{ template.name }}</TableCell>
            <TableCell>{{ template.text }}</TableCell>
            <TableCell>
              <Badge 
                variant="success"
                size="small"
              >
                {{ 'Text Message' }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(template.created_at) }}</TableCell>
            <TableCell>
              <div class="action-buttons">
                
                <Button
                  variant="success-outline"
                  size="small"
                  icon="pi pi-pencil"
                  iconOnly
                  @click="openEditModal(template)"
                  title="Edit template"
                />
                <Button
                  variant="secondary"
                  size="small"
                  icon="pi pi-copy"
                  iconOnly
                  @click="template.id ? handleCloneTemplate(template.id) : () => console.log('No template ID for clone')"
                  title="Clone template"
                  :loading="cloneTemplateId === template.id"
                  :disabled="cloneTemplateId === template.id"
                />
                <Button
                  variant="error-outline"
                  size="small"
                  icon="pi pi-trash"
                  iconOnly
                  :loading="deleteTemplateId === template.id"
                  :disabled="deleteTemplateId === template.id"
                  @click="template.id ? handleDeleteTemplate(template.id) : () => console.log('No template ID for delete')"
                  title="Delete template"
                />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <!-- Pagination -->
      <div v-if="!publishStore.smsTemplates.loading && smsTemplatesData.length > 0 && paginationData?.total && paginationData.total > 0" class="agent-pagination-section">
        <Pagination
          :current-page="currentPage || 1"
          :total-pages="totalPages || 1"
          :total-items="paginationData?.total || 0"
          :items-per-page="itemsPerPage || 20"
          :disabled="publishStore.smsTemplates.loading || false"
          @page-change="handlePageChange"
        />
      </div>
    </div>


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

.action-buttons {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}
</style> 