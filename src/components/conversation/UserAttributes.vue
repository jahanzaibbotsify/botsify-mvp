<template>
  <div class="user-attributes-content">
    <div class="attributes-header">
      <div class="attributes-title">
        <span class="title-line"></span>
        <h3 class="attributes-heading">User Attributes</h3>
        <span class="title-line"></span>
      </div>
    </div>
    
    <div class="attributes-list">
      <div class="attribute-item">
        <span class="attribute-tag">referrer_domain</span>
        <span class="attribute-value">csv</span>
      </div>
      <div class="attribute-item">
        <span class="attribute-tag">session_id</span>
        <span class="attribute-value">sess_1234567890abcdef</span>
      </div>
      <div class="attribute-item">
        <span class="attribute-tag">ip_address</span>
        <span class="attribute-value">192.168.1.100</span>
      </div>
      <div class="attribute-item">
        <span class="attribute-tag">language</span>
        <span class="attribute-value">en-US</span>
      </div>
      <div class="attribute-item">
        <span class="attribute-tag">timezone</span>
        <span class="attribute-value">America/New_York</span>
      </div>
      <div class="attribute-item">
        <span class="attribute-tag">screen_resolution</span>
        <span class="attribute-value">1920x1080</span>
      </div>
      <div class="attribute-item">
        <span class="attribute-tag">device_type</span>
        <span class="attribute-value">desktop</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This component currently uses static data
// In the future, it can accept user attributes as props
</script>

<style scoped>
.user-attributes-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.attributes-header {
  margin-bottom: var(--space-4);
}

.attributes-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.title-line {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    var(--color-border) 0,
    var(--color-border) 4px,
    transparent 4px,
    transparent 8px
  );
}

.attributes-heading {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
}

.attributes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
}

.attribute-tag {
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.attribute-value {
  color: var(--color-text-primary);
  font-size: 0.875rem;
  word-break: break-word;
  flex: 1;
}
</style> 