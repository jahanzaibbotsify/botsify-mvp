<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import VueSelect from "vue3-select-component"
import DateRange from '@/components/ui/DateRange.vue'
import { useDataAnalysisStore } from '@/stores/dataAnalysisStore'
import { useSidebarStore } from '@/stores/sidebarStore'

interface Props {
  availableFilters?: string[]
  filterData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  availableFilters: () => [],
  filterData: () => ({})
})

const emit = defineEmits<{
  'filter-changed': [filters: Record<string, any>]
}>()

const dataAnalysisStore = useDataAnalysisStore()
const sidebarStore = useSidebarStore()

// Computed to determine if we should show mobile layout
const shouldShowMobileLayout = computed(() => {
  return window.innerWidth <= 768 || sidebarStore.isOpen
})

// Dynamic filter options based on available filters
const filterOptions = computed(() => {
  if (props.availableFilters.includes('status')) {
    return [
      { label: 'All Statuses', value: 'all' },
      { label: 'Active Users', value: 'active' },
      { label: 'Inactive Users', value: 'inactive' },
      { label: 'Pending Users', value: 'pending' }
    ]
  }
  return []
})

const segmentOptions = computed(() => {
  if (props.availableFilters.includes('platform')) {
    return [
      { label: 'All Platforms', value: 'all' },
      { label: 'SMS Users', value: 'sms' },
      { label: 'WhatsApp Users', value: 'whatsapp' },
      { label: 'Facebook Users', value: 'facebook' },
      { label: 'Website Users', value: 'website' },
      { label: 'Instagram Users', value: 'instagram' },
      { label: 'Telegram Users', value: 'telegram' },
    ]
  }
  return []
})

// UI date range value for DateRange component (expects strings YYYY-MM-DD)
const uiDateRangeValue = computed(() => {
  if (!props.availableFilters.includes('dateRange')) {
    return { start: '', end: '' }
  }
  const startIso: string | undefined = props.filterData?.dateRange?.startDate
  const endIso: string | undefined = props.filterData?.dateRange?.endDate
  const start = startIso ? dayjs(startIso).format('YYYY-MM-DD') : ''
  const end = endIso ? dayjs(endIso).format('YYYY-MM-DD') : ''
  return { start, end }
})

const searchValue = computed(() => {
  if (props.availableFilters.includes('search')) {
    return props.filterData.search || ''
  }
  return ''
})

const statusValue = computed(() => {
  if (props.availableFilters.includes('status')) {
    return props.filterData.status || 'all'
  }
  return 'all'
})

const platformValue = computed(() => {
  if (props.availableFilters.includes('platform')) {
    return props.filterData.platform || 'all'
  }
  return 'all'
})

// Generic handler for filter updates
const updateFilter = (key: string, value: any): void => {
  // Create updated filters object
  const updatedFilters = { ...props.filterData, [key]: value }
  
  // Emit the filter change to parent
  emit('filter-changed', updatedFilters)
}

// Handle VueSelect values (can be single value or array)
const handleSelectChange = (key: string, value: string | string[]): void => {
  const singleValue = Array.isArray(value) ? value[0] : value
  updateFilter(key, singleValue)
}

// Handle search input with debouncing
const handleSearchChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const searchValue = target.value
  
  // Update the search input immediately for UI responsiveness
  updateFilter('search', searchValue)
}

// Handle date range updates
const onDateChange = (value: { start: string; end: string }) => {
  // Convert back to ISO start-of-day
  const updated = {
    startDate: value.start ? dayjs(value.start).startOf('day').toISOString() : '',
    endDate: value.end ? dayjs(value.end).endOf('day').toISOString() : ''
  }
  updateFilter('dateRange', updated)
}

// Handle export data button click
const handleExport = () => {
  // Export current analysis data
  dataAnalysisStore.exportData()
}

// Numeric filter change
const handleNumericChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  updateFilter('numeric', target?.value ?? '')
}

// Boolean filter change
const handleBooleanChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  updateFilter('boolean', target?.value ?? 'all')
}
</script>

<template>
  <div class="controls-section" v-if="availableFilters.length > 0">
    <!-- Desktop Layout -->
    <div class="desktop-controls">
      <div class="search-controls">
        <!-- Search Filter -->
        <div class="search-box" v-if="availableFilters.includes('search')">
          <input 
            type="text" 
            placeholder="Search data..." 
            :value="searchValue"
            @input="handleSearchChange"
          >
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        
        <!-- Status Filter -->
        <div class="filter-dropdown" v-if="availableFilters.includes('status')" v-show="!shouldShowMobileLayout">
          <VueSelect
            :model-value="statusValue"
            @update:model-value="(value) => handleSelectChange('status', value)"
            :options="filterOptions"
            placeholder="Filter by status"
            :multiple="false"
          />
        </div>
        
        <!-- Platform Filter -->
        <div class="segment-dropdown" v-if="availableFilters.includes('platform')">
          <VueSelect
            :model-value="platformValue"
            @update:model-value="(value) => handleSelectChange('platform', value)"
            :options="segmentOptions"
            placeholder="Filter by platform"
            :multiple="false"
          />
        </div>

        <!-- Date Range Filter -->
        <div class="date-range" v-if="availableFilters.includes('dateRange')">
          <DateRange 
            :model-value="uiDateRangeValue"
            @update:model-value="onDateChange"
          />
        </div>

        <!-- Numeric Filter -->
        <div class="numeric-filter" v-if="availableFilters.includes('numeric')">
          <input 
            type="number" 
            placeholder="Numeric value..."
            :value="filterData.numeric || ''"
            @input="handleNumericChange"
            class="numeric-input"
          />
        </div>

        <!-- Boolean Filter -->
        <div class="boolean-filter" v-if="availableFilters.includes('boolean')">
          <select 
            :value="filterData.boolean || 'all'"
            @change="handleBooleanChange"
            class="boolean-select"
          >
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
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
  border-radius: 24px;
  margin-bottom: 20px;
  width: 100%;
  box-shadow: var(--shadow-sm);
}

/* Desktop Layout */
.desktop-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
  padding: 12px;
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
  min-width: 150px;
  flex-shrink: 0;
}

.filter-dropdown :deep(.vue3-select-component),
.segment-dropdown :deep(.vue3-select-component) {
  font-size: 13px;
  height: 44px;
}

.date-range {
  width: 250px;
  min-width: 250px;
  max-width: 250px;
  flex: 0 0 250px;
}

.date-range :deep(.vue3-date-time-picker) {
  height: 44px;
  width: 100%;
}

.date-range :deep(.vue3-date-time-picker input) {
  height: 44px;
  padding: 12px 16px;
  font-size: 13px;
  width: 100%;
  white-space: nowrap;
}

.numeric-filter,
.boolean-filter {
  min-width: 120px;
  flex-shrink: 0;
}

.numeric-input,
.boolean-select {
  width: 100%;
  height: 44px;
  padding: 12px 16px;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  font-size: 13px;
  background-color: white;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.numeric-input:focus,
.boolean-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 163, 255, 0.1);
}

.action-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: auto;
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
    gap: 10px;
    padding: 10px;
    flex-wrap: nowrap;
  }
  
  .search-controls {
    gap: 8px;
    flex-wrap: nowrap;
  }
  
  .filter-dropdown,
  .segment-dropdown {
    min-width: 120px;
  }
  
  .date-range {
    min-width: 140px;
    width: auto;
    max-width: none;
    flex: 0 1 auto;
  }
  
  .numeric-filter,
  .boolean-filter {
    min-width: 100px;
  }
}

/* Medium desktop responsiveness */
@media (max-width: 1280px) and (min-width: 769px) {
  .desktop-controls {
    flex-wrap: nowrap;
    gap: 10px 12px;
  }

  .search-controls {
    flex-wrap: nowrap;
    gap: 10px;
  }

  .filter-dropdown,
  .segment-dropdown,
  .numeric-filter,
  .boolean-filter {
    min-width: 160px;
  }

  .date-range {
    width: 250px;
    min-width: 250px;
    max-width: 250px;
    flex: 0 0 250px;
  }

  .action-controls {
    width: auto;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .desktop-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
  }

  .search-controls {
    flex-wrap: wrap;
    gap: 8px;
    flex: 1 1 100%;
  }

  .search-box,
  .filter-dropdown,
  .segment-dropdown,
  .date-range,
  .numeric-filter,
  .boolean-filter {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .action-controls {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
  }
}
</style>