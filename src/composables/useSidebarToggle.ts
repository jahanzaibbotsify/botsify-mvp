import { ref, computed, watch, onMounted } from 'vue';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useWindowSize } from '@vueuse/core';

export function useSidebarToggle() {
  const sidebarStore = useSidebarStore();
  const { width } = useWindowSize();
  
  const overlay = ref(false);
  const isMobile = computed(() => width.value < 768);
  
  // Computed properties for better reactivity
  const shouldShowOverlay = computed(() => isMobile.value && sidebarStore.isOpen);
  const sidebarToggleIcon = computed(() => 
    sidebarStore.isOpen ? 'pi-times' : 'pi-bars'
  );

  // Watch screen size changes and manage sidebar state
  watch(isMobile, (newValue, oldValue) => {
    // Only update if the value actually changed
    if (newValue !== oldValue) {
      if (newValue) {
        sidebarStore.closeSidebar();
      } else {
        sidebarStore.openSidebar();
      }
      overlay.value = false;
    }
  });

  // Watch sidebar state to toggle overlay
  watch(() => sidebarStore.isOpen, (isOpen) => {
    if (isMobile.value) {
      overlay.value = isOpen;
    }
  });

  const toggleSidebar = () => {
    try {
      sidebarStore.toggleSidebar();
      if (isMobile.value) {
        overlay.value = sidebarStore.isOpen;
      }
    } catch (error) {
      console.error('Error toggling sidebar:', error);
      // Fallback: ensure overlay is hidden on error
      overlay.value = false;
    }
  };

  const initializeSidebar = () => {
    try {
      if (isMobile.value) {
        sidebarStore.closeSidebar();
      } else {
        sidebarStore.openSidebar();
      }
      overlay.value = false;
    } catch (error) {
      console.error('Error initializing sidebar:', error);
      // Fallback: ensure sidebar is closed on error
      sidebarStore.closeSidebar();
      overlay.value = false;
    }
  };

  // Initialize on mount
  onMounted(() => {
    initializeSidebar();
  });

  return {
    overlay,
    isMobile,
    shouldShowOverlay,
    sidebarToggleIcon,
    toggleSidebar,
    initializeSidebar,
    sidebarStore
  };
}
