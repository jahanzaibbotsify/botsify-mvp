<template>
  <ModalLayout
    ref="modalRef"
    title="Billing & Subscription"
    max-width="900px"
    @close="closeModal"
  >
    <div class="billing-content">
      <!-- Current Subscription Info -->
      <div class="subscription-section">
        <h3>Current Subscription</h3>
        <div class="subscription-card">
          <div class="subscription-header">
            <div class="plan-info">
              <h4>{{ getActualPlanName }}</h4>
              <!-- <p class="plan-description">{{ getPlanDescription(getActualPlanName) }}</p> -->
            </div>
            <div class="plan-price">
              <span class="price-amount">${{ getPlanPrice(getActualPlanName) }}</span>
              <span class="price-period">{{ getBillingPeriod(getActualPlanName) }}</span>
            </div>
          </div>

          <div class="subscription-actions">
            <Button 
              variant="secondary"
              @click="openChangePlanModal"
            >
              Change Plan
            </Button>
            <Button variant="secondary" @click="openChangePaymentModal">Update Payment</Button>
            <Button variant="error" @click="openCancellationModal">Cancel Subscription</Button>
          </div>
        </div>
      </div>

      <!-- Charges History -->
      <div class="charges-section">
        <div class="section-header">
          <h3>Payment History</h3>
          <Button @click="downloadAllChargesHandler" icon="pi pi-download">
            Download All
          </Button>
        </div>
        
        <Table v-if="chargesData.length > 0">
          <TableHeader>
            <TableRow>
              <TableCell width='1fr'>Date</TableCell>
              <TableCell width='2fr'>Description</TableCell>
              <TableCell width='1fr'>Amount</TableCell>
              <TableCell width='1fr'>Status</TableCell>
              <TableCell width='1fr'>Action</TableCell>
            </TableRow>
          </TableHeader>
          
          <TableRow v-for="charge in chargesData" :key="charge.id">
            <TableCell>{{ formatDate(charge.created) }}</TableCell>
            <TableCell>{{ charge.description || 'Subscription payment' }}</TableCell>
            <TableCell align="right">${{ (charge.amount / 100).toFixed(2) }}</TableCell>
                         <TableCell align="center">
               <Badge 
                 :variant="getStatusVariant(charge.status)" 
                 size="small"
               >
                 {{ charge.status }}
               </Badge>
             </TableCell>
            <TableCell align="center">
              <Button 
                variant="secondary" 
                size="small" 
                icon="pi pi-download" 
                icon-only
                @click="downloadChargeReceipt(charge.receipt_url)" 
                title="Download Receipt"
              />
            </TableCell>
          </TableRow>
        </Table>
        
        <div v-else class="empty-state">
          <i class="pi pi-credit-card"></i>
          <p>No charges found</p>
          <span>Your payment history will appear here</span>
        </div>
      </div>
    </div>
  </ModalLayout>

         <!-- Change Plan Modal -->
     <ChangePlanModal
       ref="changePlanModalRef"
       :is-configured="isConfigured"
       :current-plan-id="currentPlanId"
       :can-downgrade="canDowngrade"
       @close="closeChangePlanModal"
       @plan-changed="handlePlanChanged"
     />

         <!-- Change Payment Method Modal -->
     <ChangePaymentModal
       ref="changePaymentModalRef"
       :current-plan-name="getActualPlanName"
       @close="closeChangePaymentModal"
       @payment-updated="handlePaymentUpdated"
     />

         <!-- Cancellation Modal -->
     <CancellationModal
       ref="cancellationModalRef"
       @close="closeCancellationModal"
       @subscription-cancelled="handleSubscriptionCancelled"
     />
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useWhitelabelStore } from '@/stores/whitelabelStore'
  import { storeToRefs } from 'pinia'
  import Button from '@/components/ui/Button.vue'
  import ModalLayout from '@/components/ui/ModalLayout.vue'
  import Table from '@/components/ui/Table.vue'
  import TableHeader from '@/components/ui/TableHeader.vue'
  import TableRow from '@/components/ui/TableRow.vue'
  import TableCell from '@/components/ui/TableCell.vue'
  import Badge from '@/components/ui/Badge.vue'
  import ChangePlanModal from './ChangePlanModal.vue'
  import ChangePaymentModal from './ChangePaymentModal.vue'
  import CancellationModal from './CancellationModal.vue'
  import type { StripeCharge, StripeSubscription, BillingData } from '@/types'
  
  
  interface Props {
  billingData?: BillingData | null
}
  
  interface Emits {
    (e: 'close'): void
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  
  // Modal refs
  const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
  const changePlanModalRef = ref<InstanceType<typeof ChangePlanModal> | null>(null)
  const changePaymentModalRef = ref<InstanceType<typeof ChangePaymentModal> | null>(null)
  const cancellationModalRef = ref<InstanceType<typeof CancellationModal> | null>(null)

  // Computed properties
  const chargesData = computed((): StripeCharge[] => {
    if (!props.billingData) {
      return []
    }
    
    // Try different possible data structures
    let charges: StripeCharge[] = []
    if (props.billingData.charges) {
      if (Array.isArray(props.billingData.charges)) {
        charges = props.billingData.charges
      } else if (props.billingData.charges.data && Array.isArray(props.billingData.charges.data)) {
        charges = props.billingData.charges.data
      }
    }
    
    return charges
  })

  const subscriptionData = computed((): StripeSubscription | null => {
    if (!props.billingData) {
      return null
    }
    
    // Try different possible data structures
    let subscription: StripeSubscription | null = null
    if (props.billingData.stripe_subscription) {
      subscription = props.billingData.stripe_subscription
    } else if (props.billingData.subscription) {
      subscription = props.billingData.subscription
    }
    
    console.log('Computed subscriptionData:', subscription)
    return subscription
  })

  // Helper function to get the actual plan name from Stripe subscription
  const getActualPlanName = computed(() => {
    if (!subscriptionData.value) return 'Free Plan'
    
    console.log('Getting actual plan name from subscriptionData:', subscriptionData.value)
    console.log('Whitelabel state - isConfigured:', isConfigured.value, 'isInitialized:', isInitialized.value)
    
    // Check if this is a Stripe subscription object with items
    if (subscriptionData.value.items && Array.isArray(subscriptionData.value.items.data)) {
      const firstItem = subscriptionData.value.items.data[0]
      console.log('First subscription item:', firstItem)
      if (firstItem && firstItem.plan && firstItem.plan.name) {
        console.log('Found plan name in items:', firstItem.plan.name)
        return firstItem.plan.name
      }
    }
    
    // Fallback to plan object if available
    if (subscriptionData.value.plan && subscriptionData.value.plan.name) {
      console.log('Found plan name in plan object:', subscriptionData.value.plan.name)
      return subscriptionData.value.plan.name
    }
    
    // Fallback to stripe_plan if available
    if (subscriptionData.value.stripe_plan) {
      console.log('Found plan name in stripe_plan:', subscriptionData.value.stripe_plan)
      return String(subscriptionData.value.stripe_plan)
    }
    
    console.log('No plan name found, returning Unknown Plan')
    return 'Unknown Plan'
  })
  
  // Modal states - remove these since we're using refs now
  // const showChangePlanModal = ref(false)
  // const showChangePaymentModal = ref(false)
  // const showCancellationModal = ref(false)
  
  
  
  const currentPlanId = computed(() => {
    const planName = getActualPlanName.value
    return planName || ''
  })

  const whitelabelStore = useWhitelabelStore()
  const { isConfigured, isInitialized } = storeToRefs(whitelabelStore)


  const canDowngrade = computed(() => {
    if (isConfigured.value) {
      return false // Whitelabel clients cannot downgrade
    }
    return true
  })


   
   // Helper function to get Badge variant based on status
   const getStatusVariant = (status: string | undefined): 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
     if (!status) return 'secondary'
     
     const statusLower = status.toLowerCase()
     
     if (statusLower === 'succeeded' || statusLower === 'active' || statusLower === 'completed') {
       return 'success'
     } else if (statusLower === 'pending' || statusLower === 'incomplete' || statusLower === 'processing') {
       return 'warning'
     } else if (statusLower === 'failed' || statusLower === 'canceled' || statusLower === 'cancelled') {
       return 'error'
     } else if (statusLower === 'trialing' || statusLower === 'past_due') {
       return 'info'
     }
     
     return 'secondary'
   }
  
  // Helper functions
  const getPlanDescription = (planName: string | undefined) => {
    if (!planName) return 'Professional plan with advanced features'
    
    // For whitelabel clients, use the plan name from Stripe
    if (isConfigured.value) {
      return `${planName} plan with advanced features`
    }
    
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
    if (!planName) return 0
    
    console.log('Getting plan price for:', planName, 'isConfigured:', isConfigured.value, 'isInitialized:', isInitialized.value)
    console.log('Subscription data plan:', subscriptionData.value?.plan)
    
    // For whitelabel clients, get price from Stripe data
    if (isConfigured.value && subscriptionData.value?.plan?.amount) {
      const price = (subscriptionData.value.plan.amount / 100)
      console.log('Whitelabel price from Stripe:', price)
      return price
    }
    
    console.log('Not using whitelabel pricing, falling back to default')
    
    // Handle Stripe plan names
    if (planName === 'Personal Plan') {
      return 49
    } else if (planName === 'Personal-Plan-Annual') {
      return 490
    } else if (planName === 'Professional Plan') {
      return 149
    } else if (planName === 'Professional-Plan-Annual') {
      return 1490
    }
    
    // Fallback to old logic
    if (planName.includes('Annual')) {
      return 1490
    } else if (planName.includes('Personal')) {
      return 49
    } else if (planName.includes('Professional')) {
      return 149
    }
    
    return 0
  }
  
  const getBillingPeriod = (planName: string | undefined) => {
    if (!planName) return '/month'
    
    console.log('Getting billing period for:', planName, 'isConfigured:', isConfigured.value, 'isInitialized:', isInitialized.value)
    console.log('Subscription data plan interval:', subscriptionData.value?.plan?.interval)
    
    // For whitelabel clients, get billing period from Stripe data
    if (isConfigured.value && subscriptionData.value?.plan?.interval) {
      const interval = subscriptionData.value.plan.interval
      const intervalCount = subscriptionData.value.plan.interval_count || 1
      console.log('Whitelabel interval from Stripe:', interval, 'count:', intervalCount)
      
      if (interval === 'year') {
        return '/year'
      } else if (interval === 'month' && intervalCount > 1) {
        return `/${intervalCount} months`
      } else if (interval === 'week') {
        return '/week'
      } else if (interval === 'day') {
        return '/day'
      }
    }
    
    console.log('Not using whitelabel billing period, falling back to default')
    
    // Handle Stripe plan names
    if (planName === 'Personal-Plan-Annual' || planName === 'Professional-Plan-Annual') {
      return '/year'
    }
    
    // Fallback to old logic
    if (planName.includes('Annual')) {
      return '/year'
    }
    
    return '/month'
  }
  
  const closeModal = () => {
    emit('close')
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
  
  

  // Modal methods
  const openChangePlanModal = () => {
    changePlanModalRef.value?.openModal()
  }
  
  const closeChangePlanModal = () => {
    changePlanModalRef.value?.closeModal()
  }
  
  const handlePlanChanged = () => {
    // Emit event to refresh billing data
    emit('close')
  }
  
  const handlePaymentUpdated = () => {
    // Emit event to refresh billing data
    emit('close')
  }
  
  const handleSubscriptionCancelled = () => {
    // Emit event to refresh billing data
    emit('close')
  }
  
  const openChangePaymentModal = () => {
    changePaymentModalRef.value?.openModal()
  }
  
  // Check if Stripe is available
  // const isStripeLoaded = computed(() => {
  //   return typeof window.Stripe !== 'undefined'
  // })
  
  const closeChangePaymentModal = () => {
    changePaymentModalRef.value?.closeModal()
  }
  
  const openCancellationModal = () => {
    cancellationModalRef.value?.openModal()
  }
  
  const closeCancellationModal = () => {
    cancellationModalRef.value?.closeModal()
  }

  // Watch for changes in billingData prop
  watch(() => props.billingData, (newData) => {
    if (newData) {
      // Billing data updated
    }
  }, { immediate: true })
  
  // Initialize whitelabel store when component mounts
  onMounted(async () => {
    // Initialize whitelabel store if needed
    if (!isInitialized.value) {
      try {
        await whitelabelStore.initialize()
        console.log('Whitelabel store initialized:', {
          isConfigured: isConfigured.value,
          config: whitelabelStore.config
        })
      } catch (error) {
        console.error('Failed to initialize whitelabel store:', error)
      }
    }
    
    // Note: Packages are only fetched on the pricing page, not here
    // as they're not needed for billing information
  })

  // Expose methods to parent component
  defineExpose({ 
    openModal: () => modalRef.value?.openModal(),
    closeModal: () => modalRef.value?.closeModal()
  })
</script>
  
  <style scoped>
  .billing-content {
    padding: var(--space-4);
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
  
  
  
  .subscription-actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }
  
  .status-badge{
    width: max-content;
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

  }
  

  
  
  
  
  </style>