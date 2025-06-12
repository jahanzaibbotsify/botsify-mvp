<script setup lang="ts">

</script>

<template>
  <div class="typing-message">
    <div class="typing-container">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="typing-text">AI is thinking...</div>
    </div>
  </div>
</template>

<style scoped>
.typing-message {
  display: flex;
  justify-content: flex-start;
  margin: var(--space-3) 0;
  animation: fadeIn 0.3s ease-in-out;
}

.typing-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  max-width: 150px;
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-tertiary);
  background-image: linear-gradient(135deg, rgba(0, 163, 255, 0.1), transparent 80%);
  border: 1px solid rgba(0, 163, 255, 0.15);
  box-shadow: 
    0 4px 12px rgba(0, 163, 255, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.typing-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 163, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 2px;
}

.typing-indicator span {
  height: 10px;
  width: 10px;
  background: linear-gradient(135deg, var(--color-primary), #0084d1);
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
  box-shadow: 
    0 2px 6px rgba(0, 163, 255, 0.3),
    0 0 10px rgba(0, 163, 255, 0.2);
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
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  letter-spacing: 0.5px;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8) translateY(0);
    opacity: 0.5;
    box-shadow: 
      0 1px 3px rgba(0, 163, 255, 0.2),
      0 0 5px rgba(0, 163, 255, 0.1);
  }
  40% {
    transform: scale(1.2) translateY(-8px);
    opacity: 1;
    box-shadow: 
      0 4px 8px rgba(0, 163, 255, 0.4),
      0 0 15px rgba(0, 163, 255, 0.3);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>