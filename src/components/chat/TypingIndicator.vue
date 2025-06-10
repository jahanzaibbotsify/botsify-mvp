<script setup lang="ts">

</script>

<template>
  <div class="typing-container">
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="typing-text">AI is typing...</div>
  </div>
</template>

<style scoped>
.typing-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: var(--space-2) 0;
  padding: var(--space-2) var(--space-3);
  max-width: 100px;
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-tertiary);
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 1px;
  background-color: var(--color-text-secondary);
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.typing-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

@keyframes typing {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}
</style>