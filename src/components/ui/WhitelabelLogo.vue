<template>
  <img 
    :src="logoUrl" 
    :alt="companyName"
    :class="['whitelabel-logo', sizeClass]"
    @error="handleImageError"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWhitelabel } from '@/composables/useWhitelabel'

interface Props {
  size?: 'small' | 'medium' | 'large'
  fallbackSrc?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  fallbackSrc: '/logo.png'
})

const { companyName, getLogoUrl } = useWhitelabel()

const logoUrl = computed(() => {
  return getLogoUrl() || props.fallbackSrc
})

const sizeClass = computed(() => {
  return `logo-${props.size}`
})

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img.src !== props.fallbackSrc) {
    img.src = props.fallbackSrc
  }
}
</script>

<style scoped>
.whitelabel-logo {
  object-fit: contain;
  transition: opacity var(--transition-normal);
}

.whitelabel-logo:hover {
  opacity: 0.8;
}

.logo-small {
  height: 24px;
  width: auto;
}

.logo-medium {
  height: 32px;
  width: auto;
}

.logo-large {
  height: 40px;
  width: auto;
}
</style>
