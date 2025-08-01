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
                <h4>{{ currentPlan?.name || 'Free Plan' }}</h4>
                <p class="plan-description">{{ currentPlan?.description || 'Basic features for getting started' }}</p>
              </div>
              <div class="plan-price">
                <span class="price-amount">${{ currentPlan?.price || 0 }}</span>
                <span class="price-period">{{ currentPlan?.billing === 'monthly' ? '/month' : currentPlan?.billing === 'yearly' ? '/year' : '' }}</span>
              </div>
            </div>
            
            <div class="subscription-details">
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value status" :class="subscriptionStatus">{{ subscriptionStatusText }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Next Billing:</span>
                <span class="value">{{ nextBillingDate }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Method:</span>
                <span class="value">{{ paymentMethod }}</span>
              </div>
            </div>

            <div class="subscription-actions">
              <button class="action-btn secondary">Change Plan</button>
              <button class="action-btn secondary">Update Payment</button>
              <button class="action-btn danger">Cancel Subscription</button>
            </div>
          </div>
        </div>

        <!-- Usage Summary -->
        <div class="usage-section">
          <h3>Current Usage</h3>
          <div class="usage-grid">
            <div class="usage-item">
              <div class="usage-icon">
                <i class="pi pi-users"></i>
              </div>
              <div class="usage-info">
                <span class="usage-value">{{ currentUsage.users.toLocaleString() }}</span>
                <span class="usage-label">Users this month</span>
                <div class="usage-limit">of {{ currentPlan?.limits?.conversations === 'unlimited' ? '∞' : currentPlan?.limits?.conversations?.toLocaleString() || '5,000' }} limit</div>
              </div>
            </div>
            <div class="usage-item">
              <div class="usage-icon">
                <i class="pi pi-android"></i>
              </div>
              <div class="usage-info">
                <span class="usage-value">{{ currentUsage.agents }}</span>
                <span class="usage-label">Active Agents</span>
                <div class="usage-limit">of {{ currentPlan?.limits?.agents === 'unlimited' ? '∞' : currentPlan?.limits?.agents || 2 }} limit</div>
              </div>
            </div>
            <div class="usage-item">
              <div class="usage-icon">
                <i class="pi pi-chart-line"></i>
              </div>
              <div class="usage-info">
                <span class="usage-value">{{ currentUsage.conversations.toLocaleString() }}</span>
                <span class="usage-label">Conversations</span>
                <div class="usage-limit">this month</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice History -->
        <div class="invoices-section">
          <div class="section-header">
            <h3>Invoice History</h3>
            <button class="download-all-btn" @click="downloadAllInvoicesHandler">
              <i class="pi pi-download"></i>
              Download All
            </button>
          </div>
          
          <div class="invoices-table">
            <div class="table-header">
              <div class="header-cell">Date</div>
              <div class="header-cell">Plan</div>
              <div class="header-cell">Amount</div>
              <div class="header-cell">Status</div>
              <div class="header-cell">Actions</div>
            </div>
            
            <div v-if="invoices.length === 0" class="empty-state">
              <i class="pi pi-file"></i>
              <p>No invoices yet</p>
              <span>Your billing history will appear here</span>
            </div>
            
            <div v-else class="table-body">
              <div v-for="invoice in invoices" :key="invoice.id" class="table-row">
                <div class="cell">{{ formatDate(invoice.date) }}</div>
                <div class="cell">{{ invoice.planName }}</div>
                <div class="cell">${{ invoice.amount.toFixed(2) }}</div>
                <div class="cell">
                  <span class="status-badge" :class="invoice.status">{{ invoice.status }}</span>
                </div>
                <div class="cell">
                  <button class="download-btn" @click="downloadInvoiceHandler(invoice.id)">
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type { PricingPlan } from '@/types/auth'
import { generateInvoiceData, downloadInvoice, downloadAllInvoices } from '@/utils/invoiceGenerator'

interface Invoice {
  id: string
  date: Date
  planName: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
}

interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()

// Mock current usage data
const currentUsage = ref({
  users: 3247,
  agents: 2,
  conversations: 8932
})

// Mock invoice data
const invoices = ref<Invoice[]>([
  {
    id: 'inv_2024_001',
    date: new Date('2024-12-01'),
    planName: 'Done for you',
    amount: 149.00,
    status: 'paid'
  },
  {
    id: 'inv_2024_002', 
    date: new Date('2024-11-01'),
    planName: 'Done for you',
    amount: 149.00,
    status: 'paid'
  },
  {
    id: 'inv_2024_003',
    date: new Date('2024-10-01'),
    planName: 'Do it yourself',
    amount: 49.00,
    status: 'paid'
  },
  {
    id: 'inv_2024_004',
    date: new Date('2024-09-01'),
    planName: 'Do it yourself',
    amount: 49.00,
    status: 'paid'
  },
  {
    id: 'inv_2024_005',
    date: new Date('2024-08-01'),
    planName: 'Done for you',
    amount: 149.00,
    status: 'paid'
  },
  {
    id: 'inv_2024_006',
    date: new Date('2024-07-01'),
    planName: 'Custom',
    amount: 299.00,
    status: 'paid'
  },
  {
    id: 'inv_2024_007',
    date: new Date('2024-06-01'),
    planName: 'Custom',
    amount: 299.00,
    status: 'paid'
  }
])

const currentPlan = computed(() => {
  // Find the popular plan (Done for you) as default
  return authStore.pricingPlans.find(plan => plan.isPopular) || authStore.pricingPlans[0]
})

const subscriptionStatus = computed(() => 'active')
const subscriptionStatusText = computed(() => 'Active')
const nextBillingDate = computed(() => 'January 1, 2025')
const paymentMethod = computed(() => '**** **** **** 4242 (Visa)')

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const downloadInvoiceHandler = async (invoiceId: string) => {
  console.log('Downloading invoice:', invoiceId)
  
  // Find the invoice data
  const invoice = invoices.value.find(inv => inv.id === invoiceId)
  if (!invoice) {
    window.$toast?.error('Invoice not found')
    return
  }
  
  try {
    // Generate and download the invoice PDF
    const invoiceData = generateInvoiceData(invoice.id, invoice.planName, invoice.amount, invoice.date)
    window.$toast?.info('Generating PDF invoice...')
    await downloadInvoice(invoiceData)
    window.$toast?.success('PDF invoice downloaded successfully')
  } catch (error) {
    console.error('Error downloading invoice:', error)
    window.$toast?.error('Failed to download PDF invoice')
  }
}

const downloadAllInvoicesHandler = async () => {
  console.log('Downloading all invoices...')
  
  try {
    const invoiceList = invoices.value.map(invoice => ({
      id: invoice.id,
      planName: invoice.planName,
      amount: invoice.amount,
      date: invoice.date
    }))
    
    window.$toast?.info(`Starting download of ${invoiceList.length} PDF invoices + CSV summary...`)
    await downloadAllInvoices(invoiceList)
    window.$toast?.success('All invoices downloaded successfully!')
  } catch (error) {
    console.error('Error downloading invoices:', error)
    window.$toast?.error('Some invoices failed to download. Check console for details.')
  }
}

onMounted(() => {
  // Load billing data when modal opens
  if (props.show) {
    console.log('Loading billing data...')
  }
})
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
  gap: var(--space-4);
}

.header-content {
  flex: 1;
  min-width: 0; /* Allow content to shrink and text to wrap if needed */
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
  flex-shrink: 0; /* Prevent button from shrinking */
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
.usage-section,
.invoices-section {
  margin-bottom: var(--space-8);
}

.subscription-section h3,
.usage-section h3,
.invoices-section h3 {
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

.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.usage-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.usage-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.usage-info {
  flex: 1;
}

.usage-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.usage-label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
}

.usage-limit {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
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

.invoices-table {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
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
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-normal);
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

.status-badge.paid {
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
    gap: var(--space-3);
  }

  .header-content {
    flex: 1;
    min-width: 0; /* Allow text to wrap/truncate */
    margin-right: var(--space-2);
  }

  .header-content h2 {
    font-size: 1.25rem;
    line-height: 1.3;
  }

  .header-content p {
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .close-button {
    flex-shrink: 0; /* Prevent close button from shrinking */
    width: 36px;
    height: 36px;
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

  .usage-grid {
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
}

/* Extra small screens */
@media (max-width: 480px) {
  .billing-modal {
    width: 98%;
    margin: var(--space-2);
    max-height: 95vh;
  }

  .modal-header {
    padding: var(--space-3);
  }

  .header-content h2 {
    font-size: 1.125rem;
  }

  .header-content p {
    font-size: 0.75rem;
  }

  .close-button {
    width: 32px;
    height: 32px;
  }

  .modal-content {
    padding: var(--space-3);
  }
}
</style>