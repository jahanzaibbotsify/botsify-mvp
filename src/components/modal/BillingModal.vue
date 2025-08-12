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
                <button class="action-btn secondary">Change Plan</button>
                <button class="action-btn secondary">Update Payment</button>
                <button class="action-btn danger">Cancel Subscription</button>
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
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useAuthStore } from '@/stores/authStore'
  
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
    charges: {
      object: string
      data: StripeCharge[]
      has_more: boolean
      url: string
    }
    stripe_subscription: StripeSubscription
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
  
  const authStore = useAuthStore()
  
  // Computed properties
  const chargesData = computed(() => {
    return props.billingData?.charges?.data || []
  })
  
  const subscriptionData = computed(() => {
    return props.billingData?.stripe_subscription || null
  })
  
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
  </style>