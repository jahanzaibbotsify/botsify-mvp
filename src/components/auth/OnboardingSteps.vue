<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const steps = [
  {
    id: 'signup',
    name: 'Create Account',
    description: 'Sign up for your account',
    icon: 'pi-user-plus'
  },
  {
    id: 'pricing',
    name: 'Choose Plan',
    description: 'Select your subscription',
    icon: 'pi-credit-card'
  },
  {
    id: 'agent-selection',
    name: 'Select Agent',
    description: 'Pick your AI assistant',
    icon: 'pi-users'
  },
  {
    id: 'completed',
    name: 'Get Started',
    description: 'Welcome to Botsify',
    icon: 'pi-check-circle'
  }
]

const currentStepIndex = computed(() => {
  return steps.findIndex(step => step.id === authStore.onboardingStep)
})

const getStepStatus = (stepIndex: number) => {
  if (stepIndex < currentStepIndex.value) return 'completed'
  if (stepIndex === currentStepIndex.value) return 'active'
  return 'pending'
}
</script>

<template>
  <div class="onboarding-steps">
    <div class="steps-container">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="step-item"
        :class="getStepStatus(index)"
      >
        <div class="step-indicator">
          <div class="step-circle">
            <i v-if="getStepStatus(index) === 'completed'" class="pi pi-check"></i>
            <i v-else :class="step.icon"></i>
          </div>
          <div v-if="index < steps.length - 1" class="step-line"></div>
        </div>
        
        <div class="step-content">
          <h4 class="step-name">{{ step.name }}</h4>
          <p class="step-description">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-steps {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.steps-container {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  position: relative;
}

.step-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-3);
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  border: 2px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-tertiary);
  transition: all var(--transition-normal);
  z-index: 1;
  position: relative;
}

.step-item.completed .step-circle {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.step-item.active .step-circle {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 0 0 4px rgba(68, 115, 246, 0.2);
}

.step-line {
  position: absolute;
  top: 24px;
  left: 60px;
  right: -60px;
  height: 2px;
  background: var(--color-border);
  transition: background var(--transition-normal);
}

.step-item.completed .step-line {
  background: var(--color-success);
}

.step-item:last-child .step-line {
  display: none;
}

.step-content {
  flex: 1;
}

.step-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.step-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.step-item.active .step-name {
  color: var(--color-primary);
}

.step-item.completed .step-name {
  color: var(--color-success);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .steps-container {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .step-item {
    flex-direction: row;
    text-align: left;
  }
  
  .step-indicator {
    margin-bottom: 0;
    margin-right: var(--space-3);
  }
  
  .step-circle {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .step-line {
    top: 48px;
    left: 20px;
    right: 20px;
    width: 2px;
    height: var(--space-4);
  }
  
  .step-item:last-child .step-line {
    display: none;
  }
}

@media (max-width: 480px) {
  .step-name {
    font-size: 0.8rem;
  }
  
  .step-description {
    font-size: 0.7rem;
  }
  
  .step-circle {
    width: 36px;
    height: 36px;
    font-size: 0.875rem;
  }
}

/* Dark theme support */
[data-theme="dark"] .step-circle {
  background: var(--color-bg-secondary);
}

[data-theme="dark"] .step-item.active .step-circle {
  box-shadow: 0 0 0 4px rgba(68, 115, 246, 0.3);
}
</style> 