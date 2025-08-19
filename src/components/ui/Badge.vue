<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
  size?: 'xs' | 'small' | 'medium' | 'large'
  text?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  rounded?: boolean
  outlined?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'small',
  iconPosition: 'left',
  rounded: false,
  outlined: false
})

const badgeClasses = computed(() => {
  const classes = [
    'ui-badge',
    `ui-badge--${props.variant}`,
    `ui-badge--${props.size}`,
    {
      'ui-badge--rounded': props.rounded,
      'ui-badge--outlined': props.outlined,
      'ui-badge--with-icon': props.icon,
      'ui-badge--icon-left': props.icon && props.iconPosition === 'left',
      'ui-badge--icon-right': props.icon && props.iconPosition === 'right'
    }
  ]
  
  return classes
})
</script>

<template>
  <span :class="badgeClasses">
    <!-- Left Icon -->
    <i 
      v-if="icon && iconPosition === 'left'" 
      :class="icon"
      class="badge-icon badge-icon--left"
    ></i>
    
    <!-- Content -->
    <span class="badge-content">
      <slot>{{ text }}</slot>
    </span>
    
    <!-- Right Icon -->
    <i 
      v-if="icon && iconPosition === 'right'" 
      :class="icon"
      class="badge-icon badge-icon--right"
    ></i>
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
  transition: all var(--transition-normal);
  user-select: none;
}

/* Variants */
.ui-badge--primary {
  background-color: var(--color-primary);
  color: white;
}

.ui-badge--primary.ui-badge--outlined {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.ui-badge--success {
  background-color: var(--color-success);
  color: white;
}

.ui-badge--success.ui-badge--outlined {
  background-color: transparent;
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.ui-badge--warning {
  background-color: var(--color-warning);
  color: white;
}

.ui-badge--warning.ui-badge--outlined {
  background-color: transparent;
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
}

.ui-badge--error {
  background-color: var(--color-error);
  color: white;
}

.ui-badge--error.ui-badge--outlined {
  background-color: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.ui-badge--info {
  background-color: var(--color-accent);
  color: white;
}

.ui-badge--info.ui-badge--outlined {
  background-color: transparent;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
}

.ui-badge--secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.ui-badge--secondary.ui-badge--outlined {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* Sizes */
.ui-badge--xs {
  padding: var(--space-1);
  font-size: 0.625rem;
  line-height: 1;
  min-height: 16px;
}

.ui-badge--xs.ui-badge--rounded {
  border-radius: var(--radius-full);
}

.ui-badge--xs:not(.ui-badge--rounded) {
  border-radius: var(--radius-sm);
}

.ui-badge--small {
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  line-height: 1;
  min-height: 20px;
}

.ui-badge--small.ui-badge--rounded {
  border-radius: var(--radius-full);
}

.ui-badge--small:not(.ui-badge--rounded) {
  border-radius: var(--radius-sm);
}

.ui-badge--medium {
  padding: var(--space-2) var(--space-3);
  font-size: 0.875rem;
  line-height: 1;
  min-height: 24px;
}

.ui-badge--medium.ui-badge--rounded {
  border-radius: var(--radius-full);
}

.ui-badge--medium:not(.ui-badge--rounded) {
  border-radius: var(--radius-md);
}

.ui-badge--large {
  padding: var(--space-3) var(--space-4);
  font-size: 1rem;
  line-height: 1;
  min-height: 32px;
}

.ui-badge--large.ui-badge--rounded {
  border-radius: var(--radius-full);
}

.ui-badge--large:not(.ui-badge--rounded) {
  border-radius: var(--radius-lg);
}

/* Icon Styles */
.badge-icon {
  font-size: 1em;
  line-height: 1;
}

.badge-icon--left {
  order: -1;
}

.badge-icon--right {
  order: 1;
}

/* Content */
.badge-content {
  line-height: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .ui-badge--xs {
    padding: var(--space-1);
    font-size: 0.625rem;
    min-height: 16px;
  }
  
  .ui-badge--large {
    padding: var(--space-2) var(--space-3);
    font-size: 0.875rem;
    min-height: 28px;
  }
}
</style> 