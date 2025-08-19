<script setup lang="ts">
import { ActionType, SegmentType } from '@/types/user'
import { useUserStore } from '@/stores/userStore'
import { Input, VueSelect, DateRange, Button } from '@/components/ui'
import { ref } from 'vue'
import ImportModal from './ImportModal.vue'

const userStore = useUserStore()
// Computed to determine if we should show mobile layout
const dateRangeValue = ref({
  start: new Date().toISOString().split('T')[0],
  end: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
});

// Local state for import modal
const showImportModal = ref(false)

// Filter options configuration - removed status filter since it's not needed
const segmentOptions = [
  { label: 'SMS Users', value: 'sms' as SegmentType },
  { label: 'WhatsApp Users', value: 'whatsapp' as SegmentType },
  { label: 'Facebook Users', value: 'facebook' as SegmentType },
  { label: 'Website Users', value: 'website' as SegmentType },
  { label: 'Instagram Users', value: 'instagram' as SegmentType },
  { label: 'Telegram Users', value: 'telegram' as SegmentType },
]

const actionOptions = [
  { label: 'Activate User', value: 'activate' as ActionType },
  { label: 'Deactivate User', value: 'deactivate' as ActionType },
  { label: 'Delete User', value: 'delete' as ActionType },
  { label: 'Make Test User', value: 'test' as ActionType },
  { label: 'Export User', value: 'export' as ActionType },
  { label: 'Delete User Conversation', value: 'delete_conversation' as ActionType },
]

// Generic handler for filter updates
const updateFilter = (key: keyof typeof userStore.filterState, value: any): void => {
  userStore.updateFilter({ [key]: value })
}

// Handle VueSelect values (can be single value or array)
const handleSelectChange = (key: keyof typeof userStore.filterState, value: string | number | string[] | number[]): void => {
  const singleValue = Array.isArray(value) ? value[0] : value
  updateFilter(key, singleValue)
}

// Handle search input with debouncing
const handleSearchChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const searchValue = target.value
  
  // Update the search input immediately for UI responsiveness
  userStore.updateSearch(searchValue)
}

// Handle action selection
const handleActionChange = (value: string | number | string[] | number[]): void => {
  const actionValue = Array.isArray(value) ? value[0] : value
  userStore.selectedAction = actionValue as ActionType
}

// Handle date range updates
const handleDateRangeChange = ({ start, end }: { start: string; end: string }) => {
  userStore.updateFilter({
    dateRange: {
      startDate: new Date(start),
      endDate: new Date(end)
    }
  });
};

// Handle import button click
const handleImport = () => {
  showImportModal.value = true
}

// Handle import modal close
const handleImportClose = () => {
  showImportModal.value = false
}

// Handle successful import
const handleImportSuccess = () => {
  // Close the modal
  showImportModal.value = false
  
  // Clear cache and refresh user list with fresh data
  userStore.clearAllCache()
  userStore.fetchUsers(true) // Force refresh
}
</script>

<template>
  <div class="controls-section">
    <!-- Desktop Layout -->
    <div class="desktop-controls">
        <div class="filters">
          <Input 
            v-model="userStore.filterState.search" 
            placeholder="Search user..."
            @input="handleSearchChange"
            searchable
            class="search-box"
          />
        
          <VueSelect
            :model-value="userStore.filterState.segment"
            @update:model-value="(value: string | number | string[] | number[]) => handleSelectChange('segment', value)"
            :options="segmentOptions"
            placeholder="Filter by platform"
            :multiple="false"
          />

          <DateRange 
            v-model="dateRangeValue"
            @change="handleDateRangeChange"
          />
      
        </div>
      <div class="action-controls">
        <VueSelect
          :model-value="userStore.selectedAction"
          @update:model-value="handleActionChange"
          :options="actionOptions"
          placeholder="Select action"
          :disabled="userStore.selectedUsersCount === 0"
          :multiple="false"
        />
        <Button variant="primary" @click="handleImport">
          Import users
        </Button>
      </div>
    </div>

    <!-- Import Modal -->
    <ImportModal 
      :is-open="showImportModal"
      @close="handleImportClose"
      @import-success="handleImportSuccess"
    />
  </div>
</template>

<style scoped>
.controls-section {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 20px;
}

/* Desktop Layout */
.desktop-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  padding: 12px 8px;
  border-bottom: 1px solid var(--color-border);
}
.filters{
  display: flex;
  gap: 10px;
  width: 100%;
}
.search-box {
  width: 200px;
}

.action-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .desktop-controls {
    padding: 10px;
  }
  
  .search-controls {
    gap: 8px;
  }
  
  .segment-dropdown {
    min-width: 120px;
  }
  
  .action-dropdown {
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .desktop-controls {
    display: none;
  }
  
  .mobile-controls {
    display: block;
  }
}
</style>
