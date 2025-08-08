<script setup lang="ts">
import { ref, computed } from "vue";
// import ModalLayout from "@/components/ui/ModalLayout.vue";
// import Pagination from "@/components/ui/Pagination.vue";
import Input from "@/components/ui/Input.vue";
import CreateTemplateModal from "./CreateTemplateModal.vue";

// Props
interface Props {
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-template': [block: any];
  'delete-template': [id: number];
  'clone-template': [block: any];
  'preview-template': [block: any];
  'copy-payload': [block: any];
}>();

const createModalRef = ref<InstanceType<typeof CreateTemplateModal> | null>(null);

// Local reactive data
const templates = ref([
  {
    id: 1,
    name: "Welcome Template",
    type: "text",
    status: "active"
  },
  {
    id: 2,
    name: "Product Catalog",
    type: "catalog",
    status: "active"
  },
  {
    id: 3,
    name: "Promotional Message",
    type: "text",
    status: "inactive"
  }
]);

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
const openCreateModal = () => {
  createModalRef.value?.openModal();
};

// const closeCreateModal = () => {
//   createModalRef.value?.closeModal();
// };

const createTemplate = (block: any) => {
  const newBlock = {
    id: Date.now(),
    name: block.name,
    type: block.type,
    content: block.content,
    created_at: new Date().toISOString().split('T')[0],
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

// const copyPayload = (block: any) => {
//   const payload = JSON.stringify(block, null, 2);
//   navigator.clipboard.writeText(payload);
//   console.log('Payload copied to clipboard');
//   emit('copy-payload', block);
// };

// const handlePageChange = (page: number) => {
//   currentPage.value = page;
// };

const handleSearch = (query: string) => {
  searchQuery.value = query;
  currentPage.value = 1; // Reset to first page on new search
};

// Expose methods for parent component
defineExpose({
  currentPage,
  totalPages,
  filteredTemplates
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

    <div class="media-list">
      <div class="media-table">
        <div class="table-header">
          <div class="header-cell">Name</div>
          <div class="header-cell">Type</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Actions</div>
        </div>
        
        <tr v-for="block in paginatedTemplates" :key="block.id" class="table-row">
          <td class="table-cell">{{ block.name }}</td>
          <td class="table-cell">{{ block.type }}</td>
          <td class="table-cell">
            <span :class="['status-badge', block.status]">
              {{ block.status }}
            </span>
          </td>
          <td class="table-cell">
            <div class="action-buttons">
              <button
                class="action-button delete"
                @click="deleteTemplate(block.id)"
                title="Delete template"
              >
                <i class="pi pi-trash"></i>
              </button>
              <button
                class="action-button clone"
                @click="cloneTemplate(block)"
                title="Clone template"
              >
                <i class="pi pi-copy"></i>
              </button>
              <button
                class="action-button preview"
                @click="previewTemplate(block)"
                title="Preview template"
              >
                <i class="pi pi-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      </div>
    </div>

    <!-- Create Template Modal -->
    <CreateTemplateModal
      ref="createModalRef"
      @create-template="createTemplate"
    />
  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

/* Template Styles */
.media-header {
  margin-bottom: 20px;
}

.media-list {
  margin-top: 16px;
}

.media-table {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background: var(--color-secondary, #10b981);
  color: white;
}

.status-badge.inactive {
  background: var(--color-text-tertiary, #9ca3af);
  color: white;
}

@media (max-width: 768px) {
  .media-table {
    font-size: 12px;
  }
}
</style> 