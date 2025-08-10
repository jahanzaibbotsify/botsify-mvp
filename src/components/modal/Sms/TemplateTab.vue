<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Input, Badge, Button } from "@/components/ui";
import CreateTemplateModal from "./CreateTemplateModal.vue";
import { usePublishStore } from "@/stores/publishStore";

// Props removed - not needed

// Emits
const emit = defineEmits<{
  'create-template': [block: any];
  'delete-template': [id: number];
  'copy-payload': [block: any];
  'open-create-modal': [];
  'close-sms-modal': [];
}>();

const createModalRef = ref<InstanceType<typeof CreateTemplateModal> | null>(null);
const publishStore = usePublishStore();

// Store data
const templates = ref<any[]>([]);
const isLoading = ref(false);

// Local state
const searchQuery = ref('');
const deletingTemplateId = ref<number | null>(null);

// Computed
const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value;
  return templates.value.filter(template => 
    template.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    template.text?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Methods
const openCreateModal = () => {
  // Emit to close SMS modal and open create modal
  emit('close-sms-modal');
  emit('open-create-modal');
};

const openEditModal = (template: any) => {
  // Store the template ID for update
  createModalRef.value?.openModalWithData(template);
};

const handleDeleteTemplate = async (id: number) => {
  window.$confirm(
    'Are you sure you want to delete this template?',
    async () => {
      deletingTemplateId.value = id;
      isLoading.value = true;
      try {
        console.log('Deleting template with ID:', id);
        const result = await publishStore.deleteSmsTemplate(id);
        console.log('Delete result:', result);
        
        if (result.success) {
          emit('delete-template', id);
          // Refresh templates
          console.log('Refreshing templates after delete...');
          const refreshResult = await publishStore.loadDataForPlugins("sms_templates");
          console.log('Refresh result:', refreshResult);
          
          if (refreshResult.success && refreshResult.data?.sms_templates) {
            templates.value = refreshResult.data.sms_templates;
            console.log('Templates refreshed, new count:', templates.value.length);
          } else {
            console.error('Failed to refresh templates:', refreshResult);
          }
        } else {
          console.error('Delete failed:', result.error);
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
      } finally {
        deletingTemplateId.value = null;
        isLoading.value = false;
      }
    }
  );
};

const handleCloneTemplate = async (id: number) => {
  window.$confirm(
    'Are you sure you want to clone this template?',
    async () => {
      isLoading.value = true;
      try {
        console.log('Cloning template with ID:', id);
        const result = await publishStore.cloneSmsTemplate(id);
        console.log('Clone result:', result);
        
        if (result.success) {
          // Refresh templates after cloning
          console.log('Refreshing templates after clone...');
          const refreshResult = await publishStore.loadDataForPlugins("sms_templates");
          console.log('Refresh result:', refreshResult);
          
          if (refreshResult.success && refreshResult.data?.sms_templates) {
            templates.value = refreshResult.data.sms_templates;
            console.log('Templates refreshed, new count:', templates.value.length);
          } else {
            console.error('Failed to refresh templates:', refreshResult);
          }
        } else {
          console.error('Clone failed:', result.error);
        }
      } catch (error) {
        console.error('Failed to clone template:', error);
      } finally {
        isLoading.value = false;
      }
    }
  );
};

// These functions are not used - removed

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

// Load templates on mount
onMounted(async () => {
  isLoading.value = true;
  try {
    console.log('Loading SMS templates on mount...');
    const result = await publishStore.loadDataForPlugins("sms_templates");
    console.log('Load result:', result);
    
    if (result.success && result.data?.sms_templates) {
      templates.value = result.data.sms_templates;
      console.log('Templates loaded:', templates.value);
      console.log('Template count:', templates.value.length);
      if (templates.value.length > 0) {
        console.log('First template:', templates.value[0]);
        console.log('First template ID:', templates.value[0].id);
      }
    } else {
      console.error('Failed to load templates:', result);
    }
  } catch (error) {
    console.error('Failed to load templates:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="tab-panel">
    <div class="media-header">
      <div class="search-create-section">
        <Input 
          v-model="searchQuery" 
          placeholder="Search templates..."
          searchable
          @search="handleSearch"
        />
        
        <!-- Create Button moved back to search section -->
        <button 
          class="action-button primary"
          @click="openCreateModal"
        >
          <i class="pi pi-plus"></i>
          Create
        </button>
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
          <TableRow v-if="isLoading" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="badge"></TableCell>
            <TableCell :isLoading="true" skeletonType="text"></TableCell>
            <TableCell :isLoading="true" skeletonType="actions"></TableCell>
          </TableRow>
          
          <!-- Empty state -->
          <TableRow v-else-if="filteredTemplates.length === 0" noData>
            <TableCell noData colspan="6">
              <div class="empty-state">
                <i class="pi pi-file-o"></i>
                <p>No templates found</p>
              </div>
            </TableCell>
          </TableRow>
          
          <!-- Template rows -->
          <TableRow v-else v-for="template in filteredTemplates" :key="template.id || `template-${Math.random()}`">
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
                />
                <Button
                  variant="error-outline"
                  size="small"
                  :icon="deletingTemplateId === template.id ? 'pi pi-spinner pi-spin' : 'pi pi-trash'"
                  iconOnly
                  :loading="deletingTemplateId === template.id"
                  :disabled="deletingTemplateId === template.id"
                  @click="template.id ? handleDeleteTemplate(template.id) : () => console.log('No template ID for delete')"
                  title="Delete template"
                />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>


  </div>
</template>

<style scoped>
/* Component-specific styles only */

.media-header {
  margin-bottom: var(--space-4);
}

.search-create-section {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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
  background-color: var(--color-primary);
  color: white;
}

.action-button.primary:hover {
  background-color: var(--color-primary-hover);
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