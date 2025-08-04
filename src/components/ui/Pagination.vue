<script setup lang="ts">
import { computed } from "vue";

// Props
interface Props {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  showPageInfo?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  totalItems: 0,
  itemsPerPage: 10,
  showPageInfo: true,
  disabled: false
});

// Emits
const emit = defineEmits<{
  'page-change': [page: number];
}>();

// Computed properties
const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

const pageInfo = computed(() => {
  if (props.totalItems === 0) return '';
  return `${startItem.value}-${endItem.value} of ${props.totalItems}`;
});

// Methods
const goToPreviousPage = () => {
  if (props.currentPage > 1 && !props.disabled) {
    emit('page-change', props.currentPage - 1);
  }
};

const goToNextPage = () => {
  if (props.currentPage < props.totalPages && !props.disabled) {
    emit('page-change', props.currentPage + 1);
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && !props.disabled) {
    emit('page-change', page);
  }
};

// Generate page numbers to show
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = props.totalPages;
  const current = props.currentPage;
  
  if (total <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (current > 3) {
      pages.push('...');
    }
    
    // Show pages around current page
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (current < total - 2) {
      pages.push('...');
    }
    
    // Always show last page
    if (total > 1) {
      pages.push(total);
    }
  }
  
  return pages;
});
</script>

<template>
  <div class="pagination" :class="{ disabled: disabled }">
    <!-- Previous Button -->
    <button 
      class="pagination-btn"
      :disabled="currentPage === 1 || disabled"
      @click="goToPreviousPage"
      title="Previous page"
    >
      <i class="pi pi-chevron-left"></i>
    </button>
    
    <!-- Page Numbers -->
    <div class="page-numbers">
      <button 
        v-for="page in visiblePages" 
        :key="page"
        class="page-btn"
        :class="{ 
          'current': page === currentPage,
          'ellipsis': page === '...'
        }"
        :disabled="page === '...' || disabled"
        @click="page !== '...' ? goToPage(page as number) : null"
      >
        {{ page }}
      </button>
    </div>
    
    <!-- Next Button -->
    <button 
      class="pagination-btn"
      :disabled="currentPage === totalPages || disabled"
      @click="goToNextPage"
      title="Next page"
    >
      <i class="pi pi-chevron-right"></i>
    </button>
    
    <!-- Page Info -->
    <span v-if="showPageInfo && totalItems > 0" class="page-info">
      {{ pageInfo }}
    </span>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.pagination.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.pagination-btn {
  background: var(--color-bg-tertiary, #f3f4f6);
  border: 1px solid var(--color-border, #e5e7eb);
  padding: 8px 12px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  color: var(--color-text-primary, #111827);
  transition: all var(--transition-normal, 0.2s ease);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-bg-secondary, #f9fafb);
  border-color: var(--color-primary, #3b82f6);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  background: var(--color-bg-tertiary, #f3f4f6);
  border: 1px solid var(--color-border, #e5e7eb);
  padding: 8px 12px;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  color: var(--color-text-primary, #111827);
  transition: all var(--transition-normal, 0.2s ease);
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-bg-secondary, #f9fafb);
  border-color: var(--color-primary, #3b82f6);
}

.page-btn.current {
  background: var(--color-primary, #3b82f6);
  color: white;
  border-color: var(--color-primary, #3b82f6);
}

.page-btn.current:hover {
  background: var(--color-primary-hover, #2563eb);
}

.page-btn.ellipsis {
  cursor: default;
  background: transparent;
  border: none;
  padding: 8px 4px;
  min-width: auto;
}

.page-btn.ellipsis:hover {
  background: transparent;
  border: none;
}

.page-info {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  white-space: nowrap;
  margin-left: 8px;
}

@media (max-width: 640px) {
  .pagination {
    gap: 4px;
  }
  
  .page-btn {
    min-width: 32px;
    height: 32px;
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .pagination-btn {
    min-width: 32px;
    height: 32px;
    padding: 6px 8px;
  }
  
  .page-info {
    display: none;
  }
}
</style> 