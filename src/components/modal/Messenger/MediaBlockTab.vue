<script setup lang="ts">
import { ref, computed } from "vue";
import ModalLayout from "@/components/ui/ModalLayout.vue";
import Pagination from "@/components/ui/Pagination.vue";
import CreateMediaBlockModal from "./CreateMediaBlockModal.vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'create-media-block': [block: any];
  'delete-media-block': [id: number];
  'clone-media-block': [block: any];
  'preview-media-block': [block: any];
  'copy-payload': [block: any];
}>();

const createModalRef = ref<InstanceType<typeof CreateMediaBlockModal> | null>(null);

// Local reactive data
const mediaBlocks = ref([
  {
    id: 1,
    name: 'Welcome Message',
    category: 'greeting',
    language: 'en',
    type: 'text',
    body: 'Welcome to our service!',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Product Catalog',
    category: 'product',
    language: 'en',
    type: 'catalog',
    body: 'Product list with images',
    status: 'active',
    createdAt: '2024-01-14'
  },
  {
    id: 3,
    name: 'FAQ Response',
    category: 'support',
    language: 'en',
    type: 'text',
    body: 'Frequently asked questions',
    status: 'inactive',
    createdAt: '2024-01-13'
  }
]);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

// Computed properties
const filteredMediaBlocks = computed(() => {
  return mediaBlocks.value.filter(block => 
    block.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    block.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    block.type.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedMediaBlocks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMediaBlocks.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredMediaBlocks.value.length / itemsPerPage);
});

// Methods
const openCreateModal = () => {
  createModalRef.value?.openModal();
};

const closeCreateModal = () => {
  createModalRef.value?.closeModal();
};

const createMediaBlock = (block: any) => {
  // Add to local state (will be replaced with API call)
  const newBlock = {
    id: Date.now(),
    ...block,
    createdAt: new Date().toISOString().split('T')[0]
  };
  mediaBlocks.value.unshift(newBlock);
  emit('create-media-block', newBlock);
};

const deleteMediaBlock = (id: number) => {
  // Remove from local state (will be replaced with API call)
  mediaBlocks.value = mediaBlocks.value.filter(block => block.id !== id);
  emit('delete-media-block', id);
};

const cloneMediaBlock = (block: any) => {
  // Clone in local state (will be replaced with API call)
  const newBlock = {
    ...block,
    id: Date.now(),
    name: `${block.name} (Copy)`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  mediaBlocks.value.unshift(newBlock);
  emit('clone-media-block', newBlock);
};

const previewMediaBlock = (block: any) => {
  console.log('Previewing media block:', block);
  emit('preview-media-block', block);
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

// Expose methods for parent component
defineExpose({
  openCreateModal,
  closeCreateModal,
  deleteMediaBlock,
  cloneMediaBlock,
  previewMediaBlock,
  copyPayload,
  currentPage,
  totalPages,
  filteredMediaBlocks
});
</script>

<template>
  <div class="tab-panel">
    <div class="media-header">
      <div class="search-create-section">
        <div class="search-box">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search media blocks..."
            class="search-input"
          />
          <i class="pi pi-search search-icon"></i>
        </div>
        
        <!-- Create Button moved back to search section -->
        <button 
          class="create-button primary"
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
        
        <div 
          v-for="block in paginatedMediaBlocks" 
          :key="block.id"
          class="table-row"
        >
          <div class="cell">{{ block.name }}</div>
          <div class="cell">
            <span class="type-badge" :class="block.type">
              {{ block.type }}
            </span>
          </div>
          <div class="cell">
            <span class="status-badge" :class="block.status">
              {{ block.status }}
            </span>
          </div>
          <div class="cell actions-cell">
            <button 
              class="action-icon"
              @click="deleteMediaBlock(block.id)"
              title="Delete"
            >
              <i class="pi pi-trash"></i>
            </button>
            <button 
              class="action-icon"
              @click="cloneMediaBlock(block)"
              title="Clone"
            >
              <i class="pi pi-copy"></i>
            </button>
            <button 
              class="action-icon"
              @click="previewMediaBlock(block)"
              title="Preview"
            >
              <i class="pi pi-eye"></i>
            </button>
            <button 
              class="action-icon"
              @click="copyPayload(block)"
              title="Copy Payload"
            >
              <i class="pi pi-clipboard"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Media Block Modal -->
    <CreateMediaBlockModal
      ref="createModalRef"
      :is-loading="isLoading"
      @create-media-block="createMediaBlock"
    />
  </div>
</template>

<style scoped>
.tab-panel {
  padding: 0;
}

/* Media Block Styles */
.media-header {
  margin-bottom: 20px;
}

.search-create-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-family: inherit;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary, #6b7280);
  font-size: 14px;
}

.create-button {
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  border: none;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-button.primary {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.create-button.primary:hover {
  background: var(--color-primary-hover, #2563eb);
}

.media-list {
  margin-top: 16px;
}

.media-table {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.header-cell {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  transition: background var(--transition-normal, 0.2s ease);
}

.table-row:hover {
  background: var(--color-bg-secondary, #f9fafb);
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-primary, #111827);
  display: flex;
  align-items: center;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.action-icon {
  background: none;
  border: none;
  padding: 6px;
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  color: var(--color-text-secondary, #6b7280);
  transition: all var(--transition-normal, 0.2s ease);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon:hover {
  background: var(--color-bg-tertiary, #f3f4f6);
  color: var(--color-text-primary, #111827);
}

.type-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.type-badge.text {
  background: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
}

.type-badge.image {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.type-badge.video {
  background: var(--color-accent, #8b5cf6);
  color: white;
}

.type-badge.audio {
  background: var(--color-secondary, #10b981);
  color: white;
}

.type-badge.document {
  background: var(--color-warning, #f59e0b);
  color: white;
}

.type-badge.catalog {
  background: var(--color-error, #ef4444);
  color: white;
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
  .search-create-section {
    flex-direction: column;
  }
  
  .media-table {
    font-size: 12px;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  
  .header-cell,
  .cell {
    padding: 8px 12px;
  }
  
  .actions-cell {
    gap: 4px;
  }
  
  .action-icon {
    padding: 4px;
  }
}
</style> 