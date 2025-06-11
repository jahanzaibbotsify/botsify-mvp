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
  background-image: linear-gradient(to right, rgba(0, 163, 255, 0.08), transparent 80%);
  border: 1px solid rgba(0, 163, 255, 0.08);
  box-shadow: 0 3px 8px rgba(0, 163, 255, 0.06);
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 1px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
  box-shadow: 0 0 4px rgba(0, 163, 255, 0.3);
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
    box-shadow: 0 0 2px rgba(0, 163, 255, 0.2);
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
    box-shadow: 0 0 6px rgba(0, 163, 255, 0.4);
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
    box-shadow: 0 0 2px rgba(0, 163, 255, 0.2);
  }
}
</style>