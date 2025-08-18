<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  success?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  searchable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'medium',
  disabled: false,
  readonly: false,
  required: false,
  success: false,
  iconPosition: 'left',
  searchable: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'input': [event: Event];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
  'search': [value: string];
}>();

const inputClasses = computed(() => {
  return [
    'ui-input',
    `ui-input--${props.size}`,
    {
      'ui-input--error': props.error,
      'ui-input--success': props.success,
      'ui-input--disabled': props.disabled,
      'ui-input--readonly': props.readonly,
      'ui-input--with-icon': props.icon,
      'ui-input--with-icon-left': props.searchable && props.iconPosition === 'left',
      'ui-input--with-icon-right': props.searchable && props.iconPosition === 'right',
      'ui-input--searchable': props.searchable
    }
  ];
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  emit('update:modelValue', value);
  emit('input', event);
  
  if (props.searchable) {
    emit('search', value);
  }
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const searchIcon = computed(() => {
  if (props.searchable && !props.icon) {
    return 'pi pi-search';
  }
  return props.icon;
});
</script>

<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label" :for="`input-${Math.random()}`">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="input-container" :class="inputClasses">
      <i 
        v-if="searchIcon && iconPosition === 'left'" 
        :class="searchIcon"
        class="input-icon input-icon--left"
      ></i>
      
      <input
        :id="`input-${Math.random()}`"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        class="input-field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <i 
        v-if="searchIcon && iconPosition === 'right'" 
        :class="searchIcon"
        class="input-icon input-icon--right"
      ></i>
    </div>
    
    <div v-if="error" class="input-error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.required-mark {
  color: var(--color-error);
  /* margin-left: var(--space-1); */
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  min-height: inherit;
}

.input-container:hover {
  border-color: var(--color-border-hover, var(--color-border));
}

.input-container:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.1);
}

.input-container.ui-input--error {
  border-color: var(--color-error);
}

.input-container.ui-input--error:focus-within {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-container.ui-input--success {
  border-color: var(--color-success);
}

.input-container.ui-input--success:focus-within {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-container.ui-input--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  width: 100%;
}

.input-field::placeholder {
  color: var(--color-text-tertiary);
}

.input-field:disabled {
  cursor: not-allowed;
}

/* Sizes */
.ui-input--small {
  font-size: 0.75rem;
  min-height: 28px;
}

.ui-input--small .input-field {
  padding: var(--space-1) var(--space-2);
}

.ui-input--small.ui-input--with-icon-left .input-field {
  padding: var(--space-1) var(--space-5) !important;
}

.ui-input--small.ui-input--with-icon-right .input-field {
  padding-right: 32px;
}

.ui-input--medium {
  font-size: 0.875rem;
  min-height: 40px;
}

.ui-input--medium .input-field {
  padding: var(--space-2) var(--space-3);
}

.ui-input--medium.ui-input--with-icon-left .input-field {
  padding: var(--space-2) var(--space-6) !important;
}

.ui-input--medium.ui-input--with-icon-right .input-field {
  padding-right: 44px;
}

.ui-input--large {
  font-size: 1rem;
  min-height: 44px;
}

.ui-input--large .input-field {
  padding: var(--space-3) var(--space-4);
}

.ui-input--large.ui-input--with-icon-left .input-field {
  padding: var(--space-3) var(--space-7) !important;
}

.ui-input--large.ui-input--with-icon-right .input-field {
  padding-right: 48px;
}

/* Icons */
.input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  font-size: 1em;
  pointer-events: none;
  z-index: 1;
}

.input-icon--left {
  left: var(--space-3);
}

.input-icon--right {
  right: var(--space-3);
}

/* Actions */
.input-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding-right: var(--space-2);
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 0.75rem;
}

.clear-button:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Error Message */
.input-error {
  font-size: 0.75rem;
  color: var(--color-error);
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .ui-input--large {
    font-size: 0.875rem;
    min-height: 40px;
  }
  
  .ui-input--large .input-field {
    padding: var(--space-2) var(--space-3);
  }
  
    .ui-input--large.ui-input--with-icon-left .input-field {
  padding: var(--space-2) var(--space-6) !important;
}
  
  .ui-input--large.ui-input--with-icon-right .input-field {
    padding-right: 40px;
  }
}
</style> 