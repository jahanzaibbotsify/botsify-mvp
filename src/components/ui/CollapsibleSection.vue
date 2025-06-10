<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  initiallyExpanded?: boolean;
}>();

const isExpanded = ref(props.initiallyExpanded || false);
const contentRef = ref<HTMLElement | null>(null);

const toggle = () => {
  isExpanded.value = !isExpanded.value;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggle();
  }
};
</script>

<template>
  <div class="collapsible-section">
    <button
      class="toggle-button"
      @click="toggle"
      @keydown="handleKeydown"
      :aria-expanded="isExpanded"
      :aria-controls="'content-' + title.toLowerCase().replace(/\s+/g, '-')"
    >
      <span class="toggle-icon" :class="{ expanded: isExpanded }">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
      <span class="toggle-title">{{ title }}</span>
    </button>

    <div
      :id="'content-' + title.toLowerCase().replace(/\s+/g, '-')"
      class="content"
      :class="{ expanded: isExpanded }"
      ref="contentRef"
      role="region"
      :aria-hidden="!isExpanded"
    >
      <div class="content-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collapsible-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.toggle-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-bg-secondary);
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-normal);
}

.toggle-button:hover {
  background-color: var(--color-bg-hover);
}

.toggle-button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.toggle-icon {
  display: flex;
  align-items: center;
  transition: transform var(--transition-normal);
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.toggle-title {
  font-weight: 500;
  color: var(--color-text-primary);
}

.content {
  height: 0;
  overflow: hidden;
  transition: height var(--transition-normal);
}

.content.expanded {
  height: auto;
}

.content-inner {
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
}
</style>