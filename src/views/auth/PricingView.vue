<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import type { PricingPlan } from '@/types/auth'
import {axiosInstance} from "@/utils/axiosInstance.ts";

const authStore = useAuthStore()
const router = useRouter()

const selectedPlanId = ref<string | null>(null)
const billingCycle = ref<'monthly' | 'annually'>('monthly')
const isLoggingOut = ref(false)

// Show all plans with dynamic pricing
const allPlans = computed(() => {
  return authStore.pricingPlans.map(plan => {
    if (billingCycle.value === 'annually' && plan.discount?.yearlyPrice) {
      return {
        ...plan,
        price: Math.round(plan.discount.yearlyPrice / 12),
        billing: 'yearly' as const,
        showAnnualDiscount: true
      }
    }
    return {
      ...plan,
      showAnnualDiscount: false
    }
  })
})

/**
 * Handle plan selection
 * @param plan
 */
const handlePlanSelect = async (plan: PricingPlan) => {
  selectedPlanId.value = plan.id;
  const priceId = plan.prices ? plan.prices[billingCycle.value] : null

  const response = await axiosInstance.get(`v1/stripe/checkout-session/${priceId}`);

  if (response.data.redirect) {
    window.open(response.data.redirect)
  }
}

const bookDemo = () => {
  window.open('https://botsify.com/book-demo', '_blank');
}

/**
 * Handle logout.
 */
const handleLogout = async () => {
  try {
    isLoggingOut.value = true;
    await authStore.logout();
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<template>
  <div class="pricing-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <!-- Header moved inside hero section -->
      <div class="hero-header">
        <div class="header-container">
          <div class="header-left">
            <img src="/images/logos/botsify-logo.webp" alt="Botsify" class="header-logo">
          </div>
          <div class="header-right">
            <button @click="handleLogout" class="logout-button" :disabled="isLoggingOut">
              <span v-if="isLoggingOut" class="loading-spinner"></span>
              <template v-else>
                <i class="pi pi-sign-out"></i>
                <span>Logout</span>
              </template>
            </button>
          </div>
        </div>
      </div>
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

    <!-- Billing Toggle -->
    <div class="billing-toggle-section">
      <div class="billing-toggle-container">
        <div class="billing-toggle">
          <button
            @click="billingCycle = 'monthly'"
            class="billing-btn"
            :class="{ active: billingCycle === 'monthly' }"
          >
            Monthly
          </button>
          <button
            @click="billingCycle = 'annually'"
            class="billing-btn"
            :class="{ active: billingCycle === 'annually' }"
          >
            <span>Annually</span>
            <span class="discount-badge-small">17% OFF</span>
          </button>
        </div>
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
            <div v-if="plan.isContactSales" class="price-contact">
              <span class="price-main">Contact Us</span>
              <span class="price-period">Custom Pricing</span>
            </div>
            <div v-else-if="plan.price === 0" class="price-free">
              <span class="price-main">Free</span>
              <span class="price-period">Forever</span>
            </div>
            <div v-else class="price-paid">
              <div class="price-main">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price }}</span>
              </div>
              <span class="price-period">
                per {{ billingCycle === 'annually' ? 'month' : 'month' }}
                <span v-if="billingCycle === 'annually'" class="billing-note">(billed annually)</span>
              </span>
            </div>
            
            <div v-if="billingCycle === 'annually' && plan.discount?.yearlyPrice && !plan.isContactSales" class="price-discount">
              <span class="annual-savings">${{ plan.discount.yearlyPrice }} (Billed Annually & save 2 months)</span>
              <span class="discount-badge">17% OFF</span>
            </div>
          </div>
           <!-- Action Button (Moved to top) -->
           <div class="plan-action">
            <button
              class="plan-button"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading && selectedPlanId === plan.id" class="loading-spinner"></span>
              <template v-else>
                <div v-if="plan.prices"
                     @click="handlePlanSelect(plan)">
                   <span class="button-text">
                    Subscribe
                  </span>
                </div>
                <div v-else @click="bookDemo">
                  <span class="button-text">
                    Book A Demo
                  </span>
                  <i class="pi pi-arrow-right button-icon"></i>
                </div>
              </template>
            </button>
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Global Styles */
.pricing-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

/* Header Section */
/* Removed standalone header-section background; header now sits inside hero */

.hero-header {
  position: relative;
  z-index: 2;
}

.header-container {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  transition: filter var(--transition-normal);
  display: block;
  max-width: 100%;
}

.header-logo:hover {
  filter: brightness(1) invert(0);
}

.header-right {
  display: flex;
  align-items: center;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  min-height: 44px;
  min-width: 100px;
}

.logout-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.logout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.logout-button i {
  font-size: 1rem;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: var(--space-2) var(--space-6) var(--space-7);
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
  padding: 8px 20px;
  border-radius: 50px;
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #feda75, #d21efa, #d62976, #962fbf, #4f5bd5);
  background-size: 600% 600%;
  animation: gradientShift 6s ease infinite;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--space-4);
  line-height: 1.1;
  color: #384348;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0;
  color: white;
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

/* Billing Toggle */
.billing-toggle-section {
  padding: var(--space-6) var(--space-6) 0;
}

.billing-toggle-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.billing-toggle {
  display: flex;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
  border: 1px solid var(--color-border);
}

.billing-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 120px;
  justify-content: center;
}

.billing-btn.active {
  background: var(--color-primary);
    color: white;
    box-shadow: var(--shadow-sm);
}

.billing-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}

.discount-badge-small {
  background: var(--color-success);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: var(--space-1);
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

.billing-note {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  font-style: italic;
  margin-left: var(--space-1);
}

.price-contact .price-main {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.price-contact .price-period {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.price-discount {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.annual-savings {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-align: center;
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

/* Plan Action */
.plan-action {
  text-align: center;
  margin-bottom: var(--space-4);
  padding-top: var(--space-2);
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: var(--space-3) var(--space-4);
  }

  .header-logo {
    height: 32px;
  }

  .logout-button {
    padding: var(--space-2) var(--space-3);
    font-size: 0.8rem;
  }

  .logout-button span {
    display: none;
  }

  .logout-button i {
    font-size: 1.1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .billing-toggle-section {
    padding: var(--space-4);
  }

  .billing-btn {
    min-width: 100px;
    padding: var(--space-2) var(--space-3);
    font-size: 0.8rem;
  }

  .discount-badge-small {
    font-size: 0.65rem;
    padding: 1px 4px;
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
}

@media (max-width: 480px) {
  .header-container {
    padding: var(--space-2) var(--space-3);
  }

  .header-logo {
    height: 28px;
  }

  .logout-button {
    padding: var(--space-1) var(--space-2);
    min-width: 44px;
    min-height: 44px;
    justify-content: center;
  }

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

[data-theme="dark"] .header-logo {
  filter: brightness(0) invert(1);
}

[data-theme="dark"] .logout-button {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

[data-theme="dark"] .logout-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.35);
}

[data-theme="dark"] .plan-card {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style> 