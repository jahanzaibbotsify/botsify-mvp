<script setup lang="ts">
// import { computed } from 'vue';
// import { useChatStore } from '../../stores/chatStore';
// import CodeViewer from '../code/CodeViewer.vue';

// const chatStore = useChatStore();

// Placeholder for code snippet - this can be implemented later when needed
// const codeSnippet = computed(() => null);

const closeRightSidebar = () => {
  // Placeholder - this can be implemented later when needed
  console.log('Close right sidebar clicked');
};
</script>

<template>
  <aside class="right-sidebar scrollbar">
    <div class="sidebar-header">
      <h3>Code Snippets</h3>
      <button class="icon-button close-button" @click="closeRightSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="sidebar-content">
      <!-- Placeholder for future code snippet functionality -->
      <div class="no-code">
        <p>Code snippets feature coming soon</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.right-sidebar {
  width: 400px;
  height: 100%;
  background-color: var(--color-bg-secondary);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: transform var(--transition-slow);
  position: relative;
}

.sidebar-header {
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-header h3 {
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
}

.sidebar-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.no-code {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
}

/* Mobile/tablet adjustments */
@media (max-width: 1023px) {
  .right-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: var(--z-fixed);
    transform: translateX(100%);
    box-shadow: var(--shadow-lg);
  }

  .right-sidebar.open {
    transform: translateX(0);
  }
}
</style>