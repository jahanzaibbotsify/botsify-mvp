<script setup lang="ts">
import { computed } from 'vue'
import VueSelect from "vue3-select-component"
import DateRange from '@/components/ui/DateRange.vue'
import { useDataAnalysisStore } from '@/stores/dataAnalysisStore'
import { useSidebarStore } from '@/stores/sidebarStore'

const dataAnalysisStore = useDataAnalysisStore()
const sidebarStore = useSidebarStore()

// Computed to determine if we should show mobile layout
const shouldShowMobileLayout = computed(() => {
  return window.innerWidth <= 768 || sidebarStore.isOpen
})

// Filter options configuration - matching user table exactly
const filterOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active Users', value: 'active' },
  { label: 'Inactive Users', value: 'inactive' },
]

const segmentOptions = [
  { label: 'All Platforms', value: 'all' },
  { label: 'SMS Users', value: 'sms' },
  { label: 'WhatsApp Users', value: 'whatsapp' },
  { label: 'Facebook Users', value: 'facebook' },
  { label: 'Website Users', value: 'website' },
  { label: 'Instagram Users', value: 'instagram' },
  { label: 'Telegram Users', value: 'telegram' },
]

// Generic handler for filter updates
const updateFilter = (key: keyof typeof dataAnalysisStore.filterState, value: any): void => {
  dataAnalysisStore.updateFilter({ [key]: value })
}

// Handle VueSelect values (can be single value or array)
const handleSelectChange = (key: keyof typeof dataAnalysisStore.filterState, value: string | string[]): void => {
  const singleValue = Array.isArray(value) ? value[0] : value
  updateFilter(key, singleValue)
}

// Handle search input with debouncing
const handleSearchChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const searchValue = target.value
  
  // Update the search input immediately for UI responsiveness
  dataAnalysisStore.updateSearch(searchValue)
}

// Handle date range updates
const handleDateRangeChange = (dateRange: { startDate: Date, endDate: Date } | null): void => {
  if (dateRange) {
    dataAnalysisStore.updateFilter({
      dateRange: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    })
  }
}

// Handle export data button click
const handleExport = () => {
  // Export current analysis data
  dataAnalysisStore.exportData()
}
</script>

<template>
  <div class="controls-section">
    <!-- Desktop Layout -->
    <div class="desktop-controls">
      <div class="search-controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search data..." 
            :value="dataAnalysisStore.filterState.search"
            @input="handleSearchChange"
          >
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        
        <div class="filter-dropdown" v-show="!shouldShowMobileLayout">
          <VueSelect
            :model-value="dataAnalysisStore.filterState.filter"
            @update:model-value="(value: string | string[]) => handleSelectChange('filter', value)"
            :options="filterOptions"
            placeholder="Filter by status"
            :multiple="false"
          />
        </div>
        
        <div class="segment-dropdown">
          <VueSelect
            :model-value="dataAnalysisStore.filterState.segment"
            @update:model-value="(value: string | string[]) => handleSelectChange('segment', value)"
            :options="segmentOptions"
            placeholder="Filter by platform"
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
        <button 
          class="export-btn" 
          @click="handleExport"
          :disabled="!dataAnalysisStore.hasData"
        >
          Export Data
        </button>
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

.filter-dropdown,
.segment-dropdown {
  min-width: 130px;
  flex-shrink: 0;
}

.filter-dropdown :deep(.vue3-select-component),
.segment-dropdown :deep(.vue3-select-component) {
  font-size: 13px;
  height: 44px;
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

.export-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-btn:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
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
  
  .filter-dropdown,
  .segment-dropdown {
    min-width: 120px;
  }
  
  .date-range {
    min-width: 140px;
  }
}

@media (max-width: 768px) {
  .desktop-controls {
    display: none;
  }
}
</style>