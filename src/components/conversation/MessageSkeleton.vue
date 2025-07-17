<template>
  <div class="message-skeleton" :class="{ 'user-message': isUser }">
    <div class="skeleton-avatar" v-if="!isUser">
      <div class="skeleton-circle"></div>
    </div>
    <div class="skeleton-message">
      <div class="skeleton-bubble">
        <div class="skeleton-line" v-for="i in lines" :key="i" :style="{ width: getLineWidth(i) }"></div>
      </div>
      <div class="skeleton-time"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isUser?: boolean
  lines?: number
}

const props = withDefaults(defineProps<Props>(), {
  isUser: false,
  lines: 2
})

const getLineWidth = (lineIndex: number) => {
  // Last line is usually shorter
  if (lineIndex === props.lines) {
    return '60%'
  }
  return '100%'
}
</script>

<style scoped>
.message-skeleton {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--space-3);
  animation: pulse 1.5s ease-in-out infinite;
}

.message-skeleton.user-message {
  flex-direction: row-reverse;
}

.skeleton-avatar {
  margin-right: var(--space-2);
  flex-shrink: 0;
}

.user-message .skeleton-avatar {
  margin-right: 0;
  margin-left: var(--space-2);
}

.skeleton-circle {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, 
    var(--color-bg-tertiary) 25%, 
    var(--color-bg-hover) 50%, 
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-message {
  flex: 1;
  max-width: 70%;
}

.user-message .skeleton-message {
  align-items: flex-end;
}

.skeleton-bubble {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  margin-bottom: var(--space-1);
  border: 1px solid var(--color-border);
}

.user-message .skeleton-bubble {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.skeleton-line {
  height: 12px;
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

.skeleton-line:last-child {
  margin-bottom: 0;
}

.user-message .skeleton-line {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.3) 25%, 
    rgba(255, 255, 255, 0.5) 50%, 
    rgba(255, 255, 255, 0.3) 75%
  );
  background-size: 200% 100%;
}

.skeleton-time {
  height: 10px;
  width: 60px;
  background: linear-gradient(90deg, 
    var(--color-bg-tertiary) 25%, 
    var(--color-bg-hover) 50%, 
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 2s infinite;
  margin-left: var(--space-3);
}

.user-message .skeleton-time {
  margin-left: 0;
  margin-right: var(--space-3);
  align-self: flex-end;
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

/* Responsive */
@media (max-width: 768px) {
  .skeleton-message {
    max-width: 85%;
  }
}
</style> 