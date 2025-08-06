<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'primary-outline' | 'success-outline' | 'warning-outline' | 'error-outline';
  size?: 'large' | 'medium' | 'small';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false,
  loading: false,
  iconPosition: 'left'
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  const classes = [
    'ui-button',
    `ui-button--${props.variant}`,
    `ui-button--${props.size}`,
    {
      'ui-button--icon-only': props.iconOnly,
      'ui-button--loading': props.loading,
      'ui-button--disabled': props.disabled
    }
  ];
  
  return classes;
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <div v-if="loading" class="button-spinner">
      <i class="pi pi-spin pi-spinner"></i>
    </div>
    
    <!-- Icon (Left) -->
    <i 
      v-if="icon && !iconOnly && iconPosition === 'left' && !loading" 
      :class="icon"
      class="button-icon button-icon--left"
    ></i>
    
    <!-- Content -->
    <span v-if="!iconOnly && !loading" class="button-content">
      <slot></slot>
    </span>
    
    <!-- Icon (Right) -->
    <i 
      v-if="icon && !iconOnly && iconPosition === 'right' && !loading" 
      :class="icon"
      class="button-icon button-icon--right"
    ></i>
    
    <!-- Icon Only -->
    <i 
      v-if="icon && iconOnly && !loading" 
      :class="icon"
      class="button-icon"
    ></i>
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  user-select: none;
  position: relative;
  overflow: hidden;
}

/* Variants */
.ui-button--primary {
  background-color: var(--color-primary);
  color: white;
}

.ui-button--primary:hover:not(.ui-button--disabled) {
  background-color: var(--color-primary-hover);
}

.ui-button--primary:active:not(.ui-button--disabled) {
  background-color: var(--color-primary-active);
}

.ui-button--success {
  background-color: var(--color-success);
  color: white;
}

.ui-button--success:hover:not(.ui-button--disabled) {
  background-color: var(--color-success-hover, #059669);
}

.ui-button--success:active:not(.ui-button--disabled) {
  background-color: var(--color-success-active, #047857);
}

.ui-button--warning {
  background-color: var(--color-warning);
  color: white;
}

.ui-button--warning:hover:not(.ui-button--disabled) {
  background-color: var(--color-warning-hover, #d97706);
}

.ui-button--warning:active:not(.ui-button--disabled) {
  background-color: var(--color-warning-active, #b45309);
}

.ui-button--error {
  background-color: var(--color-error);
  color: white;
}

.ui-button--error:hover:not(.ui-button--disabled) {
  background-color: var(--color-error-hover);
}

.ui-button--error:active:not(.ui-button--disabled) {
  background-color: var(--color-error-active, #dc2626);
}

.ui-button--secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.ui-button--secondary:hover:not(.ui-button--disabled) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover, var(--color-border));
}

.ui-button--secondary:active:not(.ui-button--disabled) {
  background-color: var(--color-bg-active);
}

.ui-button--primary-outline {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}

.ui-button--primary-outline:hover:not(.ui-button--disabled) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.ui-button--primary-outline:active:not(.ui-button--disabled) {
  background-color: var(--color-primary);
  color: white;
}

.ui-button--success-outline {
  background-color: var(--color-bg-secondary);
  color: var(--color-success);
  border: 1px solid var(--color-border);
}

.ui-button--success-outline:hover:not(.ui-button--disabled) {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.ui-button--success-outline:active:not(.ui-button--disabled) {
  background-color: var(--color-success);
  color: white;
}

.ui-button--warning-outline {
  background-color: var(--color-bg-secondary);
  color: var(--color-warning);
  border: 1px solid var(--color-border);
}

.ui-button--warning-outline:hover:not(.ui-button--disabled) {
  background-color: var(--color-warning);
  border-color: var(--color-warning);
  color: white;
}

.ui-button--warning-outline:active:not(.ui-button--disabled) {
  background-color: var(--color-warning);
  color: white;
}

.ui-button--error-outline {
  background-color: var(--color-bg-secondary);
  color: var(--color-error);
  border: 1px solid var(--color-border);
}

.ui-button--error-outline:hover:not(.ui-button--disabled) {
  background-color: var(--color-error);
  border-color: var(--color-error);
  color: white
}

.ui-button--error-outline:active:not(.ui-button--disabled) {
  background-color: var(--color-error);
  color: white;
}


/* Sizes */
.ui-button--small {
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  min-height: 28px;
}

.ui-button--small.ui-button--icon-only {
  width: 28px;
  height: 28px;
  padding: 0;
}

.ui-button--medium {
  padding: var(--space-2) var(--space-4);
  font-size: 0.875rem;
  min-height: 40px;
}

.ui-button--medium.ui-button--icon-only {
  width: 40px;
  height: 40px;
  padding: 0;
}

.ui-button--large {
  padding: var(--space-3) var(--space-5);
  font-size: 1rem;
  min-height: 44px;
}

.ui-button--large.ui-button--icon-only {
  width: 44px;
  height: 44px;
  padding: 0;
}

/* States */
.ui-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.ui-button--loading {
  cursor: wait;
  pointer-events: none;
}

/* Icon Styles */
.button-icon {
  font-size: 1em;
  line-height: 1;
}

.button-icon--left {
  order: -1;
}

.button-icon--right {
  order: 1;
}

/* Loading Spinner */
.button-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-spinner i {
  font-size: 1em;
}

/* Content */
.button-content {
  line-height: 1;
}

/* Focus States */
.ui-button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .ui-button--large {
    padding: var(--space-2) var(--space-3);
    font-size: 0.875rem;
    min-height: 40px;
  }
  
  .ui-button--large.ui-button--icon-only {
    width: 40px;
    height: 40px;
  }
}
</style> 