<template>
  <div class="conversation-skeleton">
    <div class="skeleton-avatar">
      <div class="skeleton-circle"></div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-time"></div>
      </div>
      <div class="skeleton-preview"></div>
      <div class="skeleton-meta">
        <div class="skeleton-platform"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for skeleton component
</script>

<style scoped>
.conversation-skeleton {
  display: flex;
  align-items: flex-start;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-avatar {
  margin-right: var(--space-3);
  flex-shrink: 0;
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, 
    var(--color-bg-tertiary) 25%, 
    var(--color-bg-hover) 50%, 
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-content {
  flex: 1;
  min-width: 0;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-1);
}

.skeleton-title {
  height: 12px;
  width: 60%;
  background: linear-gradient(90deg, 
    var(--color-bg-tertiary) 25%, 
    var(--color-bg-hover) 50%, 
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 2s infinite;
}

.skeleton-time {
  height: 10px;
  width: 40px;
  background: linear-gradient(90deg, 
    var(--color-bg-tertiary) 25%, 
    var(--color-bg-hover) 50%, 
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 2s infinite;
}

.skeleton-preview {
  height: 10px;
  width: 80%;
  background: linear-gradient(90deg, 
    var(--color-bg-tertiary) 25%, 
    var(--color-bg-hover) 50%, 
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-1);
  animation: shimmer 2s infinite;
}

.skeleton-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-platform {
  height: 8px;
  width: 30px;
  background: linear-gradient(90deg, 
    var(--color-bg-tertiary) 25%, 
    var(--color-bg-hover) 50%, 
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style> 