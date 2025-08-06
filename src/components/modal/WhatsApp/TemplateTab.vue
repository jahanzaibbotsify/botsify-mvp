<script setup lang="ts">
import { ref, computed } from "vue";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Input, Badge, Button } from "@/components/ui";
import CreateTemplateModal from "./Create/CreateTemplateModal.vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-template': [block: any];
  'delete-template': [id: number];
  'clone-template': [block: any];
  'preview-template': [block: any];
  'copy-payload': [block: any];
  'open-create-modal': [];
  'close-whatsapp-modal': [];
}>();

const createModalRef = ref<InstanceType<typeof CreateTemplateModal> | null>(null);

// Local reactive data
const templates = ref<any[]>([]);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

// Computed properties
const filteredTemplates = computed(() => {
  return templates.value.filter(block =>
    block.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    block.type.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTemplates.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTemplates.value.length / itemsPerPage);
});

// Methods
const setTemplates = (newTemplates: any[]) => {
  templates.value = newTemplates;
};

const openCreateModal = () => {
  // Emit to close WhatsApp modal and open create modal
  emit('close-whatsapp-modal');
  emit('open-create-modal');
};

const closeCreateModal = () => {
  createModalRef.value?.closeModal();
};

const createTemplate = (block: any) => {
  const newBlock = {
    id: Date.now(),
    name: block.name,
    type: block.type,
    status: 'active'
  };
  templates.value.unshift(newBlock);
  emit('create-template', newBlock);
};

const deleteTemplate = (id: number) => {
  templates.value = templates.value.filter(block => block.id !== id);
  emit('delete-template', id);
};

const cloneTemplate = (block: any) => {
  const newBlock = {
    id: Date.now(),
    name: `${block.name} (Copy)`,
    type: block.type,
    content: block.content,
    created_at: new Date().toISOString().split('T')[0],
    status: 'active'
  };
  templates.value.unshift(newBlock);
  emit('clone-template', newBlock);
};

const previewTemplate = (block: any) => {
  console.log('Previewing template:', block);
  emit('preview-template', block);
};

const copyPayload = (block: any) => {
  const payload = JSON.stringify(block, null, 2);
  navigator.clipboard.writeText(payload);
  console.log('Payload copied to clipboard');
  emit('copy-payload', block);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
  currentPage.value = 1; // Reset to first page on new search
};

// Expose methods for parent component
defineExpose({
  currentPage,
  totalPages,
  filteredTemplates,
  setTemplates
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
          <TableRow v-if="props.isLoading" v-for="i in 5" :key="`skeleton-${i}`" skeleton>
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
            <TableCell>{{ template.name }}</TableCell>
            <TableCell>{{ template.type }}</TableCell>
            <TableCell>{{ template.language }}</TableCell>
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
                  variant="error"
                  size="small"
                  icon="pi pi-trash"
                  iconOnly
                  @click="deleteTemplate(template.id)"
                  title="Delete template"
                />
                <Button
                  variant="secondary"
                  size="small"
                  icon="pi pi-copy"
                  iconOnly
                  @click="cloneTemplate(template)"
                  title="Clone template"
                />
                <Button
                  variant="secondary"
                  size="small"
                  icon="pi pi-eye"
                  iconOnly
                  @click="previewTemplate(template)"
                  title="Preview template"
                />
                <Button
                  variant="secondary"
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
</style> 