<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  noData?: boolean
  skeleton?: boolean
  skeletonType?: 'checkbox' | 'user-info' | 'text' | 'badge' | 'actions'
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  noData: false,
  skeleton: false,
  skeletonType: 'text',
  isLoading: false
})

const cellClasses = computed(() => {
  return {
    'no-data-cell': props.noData,
    [`skeleton-${props.skeletonType}`]: props.skeleton || props.isLoading
  }
})

const shouldShowSkeleton = computed(() => {
  return props.skeleton || props.isLoading
})
</script>

<template>
  <td :class="cellClasses">
    <div v-if="shouldShowSkeleton" class="skeleton-content">
      <div class="skeleton-element"></div>
    </div>
    <slot v-else />
  </td>
</template>

<style scoped>
/* Cell styles are handled by the parent Table component */
td {
  padding: 10px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.skeleton-content {
  display: flex;
  align-items: center;
  padding: 7px;
}

.skeleton-element {
  height: 16px;
  background: linear-gradient(90deg, var(--color-bg-tertiary, #f3f4f6) 25%, var(--color-bg-hover, #e5e7eb) 50%, var(--color-bg-tertiary, #f3f4f6) 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm, 4px);
  width: 100%;
}

.skeleton-badge .skeleton-element {
  height: 24px;
  width: 60px;
}

.skeleton-text .skeleton-element {
  height: 16px;
  width: 100%;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style> 