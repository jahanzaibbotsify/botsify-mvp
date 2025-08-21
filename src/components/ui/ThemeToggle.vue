<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();

const toggleTheme = () => {
  themeStore.setTheme(themeStore.theme === 'light' ? 'dark' : 'light');
};
</script>

<template>
  <button class="theme-toggle icon-button" @click="toggleTheme" :title="themeStore.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'">
    <i v-if="themeStore.theme === 'light'" class="pi pi-moon"></i>
    <i v-else class="pi pi-sun"></i>
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