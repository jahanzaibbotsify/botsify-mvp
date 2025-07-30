<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { PricingPlan } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

const selectedPlanId = ref<string | null>(null)
const billingCycle = ref<'monthly' | 'annually'>('monthly')

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

const bookPlatformTour = () => {
  // Mock function for booking platform tour
  window.$toast?.success('Platform tour booking requested!')
  console.log('Book platform tour requested')
}

const bookDemo = () => {
  // Mock function for booking demo
  window.$toast?.success('Demo booking requested!')
  console.log('Book demo requested')
}

// Testimonials carousel functionality
const currentTestimonialIndex = ref(0)

const testimonials = ref([
  {
    name: "Troy Chartier",
    title: "CEO Premium Rentals",
    avatar: "/images/testimonials/tory.webp",
    quote: "Our Bot helped save a lot of time in sharing with our customers what apartments we had available and got them to book appointments.",
    metrics: [
      {
        type: "conversions",
        label: "More Conversions",
        value: "Increased by 60%",
        icon: "/images/icons/circle1.svg"
      }
    ]
  },
  {
    name: "Bryan Ulatowski",
    title: "CEO Uberoom",
    avatar: "/images/testimonials/bryan.webp",
    quote: "I love your system; your team has made a lot of progress, which is great to see. The web chatbot greatly improves our customer service accuracy and reduces response time, which is essential for our customers.",
    metrics: [
      {
        type: "sales",
        label: "More Sales",
        value: "Increased by 90%",
        icon: "/images/icons/circle2.svg"
      },
      {
        type: "conversions",
        label: "More Conversions",
        value: "Increased by 60%",
        icon: "/images/icons/circle3.svg"
      }
    ]
  },
  {
    name: "Jose Filemon",
    title: "Founder Filemon",
    avatar: "/images/testimonials/jose.webp",
    quote: "Very easy to use. Very complete, I love the option of being able to talk to my clients by video call. Best tool for businesses",
    metrics: [
      {
        type: "sales",
        label: "More Sales",
        value: "Increased by 50%",
        icon: "/images/icons/circle4.svg"
      },
      {
        type: "conversions",
        label: "More Conversions",
        value: "Increased by 70%",
        icon: "/images/icons/circle5.svg"
      }
    ]
  },
  {
    name: "Mar Diaz",
    title: "CEO Diaz Studio",
    avatar: "/images/testimonials/mar.webp",
    quote: "Botsify is an excellent tool to improve and automate the customer service, support, and sales area of any company; the limit for the design of your bot is your imagination.",
    metrics: [
      {
        type: "sales",
        label: "More Sales",
        value: "Increased by 95%",
        icon: "/images/icons/circle2.svg"
      },
      {
        type: "conversions",
        label: "More Conversions",
        value: "Increased by 50%",
        icon: "/images/icons/circle3.svg"
      }
    ]
  },
  {
    name: "David Larson",
    title: "Managing Partner Autobahn",
    avatar: "/images/testimonials/david.webp",
    quote: "I chose Botsify as my customer support automation platform for both the websites and Facebook. I appreciate the direct connection with Usama, who helped me reduce the cost per lead to $4. I instantly.",
    metrics: [
      {
        type: "sales",
        label: "More Sales",
        value: "Increased by 80%",
        icon: "/images/icons/circle4.svg"
      },
      {
        type: "conversions",
        label: "More Conversions",
        value: "Increased by 80%",
        icon: "/images/icons/circle5.svg"
      }
    ]
  },
  {
    name: "Ashfaque Ahmed",
    title: "GM EFU Life",
    avatar: "/images/testimonials/ashfaque.webp",
    quote: "We are satisfied with the performance of the Botsify platform to handle the queries of over two million Facebook community members. One of the best features is an AI-based routing of queries",
    metrics: [
      {
        type: "sales",
        label: "More Sales",
        value: "Increased by 95%",
        icon: "/images/icons/circle4.svg"
      },
      {
        type: "conversions",
        label: "More Conversions",
        value: "Increased by 80%",
        icon: "/images/icons/circle5.svg"
      }
    ]
  },
  {
    name: "Jennifer Ponzi",
    title: "Founder Taond",
    avatar: "/images/testimonials/jennifer.webp",
    quote: "Excellent customer service—very responsive and attempts to satisfy all our needs and requests; the bot is super easy to learn how to use.",
    metrics: [
      {
        type: "sales",
        label: "More Sales",
        value: "Increased by 90%",
        icon: "/images/icons/circle2.svg"
      },
      {
        type: "conversions",
        label: "More Conversions",
        value: "Increased by 65%",
        icon: "/images/icons/circle3.svg"
      }
    ]
  }
])

const currentTestimonial = computed(() => {
  return testimonials.value[currentTestimonialIndex.value]
})

const nextTestimonial = () => {
  currentTestimonialIndex.value = (currentTestimonialIndex.value + 1) % testimonials.value.length
}

const prevTestimonial = () => {
  currentTestimonialIndex.value = currentTestimonialIndex.value === 0 
    ? testimonials.value.length - 1 
    : currentTestimonialIndex.value - 1
}

const goToTestimonial = (index: number) => {
  currentTestimonialIndex.value = index
}

// Auto-rotate testimonials
let testimonialInterval: NodeJS.Timeout | null = null

const startTestimonialRotation = () => {
  testimonialInterval = setInterval(() => {
    nextTestimonial()
  }, 5000) // Change every 5 seconds
}

const stopTestimonialRotation = () => {
  if (testimonialInterval) {
    clearInterval(testimonialInterval)
    testimonialInterval = null
  }
}

// Start rotation on mount
onMounted(() => {
  startTestimonialRotation()
})

onUnmounted(() => {
  stopTestimonialRotation()
})

// FAQ functionality
const activeCategory = ref('general')
const expandedFAQ = ref<number | null>(null)

const faqCategories = ref([
  { id: 'general', name: 'General', icon: 'pi pi-info-circle' },
  { id: 'pricing', name: 'Pricing & Plans', icon: 'pi pi-credit-card' },
  { id: 'technical', name: 'Technical', icon: 'pi pi-cog' },
  { id: 'support', name: 'Support', icon: 'pi pi-headphones' }
])

const faqData = ref([
  {
    category: 'support',
    question: 'What is the difference between Basic & Premium Support?',
    answer: 'The basic personal plan has only included ticket support, but for professional and business plans, you can get a dedicated chatbot developer to develop 1 chatbot for free.'
  },
  {
    category: 'technical',
    question: 'What do you mean by Deployable across all platforms?',
    answer: 'We offer chatbots for a website, Facebook messenger, and SMS so any plan that you choose includes certain perks that can be deployable across any of the 3 platforms'
  },
  {
    category: 'general',
    question: 'What do you mean by Free Training Sessions?',
    answer: 'Our Business plan includes free training sessions that could be in form of ebook guides, videos, and much more. this is a value-added service for businesses and corporations'
  },
  {
    category: 'pricing',
    question: 'Does each add-on charge $199/month?',
    answer: 'It\'s a chat that contains at least one successful interaction between the customer and the chatbot. You will never pay for spam messages'
  },
  {
    category: 'general',
    question: 'Do you send invoices/receipts?',
    answer: 'Of course! Every time a payment is charged, you will get an invoice via email'
  },
  {
    category: 'general',
    question: 'What is your refund policy?',
    answer: 'We make sure to provide you the best platform and best chatbot service you have ever used. If at any point you feel like you no longer want to continue using Botsify you can discontinue. Every time a payment is charged you get an email notification for 3 days. in case you miss it and payment is charged, we don\'t have a refund policy unless you fall under exceptions. learn more about exceptions in our terms of use'
  }
])

const filteredFAQs = computed(() => {
  return faqData.value.filter(faq => faq.category === activeCategory.value)
})

const toggleFAQ = (index: number) => {
  expandedFAQ.value = expandedFAQ.value === index ? null : index
}

const contactSupport = () => {
  // Mock function for contacting support
  window.$toast?.success('Redirecting to support...')
  console.log('Contact support requested')
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
            selected: selectedPlanId === plan.id || (!selectedPlanId && plan.isPopular),
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
              @click="handlePlanSelect(plan)"
              class="plan-button"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading && selectedPlanId === plan.id" class="loading-spinner"></span>
              <template v-else>
                <span class="button-text">
                  Book A Demo
                </span>
                <i class="pi pi-arrow-right button-icon"></i>
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

    <!-- VIP Treatment & Testimonials Section -->
    <div class="vip-testimonials-section">
      <div class="vip-testimonials-container">
        <!-- Section Title -->
        <div class="section-title-wrapper">
          <h2 class="section-title-landing">
            Empowering <span class="highlight-text">Businesses</span> to Treat Their<br>
            Customers like a VIP<span class="dot-accent">.</span>
          </h2>
          <h4 class="section-subtitle">So your millionth customer feels like your first</h4>
        </div>

        <!-- Main Content Grid -->
        <div class="main-content-grid">
          <!-- Left Side - Client Showcase -->
          <div class="clients-side">
            <div class="clients-header">
              <h3 class="clients-title">Trusted by Industry Leaders</h3>
              <p class="clients-subtitle">Join 500+ companies who chose Botsify for their AI automation</p>
            </div>
            
            <div class="clients-showcase">
              <div class="clients-grid-professional">
                <div class="client-card">
                  <img src="/images/brands/zong.webp" alt="Zong" class="client-logo-pro">
                </div>
                <div class="client-card">
                  <img src="/images/brands/met.webp" alt="Met" class="client-logo-pro">
                </div>
                <div class="client-card">
                  <img src="/images/brands/unilever.webp" alt="Unilever" class="client-logo-pro">
                </div>
                <div class="client-card">
                  <img src="/images/brands/unicef.webp" alt="UNICEF" class="client-logo-pro">
                </div>
                <div class="client-card">
                  <img src="/images/brands/jazz.webp" alt="Jazz" class="client-logo-pro">
                </div>
                <div class="client-card">
                  <img src="/images/brands/autobahn.webp" alt="Autobahn" class="client-logo-pro">
                </div>
              </div>
              
              <div class="more-clients">
                <span class="more-text">And many more...</span>
                <div class="additional-logos">
                  <img src="/images/brands/belo.webp" alt="Belo" class="mini-logo">
                  <img src="/images/brands/costi.webp" alt="Costi" class="mini-logo">
                  <img src="/images/brands/pagosa.webp" alt="Pagosa" class="mini-logo">
                  <img src="/images/brands/etrading.webp" alt="E-Trading" class="mini-logo">
                  <img src="/images/brands/tamimimarket.webp" alt="Tamimi Market" class="mini-logo">
                  <img src="/images/brands/ministry.webp" alt="Ministry" class="mini-logo">
                  <img src="/images/brands/world.webp" alt="World" class="mini-logo">
                  <img src="/images/brands/trax.webp" alt="Trax" class="mini-logo">
                </div>
              </div>
            </div>

            <div class="clients-stats">
              <div class="stat-item">
                <span class="stat-number">500+</span>
                <span class="stat-label">Companies</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">2M+</span>
                <span class="stat-label">Conversations</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">95%</span>
                <span class="stat-label">Satisfaction</span>
              </div>
            </div>
          </div>

          <!-- Right Side - Professional Testimonials -->
          <div class="testimonials-side">
            <div class="testimonials-header">
              <h3 class="testimonials-title">What Our Customers Say</h3>
              <p class="testimonials-subtitle">Real results from businesses that chose Botsify</p>
            </div>

            <div class="testimonials-carousel-pro">
              <!-- Current Testimonial Card -->
              <div class="testimonial-card-pro" :key="currentTestimonialIndex">
                <div class="testimonial-header-pro">
                  <div class="customer-info">
                    <div class="customer-avatar">
                      <img :src="currentTestimonial.avatar" :alt="currentTestimonial.name" class="avatar-img">
                    </div>
                    <div class="customer-details">
                      <h4 class="customer-name">{{ currentTestimonial.name }}</h4>
                      <p class="customer-role">{{ currentTestimonial.title }}</p>
                    </div>
                  </div>
                  <div class="quote-icon">
                    <i class="pi pi-quote-right"></i>
                  </div>
                </div>

                <div class="testimonial-content-pro">
                  <p class="testimonial-text-pro">{{ currentTestimonial.quote }}</p>
                </div>

                <div class="results-section">
                  <h5 class="results-title">Results Achieved:</h5>
                  <div class="metrics-grid">
                    <div v-for="metric in currentTestimonial.metrics" :key="metric.type" class="metric-card">
                      <div class="metric-icon-wrapper">
                        <img :src="metric.icon" :alt="metric.type" class="metric-icon-pro">
                      </div>
                      <div class="metric-content">
                        <span class="metric-label-pro">{{ metric.label }}</span>
                        <span class="metric-value-pro">{{ metric.value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Professional Navigation -->
              <div class="carousel-controls">
                <button @click="prevTestimonial" class="nav-btn-pro prev-btn-pro">
                  <i class="pi pi-chevron-left"></i>
                </button>
                <div class="carousel-indicators">
                  <div 
                    v-for="(_, index) in testimonials" 
                    :key="index"
                    @click="goToTestimonial(index)"
                    class="indicator"
                    :class="{ active: index === currentTestimonialIndex }"
                  ></div>
                </div>
                <button @click="nextTestimonial" class="nav-btn-pro next-btn-pro">
                  <i class="pi pi-chevron-right"></i>
                </button>
              </div>
            </div>

            <!-- Professional CTA & Trust Section -->
            <div class="cta-trust-section">
              <div class="cta-trust-container">
                <!-- Left Side - CTA Content -->
                <div class="cta-content-pro">
                  <div class="cta-text">
                    <h4 class="cta-title-pro">Ready to See Results Like These?</h4>
                    <p class="cta-description-pro">Join successful companies using Botsify to transform their customer experience</p>
                  </div>
                  <button @click="bookPlatformTour" class="cta-button-main">
                    <span>Book a Platform Tour</span>
                    <i class="pi pi-arrow-right"></i>
                  </button>
                </div>

                <!-- Right Side - Trust Indicators -->
                <div class="trust-indicators">
                  <div class="trust-grid">
                    <div class="trust-badge">
                      <div class="trust-icon-pro">
                        <i class="pi pi-star-fill"></i>
                      </div>
                      <div class="trust-details">
                        <span class="trust-metric">4.5/5 Rating</span>
                        <span class="trust-subtitle">Based on 147+ reviews</span>
                      </div>
                    </div>
                    <div class="trust-badge">
                      <div class="trust-icon-pro">
                        <i class="pi pi-headphones"></i>
                      </div>
                      <div class="trust-details">
                        <span class="trust-metric">24/7 Support</span>
                        <span class="trust-subtitle">2 min response time</span>
                      </div>
                    </div>
                    <div class="trust-badge">
                      <div class="trust-icon-pro">
                        <i class="pi pi-shield"></i>
                      </div>
                      <div class="trust-details">
                        <span class="trust-metric">Enterprise Ready</span>
                        <span class="trust-subtitle">SOC 2 compliant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Professional FAQ Section -->
    <div class="faq-section-pro">
      <div class="faq-container-pro">
        <!-- FAQ Header -->
        <div class="faq-header">
          <h2 class="faq-title-pro">Frequently Asked Questions</h2>
          <p class="faq-subtitle">Everything you need to know about Botsify's AI chatbot platform</p>
        </div>

        <!-- FAQ Categories -->
        <div class="faq-categories">
          <div class="faq-category-tabs">
            <button 
              v-for="category in faqCategories" 
              :key="category.id"
              @click="activeCategory = category.id"
              class="category-tab"
              :class="{ active: activeCategory === category.id }"
            >
              <i :class="category.icon"></i>
              <span>{{ category.name }}</span>
            </button>
          </div>
        </div>

        <!-- FAQ Content -->
        <div class="faq-content">
          <div class="faq-list">
            <div 
              v-for="(faq, index) in filteredFAQs" 
              :key="index"
              class="faq-item-pro"
            >
              <button 
                @click="toggleFAQ(index)"
                class="faq-question-btn"
                :class="{ expanded: expandedFAQ === index }"
              >
                <div class="question-content">
                  <div class="question-icon">
                    <i class="pi pi-question-circle"></i>
                  </div>
                  <h3 class="question-text">{{ faq.question }}</h3>
                </div>
                <div class="expand-icon">
                  <i class="pi pi-chevron-down" :class="{ rotated: expandedFAQ === index }"></i>
                </div>
              </button>
              
              <div 
                class="faq-answer-container"
                :class="{ expanded: expandedFAQ === index }"
              >
                                 <div class="faq-answer-content">
                   <p class="faq-answer-text">{{ faq.answer }}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ CTA -->
        <div class="faq-cta">
          <div class="faq-cta-content">
            <h3 class="faq-cta-title">Still have questions?</h3>
            <p class="faq-cta-text">Our support team is here to help you get started with Botsify</p>
            <div class="faq-cta-buttons">
              <button @click="contactSupport" class="faq-support-btn">
                <i class="pi pi-headphones"></i>
                <span>Contact Support</span>
              </button>
              <button @click="bookDemo" class="faq-demo-btn">
                <i class="pi pi-calendar"></i>
                <span>Schedule a Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Final CTA & Publications Section -->
    <div class="final-cta-section-pro">
      <div class="content-wrapper">
        <div class="cta-columns">
          <!-- Left Column - Content -->
          <div class="cta-content-column">
            <div class="side-feature-text">
              <h2 class="feature-headline">
                Automate your customer journey with powerful AI chatbot
              </h2>
              <p class="feature-description">
                Botsify is one of the largest chatbot platforms, established in 2016, and endorsed by
                several media publications as the best platform for building chatbots.
              </p>
              <p class="feature-guarantee">
                Get guaranteed results for your chatbot without our done-for-you plan.
              </p>
              <div class="button-wrap">
                <button @click="bookDemo" class="cta-demo-button">
                  Book a Demo
                </button>
              </div>
              <div class="badges-section">
                <img 
                  src="/images/badges/badges.webp" 
                  alt="Awards and Recognition" 
                  class="badges-image"
                  loading="lazy"
                >
              </div>
            </div>
          </div>
          
          <!-- Right Column - Publications Card -->
          <div class="publications-column">
            <div class="publications-card">
              <div class="publications-header">
                <p class="publications-title">As seen on</p>
              </div>
              
              <div class="publications-grid">
                <div class="publication-item">
                  <img 
                    class="publication-logo" 
                    loading="lazy" 
                    src="/images/publications/npdigital.webp" 
                    alt="NPDigital"
                  >
                </div>
                <div class="publication-item">
                  <img 
                    class="publication-logo" 
                    loading="lazy" 
                    src="/images/publications/forbes.webp" 
                    alt="Forbes"
                  >
                </div>
                <div class="publication-item">
                  <img 
                    class="publication-logo" 
                    loading="lazy" 
                    src="/images/publications/entrepreneur.webp" 
                    alt="Entrepreneur"
                  >
                </div>
                <div class="publication-item">
                  <img 
                    class="publication-logo" 
                    loading="lazy" 
                    src="/images/publications/insider.webp" 
                    alt="Business Insider"
                  >
                </div>
                <div class="publication-item">
                  <img 
                    class="publication-logo" 
                    loading="lazy" 
                    src="/images/publications/hongikat.webp" 
                    alt="Hong Kong IT"
                  >
                </div>
                <div class="publication-item">
                  <img 
                    class="publication-logo" 
                    loading="lazy" 
                    src="/images/publications/venturebeat.webp" 
                    alt="VentureBeat"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
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

/* Selected Plan Card - Beautiful Gradient */
.plan-card.selected {
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%
  );
  background-size: 300% 300%;
  animation: gradientShift 6s ease infinite;
  border: 2px solid transparent;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4), 
              0 10px 20px rgba(245, 87, 108, 0.3);
  transform: translateY(-5px);
  position: relative;
}

.plan-card.selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(255, 255, 255, 0.1) 100%
  );
  border-radius: inherit;
  pointer-events: none;
}

.plan-card.selected:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(102, 126, 234, 0.5), 
              0 15px 30px rgba(245, 87, 108, 0.4);
}

/* Selected Card Content Styling */
.plan-card.selected .plan-title,
.plan-card.selected .plan-subtitle,
.plan-card.selected .feature-item,
.plan-card.selected .price-main,
.plan-card.selected .price-period,
.plan-card.selected .question-text {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.plan-card.selected .plan-pricing {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.plan-card.selected .feature-check {
  background: var(--color-success);;
  color: var(--color-primary);
}

.plan-card.selected .plan-button {
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-primary);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.plan-card.selected .plan-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Selected Badge Enhancement */
.plan-card.selected .plan-badge {
  background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
  background-size: 300% 300%;
  animation: gradientShift 4s ease infinite;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transform: translateX(-50%) translateY(-2px);
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

.annual-pricing {
  margin-top: var(--space-2);
  text-align: center;
}

.annual-price {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 500;
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

/* VIP Testimonials Section */
.vip-testimonials-section {
  padding: var(--space-8) var(--space-6);
  background: white;
}

.vip-testimonials-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-title-wrapper {
  text-align: center;
  margin-bottom: var(--space-8);
}

.section-title-landing {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  line-height: 1.2;
}

.highlight-text {
  color: var(--color-warning, #f39c12);
}

.dot-accent {
  color: var(--color-warning, #f39c12);
}

.section-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  margin: 0;
}

/* Main Content Grid */
.main-content-grid {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: var(--space-8);
  align-items: flex-start;
}

/* Clients Side - Professional Design */
.clients-side {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Clients Header */
.clients-header {
  text-align: center;
  margin-bottom: var(--space-4);
}

.clients-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
  letter-spacing: -0.025em;
}

.clients-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Clients Showcase */
.clients-showcase {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.clients-grid-professional {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.client-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
  min-height: 80px;
}

.client-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.client-logo-pro {
  max-height: 50px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  filter: grayscale(0.3) opacity(0.8);
  transition: all var(--transition-normal);
}

.client-card:hover .client-logo-pro {
  filter: grayscale(0) opacity(1);
  transform: scale(1.05);
}

/* More Clients Section */
.more-clients {
  text-align: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.more-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-bottom: var(--space-3);
  display: block;
}

.additional-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  opacity: 0.6;
}

.mini-logo {
  height: 24px;
  width: auto;
  object-fit: contain;
  filter: grayscale(1);
  transition: all var(--transition-normal);
}

.mini-logo:hover {
  filter: grayscale(0);
  transform: scale(1.1);
}

/* Clients Stats */
.clients-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-top: var(--space-2);
}

.stat-item {
  text-align: center;
  padding: var(--space-4);
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Professional Testimonials Side */
.testimonials-side {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Testimonials Header */
.testimonials-header {
  text-align: center;
  margin-bottom: var(--space-2);
}

.testimonials-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
  letter-spacing: -0.025em;
}

.testimonials-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Professional Carousel */
.testimonials-carousel-pro {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.testimonial-card-pro {
  padding: var(--space-6);
  min-height: 400px;
}

/* Testimonial Header */
.testimonial-header-pro {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.customer-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.customer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.customer-details {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
}

.customer-role {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: 500;
}

.quote-icon {
  color: var(--color-primary);
  font-size: 2rem;
  opacity: 0.3;
}

/* Testimonial Content */
.testimonial-content-pro {
  margin-bottom: var(--space-5);
}

.testimonial-text-pro {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--color-text-primary);
  font-style: italic;
  margin: 0;
  font-weight: 400;
}

/* Results Section */
.results-section {
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
}

.results-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: white;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.metric-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon-pro {
  width: 24px;
  height: 24px;
}

.metric-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.metric-label-pro {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-bottom: 2px;
}

.metric-value-pro {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-success);
}

/* Professional Navigation */
.carousel-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--color-bg-primary);
  border-top: 1px solid var(--color-border);
}

.nav-btn-pro {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  color: var(--color-text-secondary);
}

.nav-btn-pro:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.carousel-indicators {
  display: flex;
  gap: var(--space-2);
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.indicator.active {
  background: var(--color-primary);
  transform: scale(1.2);
}

.indicator:hover:not(.active) {
  background: var(--color-text-secondary);
}

/* Professional CTA & Trust Section */
.cta-trust-section {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.cta-trust-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 180px;
}

/* Left Side - CTA Content */
.cta-content-pro {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}

.cta-text {
  margin-bottom: var(--space-4);
}

.cta-title-pro {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0 0 var(--space-3) 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: white;
}

.cta-description-pro {
  font-size: 0.95rem;
  opacity: 0.95;
  margin: 0;
  line-height: 1.5;
}

.cta-button-main {
  background: white;
  color: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-5);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  align-self: flex-start;
}

.cta-button-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.95);
}

/* Right Side - Trust Indicators */
.trust-indicators {
  background: var(--color-bg-primary);
  padding: var(--space-6);
  display: flex;
  align-items: center;
}

.trust-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal);
}

.trust-badge:hover {
  transform: translateX(4px);
}

.trust-icon-pro {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.trust-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.trust-metric {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
  margin-bottom: 2px;
}

.trust-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

/* Dark Theme Support */
[data-theme="dark"] .cta-trust-section {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .trust-indicators {
  background: var(--color-bg-tertiary);
}

[data-theme="dark"] .trust-badge {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

/* Dark Theme Support - FAQ */
[data-theme="dark"] .faq-section-pro {
  background: var(--color-bg-secondary);
}

[data-theme="dark"] .faq-category-tabs {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .category-tab:hover {
  background: var(--color-bg-tertiary);
}

[data-theme="dark"] .faq-item-pro {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .faq-question-btn:hover,
[data-theme="dark"] .faq-question-btn.expanded {
  background: var(--color-bg-tertiary);
}

[data-theme="dark"] .faq-answer-content {
  border-color: var(--color-border);
}



[data-theme="dark"] .faq-cta {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .faq-demo-btn {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border);
}

[data-theme="dark"] .faq-demo-btn:hover {
  background: var(--color-bg-primary);
}

/* Dark Theme Support - Final CTA & Publications */
[data-theme="dark"] .final-cta-section-pro {
  background: var(--color-bg-secondary);
}

[data-theme="dark"] .publications-card {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

[data-theme="dark"] .publication-item {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border);
}

[data-theme="dark"] .publication-item:hover {
  background: var(--color-bg-primary);
}

/* Decorative Element */
.decorative-element {
  position: relative;
  margin-top: var(--space-4);
  text-align: center;
}

.decoration-img {
  max-width: 60%;
  height: auto;
  opacity: 0.1;
}

/* Professional FAQ Section */
.faq-section-pro {
  padding: var(--space-8) var(--space-6);
  background: var(--color-bg-primary);
}

.faq-container-pro {
  max-width: 1000px;
  margin: 0 auto;
}

/* FAQ Header */
.faq-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.faq-title-pro {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
  letter-spacing: -0.025em;
}

.faq-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* FAQ Categories */
.faq-categories {
  margin-bottom: var(--space-8);
}

.faq-category-tabs {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  background: white;
  padding: var(--space-1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.category-tab {
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
  white-space: nowrap;
}

.category-tab:hover {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.category-tab.active {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.category-tab i {
  font-size: 1rem;
}

/* FAQ Content */
.faq-content {
  margin-bottom: var(--space-8);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.faq-item-pro {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.faq-item-pro:hover {
  box-shadow: var(--shadow-md);
}

.faq-question-btn {
  width: 100%;
  padding: var(--space-5);
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
}

.faq-question-btn:hover {
  background: var(--color-bg-primary);
}

.faq-question-btn.expanded {
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
}

.question-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.question-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.question-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
}

.expand-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: transform var(--transition-normal);
}

.expand-icon i.rotated {
  transform: rotate(180deg);
}

/* FAQ Answer */
.faq-answer-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-normal) ease-out;
}

.faq-answer-container.expanded {
  max-height: 500px;
  transition: max-height var(--transition-normal) ease-in;
}

.faq-answer-content {
  padding: 0 var(--space-5) var(--space-5);
  border-top: 1px solid var(--color-border);
  margin-top: 0;
}

.faq-answer-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: var(--space-4) 0;
}



/* FAQ CTA */
.faq-cta {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.faq-cta-content {
  max-width: 500px;
  margin: 0 auto;
}

.faq-cta-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.faq-cta-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-5) 0;
  line-height: 1.5;
}

.faq-cta-buttons {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.faq-support-btn,
.faq-demo-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--color-border);
  text-decoration: none;
}

.faq-support-btn {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.faq-support-btn:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.faq-demo-btn {
  background: white;
  color: var(--color-text-primary);
}

.faq-demo-btn:hover {
  background: var(--color-bg-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Final CTA & Publications Section */
.final-cta-section-pro {
  padding: var(--space-8) var(--space-6);
  background: var(--color-bg-primary);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.cta-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  align-items: center;
}

/* Left Column - Content */
.cta-content-column {
  padding-left: var(--space-6);
}

.side-feature-text {
  max-width: 500px;
}

.feature-headline {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.feature-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.feature-guarantee {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
  font-weight: 500;
}

.button-wrap {
  margin-bottom: var(--space-6);
}

.cta-demo-button {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-6);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 12px rgba(46, 102, 244, 0.3);
}

.cta-demo-button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 102, 244, 0.4);
}

.badges-section {
  margin-top: var(--space-6);
}

.badges-image {
  max-width: 300px;
  height: auto;
  filter: grayscale(30%) opacity(0.8);
  transition: filter var(--transition-normal);
}

.badges-image:hover {
  filter: grayscale(0%) opacity(1);
}

/* Right Column - Publications Card */
.publications-column {
  position: relative;
  padding: var(--space-6);
}

.random-element-cta {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.bg-element {
  width: 100%;
  height: 66px;
  object-fit: cover;
}

.publications-card {
  position: relative;
  z-index: 2;
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  margin-top: var(--space-4);
}

.publications-header {
  margin-bottom: var(--space-5);
  text-align: center;
}

.publications-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.publications-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

.publication-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
  min-height: 60px;
}

.publication-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background: white;
}

.publication-logo {
  max-width: 100%;
  max-height: 40px;
  height: auto;
  object-fit: contain;
  filter: grayscale(50%) opacity(0.8);
  transition: filter var(--transition-normal);
}

.publication-item:hover .publication-logo {
  filter: grayscale(0%) opacity(1);
}

/* Mobile Responsive for New Sections */
@media (max-width: 768px) {
  .section-title-landing {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .main-content-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .clients-side {
    order: 2;
    padding: var(--space-3);
    gap: var(--space-4);
  }

  .testimonials-side {
    order: 1;
    padding: var(--space-3);
    gap: var(--space-4);
  }

  .testimonials-title {
    font-size: 1.25rem;
  }

  .testimonials-subtitle {
    font-size: 0.8rem;
  }

  .testimonial-card-pro {
    padding: var(--space-4);
    min-height: 350px;
  }

  .testimonial-header-pro {
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
  }

  .customer-info {
    flex-direction: column;
    gap: var(--space-2);
  }

  .customer-avatar {
    width: 80px;
    height: 80px;
  }

  .quote-icon {
    font-size: 1.5rem;
  }

  .testimonial-text-pro {
    font-size: 1rem;
    text-align: center;
  }

  .results-section {
    padding: var(--space-3);
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .metric-card {
    padding: var(--space-2);
  }

  .carousel-controls {
    padding: var(--space-3);
  }

  .nav-btn-pro {
    width: 40px;
    height: 40px;
  }

  .cta-trust-container {
    grid-template-columns: 1fr;
  }

  .cta-content-pro {
    padding: var(--space-4);
    text-align: center;
  }

  .cta-title-pro {
    font-size: 1.2rem;
  }

  .cta-description-pro {
    font-size: 0.85rem;
  }

  .cta-button-main {
    align-self: center;
    padding: var(--space-3) var(--space-4);
    font-size: 0.9rem;
  }

  .trust-indicators {
    padding: var(--space-4);
  }

  .trust-grid {
    gap: var(--space-3);
  }

  .trust-badge {
    padding: var(--space-2);
  }

  .trust-badge:hover {
    transform: none;
  }

  .trust-icon-pro {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .trust-metric {
    font-size: 0.85rem;
  }

  .trust-subtitle {
    font-size: 0.7rem;
  }

  /* FAQ Section Mobile */
  .faq-section-pro {
    padding: var(--space-6) var(--space-4);
  }

  .faq-title-pro {
    font-size: 1.875rem;
  }

  .faq-subtitle {
    font-size: 1rem;
  }

  .faq-category-tabs {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: var(--space-1);
  }

  .category-tab {
    padding: var(--space-2) var(--space-3);
    font-size: 0.8rem;
  }

  .category-tab i {
    font-size: 0.9rem;
  }

  .faq-question-btn {
    padding: var(--space-4);
  }

  .question-icon {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .question-text {
    font-size: 1rem;
  }

  .faq-answer-content {
    padding: 0 var(--space-4) var(--space-4);
  }

  .faq-answer-text {
    font-size: 0.875rem;
  }

  .faq-cta {
    padding: var(--space-4);
  }

  .faq-cta-title {
    font-size: 1.25rem;
  }

  .faq-cta-text {
    font-size: 0.9rem;
  }

  .faq-cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .faq-support-btn,
  .faq-demo-btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }

  /* Final CTA & Publications Section Mobile */
  .cta-columns {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .cta-content-column {
    padding-left: 0;
    text-align: center;
    order: 2;
  }

  .publications-column {
    padding: var(--space-4);
    order: 1;
  }

  .feature-headline {
    font-size: 1.875rem;
  }

  .feature-description,
  .feature-guarantee {
    font-size: 0.9rem;
  }

  .badges-image {
    max-width: 250px;
  }

  .publications-card {
    padding: var(--space-4);
    margin-top: var(--space-3);
  }

  .publication-item {
    min-height: 50px;
    padding: var(--space-2);
  }

  .publication-logo {
    max-height: 30px;
  }

  .clients-title {
    font-size: 1.25rem;
  }

  .clients-subtitle {
    font-size: 0.8rem;
  }

  .clients-showcase {
    padding: var(--space-4);
  }

  .clients-grid-professional {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  .client-card {
    padding: var(--space-3);
    min-height: 70px;
  }

  .client-logo-pro {
    max-height: 40px;
  }

  .additional-logos {
    gap: var(--space-1);
  }

  .mini-logo {
    height: 20px;
  }

  .clients-stats {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .stat-item {
    padding: var(--space-3);
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .faq-title {
    font-size: 2rem;
  }

  .faq-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .faq-item {
    padding: var(--space-4);
  }

  .final-cta-title {
    font-size: 2rem;
  }

  .final-cta-description {
    font-size: 1rem;
  }
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