<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const query = ref(props.modelValue);

const updateQuery = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  query.value = value;
  emit('update:modelValue', value);
};

const clearSearch = () => {
  query.value = '';
  emit('update:modelValue', '');
};
</script>

<template>
  <div class="search-bar">
    <div class="search-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
    
    <input
      type="text"
      :placeholder="placeholder || 'Search...'"
      :value="query"
      @input="updateQuery"
      class="search-input"
    />
    
    <button 
      v-if="query" 
      class="clear-button" 
      @click="clearSearch"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  position: absolute;
  left: calc(var(--space-4) + var(--space-2));
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input {
  width: 100%;
  padding-left: var(--space-6);
  padding-right: var(--space-6);
  font-size: 0.875rem;
}

.clear-button {
  position: absolute;
  right: calc(var(--space-4) + var(--space-2));
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: var(--space-1);
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-normal);
}

.clear-button:hover {
  color: var(--color-text-primary);
}
</style>