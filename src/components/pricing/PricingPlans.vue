<script setup lang="ts">
import { ref } from 'vue';
import type { PricingTier } from '../../types';

const plans = ref<PricingTier[]>([
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '50 messages per day',
      'Basic AI responses',
      'File uploads up to 5MB',
      'Community support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 10,
    features: [
      'Unlimited messages',
      'Advanced AI capabilities',
      'File uploads up to 50MB',
      'Priority support',
      'Custom AI training'
    ],
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'SLA guarantee'
    ]
  }
]);
</script>

<template>
  <div class="pricing-plans scrollbar">
    <div class="plans-grid">
      <div 
        v-for="plan in plans" 
        :key="plan.id"
        class="plan-card"
        :class="{ 'popular': plan.isPopular }"
      >
        <div class="plan-header">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="currency">$</span>
            <span class="amount">{{ plan.price }}</span>
            <span class="period">/month</span>
          </div>
        </div>

        <ul class="features-list">
          <li v-for="feature in plan.features" :key="feature">
            {{ feature }}
          </li>
        </ul>

        <button class="select-plan-button" :class="{ 'primary': plan.isPopular }">
          Select {{ plan.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pricing-plans {
  padding: var(--space-6);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
}

.plan-card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  height: fit-content;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.plan-card.popular {
  border-color: var(--color-primary);
  position: relative;
}

.plan-card.popular::before {
  content: 'Most Popular';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.plan-header {
  text-align: center;
  margin-bottom: var(--space-4);
}

.plan-name {
  font-size: 1.25rem;
  margin-bottom: var(--space-2);
}

.plan-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.currency {
  font-size: 1.5rem;
  vertical-align: super;
}

.period {
  font-size: 1rem;
  color: var(--color-text-secondary);
  font-weight: normal;
}

.features-list {
  list-style: none;
  margin: 0;
  padding: 0;
  margin-bottom: var(--space-4);
}

.features-list li {
  padding: var(--space-2) 0;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.features-list li::before {
  content: '✓';
  color: var(--color-success);
  margin-right: var(--space-2);
}

.select-plan-button {
  width: 100%;
  padding: var(--space-3);
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .pricing-plans {
    padding: var(--space-4);
    max-height: calc(100vh - 150px);
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}
</style>