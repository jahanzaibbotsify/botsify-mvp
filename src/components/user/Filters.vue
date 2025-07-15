<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import { ActionType, FilterType, SegmentType, SegmentId } from '@/types/user'
import VueSelect from "vue3-select-component"
import DateRange from '@/components/ui/DateRange.vue'
import { createUserFilterManager, type UserFilterState } from '@/utils/filterUtils'

const props = defineProps<{
  selectedAction: ActionType
  selectedUsersCount: number
  filterState: UserFilterState
}>()

const emit = defineEmits<{
  'update:filterState': [state: Partial<UserFilterState>]
  'update:selectedAction': [value: ActionType]
  'import': []
}>()

// Filter options configuration
const filterOptions = [
  { label: 'All Users', value: 'all' as FilterType },
  { label: 'Active Users', value: 'active' as FilterType },
  { label: 'Inactive Users', value: 'inactive' as FilterType },
]

const segmentOptions = [
  { label: 'All Users', value: 'all' as SegmentType },
  { label: 'SMS Users', value: 'sms' as SegmentType },
  { label: 'WhatsApp Users', value: 'whatsapp' as SegmentType },
  { label: 'Facebook Users', value: 'facebook' as SegmentType },
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
const updateFilter = (key: keyof UserFilterState, value: any): void => {
  emit('update:filterState', { [key]: value })
}

// Handle VueSelect values (can be single value or array)
const handleSelectChange = (key: keyof UserFilterState, value: string | string[]): void => {
  const singleValue = Array.isArray(value) ? value[0] : value
  updateFilter(key, singleValue)
}

// Handle search input with debouncing
const handleSearchChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const searchValue = target.value
  
  // Update the search input immediately for UI responsiveness
  emit('update:filterState', { search: searchValue })
}

// Handle action selection
const handleActionChange = (value: ActionType | ActionType[]): void => {
  const actionValue = Array.isArray(value) ? value[0] : value
  emit('update:selectedAction', actionValue)
}

// Handle date range updates
const handleDateRangeChange = (dateRange: { startDate: Date, endDate: Date } | null): void => {
  if (dateRange) {
    updateFilter('dateRange', {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    })
  }
}
</script>

<template>
  <div class="controls-section">
    <div class="search-controls">
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search..." 
          :value="filterState.search"
          @input="handleSearchChange"
        >
        <button class="search-btn">🔍</button>
      </div>
      
      <div class="filter-dropdown">
        <VueSelect
          :model-value="filterState.filter"
          @update:model-value="(value: string) => handleSelectChange('filter', value)"
          :options="filterOptions"
          placeholder="Select user type"
          :multiple="false"
        />
      </div>
      
      <div class="segment-dropdown">
        <VueSelect
          :model-value="filterState.segment"
          @update:model-value="(value: string) => handleSelectChange('segment', value)"
          :options="segmentOptions"
          placeholder="Select segment"
          :multiple="false"
        />
      </div>

      <div class="date-range">
        <DateRange 
          :fromDate="new Date()"
          :toDate="new Date()"
          :get-from-date="handleDateRangeChange"
          autoPlay
          opens="left"
          @update="handleDateRangeChange"
        />
      </div>
    </div>
    
    <div class="action-controls">
      <div class="action-dropdown">
        <VueSelect
          :model-value="selectedAction"
          @update:model-value="handleActionChange"
          :options="actionOptions"
          placeholder="Select action"
          :disabled="selectedUsersCount === 0"
          :multiple="false"
        />
      </div>
      <button class="import-btn" @click="() => emit('import')">
        Import
      </button>
    </div>
  </div>
</template>

<style scoped>
.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 16px;
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
}

.search-box input {
  padding: 8px 40px 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
}

.search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-primary);
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.filter-dropdown select,
.action-dropdown select,
.segment-dropdown select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.date-range input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.action-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.import-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.import-btn:hover:not(:disabled) {
  background-color: #3367d6;
}

@media (max-width: 768px) {
  .controls-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-controls,
  .action-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .search-box input {
    width: 150px;
  }
}
</style>