<script setup lang="ts">
import ApiKeySettings from '../components/settings/ApiKeySettings.vue';
import SystemMessageSender from '../components/chat/SystemMessageSender.vue';
</script>

<template>
  <div class="settings-view scrollbar">
    <div class="settings-header">
      <div class="header-content">
        <h1>Settings</h1>
      </div>
    </div>
    
    <div class="settings-container">
      <div class="settings-section">
        <ApiKeySettings />
      </div>
      
      <div class="settings-section">
        <SystemMessageSender />
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  height: 100%;
  overflow-y: auto;
  padding: var(--space-4);
  background-color: var(--color-bg-primary);
}

.settings-header {
  position: sticky;
  top: 0;
  background-color: var(--color-bg-primary);
  padding: var(--space-2) 0;
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-4) 0;
}

.settings-section {
  margin-bottom: var(--space-6);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

@media (max-width: 767px) {
  .settings-view {
    padding: var(--space-3) var(--space-2);
  }
  
  .settings-header {
    padding: var(--space-2) 0;
    margin-bottom: var(--space-4);
  }
  
  .header-content {
    height: 40px;
    padding: 0 var(--space-3);
  }
  
  .settings-container {
    padding: var(--space-2) 0;
  }
}
</style> 