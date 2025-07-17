<script setup lang="ts">
import { ref, computed } from 'vue'

interface FilterOption {
  value: string
  label: string
  icon: string
}

interface Props {
  title: string
  icon: string
  options: FilterOption[]
  selected: string | string[]
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false
})

const emit = defineEmits<{
  update: [value: string | string[]]
}>()

const isExpanded = ref(false)

const hasActiveSelection = computed(() => {
  if (Array.isArray(props.selected)) {
    return props.selected.length > 0 && !props.selected.includes('all')
  }
  return props.selected !== 'all'
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const isSelected = (value: string) => {
  if (Array.isArray(props.selected)) {
    return props.selected.includes(value)
  }
  return props.selected === value
}

const selectOption = (value: string) => {
  if (props.multiple) {
    // Handle multiple selection
    let newSelected = Array.isArray(props.selected) ? [...props.selected] : [props.selected]
    
    if (value === 'all') {
      newSelected = ['all']
    } else {
      const index = newSelected.indexOf(value)
      if (index > -1) {
        newSelected.splice(index, 1)
      } else {
        newSelected.push(value)
      }
      
      // Remove 'all' if other options are selected
      const allIndex = newSelected.indexOf('all')
      if (allIndex > -1 && newSelected.length > 1) {
        newSelected.splice(allIndex, 1)
      }
      
      // If no options selected, default to 'all'
      if (newSelected.length === 0) {
        newSelected = ['all']
      }
    }
    
    emit('update', newSelected)
  } else {
    // Handle single selection
    emit('update', value)
  }
}
</script>

<template>
  <div class="filter-section">
    <div class="filter-header" @click="toggleExpanded">
      <div class="filter-title">
        <i :class="['filter-icon', icon]" />
        <span>{{ title }}</span>
        <div v-if="hasActiveSelection" class="active-indicator"></div>
      </div>
      <i class="pi pi-chevron-down" :class="{ 'expanded': isExpanded }"></i>
    </div>
    
    <Transition name="section-collapse">
      <div v-show="isExpanded" class="filter-options">
        <div class="filter-chips">
          <button
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option.value)"
            class="filter-chip"
            :class="{ 
              'active': isSelected(option.value),
              'multiple': multiple 
            }"
          >
            <i :class="['option-icon', option.icon]" />
            <span>{{ option.label }}</span>
            <i v-if="isSelected(option.value)" class="pi pi-check"></i>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.filter-section {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  cursor: pointer;
  user-select: none;
  background-color: var(--color-bg-tertiary);
  transition: background-color var(--transition-normal);
}

.filter-header:hover {
  background-color: var(--color-bg-hover);
}

.filter-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.filter-icon {
  width: 14px;
  height: 14px;
  color: var(--color-text-secondary);
}

.active-indicator {
  width: 6px;
  height: 6px;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
}

.pi-chevron-down {
  transition: transform var(--transition-normal);
}

.pi-chevron-down.expanded {
  transform: rotate(180deg);
}

.section-collapse-enter-active,
.section-collapse-leave-active {
  transition: all var(--transition-normal);
  max-height: 200px;
  opacity: 1;
}

.section-collapse-enter-from,
.section-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.filter-options {
  padding: var(--space-3);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.filter-chip:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.filter-chip.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.option-icon {
  width: 12px;
  height: 12px;
}

.filter-chip.multiple {
  min-width: 80px;
  justify-content: space-between;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-chips {
    gap: var(--space-1);
  }

  .filter-chip {
    padding: var(--space-1) var(--space-2);
    font-size: 0.7rem;
    min-width: 60px;
  }

  .filter-header {
    padding: var(--space-2);
  }

  .filter-options {
    padding: var(--space-2);
  }
}
</style>