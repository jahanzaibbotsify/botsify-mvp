<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import { ActionType, FilterType } from '@/types/user'
import VueSelect from "vue3-select-component"
import DateRange from '@/components/ui/DateRange.vue'

const props = defineProps<{
  searchQuery: string
  selectedFilter: FilterType
  selectedAction: ActionType
  selectedUsersCount: number
}>()
console.log('props', props)

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedFilter': [value: FilterType]
  'update:selectedAction': [value: ActionType]
  'dateRangeUpdate': [dateRange: { startDate: Date, endDate: Date }]
  'import': []
}>()

const updateSearchQuery = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}

const updateSelectedFilter = (value: FilterType | FilterType[]): void => {
  // Handle both single value and array (VueSelect can return either)
  const filterValue = Array.isArray(value) ? value[0] : value
  emit('update:selectedFilter', filterValue)
}

const updateSelectedAction = (value: ActionType | ActionType[]): void => {
  // Handle both single value and array (VueSelect can return either)
  const actionValue = Array.isArray(value) ? value[0] : value
  emit('update:selectedAction', actionValue)
}

const handleDateRangeUpdate = (dateRange: { startDate: Date, endDate: Date }): void => {
  emit('dateRangeUpdate', dateRange)
}

const handleDateRangeUpdateWrapper = (dateRange: { startDate: Date, endDate: Date } | null): void => {
  if (dateRange) {
    handleDateRangeUpdate(dateRange)
  }
}

const handleImport = (): void => {
  emit('import')
}
</script>

<template>
  <div class="controls-section">
    <div class="search-controls">
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search..." 
          :value="searchQuery"
          @input="updateSearchQuery"
        >
        <button class="search-btn">🔍</button>
      </div>
      
      <div class="filter-dropdown">
        <VueSelect
          :model-value="selectedFilter"
          @update:model-value="updateSelectedFilter"
          :options="[
            { label: 'All Users', value: 'all' },
            { label: 'Active Users', value: 'active' },
            { label: 'Inactive Users', value: 'inactive' },
          ]"
          placeholder="Select an user type"
          :multiple="false"
        />
      </div>
      
      <div class="date-range">
        <DateRange 
          :fromDate="new Date()"
          :toDate="new Date()"
          :get-from-date="handleDateRangeUpdateWrapper"
          autoPlay
          opens="left"
          @update="handleDateRangeUpdateWrapper"
        />
      </div>
    </div>
    
    <div class="action-controls">
      <div class="action-dropdown">
        <VueSelect
          :model-value="selectedAction"
          @update:model-value="updateSelectedAction"
          :options="[
            { label: 'Activate', value: 'activate' },
            { label: 'Delete', value: 'delete' },
          ]"
          placeholder="Select an action"
          :disabled="selectedUsersCount === 0"
          :multiple="false"
        />
      </div>
      <button class="import-btn" @click="handleImport">
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
.action-dropdown select {
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