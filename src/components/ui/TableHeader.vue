<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  sortable?: boolean
  sort?: 'asc' | 'desc' | ''
  width?: string
  onClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  sortable: false,
  sort: '',
  width: 'auto',
  onClick: undefined
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.sortable) {
    emit('click')
  }
}

const headerClasses = computed(() => {
  return {
    'sortable': props.sortable,
    'asc': props.sort === 'asc',
    'desc': props.sort === 'desc'
  }
})
</script>

<template>
  <th :class="headerClasses" :style="{ width: props.width }" @click="handleClick">
    <slot />
  </th>
</template>

<style scoped>
/* Header styles are handled by the parent Table component */
th {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  padding: 12px 16px;
  text-align: left;
  background: var(--color-bg-secondary, #f9fafb);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}
</style> 