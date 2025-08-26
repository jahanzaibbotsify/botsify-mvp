<template>
  <div class="dropdown-container" :class="containerClass" ref="dropdownRef">
    <!-- Trigger Element -->
    <div class="dropdown-trigger" @click="toggleDropdown" ref="triggerRef">
      <slot name="trigger"></slot>
    </div>

    <!-- Dropdown Content -->
    <Transition name="dropdown">
      <div v-if="isOpen && !usePortal" class="dropdown-content" :class="[`dropdown-content--${position}`, contentClass]">
        <!-- Dropdown Arrow -->
        <div v-if="showArrow" class="dropdown-arrow" :class="`dropdown-arrow--${position}`"></div>
        
        <!-- Dropdown Items -->
        <div class="dropdown-items">
          <slot name="content"></slot>
        </div>
      </div>
    </Transition>
  </div>

  <!-- Portal Dropdown Content -->
  <Teleport v-if="usePortal && isOpen" :to="portalTarget">
    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-content dropdown-content--portal" :class="[`dropdown-content--${position}`, contentClass]" :style="portalStyles">
        <!-- Dropdown Arrow -->
        <div v-if="showArrow" class="dropdown-arrow" :class="`dropdown-arrow--${position}`"></div>
        
        <!-- Dropdown Items -->
        <div class="dropdown-items">
          <slot name="content"></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

interface Props {
  // Dropdown positioning
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  // Whether to show the dropdown arrow
  showArrow?: boolean
  // Custom container class
  containerClass?: string
  // Custom content class
  contentClass?: string
  // Whether to close on outside click
  closeOnOutsideClick?: boolean
  // Whether to close on escape key
  closeOnEscape?: boolean
  // Initial open state
  modelValue?: boolean
  // Whether to render dropdown in portal (useful for overflow containers)
  usePortal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-left',
  showArrow: true,
  closeOnOutsideClick: true,
  closeOnEscape: true,
  modelValue: false,
  usePortal: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'close': []
}>()

const isOpen = ref(props.modelValue)
const dropdownRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLDivElement | null>(null)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

// Watch for internal changes to emit updates
watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (newValue) {
    emit('open')
  } else {
    emit('close')
  }
})

// Calculate portal positioning styles
const portalStyles = computed(() => {
  if (!props.usePortal || !triggerRef.value) return {}
  
  const rect = triggerRef.value.getBoundingClientRect()
  const styles: Record<string, string> = {
    position: 'absolute',
    zIndex: 'var(--z-dropdown)'
  }
  
  // Calculate position based on dropdown position prop, accounting for scroll
  switch (props.position) {
    case 'bottom-left':
      styles.top = `${rect.bottom}px`
      styles.left = `${rect.left}px`
      break
    case 'bottom-right':
      styles.top = `${rect.bottom + 8}px`
      styles.left = `${rect.right - 200}px` // Adjust based on dropdown width
      break
    case 'top-left':
      styles.top = `${rect.top - 8}px`
      styles.left = `${rect.left}px`
      styles.transform = 'translateY(-100%)'
      break
    case 'top-right':
      styles.top = `${rect.top - 8}px`
      styles.left = `${rect.right - 200}px` // Adjust based on dropdown width
      styles.transform = 'translateY(-100%)'
      break
  }
  
  return styles
})

// Find the best portal target - prefer scrollable containers over body
const portalTarget = computed(() => {
  if (!dropdownRef.value) return 'body'
  
  // Try to find a scrollable parent container
  let parent = dropdownRef.value.parentElement
  while (parent && parent !== document.body) {
    const style = window.getComputedStyle(parent)
    const overflow = style.overflow + style.overflowX + style.overflowY
    
    if (overflow.includes('auto') || overflow.includes('scroll')) {
      return parent
    }
    
    parent = parent.parentElement
  }
  
  // Fallback to body if no scrollable container found
  return 'body'
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const openDropdown = () => {
  isOpen.value = true
}

// Handle outside clicks
const handleClickOutside = (event: MouseEvent) => {
  if (!props.closeOnOutsideClick) return
  
  const target = event.target as Node
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    closeDropdown()
  }
}

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.closeOnEscape) return
  
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

// Handle scroll events to update portal positioning
const handleScroll = () => {
  // Force reactivity update for portal positioning
  if (props.usePortal && isOpen.value) {
    // Trigger a reactive update by accessing the computed property
    portalStyles.value
  }
}

// Handle custom close event from dropdown items
const handleCloseEvent = () => {
  closeDropdown()
}

// Expose methods for parent components
defineExpose({
  open: openDropdown,
  close: closeDropdown,
  toggle: toggleDropdown,
  isOpen: () => isOpen.value
})

onMounted(() => {
  if (props.closeOnOutsideClick) {
    document.addEventListener('click', handleClickOutside)
  }
  
  if (props.closeOnEscape) {
    document.addEventListener('keydown', handleKeydown)
  }
  
  // Add scroll listener for portal positioning
  if (props.usePortal) {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
  }
  
  // Add listener for custom close event from dropdown items
  if (dropdownRef.value) {
    dropdownRef.value.addEventListener('close-dropdown', handleCloseEvent)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  
  // Remove scroll listener
  if (props.usePortal) {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleScroll)
  }
  
  // Remove custom close event listener
  if (dropdownRef.value) {
    dropdownRef.value.removeEventListener('close-dropdown', handleCloseEvent)
  }
})
</script>

<style scoped>
.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  cursor: pointer;
  user-select: none;
}

.dropdown-content {
  position: absolute;
  z-index: var(--z-dropdown);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  min-width: 200px;
  max-width: 350px;
}

/* Position variants */
.dropdown-content--bottom-left {
  top: 100%;
  left: 0;
  margin-top: var(--space-2);
}

.dropdown-content--bottom-right {
  top: 100%;
  right: 0;
  margin-top: var(--space-2);
}

.dropdown-content--top-left {
  bottom: 100%;
  left: 0;
  margin-bottom: var(--space-2);
}

.dropdown-content--top-right {
  bottom: 100%;
  right: 0;
  margin-bottom: var(--space-2);
}

/* Dropdown arrow */
.dropdown-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.dropdown-arrow--bottom-left,
.dropdown-arrow--bottom-right {
  top: -8px;
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent var(--color-bg-primary) transparent;
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.1));
}

.dropdown-arrow--top-left,
.dropdown-arrow--top-right {
  bottom: -8px;
  border-width: 8px 8px 0 8px;
  border-color: var(--color-bg-primary) transparent transparent transparent;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.dropdown-arrow--bottom-left,
.dropdown-arrow--top-left {
  left: 16px;
}

.dropdown-arrow--bottom-right,
.dropdown-arrow--top-right {
  right: 16px;
}

.dropdown-items {
  padding: var(--space-2) 0;
}

/* Portal dropdown styles */
.dropdown-content--portal {
  position: absolute;
  z-index: var(--z-dropdown);
}

/* Transition animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Dark theme support */
[data-theme="dark"] .dropdown-content {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .dropdown-arrow--bottom-left,
[data-theme="dark"] .dropdown-arrow--bottom-right {
  border-bottom-color: var(--color-bg-secondary);
}

[data-theme="dark"] .dropdown-arrow--top-left,
[data-theme="dark"] .dropdown-arrow--top-right {
  border-top-color: var(--color-bg-secondary);
}
</style>
