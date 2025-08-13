<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  success?: boolean;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  disabled: false,
  readonly: false,
  required: false,
  success: false,
  rows: 4,
  showCharCount: false,
  resize: 'vertical'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'input': [event: Event];
  'focus': [event: FocusEvent];
  'blur': [event: FocusEvent];
}>();

const textareaClasses = computed(() => {
  const classes = [
    'ui-textarea',
    `ui-textarea--${props.size}`,
    {
      'ui-textarea--error': props.error,
      'ui-textarea--success': props.success,
      'ui-textarea--disabled': props.disabled,
      'ui-textarea--readonly': props.readonly
    }
  ];
  
  return classes;
});

const charCount = computed(() => props.modelValue?.length || 0);

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  emit('input', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>

<template>
  <div class="textarea-wrapper">
    <!-- Label -->
    <label v-if="label" class="textarea-label" :for="`textarea-${Math.random()}`">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <!-- Textarea Container -->
    <div class="textarea-container" :class="textareaClasses">
      <textarea
        :id="`textarea-${Math.random()}`"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        :maxlength="maxLength"
        :style="{ resize: resize }"
        class="textarea-field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>
      
      <!-- Character Count -->
      <div v-if="showCharCount && maxLength" class="char-count">
        {{ charCount }}/{{ maxLength }}
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="textarea-error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.textarea-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.required-mark {
  color: var(--color-error);
  margin-left: var(--space-1);
}

.textarea-container {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.textarea-container:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.1);
}

.textarea-container.ui-textarea--error {
  border-color: var(--color-error);
}

.textarea-container.ui-textarea--error:focus-within {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.textarea-container.ui-textarea--success {
  border-color: var(--color-success);
}

.textarea-container.ui-textarea--success:focus-within {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.textarea-container.ui-textarea--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.textarea-field {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
}

.textarea-field::placeholder {
  color: var(--color-text-tertiary);
}

.textarea-field:disabled {
  cursor: not-allowed;
}

/* Sizes */
.ui-textarea--small {
  font-size: 0.75rem;
}

.ui-textarea--small .textarea-field {
  padding: var(--space-1) var(--space-2);
  min-height: 80px;
}

.ui-textarea--medium {
  font-size: 0.875rem;
}

.ui-textarea--medium .textarea-field {
  padding: var(--space-2) var(--space-3);
  min-height: 100px;
}

.ui-textarea--large {
  font-size: 1rem;
}

.ui-textarea--large .textarea-field {
  padding: var(--space-3) var(--space-4);
  min-height: 120px;
}

/* Character Count */
.char-count {
  position: absolute;
  bottom: var(--space-1);
  right: var(--space-2);
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  background-color: var(--color-bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  pointer-events: none;
}

/* Error Message */
.textarea-error {
  font-size: 0.75rem;
  color: var(--color-error);
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .ui-textarea--large {
    font-size: 0.875rem;
  }
  
  .ui-textarea--large .textarea-field {
    padding: var(--space-2) var(--space-3);
    min-height: 100px;
  }
}
</style> 