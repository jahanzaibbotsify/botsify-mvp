<script setup lang="ts">
import SystemMessageSender from '@/components/chat/SystemMessageSender.vue';
import ConfigurationTester from '@/components/chat/ConfigurationTester.vue';
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
        <SystemMessageSender />
      </div>
      
      <div class="settings-section">
        <ConfigurationTester />
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
  background-image: 
    radial-gradient(circle at left top, rgba(0, 163, 255, 0.08), transparent 60%),
    radial-gradient(circle at right bottom, rgba(0, 163, 255, 0.05), transparent 60%);
}

.settings-header {
  position: sticky;
  top: 0;
  background-color: var(--color-bg-primary);
  padding: var(--space-2) 0;
  margin-bottom: var(--space-6);
  border-bottom: 1px solid rgba(0, 163, 255, 0.1);
  z-index: 10;
  background-image: linear-gradient(to bottom, var(--color-bg-primary), rgba(0, 163, 255, 0.01), var(--color-bg-primary));
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
  box-shadow: 0 4px 15px rgba(0, 163, 255, 0.06);
  border: 1px solid rgba(0, 163, 255, 0.1);
  background-image: 
    radial-gradient(circle at left top, rgba(0, 163, 255, 0.03), transparent 50%),
    radial-gradient(circle at right bottom, rgba(0, 163, 255, 0.02), transparent 50%);
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