<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { PricingPlan } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

const selectedPlanId = ref<string | null>(null)

// Show all plans
const allPlans = computed(() => {
  return authStore.pricingPlans
})

// Calculate yearly savings
const getYearlySavings = (monthlyPrice: number) => {
  const yearlyPrice = monthlyPrice * 12 * 0.8 // 20% discount
  const savings = (monthlyPrice * 12) - yearlyPrice
  return Math.round(savings)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(price)
}

const handlePlanSelect = async (plan: PricingPlan) => {
  selectedPlanId.value = plan.id
  
  const success = await authStore.selectPlan(plan)
  
  if (success) {
    window.$toast?.success(`${plan.name} plan selected successfully!`)
    router.push('/select-agent')
  } else {
    window.$toast?.error('Failed to select plan. Please try again.')
    selectedPlanId.value = null
  }
}

const skipForNow = () => {
  // Select free plan and continue
  const freePlan = authStore.pricingPlans.find(plan => plan.id === 'free')
  if (freePlan) {
    handlePlanSelect(freePlan)
  }
}
</script>

<template>
  <div class="pricing-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <i class="pi pi-sparkle"></i>
          <span>Choose Your Plan</span>
        </div>
        <h1 class="hero-title">Scale Your AI Experience</h1>
        <p class="hero-subtitle">
          From free exploration to enterprise-grade solutions, find the perfect plan for your AI journey
        </p>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="authStore.error" class="error-alert">
      <div class="error-content">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ authStore.error }}</span>
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="pricing-container">
      <div class="pricing-grid">
        <div
          v-for="(plan, index) in allPlans"
          :key="plan.id"
          class="plan-card"
          :class="{ 
            popular: plan.isPopular,
            free: plan.price === 0,
            enterprise: plan.id === 'enterprise',
            selected: selectedPlanId === plan.id,
            loading: authStore.isLoading && selectedPlanId === plan.id
          }"
          :style="{ '--card-delay': index * 0.1 + 's' }"
        >
          <!-- Popular Badge -->
          <div v-if="plan.isPopular" class="plan-badge">
            <span>Most Popular</span>
          </div>

          <!-- Plan Header -->
          <div class="plan-header">
            <h3 class="plan-title">{{ plan.name }}</h3>
            <p class="plan-subtitle">{{ plan.description }}</p>
          </div>

          <!-- Plan Pricing -->
          <div class="plan-pricing">
            <div v-if="plan.price === 0" class="price-free">
              <span class="price-main">Free</span>
              <span class="price-period">Forever</span>
            </div>
            <div v-else class="price-paid">
              <div class="price-main">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price }}</span>
              </div>
              <span class="price-period">/{{ plan.billing === 'monthly' ? 'month' : 'year' }}</span>
            </div>
            
            <div v-if="plan.discount" class="price-discount">
              <span class="original-price">${{ plan.discount.originalPrice }}/mo</span>
              <span class="discount-badge">{{ plan.discount.percentage }}% OFF</span>
            </div>
          </div>

          <!-- Features -->
          <div class="plan-features">
            <div class="features-header">
              <h4>Everything included:</h4>
            </div>
            <ul class="features-list">
              <li v-for="feature in plan.features" :key="feature" class="feature-item">
                <div class="feature-check">
                  <i class="pi pi-check"></i>
                </div>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- Plan Metrics -->
          <div class="plan-metrics">
            <div class="metric">
              <div class="metric-value">
                {{ typeof plan.limits.conversations === 'number' 
                   ? plan.limits.conversations.toLocaleString() 
                   : plan.limits.conversations }}
              </div>
              <div class="metric-label">Conversations</div>
            </div>
            <div class="metric">
              <div class="metric-value">
                {{ typeof plan.limits.agents === 'number' 
                   ? plan.limits.agents 
                   : plan.limits.agents }}
              </div>
              <div class="metric-label">AI Agents</div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="plan-action">
            <button
              @click="handlePlanSelect(plan)"
              class="plan-button"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading && selectedPlanId === plan.id" class="loading-spinner"></span>
              <template v-else>
                <span class="button-text">
                  {{ plan.price === 0 ? 'Start Free' : `Choose ${plan.name}` }}
                </span>
                <i class="pi pi-arrow-right button-icon"></i>
              </template>
            </button>
            
            <div v-if="plan.trialDays" class="trial-info">
              <i class="pi pi-shield"></i>
              <span>{{ plan.trialDays }}-day free trial</span>
            </div>
            <div v-else-if="plan.price > 0" class="trial-info">
              <i class="pi pi-refresh"></i>
              <span>Cancel anytime</span>
            </div>
            <div v-else class="trial-info">
              <i class="pi pi-check"></i>
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="bottom-cta">
      <div class="cta-content">
        <h3>Not sure which plan is right for you?</h3>
        <p>Start with our free plan and upgrade anytime as your needs grow</p>
        <button @click="skipForNow" class="cta-button">
          <i class="pi pi-play"></i>
          <span>Start with Free Plan</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  overflow: scroll !important;
}
/* Global Styles */
.pricing-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: var(--space-8) var(--space-6) var(--space-7);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 180deg,
    #ff0080,
    #7928ca,
    #2afadf,
    #7928ca,
    #ff0080
  );
  filter: blur(60px);
  opacity: 0.6;
  z-index: 0;
}

.hero-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#ffffff20 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.18;
  z-index: 1;
  mix-blend-mode: color-dodge;
  pointer-events: none;
}

.hero-section > * {
  position: relative;
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--space-4);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--space-4);
  line-height: 1.1;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0;
}

/* Error Alert */
.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin: var(--space-6) var(--space-6) 0;
  text-align: center;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-error);
  font-weight: 500;
}

/* Pricing Container */
.pricing-container {
  padding: var(--space-8) var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: var(--space-6);
  align-items: stretch;
}

/* Plan Cards */
.plan-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: slideUp 0.6s ease-out;
  animation-delay: var(--card-delay);
  animation-fill-mode: both;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.plan-card.popular {
  border-color: var(--color-primary);
  box-shadow: 0 4px 6px -1px rgba(68, 115, 246, 0.1), 0 2px 4px -1px rgba(68, 115, 246, 0.06);
}

.plan-card.popular:hover {
  transform: translateY(-8px);
}

/* Plan Badge */
.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

/* Plan Header */
.plan-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.plan-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.plan-subtitle {
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Plan Pricing */
.plan-pricing {
  text-align: center;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.price-free .price-main {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-success);
}

.price-free .price-period {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.price-paid .price-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-1);
  margin-bottom: var(--space-1);
}

.price-paid .currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.price-paid .amount {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.price-paid .price-period {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.price-discount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.original-price {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
}

.discount-badge {
  background: var(--color-success);
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

/* Plan Features */
.plan-features {
  margin-bottom: var(--space-6);
}

.features-header h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.features-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-size: 0.875rem;
  line-height: 1.5;
}

.feature-check {
  width: 20px;
  height: 20px;
  background: var(--color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-check i {
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
}

/* Plan Metrics */
.plan-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.metric {
  text-align: center;
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

/* Plan Action */
.plan-action {
  text-align: center;
  margin-top: auto;
  padding-top: var(--space-4);
}

.plan-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-bottom: var(--space-3);
  min-height: 56px;
}

.plan-button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.plan-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-text {
  font-size: 0.875rem;
}

.button-icon {
  transition: transform var(--transition-normal);
}

.plan-button:hover .button-icon {
  transform: translateX(4px);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.trial-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* Bottom CTA */
.bottom-cta {
  background: white;
  padding: var(--space-8) var(--space-6);
  text-align: center;
  border-top: 1px solid var(--color-border);
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.cta-content p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-text-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.cta-button:hover {
  background: var(--color-text-secondary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .pricing-container {
    padding: var(--space-6) var(--space-4);
  }

  .pricing-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .plan-card {
    padding: var(--space-4);
    min-height: 450px;
  }

  .plan-card.popular {
    transform: none;
  }

  .plan-card.popular:hover {
    transform: translateY(-8px);
  }

  .plan-metrics {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .bottom-cta {
    padding: var(--space-6) var(--space-4);
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-6) var(--space-4);
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .plan-card {
    min-height: 400px;
  }

  .price-paid .amount {
    font-size: 2.5rem;
  }

  .price-free .price-main {
    font-size: 2rem;
  }
}

/* Dark theme support */
[data-theme="dark"] .pricing-view {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

[data-theme="dark"] .plan-card {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .bottom-cta {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}
</style> 