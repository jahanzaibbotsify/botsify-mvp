<script setup lang="ts">
import { useThemeStore } from '../../stores/themeStore';

const themeStore = useThemeStore();

const toggleTheme = () => {
  themeStore.setTheme(themeStore.theme === 'light' ? 'dark' : 'light');
};
</script>

<template>
  <button class="theme-toggle icon-button" @click="toggleTheme" :title="themeStore.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'">
    <svg v-if="themeStore.theme === 'light'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 163, 255, 0.05);
  border: 1px solid rgba(0, 163, 255, 0.08);
  background-image: radial-gradient(circle at center, rgba(0, 163, 255, 0.05), transparent 70%);
}

.theme-toggle:hover {
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 163, 255, 0.1);
  background-image: radial-gradient(circle at center, rgba(0, 163, 255, 0.1), transparent 70%);
}

.theme-toggle:active {
  transform: translateY(0);
}
</style>