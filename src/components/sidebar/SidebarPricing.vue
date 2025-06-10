<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToPricing = () => {
  router.push('/pricing');
};
</script>

<template>
  <div class="sidebar-pricing">
      <button class="pricing-button" @click="navigateToPricing">
        <div class="button-content">
          <span class="pricing-text">Pricing Plans</span>
          <span class="pricing-star">★</span>
        </div>
      </button>
  </div>
</template>

<style scoped>
.sidebar-pricing {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.pricing-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  width: 100%;
}

.button-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: center;
}

.pricing-button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.pricing-star {
  font-size: 1rem;
  color: #FFD700;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.pricing-card {
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  text-align: center;
}

.plan-name {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--space-1);
}

.plan-price {
  margin-bottom: var(--space-1);
}

.currency {
  font-size: 0.875rem;
  vertical-align: top;
}

.amount {
  font-size: 1.25rem;
  font-weight: 600;
}

.period {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.plan-feature {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.view-plans-button {
  width: 100%;
  background-color: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  padding: var(--space-2);
}

.view-plans-button:hover {
  background-color: var(--color-primary-hover);
}
</style>