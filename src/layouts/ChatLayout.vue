<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {useRoute} from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import LeftSidebar from '@/components/sidebar/LeftSidebar.vue';
import { useSidebarToggle } from '@/composables/useSidebarToggle';
import { useBotStore } from '@/stores/botStore';
import { getBotData } from '@/utils/getBotData';

const botStore = useBotStore();
const chatStore = useChatStore();
const route = useRoute();
const selectedNavigationButton = ref('Agent');

// Use the sidebar toggle composable
const {
  isMobile,
  shouldShowOverlay,
  sidebarToggleIcon,
  toggleSidebar,
  initializeSidebar,
  sidebarStore
} = useSidebarToggle();

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
  }
});

// Initialize sidebar state based on screen size
onMounted(async () => {
  await getBotData();
  initializeSidebar()
});
</script>

<template>
  <div v-if="botStore.isLoading" class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <span>Loading...</span>
    </div>
  </div>
  <div v-else>
  <div class="chat-layout">
    <!-- Overlay for mobile sidebar -->
    <div 
      v-if="shouldShowOverlay" 
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
      <i :class="sidebarToggleIcon" style="font-size: 20px;"></i>
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
    
    <!-- Desktop sidebar toggle buttons -->
    <button 
      v-if="!isMobile && sidebarStore.isOpen"
      class="desktop-sidebar-toggle icon-button"
      @click="toggleSidebar"
      :aria-label="'Hide sidebar'"
      :title="'Hide sidebar'"
    >
      <i class="pi pi-angle-left" style="font-size: 16px;"></i>
    </button>
    
    <button 
      v-if="!isMobile && !sidebarStore.isOpen"
      class="show-sidebar-toggle icon-button"
      @click="toggleSidebar"
      :aria-label="'Show sidebar'"
      :title="'Show sidebar'"
    >
      <i class="pi pi-angle-right" style="font-size: 16px;"></i>
    </button>
  </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.chat-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
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
  background-color: var(--color-bg-primary);
}

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

  .desktop-sidebar-toggle, .show-sidebar-toggle {
    display: none;
  }
}
</style>