<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  clickable?: boolean
  skeleton?: boolean
  noData?: boolean
  onClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false,
  skeleton: false,
  noData: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const rowClasses = computed(() => {
  return {
    'clickable': props.clickable,
    'skeleton-row': props.skeleton,
    'no-data-row': props.noData
  }
})
</script>

<template>
  <tr :class="rowClasses" @click="handleClick">
    <slot />
  </tr>
</template>

<style scoped>
/* Row styles are handled by the parent Table component */
</style> 