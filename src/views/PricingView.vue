<script setup lang="ts">
import PricingPlans from '../components/pricing/PricingPlans.vue';
</script>

<template>
  <div class="pricing-view">
    <div class="pricing-header">
      <h1>Choose Your Plan</h1>
      <p class="subtitle">Select the perfect plan for your needs</p>
    </div>
    
    <PricingPlans />
  </div>
</template>

<style scoped>
.pricing-view {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1.125rem;
}
</style>