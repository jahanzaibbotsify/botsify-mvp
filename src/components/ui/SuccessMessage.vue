<script setup lang="ts">
interface Props {
  title?: string
  message: string
  showIcon?: boolean
  autoClose?: boolean
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Success!',
  showIcon: true,
  autoClose: false,
  duration: 3000
})

const emit = defineEmits<{
  close: []
}>()

// Auto close functionality
if (props.autoClose) {
  setTimeout(() => {
    emit('close')
  }, props.duration)
}
</script>

<template>
  <div class="success-message">
    <div class="success-content">
      <div v-if="props.showIcon" class="success-icon">
        <div class="icon-circle">
          <i class="pi pi-check"></i>
        </div>
        <div class="success-animation">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
        </div>
      </div>
      
      <div class="success-text">
        <h3 v-if="props.title" class="success-title">{{ props.title }}</h3>
        <p class="success-description">{{ props.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-message {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(16, 185, 129, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  animation: slideInUp 0.5s ease-out;
}

.success-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.success-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-circle {
  width: 64px;
  height: 64px;
  background: var(--color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  animation: checkmarkPop 0.6s ease-out 0.2s both;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.success-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: 50%;
  animation: particleExplode 1s ease-out 0.4s both;
}

.particle-1 {
  top: -40px;
  left: -20px;
  animation-delay: 0.4s;
}

.particle-2 {
  top: -20px;
  right: -40px;
  animation-delay: 0.5s;
}

.particle-3 {
  bottom: -40px;
  left: 20px;
  animation-delay: 0.6s;
}

.particle-4 {
  bottom: -20px;
  right: -30px;
  animation-delay: 0.7s;
}

.success-text {
  flex: 1;
  min-width: 0;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-success);
  margin-bottom: var(--space-2);
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.success-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

/* Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes checkmarkPop {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes particleExplode {
  0% {
    opacity: 1;
    transform: scale(0) translate(0, 0);
  }
  50% {
    opacity: 1;
    transform: scale(1) translate(var(--particle-x, 0), var(--particle-y, 0));
  }
  100% {
    opacity: 0;
    transform: scale(0) translate(var(--particle-x, 0), var(--particle-y, 0));
  }
}

.particle-1 {
  --particle-x: -20px;
  --particle-y: -20px;
}

.particle-2 {
  --particle-x: 20px;
  --particle-y: -20px;
}

.particle-3 {
  --particle-x: -20px;
  --particle-y: 20px;
}

.particle-4 {
  --particle-x: 20px;
  --particle-y: 20px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .success-content {
    flex-direction: column;
    text-align: center;
  }
  
  .icon-circle {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }
  
  .success-title {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .success-message {
    padding: var(--space-4);
  }
  
  .icon-circle {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .success-title {
    font-size: 1rem;
  }
  
  .success-description {
    font-size: 0.8rem;
  }
}

/* Dark theme support */
[data-theme="dark"] .success-message {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.15) 0%, 
    rgba(16, 185, 129, 0.08) 100%);
  border-color: rgba(16, 185, 129, 0.3);
}
</style> 