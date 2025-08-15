<script setup lang="ts">
import { ActionType, SegmentType } from '@/types/user'
import { useUserStore } from '@/stores/userStore'
import { Input, VueSelect, DateRange, Button } from '@/components/ui'
import { ref } from 'vue'

const userStore = useUserStore()
// Computed to determine if we should show mobile layout
const dateRangeValue = ref({
  start: new Date().toISOString().split('T')[0],
  end: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
});

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
  // This will be handled by the parent component
  // We can emit a simple event or use a global event
  window.dispatchEvent(new CustomEvent('show-import-panel'))
}
</script>

<template>
  <div class="controls-section">
    <!-- Desktop Layout -->
    <div class="desktop-controls">
        <Input 
            v-model="userStore.filterState.search" 
            placeholder="Search user..."
            @input="handleSearchChange"
            searchable
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
          Import Users
        </Button>
      </div>
    </div>
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
  gap: 16px;
  flex-wrap: nowrap;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  flex: 1;
  min-width: 0;
}

.search-box {
  position: relative;
  display: flex;
  min-width: 160px;
  flex-shrink: 0;
}

.search-box input {
  padding: 12px;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  font-size: 13px;
  width: 100%;
  background-color: white;
  transition: border-color 0.2s;
  height: 38px;
  box-sizing: border-box;
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 163, 255, 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.action-dropdown{
  min-width: 180px;
  flex-shrink: 0;
}

.date-range {
  min-width: 160px;
  flex-shrink: 0;
}

.date-range :deep(.vue3-date-time-picker) {
  height: 44px;
}

.date-range :deep(.vue3-date-time-picker input) {
  height: 44px;
  padding: 12px 16px;
  font-size: 13px;
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
    gap: 12px;
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
  
  .date-range {
    min-width: 140px;
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
