<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Input, Badge, Button, Pagination } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";

// Props removed - not needed

// Emits
const emit = defineEmits<{
  'create-template': [];
  'update-template': [template: any];
  'edit-template': [template: any];
  'delete-template': [id: number];
  'copy-payload': [block: any];
  'open-create-modal': [];
  'close-sms-modal': [];
}>();

const publishStore = usePublishStore();

// Store data
const templates = ref<any[]>([]);
const isLoading = ref(false);

// Local state
const searchQuery = ref('');
const deleteTemplateId = ref<number | null>(null);
const cloneTemplateId = ref<number | null>(null);
const currentPage = ref(1);
const itemsPerPage = 20; // Match the API per_page default

// Add local pagination data
const paginationData = ref<{
  page: number;
  perPage: number;
  total: number;
  to: number;
  prev_page_url: string | null;
} | null>(null);

// Computed properties
const filteredTemplates = computed(() => {
  // For server-side pagination, we don't filter locally
  // The API should handle filtering
  return templates.value;
});

const paginatedTemplates = computed(() => {
  // For server-side pagination, all templates are already paginated
  return filteredTemplates.value;
});

const totalPages = computed(() => {
  if (paginationData.value) {
    return Math.ceil(paginationData.value.total / paginationData.value.perPage);
  }
  return 1;
});

// Methods
const openCreateModal = () => {
  // Emit to parent SmsModal to open create modal
  emit('create-template');
};

const openEditModal = (template: any) => {
  // Emit event to parent SmsModal to open edit modal
  emit('edit-template', template);
};

const handleDeleteTemplate = async (id: number) => {
  window.$confirm({
    text: 'Are you sure you want to delete this template?'
  },
    async () => {
      deleteTemplateId.value = id;
      isLoading.value = true;
      try {
        console.log('Deleting template with ID:', id);
        const result = await publishStore.deleteSmsTemplate(id);
        console.log('Delete result:', result);
        
        if (result.success) {
          emit('delete-template', id);
          // Refresh templates
          console.log('Refreshing templates after delete...');
          await fetchTemplates(currentPage.value, itemsPerPage, searchQuery.value);
        } else {
          console.error('Delete failed:', result.error);
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
      } finally {
        deleteTemplateId.value = null;
        isLoading.value = false;
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
      isLoading.value = true;
      cloneTemplateId.value = id;
      try {
        console.log('Cloning template with ID:', id);
        const result = await publishStore.cloneSmsTemplate(id);
        console.log('Clone result:', result);
        
        if (result.success) {
          // Refresh templates after cloning
          console.log('Refreshing templates after clone...');
          await fetchTemplates(currentPage.value, itemsPerPage, searchQuery.value);
        } else {
          console.error('Clone failed:', result.error);
        }
      } catch (error) {
        console.error('Failed to clone template:', error);
      } finally {
        cloneTemplateId.value = null;
        isLoading.value = false;
      }
    }
  );
};

// Fetch templates function
const fetchTemplates = async (page: number = 1, perPage: number = 20, query?: string) => { 
  try {
    const result = await publishStore.fetchSmsTemplates(page, perPage, query);
    if (result.success && result.data && result.data.templates && result.data.templates.data && Array.isArray(result.data.templates.data)) {
      templates.value = result.data.templates.data;
      
      console.log('Template API response:', result.data.templates);
      console.log('Current page requested:', page);
      console.log('API returned page:', result.data.templates.page);
      
      // Update local pagination data
      paginationData.value = {
        page: result.data.templates.page || page,
        perPage: result.data.templates.per_page || perPage,
        total: result.data.templates.total || 0,
        to: result.data.templates.to || 0,
        prev_page_url: result.data.templates.prev_page_url || null
      };
      
      // Sync currentPage with the actual page from API response
      currentPage.value = result.data.templates.page || page;
      
      console.log('Updated local state:', {
        currentPage: currentPage.value,
        paginationData: paginationData.value
      });
    } else {
      console.warn('No templates data or invalid format:', result);
      templates.value = [];
      paginationData.value = null;
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    templates.value = [];
    paginationData.value = null;
  }
};

// Handle page change from pagination component
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchTemplates(page, itemsPerPage);
};

const handleSearch = () => {
  setTimeout(() => {
    currentPage.value = 1;
    publishStore.cache.templates = null; // Clear cache to force fresh fetch
    // Fetch templates with the current search query
    fetchTemplates(1, itemsPerPage);
  }, 1000);
};


// Load templates on mount
onMounted(async () => {
  await fetchTemplates(currentPage.value, itemsPerPage);
});

// Expose methods for parent component
defineExpose({
  fetchTemplates,
  currentPage,
  itemsPerPage,
  searchQuery
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
          <TableRow v-if="publishStore.loadingStates.templates" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="badge"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="actions"></TableCell>
          </TableRow>
          
          <!-- Empty state -->
          <TableRow v-else-if="paginatedTemplates.length === 0" noData>
            <TableCell noData colspan="6">
              <div class="empty-state">
                <i class="pi pi-file-o"></i>
                <p>No templates found</p>
              </div>
            </TableCell>
          </TableRow>
          
          <!-- Template rows -->
          <TableRow v-else v-for="template in paginatedTemplates" :key="template.id || `template-${Math.random()}`">
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
            <TableCell>{{ new Date(template.created_at || '').toLocaleDateString() }}</TableCell>
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
      <div v-if="!publishStore.loadingStates.templates && paginatedTemplates.length > 0 && paginationData?.total && paginationData.total > 0" class="agent-pagination-section">
        <Pagination
          :current-page="currentPage || 1"
          :total-pages="totalPages || 1"
          :total-items="paginationData?.total || 0"
          :items-per-page="itemsPerPage || 20"
          :disabled="publishStore.loadingStates.templates || false"
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