<template>
    <div v-if="show" class="billing-modal-overlay" @click="handleOverlayClick">
      <div class="billing-modal" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-content">
            <h2>Billing & Subscription</h2>
            <p>Manage your subscription and view billing history</p>
          </div>
          <button class="close-button" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
  
        <!-- Modal Content -->
        <div class="modal-content">
          <!-- Current Subscription Info -->
          <div class="subscription-section">
            <h3>Current Subscription</h3>
            <div class="subscription-card">
              <div class="subscription-header">
                <div class="plan-info">
                  <h4>{{ subscriptionData?.stripe_plan || 'Professional Plan' }}</h4>
                  <p class="plan-description">{{ getPlanDescription(subscriptionData?.stripe_plan) }}</p>
                </div>
                <div class="plan-price">
                  <span class="price-amount">${{ getPlanPrice(subscriptionData?.stripe_plan) }}</span>
                  <span class="price-period">{{ getBillingPeriod(subscriptionData?.stripe_plan) }}</span>
                </div>
              </div>
              
              <div class="subscription-details">
                <div class="detail-item">
                  <span class="label">Status:</span>
                  <span class="value status" :class="subscriptionData?.status">{{ subscriptionData?.status || 'Unknown' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Created:</span>
                  <span class="value">{{ formatDate(subscriptionData?.created_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Last Updated:</span>
                  <span class="value">{{ formatDate(subscriptionData?.updated_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Quantity:</span>
                  <span class="value">{{ subscriptionData?.quantity || 1 }}</span>
                </div>
              </div>
  
              <div class="subscription-actions">
                <button class="action-btn secondary" @click="openChangePlanModal">Change Plan</button>
                <button class="action-btn secondary" @click="openChangePaymentModal">Update Payment</button>
                <button class="action-btn danger" @click="openCancellationModal">Cancel Subscription</button>
              </div>
            </div>
          </div>
  
          <!-- Charges History -->
          <div class="charges-section">
            <div class="section-header">
              <h3>Payment History</h3>
              <button class="download-all-btn" @click="downloadAllChargesHandler">
                <i class="pi pi-download"></i>
                Download All
              </button>
            </div>
            
            <div class="charges-table">
              <div class="table-header">
                <div class="header-cell">Date</div>
                <div class="header-cell">Description</div>
                <div class="header-cell">Amount</div>
                <div class="header-cell">Status</div>
                <div class="header-cell">Actions</div>
              </div>
              
              <div v-if="chargesData.length === 0" class="empty-state">
                <i class="pi pi-credit-card"></i>
                <p>No charges found</p>
                <span>Your payment history will appear here</span>
              </div>
              
              <div v-else class="table-body">
                <div v-for="charge in chargesData" :key="charge.id" class="table-row">
                  <div class="cell">{{ formatDate(charge.created) }}</div>
                  <div class="cell">{{ charge.description || 'Subscription payment' }}</div>
                  <div class="cell">${{ (charge.amount / 100).toFixed(2) }}</div>
                  <div class="cell">
                    <span class="status-badge" :class="charge.status">{{ charge.status }}</span>
                  </div>
                  <div class="cell">
                    <button class="download-btn" @click="downloadChargeReceipt(charge.receipt_url)" title="Download Receipt">
                      <i class="pi pi-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Plan Modal -->
    <div v-if="showChangePlanModal" class="modal-overlay" @click="closeChangePlanModal">
      <div class="sub-modal-content" @click.stop>
        <div class="sub-modal-header">
          <h3>Change Your Plan</h3>
          <button class="close-button" @click="closeChangePlanModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="sub-modal-body">
          <div v-if="!changingPlan">
            <!-- Whitelabel Client Plans -->
            <div v-if="whitelabelStore.isWhitelabelClient">
              <div v-for="(planName, planId) in availableWhitelabelPlans" :key="planId">
                <button 
                  v-show="currentPlanId !== planId" 
                  class="plan-option-btn" 
                  @click="selectPlan(planId)"
                >
                  {{ planName }}
                </button>
              </div>
            </div>
            
            <!-- Regular Client Plans -->
            <div v-else>
              <!-- Personal Plan Monthly to Annual -->
              <button 
                v-show="currentPlanId === 'Personal-Plan'" 
                class="plan-option-btn" 
                @click="selectPlan('Personal-Plan-Annual')"
              >
                Personal Plan - $490/Year
              </button>
              
              <!-- Personal Plan Annual to Monthly -->
              <button 
                v-show="currentPlanId === 'Personal-Plan-Annual'" 
                class="plan-option-btn" 
                @click="selectPlan('Personal-Plan')"
              >
                Personal Plan - $49/Month
              </button>
              
              <!-- Upgrade to Professional Monthly -->
              <button 
                v-show="currentPlanId !== 'Professional-Plan'" 
                class="plan-option-btn" 
                @click="selectPlan('Professional-Plan')"
              >
                Professional Plan - $149/Month
              </button>
              
              <!-- Upgrade to Professional Annual -->
              <button 
                v-show="currentPlanId !== 'Professional-Plan-Annual'" 
                class="plan-option-btn" 
                @click="selectPlan('Professional-Plan-Annual')"
              >
                Professional Plan - $1490/Year
              </button>
              
              <!-- Downgrade Contact Message -->
              <div v-if="!canDowngrade" class="downgrade-message">
                <p>If you want to downgrade your plan, please contact us</p>
                <a 
                  class="contact-btn" 
                  :href="getContactEmail()"
                  target="_blank"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
          
          <div v-else class="loading-state">
            <div class="spinner"></div>
            <p>Processing...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Payment Method Modal -->
    <div v-if="showChangePaymentModal" class="modal-overlay" @click="closeChangePaymentModal">
      <div class="sub-modal-content" @click.stop>
        <div class="sub-modal-header">
          <h3>Update Payment Method</h3>
          <button class="close-button" @click="closeChangePaymentModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="sub-modal-body">
          <form @submit.prevent="updatePaymentMethod">
            <div class="form-group">
              <label for="cardNumber">Card Number</label>
              <input 
                type="text" 
                id="cardNumber" 
                v-model="paymentForm.cardNumber" 
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="expiry">Expiry Date</label>
                <input 
                  type="text" 
                  id="expiry" 
                  v-model="paymentForm.expiry" 
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div class="form-group">
                <label for="cvv">CVV</label>
                <input 
                  type="text" 
                  id="cvv" 
                  v-model="paymentForm.cvv" 
                  placeholder="123"
                  required
                />
              </div>
            </div>
            <div class="form-group">
              <label for="cardName">Name on Card</label>
              <input 
                type="text" 
                id="cardName" 
                v-model="paymentForm.cardName" 
                placeholder="John Doe"
                required
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeChangePaymentModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="updatingPayment">
                <span v-if="updatingPayment">Updating...</span>
                <span v-else>Update Payment Method</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Cancellation Modal -->
    <div v-if="showCancellationModal" class="modal-overlay" @click="closeCancellationModal">
      <div class="sub-modal-content" @click.stop>
        <div class="sub-modal-header">
          <h3>Cancel Subscription</h3>
          <button class="close-button" @click="closeCancellationModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="sub-modal-body">
          <div class="cancellation-reasons">
            <h4>Why are you cancelling?</h4>
            <div class="reasons-list">
              <label v-for="reason in cancellationReasons" :key="reason.key" class="reason-item">
                <input 
                  type="radio" 
                  :value="reason.key" 
                  v-model="selectedCancellationReason"
                  name="cancellationReason"
                />
                <span>{{ reason.label }}</span>
              </label>
            </div>
          </div>
          <div class="cancellation-actions">
            <button type="button" class="btn-secondary" @click="closeCancellationModal">Keep Subscription</button>
            <button 
              type="button" 
              class="btn-danger" 
              @click="confirmCancellation"
              :disabled="!selectedCancellationReason || cancelling"
            >
              <span v-if="cancelling">Cancelling...</span>
              <span v-else>Cancel Subscription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useWhitelabelStore } from '@/stores/whitelabelStore'
  import { botsifyApi } from '@/services/botsifyApi'
  import { STRIPE_API_KEY } from '@/utils/config'
  
  // Declare Stripe as a global variable
  declare global {
    interface Window {
      Stripe: any
    }
  }

  const Stripe = window.Stripe
  
  interface StripeCharge {
    id: string
    amount: number
    currency: string
    created: number
    description: string
    status: string
    receipt_url: string
    payment_method_details: {
      card: {
        brand: string
        last4: string
        exp_month: number
        exp_year: number
      }
    }
  }
  
  interface StripeSubscription {
    id: number
    user_id: number
    name: string
    stripe_id: string
    stripe_plan: string
    quantity: number
    status: string
    trial_ends_at: string | null
    ends_at: string | null
    next_charge_date: string | null
    created_at: string
    updated_at: string
    paddle_cancel_url: string | null
    paddle_update_url: string | null
    paddle_checkout_id: string | null
    subscription_plan_id: string | null
    whitelabel_client: number
  }
  
  interface BillingData {
    charges?: {
      object: string
      data: StripeCharge[]
      has_more: boolean
      url: string
    } | StripeCharge[]
    stripe_subscription?: StripeSubscription
    subscription?: StripeSubscription
  }
  
  interface Props {
    show: boolean
    billingData?: BillingData | null
  }
  
  interface Emits {
    (e: 'close'): void
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  
  // Computed properties
  const chargesData = computed((): StripeCharge[] => {
    console.log('Computing chargesData with billingData:', props.billingData)
    console.log('billingData type:', typeof props.billingData)
    console.log('billingData keys:', props.billingData ? Object.keys(props.billingData) : 'null')
    
    if (!props.billingData) {
      console.log('No billingData provided')
      return []
    }
    
    // Try different possible data structures
    let charges: StripeCharge[] = []
    if (props.billingData.charges) {
      if (Array.isArray(props.billingData.charges)) {
        charges = props.billingData.charges
        console.log('Found charges as direct array:', charges)
      } else if (props.billingData.charges.data && Array.isArray(props.billingData.charges.data)) {
        charges = props.billingData.charges.data
        console.log('Found charges in charges.data:', charges)
      } else {
        console.log('No charges found in expected structure')
      }
    }
    
    console.log('Final chargesData:', charges)
    return charges
  })

  const subscriptionData = computed((): StripeSubscription | null => {
    console.log('Computing subscriptionData with billingData:', props.billingData)
    console.log('billingData type:', typeof props.billingData)
    console.log('billingData keys:', props.billingData ? Object.keys(props.billingData) : 'null')
    
    if (!props.billingData) {
      console.log('No billingData provided')
      return null
    }
    
    // Try different possible data structures
    let subscription: StripeSubscription | null = null
    if (props.billingData.stripe_subscription) {
      subscription = props.billingData.stripe_subscription
      console.log('Found stripe_subscription:', subscription)
    } else if (props.billingData.subscription) {
      subscription = props.billingData.subscription
      console.log('Found subscription (fallback):', subscription)
    } else {
      console.log('No subscription found in expected structure')
    }
    
    console.log('Final subscriptionData:', subscription)
    return subscription
  })
  
  // Modal states
  const showChangePlanModal = ref(false)
  const showChangePaymentModal = ref(false)
  const showCancellationModal = ref(false)
  
  // Form states
  const changingPlan = ref(false)
  const updatingPayment = ref(false)
  const cancelling = ref(false)
  
  // Form data
  const paymentForm = ref({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  })
  
  const selectedCancellationReason = ref('')
  
  const cancellationReasons = ref([
    { key: 'difficult_to_use', label: 'Difficult to use' },
    { key: 'expensive', label: 'Do you think it\'s expensive?' },
    { key: 'dont_need', label: 'Don\'t need it' },
    { key: 'not_achieving_goal', label: 'Not able to achieve your goal?' }
  ])
  
  const currentPlanId = computed(() => {
    return subscriptionData.value?.stripe_plan || ''
  })

  const whitelabelStore = useWhitelabelStore()

  const availableWhitelabelPlans = computed(() => {
    if (whitelabelStore.isWhitelabelClient) {
      return {
        'Personal-Plan': 'Personal Plan - $49/Month',
        'Personal-Plan-Annual': 'Personal Plan - $490/Year',
        'Professional-Plan': 'Professional Plan - $149/Month',
        'Professional-Plan-Annual': 'Professional Plan - $1490/Year'
      }
    }
    return {}
  })

  const canDowngrade = computed(() => {
    if (whitelabelStore.isWhitelabelClient) {
      return false // Whitelabel clients cannot downgrade
    }
    return true
  })

  const getContactEmail = () => {
    return 'mailto:support@botsify.ai'
  }
  
  // Helper functions
  const getPlanDescription = (planName: string | undefined) => {
    if (!planName) return 'Professional plan with advanced features'
    
    if (planName.includes('Professional')) {
      return 'Professional service for scalable businesses with AI agents and advanced features'
    } else if (planName.includes('Personal')) {
      return 'Basic plan for personal use and small businesses'
    } else if (planName.includes('Custom')) {
      return 'Custom enterprise solution with dedicated support'
    }
    
    return 'Professional plan with advanced features'
  }
  
  const getPlanPrice = (planName: string | undefined) => {
    if (!planName) return 149
    
    if (planName.includes('Annual')) {
      return 1490
    } else if (planName.includes('Personal')) {
      return 49
    } else if (planName.includes('Professional')) {
      return 149
    }
    
    return 149
  }
  
  const getBillingPeriod = (planName: string | undefined) => {
    if (!planName) return '/month'
    
    if (planName.includes('Annual')) {
      return '/year'
    }
    
    return '/month'
  }
  
  const closeModal = () => {
    emit('close')
  }
  
  const handleOverlayClick = () => {
    closeModal()
  }
  
  const formatDate = (dateString: string | number | undefined) => {
    if (!dateString) return 'N/A'
    
    let date: Date
    if (typeof dateString === 'number') {
      // Unix timestamp
      date = new Date(dateString * 1000)
    } else {
      // ISO string
      date = new Date(dateString)
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }
  
  const downloadChargeReceipt = (receiptUrl: string) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank')
    } else {
      window.$toast?.error('Receipt not available')
    }
  }
  
  const downloadAllChargesHandler = async () => {
    console.log('Downloading all charges...')
    
    try {
      // Create CSV content for all charges
      const csvContent = generateChargesCSV(chargesData.value)
      downloadCSV(csvContent, 'charges-history.csv')
      window.$toast?.success('Charges history downloaded successfully!')
    } catch (error) {
      console.error('Error downloading charges:', error)
      window.$toast?.error('Failed to download charges history')
    }
  }
  
  const generateChargesCSV = (charges: StripeCharge[]) => {
    const headers = ['Date', 'Description', 'Amount', 'Status', 'Currency']
    const rows = charges.map(charge => [
      formatDate(charge.created),
      charge.description || 'Subscription payment',
      (charge.amount / 100).toFixed(2),
      charge.status,
      charge.currency.toUpperCase()
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
  
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
  
  // Load Stripe script
  const loadStripeScript = (): Promise<void> => {
    if (typeof window.Stripe !== 'undefined') {
      return Promise.resolve()
    }
    
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v2'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Stripe'))
      document.head.appendChild(script)
    })
  }

  // Modal methods
  const openChangePlanModal = () => {
    showChangePlanModal.value = true
  }
  
  const closeChangePlanModal = () => {
    showChangePlanModal.value = false
  }
  
  const openChangePaymentModal = async () => {
    try {
      // Load Stripe script if not already loaded
      await loadStripeScript()
      showChangePaymentModal.value = true
    } catch (error) {
      console.error('Failed to load Stripe:', error)
      window.$toast?.error('Failed to load payment system. Please try again.')
    }
  }
  
  const closeChangePaymentModal = () => {
    showChangePaymentModal.value = false
    // Reset form
    paymentForm.value = {
      cardNumber: '',
      expiry: '',
      cvv: '',
      cardName: ''
    }
  }
  
  const openCancellationModal = () => {
    showCancellationModal.value = true
  }
  
  const closeCancellationModal = () => {
    showCancellationModal.value = false
    selectedCancellationReason.value = ''
  }
  
  // Plan selection
  const selectPlan = async (planId: string) => {
    if (planId === currentPlanId.value) return
    
    changingPlan.value = true
    try {
      // First check payment like in the original billing.vue
      const paymentCheck = await botsifyApi.checkPayment()
      if (!paymentCheck.success) {
        window.$toast?.error('Payment check failed. Please try again later.')
        return
      }
      
      // Call API to change plan using botsifyApi
      const response = await botsifyApi.changePlan({
        plan: planId,
        reason: 'User requested plan change'
      })
      
      if (response.success) {
        window.$toast?.success('Plan changed successfully!')
        closeChangePlanModal()
        // Emit event to refresh billing data
        emit('close')
      } else {
        window.$toast?.error(response.message || 'Failed to change plan')
      }
    } catch (error) {
      console.error('Error changing plan:', error)
      window.$toast?.error('Failed to change plan. Please try again.')
    } finally {
      changingPlan.value = false
    }
  }
  
  // Update payment method
  const updatePaymentMethod = async () => {
    if (paymentForm.value.cardNumber === "" || paymentForm.value.cardName === "" || paymentForm.value.expiry === "" || paymentForm.value.cvv === "") {
      window.$toast?.error('Please fill all card details')
      return
    }
    
    // Check if Stripe is loaded
    if (typeof window.Stripe === 'undefined') {
      window.$toast?.error('Stripe is not loaded. Please refresh the page and try again.')
      return
    }
    
    updatingPayment.value = true
    try {
      // Generate Stripe token like in the original billing.vue
      Stripe.setPublishableKey(STRIPE_API_KEY)
      
      // Parse expiry date (MM/YY format)
      const expiry = paymentForm.value.expiry.split('/')
      const ccData = {
        number: paymentForm.value.cardNumber,
        name: paymentForm.value.cardName,
        cvc: paymentForm.value.cvv,
        exp_month: parseInt(expiry[0]),
        exp_year: parseInt(expiry[1])
      }
      
      // Create Stripe token
      Stripe.card.createToken(ccData, async (status: string, response: any) => {
        if (response.error) {
          updatingPayment.value = false
          window.$toast?.error(response.error.message || 'Card validation failed')
        } else {
          const token = response.id
          
          // Send token to API using botsifyApi
          try {
            const apiResponse = await botsifyApi.updatePaymentMethod({
              token: token,
              plan: currentPlanId.value,
              coupon: '', // No coupon for payment method update
              card: ccData
            })
            
            if (apiResponse.success) {
              window.$toast?.success('Payment method updated successfully!')
              closeChangePaymentModal()
              // Emit event to refresh billing data
              emit('close')
            } else {
              window.$toast?.error(apiResponse.message || 'Failed to update payment method')
            }
          } catch (error) {
            console.error('Error updating payment method:', error)
            window.$toast?.error('Failed to update payment method. Please try again.')
          } finally {
            updatingPayment.value = false
          }
        }
      })
    } catch (error) {
      console.error('Error creating Stripe token:', error)
      window.$toast?.error('Failed to process card details. Please try again.')
      updatingPayment.value = false
    }
  }
  
  // Confirm cancellation
  const confirmCancellation = async () => {
    if (!selectedCancellationReason.value) return
    
    cancelling.value = true
    try {
      // Call API to cancel subscription using botsifyApi
      const response = await botsifyApi.cancelSubscription({
        reason: selectedCancellationReason.value
      })
      
      if (response.success) {
        window.$toast?.success('Subscription cancelled successfully!')
        closeCancellationModal()
        // Emit event to refresh billing data
        emit('close')
      } else {
        window.$toast?.error(response.message || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      window.$toast?.error('Failed to cancel subscription. Please try again.')
    } finally {
      cancelling.value = false
    }
  }
  
  onMounted(() => {
    // Load billing data when modal opens
    if (props.show && props.billingData) {
      console.log('Loading billing data:', props.billingData)
    }
  })
  
  // Watch for changes in billingData prop
  watch(() => props.billingData, (newData) => {
    if (newData) {
      console.log('Billing data updated:', newData)
    }
  }, { immediate: true })
  </script>
  
  <style scoped>
  .billing-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  
  .billing-modal {
    background: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
  }
  
  .header-content h2 {
    margin: 0 0 var(--space-1) 0;
    color: var(--color-text-primary);
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .header-content p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  .close-button {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-normal);
  }
  
  .close-button:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
  
  .modal-content {
    padding: var(--space-6);
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }
  
  .subscription-section,
  .charges-section {
    margin-bottom: var(--space-8);
  }
  
  .subscription-section h3,
  .charges-section h3 {
    margin: 0 0 var(--space-4) 0;
    color: var(--color-text-primary);
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .subscription-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }
  
  .subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-5);
  }
  
  .plan-info h4 {
    margin: 0 0 var(--space-1) 0;
    color: var(--color-text-primary);
    font-size: 1.125rem;
    font-weight: 600;
  }
  
  .plan-description {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  .plan-price {
    text-align: right;
  }
  
  .price-amount {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary);
  }
  
  .price-period {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  .subscription-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-5);
    padding: var(--space-4);
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-md);
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  
  .detail-item .label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .detail-item .value {
    font-size: 0.875rem;
    color: var(--color-text-primary);
    font-weight: 500;
  }
  
  .status.active {
    color: var(--color-success);
  }
  
  .subscription-actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  
  .action-btn {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 1px solid var(--color-border);
  }
  
  .action-btn.secondary {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }
  
  .action-btn.secondary:hover {
    background: var(--color-bg-hover);
  }
  
  .action-btn.danger {
    background: transparent;
    color: var(--color-error);
    border-color: var(--color-error);
  }
  
  .action-btn.danger:hover {
    background: var(--color-error);
    color: white;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }
  
  .download-all-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-normal);
  }
  
  .download-all-btn:hover {
    background: var(--color-primary-hover);
  }
  
  .charges-table {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  
  .table-header {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 1fr auto;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-bg-tertiary);
    border-bottom: 1px solid var(--color-border);
  }
  
  .header-cell {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .table-body {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .table-row {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 1fr auto;
    gap: var(--space-4);
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border);
    transition: background-color var(--transition-normal);
  }
  
  .cell:nth-child(2) {
    word-break: break-word;
    min-width: 0;
  }
  
  .table-row:hover {
    background: var(--color-bg-hover);
  }
  
  .table-row:last-child {
    border-bottom: none;
  }
  
  .cell {
    font-size: 0.875rem;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
  }
  
  .status-badge {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .status-badge.succeeded {
    background: rgba(34, 197, 94, 0.1);
    color: var(--color-success);
  }
  
  .status-badge.pending {
    background: rgba(251, 191, 36, 0.1);
    color: var(--color-warning);
  }
  
  .status-badge.failed {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-error);
  }
  
  .status-badge.active {
    background: rgba(34, 197, 94, 0.1);
    color: var(--color-success);
  }
  
  .status-badge.canceled {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-error);
  }
  
  .status-badge.incomplete {
    background: rgba(251, 191, 36, 0.1);
    color: var(--color-warning);
  }
  
  .download-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-normal);
  }
  
  .download-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
  
  .empty-state {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-text-secondary);
  }
  
  .empty-state i {
    font-size: 3rem;
    margin-bottom: var(--space-4);
    opacity: 0.5;
  }
  
  .empty-state p {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0 0 var(--space-2) 0;
    color: var(--color-text-primary);
  }
  
  .empty-state span {
    font-size: 0.875rem;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .billing-modal {
      width: 95%;
      margin: var(--space-4);
    }
  
    .modal-header {
      padding: var(--space-4);
    }
  
    .modal-content {
      padding: var(--space-4);
    }
  
    .subscription-header {
      flex-direction: column;
      gap: var(--space-3);
      text-align: left;
    }
  
    .plan-price {
      text-align: left;
    }
  
    .subscription-details {
      grid-template-columns: 1fr;
    }
  
    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      gap: var(--space-2);
    }
  
    .header-cell,
    .cell {
      padding: var(--space-2) 0;
    }
    
    .cell:nth-child(2) {
      word-break: normal;
    }
  }
  
  /* Modal Overlay Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
    backdrop-filter: blur(4px);
  }
  
  .sub-modal-content {
    background: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border);
  }
  
  .sub-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
  }
  
  .sub-modal-header h3 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .sub-modal-body {
    padding: var(--space-4);
    max-height: calc(90vh - 80px);
    overflow-y: auto;
  }
  
  /* Plan Selection Styles */
  .plan-option-btn {
    width: 100%;
    padding: var(--space-2) var(--space-4);
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-normal);
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .plan-option-btn:hover:not(:disabled) {
    background: var(--color-bg-hover);
    border-color: var(--color-primary);
  }

  .plan-option-btn:disabled {
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    cursor: not-allowed;
  }

  .downgrade-message {
    margin-top: var(--space-4);
    padding: var(--space-3);
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid var(--color-warning);
    border-radius: var(--radius-md);
    color: var(--color-warning);
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
  }

  .contact-btn {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
  }

  .contact-btn:hover {
    text-decoration: underline;
  }

  .loading-state {
    text-align: center;
    padding: var(--space-6);
  }

  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-3);
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Payment Form Styles */
  .form-group {
    margin-bottom: var(--space-4);
  }
  
  .form-group label {
    display: block;
    margin-bottom: var(--space-2);
    font-weight: 500;
    color: var(--color-text-primary);
  }
  
  .form-group input {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    transition: border-color var(--transition-normal);
  }
  
  .form-group input:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }
  
  .form-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
    margin-top: var(--space-4);
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-danger {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 1px solid transparent;
  }
  
  .btn-primary {
    background: var(--color-primary);
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
  }
  
  .btn-secondary {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border-color: var(--color-border);
  }
  
  .btn-secondary:hover {
    background: var(--color-bg-hover);
  }
  
  .btn-danger {
    background: var(--color-error);
    color: white;
  }
  
  .btn-danger:hover:not(:disabled) {
    background: #dc2626;
  }
  
  .btn-primary:disabled,
  .btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Cancellation Modal Styles */
  .cancellation-reasons h4 {
    margin: 0 0 var(--space-3) 0;
    color: var(--color-text-primary);
    font-size: 1.125rem;
    font-weight: 600;
  }
  
  .reasons-list {
    margin-bottom: var(--space-4);
  }
  
  .reason-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) 0;
    cursor: pointer;
    color: var(--color-text-primary);
  }
  
  .reason-item input[type="radio"] {
    margin: 0;
  }
  
  .cancellation-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
  }
  
  /* Mobile Responsiveness for Modals */
  @media (max-width: 768px) {
    .sub-modal-content {
      width: 95%;
      margin: var(--space-4);
    }
    
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .form-actions,
    .cancellation-actions {
      flex-direction: column;
    }
    
    .btn-primary,
    .btn-secondary,
    .btn-danger {
      width: 100%;
    }
  }
  </style>