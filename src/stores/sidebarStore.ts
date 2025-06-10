import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  // Initialize from localStorage or default to true (shown)
  const isOpen = ref(localStorage.getItem('sidebarOpen') !== 'false')
  
  // Watch for changes in isOpen and update localStorage
  watch(isOpen, (newValue) => {
    localStorage.setItem('sidebarOpen', newValue.toString())
  })

  function toggleSidebar() {
    isOpen.value = !isOpen.value
  }
  
  function openSidebar() {
    isOpen.value = true
  }
  
  function closeSidebar() {
    isOpen.value = false
  }

  return {
    isOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar
  }
})