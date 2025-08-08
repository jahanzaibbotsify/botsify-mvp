<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Input, Badge, Button } from "@/components/ui";
import { usePublishStore } from "@/stores/publishStore";
import { publishApi } from "@/services/publishApi";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Store
const publishStore = usePublishStore();

// Emits
const emit = defineEmits<{
  'create-template': [block: any];
  'delete-template': [id: number];
  'clone-template': [block: any];
  'preview-template': [block: any];
  'copy-payload': [block: any];
  'open-create-modal': [];
  'close-whatsapp-modal': [];
  'search-templates': [params: { query: string; page: number }];
}>();

// Local reactive data
const templates = ref<any[]>([]);
const paginationData = ref<{
  page: number;
  perPage: number;
  total: number;
  to: number;
  prev_page_url: string | null;
} | null>(null);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 20; // Match the API per_page default
const isLoadingTemplates = ref(false);
const isTemplatesLoaded = ref(false);

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
const fetchTemplates = async (page: number = 1, perPage: number = 20) => {
  // Prevent multiple simultaneous calls
  if (isLoadingTemplates.value) return;
  
  // If templates are already loaded for the same page, use cached data
  if (isTemplatesLoaded.value && paginationData.value && paginationData.value.page === page) {
    return;
  }
  
  isLoadingTemplates.value = true;
  try {
    const result = await publishStore.fetchTemplates(page, perPage);
    if (result.success && result.data && result.data.templates && result.data.templates.data && Array.isArray(result.data.templates.data)) {
      templates.value = result.data.templates.data;
      paginationData.value = {
        page: result.data.templates.page || page,
        perPage: result.data.templates.per_page || perPage,
        total: result.data.templates.total || 0,
        to: result.data.templates.to || 0,
        prev_page_url: result.data.templates.prev_page_url || null
      };
      currentPage.value = page;
      isTemplatesLoaded.value = true;
    } else {
      console.warn('No templates data or invalid format:', result);
      templates.value = [];
      paginationData.value = null;
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    templates.value = [];
    paginationData.value = null;
  } finally {
    isLoadingTemplates.value = false;
  }
};

const setTemplates = (templatesData: any) => {
  if (templatesData && templatesData.data) {
    templates.value = templatesData.data;
    paginationData.value = {
      page: templatesData.page || 1,
      perPage: templatesData.per_page || 20,
      total: templatesData.total || 0,
      to: templatesData.to || 0,
      prev_page_url: templatesData.prev_page_url || null
    };
    currentPage.value = templatesData.page || 1;
    isTemplatesLoaded.value = true;
  } else {
    templates.value = [];
    paginationData.value = null;
  }
};

const openCreateModal = () => {
  // Emit to close WhatsApp modal and open create modal
  emit('close-whatsapp-modal');
  emit('open-create-modal');
};

const deleteTemplate = async (id: number) => {
  try {
    window.$confirm({
      text: "Are you sure you want to delete this template?",
    }, async () => {
      const result = await publishStore.deleteTemplate(id);
      if (result.success) {
        // Remove from local state
        templates.value = templates.value.filter(template => template.id !== id);
        window.$toast?.success('Template deleted successfully!');
        
        // Refresh templates if we're on the last page and it's now empty
        if (templates.value.length === 0 && currentPage.value > 1) {
          fetchTemplates(currentPage.value - 1, itemsPerPage);
        }
      } else {
        window.$toast?.error('Failed to delete template');
      }
    });
  } catch (error) {
    console.error('Failed to delete template:', error);
    window.$toast?.error('Failed to delete template');
  }
};

const cloneTemplate = async (template: any) => {
  try {
    // Create a clone of the template
    const clonedTemplate = {
      ...template,
      id: undefined, // Remove ID so it creates a new one
      template_name: `${template.template_name || template.name} (Copy)`,
      name: `${template.template_name || template.name} (Copy)`,
      created_at: new Date().toISOString().split('T')[0],
      status: 0 // Set as not approved initially
    };
    
    // Call the API to create the cloned template
    const result = await publishApi.createTemplate(clonedTemplate);
    if (result.success) {
      window.$toast?.success('Template cloned successfully!');
      // Refresh templates to show the new cloned template
      fetchTemplates(currentPage.value, itemsPerPage);
    } else {
      window.$toast?.error('Failed to clone template');
    }
  } catch (error) {
    console.error('Failed to clone template:', error);
    window.$toast?.error('Failed to clone template');
  }
};

const previewTemplate = (template: any) => {
  // Create a modal or use existing modal system to preview the template
  console.log('Previewing template:', template);
  
  // You can implement a preview modal here
  // For now, we'll just show the template data in console
  const previewData = {
    name: template.template_name || template.name,
    type: template.type,
    language: template.language || 'en',
    status: template.status === 1 ? 'Approved' : 'Not Approved',
    created_at: new Date(template.created_at).toLocaleDateString(),
    components: template.components || [],
    params: template.params || []
  };
  
  // Show preview in a toast notification instead of alert
  window.$toast?.info(`Template Preview: ${previewData.name} (${previewData.type})`);
  console.log('Template preview data:', previewData);
};

const copyPayload = (template: any) => {
  const payload = JSON.stringify(template, null, 2);
  navigator.clipboard.writeText(payload);
  window.$toast?.success('Template payload copied to clipboard!');
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
  // Reset to first page when searching
  fetchTemplates(1, itemsPerPage);
};

const handlePageChange = (page: number) => {
  fetchTemplates(page, itemsPerPage);
};

// Initialize templates when component is mounted
onMounted(() => {
  // Don't fetch templates on mount - wait for tab activation
  // fetchTemplates(1, itemsPerPage);
});

const initializeTemplates = () => {
  console.log('Initializing templates...');
  fetchTemplates(1, itemsPerPage);
};

// Expose methods for parent component
defineExpose({
  currentPage,
  totalPages,
  filteredTemplates,
  setTemplates,
  paginationData,
  fetchTemplates,
  isLoadingTemplates,
  initializeTemplates
});
</script>

<template>
  <div class="tab-panel">
    <div class="search-section">
      <div class="search-create-wrapper">
        <Input 
          v-model="searchQuery" 
          placeholder="Search templates..."
          searchable
          @search="handleSearch"
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
          <TableRow v-if="isLoadingTemplates" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
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
          <TableRow v-else v-for="template in paginatedTemplates" :key="template.id">
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
            <TableCell>{{ new Date(template.created_at).toLocaleDateString() }}</TableCell>
            <TableCell>
              <div class="action-buttons">
                <Button
                  variant="error-outline"
                  size="small"
                  icon="pi pi-trash"
                  iconOnly
                  @click="deleteTemplate(template.id)"
                  title="Delete template"
                />
                <!-- <Button
                  variant="primary-outline"
                  size="small"
                  icon="pi pi-copy"
                  iconOnly
                  @click="cloneTemplate(template)"
                  title="Clone template"
                /> -->
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
                  @click="copyPayload(template)"
                  title="Copy payload"
                />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-section">
      <div class="pagination-info">
        Showing {{ paginationData?.to || 0 }} of {{ paginationData?.total || 0 }} templates
      </div>
      <div class="pagination-controls">
        <Button
          variant="secondary"
          size="small"
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
        >
          Previous
        </Button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <Button
          variant="secondary"
          size="small"
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          Next
        </Button>
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

.pagination-section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.page-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  min-width: 80px;
  text-align: center;
}
</style> 