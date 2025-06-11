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
  background-image: 
    radial-gradient(circle at left top, rgba(0, 163, 255, 0.1), transparent 60%),
    radial-gradient(circle at right bottom, rgba(0, 163, 255, 0.08), transparent 60%);
  min-height: 100vh;
}

.pricing-header {
  text-align: center;
  margin-bottom: var(--space-8);
  position: relative;
}

.pricing-header h1 {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-3);
}

.pricing-header h1::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, rgba(0, 163, 255, 0.8), rgba(0, 163, 255, 0.2));
  border-radius: var(--radius-full);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1.125rem;
}
</style>