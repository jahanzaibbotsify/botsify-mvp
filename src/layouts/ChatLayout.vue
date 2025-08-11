<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import LeftSidebar from '@/components/sidebar/LeftSidebar.vue';
import { useWindowSize } from '@vueuse/core';
import { useBotStore } from '@/stores/botStore';


const chatStore = useChatStore();
const sidebarStore = useSidebarStore();
const route = useRoute();
const { width } = useWindowSize();
const overlay = ref(false);
const apiKeyStore = useBotStore()

const apiKey = route.params.id as string // the :id from /agent/:id
const isMobile = computed(() => width.value < 768);
const selectedNavigationButton = ref('Agent'); 

// Watch for route changes to set the active chat
watch(() => route.params.id, (newId) => {
  if (newId) {
    chatStore.setActiveChat(newId as string);
  }
}, { immediate: true });

// Close sidebar on mobile when navigating
watch(() => route.path, () => {
  if (isMobile.value) {
    sidebarStore.closeSidebar();
    overlay.value = false;
  }
});

// Watch screen size changes
watch(isMobile, (newValue) => {
  if (newValue) {
    sidebarStore.closeSidebar();
  } else {
    sidebarStore.openSidebar();
  }
  overlay.value = false;
});

// Watch sidebar state to toggle overlay
watch(() => sidebarStore.isOpen, (isOpen) => {
  if (isMobile.value) {
    overlay.value = isOpen;
  }
});

// Initialize sidebar state based on screen size
onMounted(() => {
   if (apiKey) {
    apiKeyStore.setApiKey(apiKey)
  } 
  if (isMobile.value) {
    sidebarStore.closeSidebar();
  } else {
    sidebarStore.openSidebar();
  }
});

const toggleSidebar = () => {
  sidebarStore.toggleSidebar();
  if (isMobile.value) {
    overlay.value = sidebarStore.isOpen;
  }
};
</script>

<template>
  <div class="chat-layout">
    <!-- Overlay for mobile sidebar -->
    <div 
      v-if="overlay" 
      class="sidebar-overlay" 
      @click="toggleSidebar"
    ></div>
    
    <!-- Sidebar toggle button (mobile) -->
    <button 
      v-if="isMobile"
      class="sidebar-toggle icon-button"
      @click="toggleSidebar"
      :class="{ 'shifted': sidebarStore.isOpen }"
      :aria-label="sidebarStore.isOpen ? 'Close sidebar' : 'Open sidebar'"
      :title="sidebarStore.isOpen ? 'Close sidebar' : 'Open sidebar'"
    >
      <svg v-if="!sidebarStore.isOpen" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <!-- Content wrapper that contains both sidebar and main content -->
    <div class="content-wrapper">
      <!-- Left Sidebar -->
      <LeftSidebar 
        :select-button="selectedNavigationButton" 
        :class="{ 'open': sidebarStore.isOpen }"
        @select-button="selectedNavigationButton = $event" 
        />
      <!-- Main Content -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
    
    <!-- Desktop sidebar toggle button - hide sidebar -->
    <button 
      v-if="!isMobile && sidebarStore.isOpen"
      class="desktop-sidebar-toggle icon-button"
      @click="toggleSidebar"
      :aria-label="'Hide sidebar'"
      :title="'Hide sidebar'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    
    <!-- Desktop sidebar toggle button - show sidebar -->
    <button 
      v-if="!isMobile && !sidebarStore.isOpen"
      class="show-sidebar-toggle icon-button"
      @click="toggleSidebar"
      :aria-label="'Show sidebar'"
      :title="'Show sidebar'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
}

.main-content {
  flex: 1;
  height: 100%;
  position: relative;
  overflow-x: hidden;
  background-color: var(--color-bg-primary);
}

/* Desktop layout adjustments */
/* Removed margin-left approach - sidebar now handles its own hide/show */

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-fixed) + 5);
  backdrop-filter: blur(2px);
}

.header-actions {
  position: fixed;
  top: var(--space-3);
  right: var(--space-3);
  z-index: var(--z-fixed);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.sidebar-toggle {
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: var(--z-fixed);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.sidebar-toggle:hover {
  background-color: var(--color-bg-active);
  box-shadow: var(--shadow-md);
}

.sidebar-toggle:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.desktop-sidebar-toggle {
  position: fixed;
  top: 50%;
  left: 210px;
  transform: translateY(-50%);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.desktop-sidebar-toggle:hover {
  background-color: var(--color-bg-active);
  box-shadow: var(--shadow-md);
}

.show-sidebar-toggle {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: var(--z-fixed);
  background-color: var(--color-bg-tertiary);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  width: 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.show-sidebar-toggle:hover {
  background-color: var(--color-bg-active);
  box-shadow: var(--shadow-md);
}

/* Desktop styles */
@media (min-width: 768px) {
  .sidebar-toggle {
    display: none;
  }
  
  .sidebar-toggle.shifted {
    left: calc(280px + var(--space-4));
  }
}

/* Mobile styles */
@media (max-width: 767px) {
  .main-content {
    margin-left: 0 !important;
  }
  
  .sidebar-toggle {
    top: var(--space-3);
    left: var(--space-3);
    width: 44px;
    height: 44px;
    z-index: calc(var(--z-fixed) + 10);
  }
  
  .sidebar-toggle.shifted {
    left: var(--space-3);
  }
  
  .header-actions {
    top: var(--space-3);
    right: var(--space-3);
    z-index: calc(var(--z-fixed) + 10);
  }

  .desktop-sidebar-toggle, .show-sidebar-toggle {
    display: none;
  }
}
</style>