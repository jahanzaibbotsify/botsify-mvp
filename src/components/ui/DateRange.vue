<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: { start: string; end: string };
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  success?: boolean;
  format?: string;
  separator?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ start: '', end: '' }),
  size: 'medium',
  disabled: false,
  readonly: false,
  required: false,
  success: false,
  format: 'YYYY-MM-DD',
  separator: 'to'
});

const emit = defineEmits<{
  'update:modelValue': [value: { start: string; end: string }];
  'change': [value: { start: string; end: string }];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
}>();

const dateRangeClasses = computed(() => {
  const classes = [
    'ui-date-range',
    `ui-date-range--${props.size}`,
    {
      'ui-date-range--error': props.error,
      'ui-date-range--success': props.success,
      'ui-date-range--disabled': props.disabled,
      'ui-date-range--readonly': props.readonly
    }
  ];
  
  return classes;
});

const handleStartChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = { ...props.modelValue, start: target.value };
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleEndChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = { ...props.modelValue, end: target.value };
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>

<template>
  <div class="date-range-wrapper">
    <!-- Label -->
    <label v-if="label" class="date-range-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <!-- Date Range Container -->
    <div class="date-range-container" :class="dateRangeClasses">
      <!-- Start Date Input -->
      <div class="date-input-group">
        <input
          type="date"
          :value="modelValue.start"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          class="date-input"
          @input="handleStartChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </div>
      
      <!-- Separator -->
      <div class="date-separator">
        {{ separator }}
      </div>
      
      <!-- End Date Input -->
      <div class="date-input-group">
        <input
          type="date"
          :value="modelValue.end"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          class="date-input"
          @input="handleEndChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="date-range-error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.date-range-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.date-range-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.required-mark {
  color: var(--color-error);
  margin-left: var(--space-1);
}

.date-range-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  overflow: hidden;
}

.date-range-container:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.1);
}

.date-range-container.ui-date-range--error {
  border-color: var(--color-error);
}

.date-range-container.ui-date-range--error:focus-within {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.date-range-container.ui-date-range--success {
  border-color: var(--color-success);
}

.date-range-container.ui-date-range--success:focus-within {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.date-range-container.ui-date-range--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.date-input-group {
  flex: 1;
  position: relative;
}

.date-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  padding: 0;
  cursor: pointer;
}

.date-input::placeholder {
  color: var(--color-text-tertiary);
}

.date-input:disabled {
  cursor: not-allowed;
}

.date-separator {
  color: var(--color-text-tertiary);
  font-size: 0.875em;
  font-weight: 500;
  padding: 0 var(--space-2);
  white-space: nowrap;
}

/* Sizes */
.ui-date-range--small {
  font-size: 0.75rem;
  min-height: 28px;
}

.ui-date-range--small .date-input {
  padding: var(--space-1) var(--space-2);
}

.ui-date-range--medium {
  font-size: 0.875rem;
  min-height: 36px;
}

.ui-date-range--medium .date-input {
  padding: var(--space-2) var(--space-3);
}

.ui-date-range--large {
  font-size: 1rem;
  min-height: 44px;
}

.ui-date-range--large .date-input {
  padding: var(--space-3) var(--space-4);
}

/* Error Message */
.date-range-error {
  font-size: 0.75rem;
  color: var(--color-error);
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .date-range-container {
    flex-direction: column;
    gap: var(--space-1);
  }
  
  .date-separator {
    padding: var(--space-1) 0;
  }
  
  .ui-date-range--large {
    font-size: 0.875rem;
    min-height: 40px;
  }
  
  .ui-date-range--large .date-input {
    padding: var(--space-2) var(--space-3);
  }
}
</style>
