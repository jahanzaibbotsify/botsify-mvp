<template>
  <div 
    class="dropdown-item" 
    :class="[
      `dropdown-item--${variant}`,
      { 'dropdown-item--disabled': disabled }
    ]"
    @click="handleClick"
  >
    <div v-if="$slots.icon || icon" class="dropdown-item-icon">
      <slot name="icon">
        <i :class="icon"></i>
      </slot>
    </div>
    
    <div class="dropdown-item-content">
      <slot></slot>
    </div>
    
    <div v-if="$slots.suffix" class="dropdown-item-suffix">
      <slot name="suffix"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Item variant for different styling
  variant?: 'default' | 'danger' | 'success' | 'warning'
  // Whether the item is disabled
  disabled?: boolean
  // Icon class (if not using icon slot)
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (props.disabled) return
  
  // Emit the click event first
  emit('click', event)
  
  // Automatically close the parent dropdown
  // Find the closest parent dropdown and close it
  const parentDropdown = (event.target as Element).closest('.dropdown-container')
  if (parentDropdown) {
    // Trigger a custom event that the Dropdown component can listen to
    parentDropdown.dispatchEvent(new CustomEvent('close-dropdown'))
  }
}
</script>

<style scoped>
.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  transition: all var(--transition-fast);
  text-decoration: none;
  min-height: 40px;
}

.dropdown-item:hover:not(.dropdown-item--disabled) {
  background-color: var(--color-bg-hover);
}

.dropdown-item:active:not(.dropdown-item--disabled) {
  background-color: var(--color-bg-active);
}

.dropdown-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--color-text-tertiary);
}

.dropdown-item--disabled:hover {
  background-color: transparent;
}

/* Variant styles */
.dropdown-item--default {
  color: var(--color-text-primary);
}

.dropdown-item--danger {
  color: var(--color-error);
}

.dropdown-item--danger:hover:not(.dropdown-item--disabled) {
  background-color: rgba(239, 68, 68, 0.1);
}

.dropdown-item--success {
  color: var(--color-success);
}

.dropdown-item--success:hover:not(.dropdown-item--disabled) {
  background-color: rgba(16, 185, 129, 0.1);
}

.dropdown-item--warning {
  color: var(--color-warning);
}

.dropdown-item--warning:hover:not(.dropdown-item--disabled) {
  background-color: rgba(245, 158, 11, 0.1);
}

.dropdown-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.dropdown-item:hover .dropdown-item-icon {
  color: var(--color-text-primary);
}

.dropdown-item--danger .dropdown-item-icon {
  color: var(--color-error);
}

.dropdown-item--success .dropdown-item-icon {
  color: var(--color-success);
}

.dropdown-item--warning .dropdown-item-icon {
  color: var(--color-warning);
}

.dropdown-item-content {
  flex: 1;
  min-width: 0;
}

.dropdown-item-suffix {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
}

/* Dark theme support */
[data-theme="dark"] .dropdown-item {
  color: var(--color-text-primary);
}

[data-theme="dark"] .dropdown-item:hover:not(.dropdown-item--disabled) {
  background-color: var(--color-bg-hover);
}

[data-theme="dark"] .dropdown-item--disabled {
  color: var(--color-text-tertiary);
}
</style>
