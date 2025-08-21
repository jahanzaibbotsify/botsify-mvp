<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DataAnalysisFilter } from '@/types/dataAnalysis'

interface Props {
  filters: DataAnalysisFilter[]
  modelValue: Record<string, any>
  collapsed?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'apply-filters'): void
  (e: 'clear-filters'): void
  (e: 'toggle-collapse'): void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})
const emit = defineEmits<Emits>()

const filterValues = ref<Record<string, any>>({ ...props.modelValue })

const hasActiveFilters = computed(() => {
  return Object.values(filterValues.value).some(value => 
    value !== undefined && value !== null && value !== '' && value !== 'all'
  )
})

const updateFilter = (filterId: string, value: any) => {
  filterValues.value[filterId] = value
  emit('update:modelValue', { ...filterValues.value })
}

const applyFilters = () => {
  emit('apply-filters')
}

const clearAllFilters = () => {
  const clearedFilters: Record<string, any> = {}
  props.filters.forEach(filter => {
    clearedFilters[filter.id] = filter.defaultValue || ''
  })
  filterValues.value = clearedFilters
  emit('update:modelValue', clearedFilters)
  emit('clear-filters')
}

const toggleCollapse = () => {
  emit('toggle-collapse')
}
</script>

<template>
  <div class="filter-panel">
    <div class="filter-header" @click="toggleCollapse">
      <div class="header-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <h3>Filters</h3>
        <span v-if="hasActiveFilters" class="active-indicator">{{ Object.values(filterValues).filter(v => v && v !== 'all').length }}</span>
      </div>
      <div class="collapse-icon">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :class="{ 'rotated': !collapsed }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <div v-if="!collapsed" class="filter-content">
      <div class="filter-grid">
        <div v-for="filter in filters" :key="filter.id" class="filter-item">
          <label class="filter-label">
            {{ filter.name }}
            <span v-if="filter.required" class="required">*</span>
          </label>

          <!-- Date Input -->
          <input
            v-if="filter.type === 'date'"
            type="date"
            :value="filterValues[filter.id] || ''"
            :placeholder="filter.placeholder"
            class="filter-input"
            @input="updateFilter(filter.id, ($event.target as HTMLInputElement).value)"
          />

          <!-- Select Dropdown -->
          <select
            v-else-if="filter.type === 'select'"
            :value="filterValues[filter.id] || filter.defaultValue || 'all'"
            class="filter-select"
            @change="updateFilter(filter.id, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="option in filter.options" :key="option" :value="option">
              {{ option.charAt(0).toUpperCase() + option.slice(1) }}
            </option>
          </select>
        </div>
      </div>

      <div class="filter-actions">
        <button 
          v-if="hasActiveFilters" 
          class="clear-btn" 
          @click="clearAllFilters"
          title="Clear all filters"
        >
          Clear All
        </button>
        <button class="apply-btn" @click="applyFilters">
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-3);
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border-bottom: 1px solid var(--color-border);
}

.filter-header:hover {
  background-color: var(--color-bg-hover);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-content h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.active-indicator {
  background-color: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-icon svg {
  transition: transform var(--transition-normal);
  color: var(--color-text-secondary);
}

.collapse-icon svg.rotated {
  transform: rotate(180deg);
}

.filter-content {
  padding: var(--space-4);
  background-color: var(--color-bg-tertiary);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.required {
  color: var(--color-error);
}

.filter-input,
.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: border-color var(--transition-normal);
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.clear-btn {
  padding: var(--space-2) var(--space-3);
  font-size: 0.75rem;
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.clear-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.apply-btn {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.apply-btn:hover {
  background-color: var(--color-primary-hover);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
  
  .filter-content {
    padding: var(--space-3);
  }
  
  .filter-header {
    padding: var(--space-2) var(--space-3);
  }
  
  .filter-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>