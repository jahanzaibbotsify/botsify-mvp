<script setup lang="ts">
import VueSelectComponent from "vue3-select-component";
import { computed } from 'vue';

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
  [key: string]: any;
}

interface Props {
  modelValue?: string | number | string[] | number[];
  options: Option[];
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  success?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  disabled: false,
  readonly: false,
  required: false,
  success: false,
  multiple: false,
  searchable: true,
  clearable: true
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | string[] | number[]];
  'change': [value: string | number | string[] | number[]];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
}>();

const selectClasses = computed(() => {
  const classes = [
    'ui-vue-select',
    `ui-vue-select--${props.size}`,
    {
      'ui-vue-select--error': props.error,
      'ui-vue-select--success': props.success,
      'ui-vue-select--disabled': props.disabled,
      'ui-vue-select--readonly': props.readonly
    }
  ];
  
  return classes;
});

const handleChange = (value: any) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>

<template>
  <div class="vue-select-wrapper">
    <!-- Label -->
    <label v-if="label" class="vue-select-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <!-- VueSelect Container -->
    <div class="vue-select-container" :class="selectClasses">
      <VueSelectComponent
        :model-value="modelValue"
        :options="options"
        :placeholder="placeholder"
        :multiple="multiple"
        :searchable="searchable"
        :clearable="clearable"
        :isDisabled="disabled"
        :readonly="readonly"
        class="vue-select-component"
        @update:model-value="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="vue-select-error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.vue-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.vue-select-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.required-mark {
  color: var(--color-error);
  margin-left: var(--space-1);
}

.vue-select-container {
  position: relative;
}

.vue-select-container:deep(.vue3-select-component) {
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
}

.vue-select-container:deep(.control) {
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  min-height: inherit;
}

.vue-select-container:deep(.control:hover) {
  border-color: var(--color-border-hover, var(--color-border));
}

.vue-select-container:deep(.control.focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.1);
}

.vue-select-container.ui-vue-select--error:deep(.control) {
  border-color: var(--color-error);
}

.vue-select-container.ui-vue-select--error:deep(.control.focus) {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.vue-select-container.ui-vue-select--success:deep(.control) {
  border-color: var(--color-success);
}

.vue-select-container.ui-vue-select--success:deep(.control.focus) {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.vue-select-container.ui-vue-select--disabled:deep(.control) {
  opacity: 0.6;
  cursor: not-allowed;
}

.vue-select-container:deep(.control input) {
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
}

.vue-select-container:deep(.control input::placeholder) {
  color: var(--color-text-tertiary);
}

.vue-select-container:deep(.control input:disabled) {
  cursor: not-allowed;
}

.vue-select-container:deep(.control .placeholder) {
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.vue-select-container:deep(.control .single-value) {
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.vue-select-container:deep(.control .multi-value) {
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  margin: var(--space-1);
  font-size: 0.75rem;
}

.vue-select-container:deep(.control .multi-value .remove) {
  color: white;
  margin-left: var(--space-1);
  cursor: pointer;
}

.vue-select-container:deep(.control .clear-button) {
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.vue-select-container:deep(.control .clear-button:hover) {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.vue-select-container:deep(.control .dropdown-indicator) {
  color: var(--color-text-tertiary);
  padding: var(--space-1);
  transition: all var(--transition-normal);
}

.vue-select-container:deep(.control.focus .dropdown-indicator) {
  transform: rotate(180deg);
}

.vue-select-container:deep(.menu) {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  margin-top: var(--space-1);
  z-index: 1000;
}

.vue-select-container:deep(.menu .option) {
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.vue-select-container:deep(.menu .option:hover) {
  background-color: var(--color-bg-hover);
}

.vue-select-container:deep(.menu .option.selected) {
  background-color: var(--color-primary);
  color: white;
}

.vue-select-container:deep(.menu .option.focused) {
  background-color: var(--color-bg-hover);
}

.vue-select-container:deep(.menu .option.disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.ui-vue-select--small {
  font-size: 0.75rem;
  min-height: 28px;
}

.ui-vue-select--small:deep(.control) {
  padding: 0 var(--space-2);
  min-height: 28px;
}

.ui-vue-select--medium {
  font-size: 0.875rem;
  min-height: 40px;
}

.ui-vue-select--medium:deep(.control) {
  padding: var(--space-1) var(--space-3);
  min-height: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.ui-vue-select--large {
  font-size: 1rem;
  min-height: 44px;
}

.ui-vue-select--large:deep(.control) {
  padding: var(--space-2) var(--space-4);
  min-height: 44px;
}

/* Error Message */
.vue-select-error {
  font-size: 0.75rem;
  color: var(--color-error);
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .ui-vue-select--large {
    font-size: 0.875rem;
    min-height: 40px;
  }
  
  .ui-vue-select--large:deep(.control) {
    padding: var(--space-2) var(--space-3);
    min-height: 40px;
  }
}
</style> 