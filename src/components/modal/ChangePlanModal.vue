<template>
  <ModalLayout
    ref="modalRef"
    title="Change Your Plan"
    max-width="600px"
    @close="closeModal"
  >
    <div v-if="!changingPlan">
      <!-- Whitelabel Client Plans -->
      <div v-if="isConfigured">
        <div v-if="Object.keys(availableWhitelabelPlans).length > 0">
          <div v-for="(planName, planId) in availableWhitelabelPlans" :key="planId">
            <Button 
              class="plan-option-btn" 
              variant="secondary"
              @click="selectPlan(String(planId))"
            >
              {{ planName }}
            </Button>
          </div>
        </div>
        <div v-else class="no-plans-message">
          <p>No other plans available for your current subscription.</p>
        </div>
      </div>
      
      <!-- Regular Client Plans -->
      <div v-else>
        <!-- Personal Plan Monthly to Annual -->
        <Button 
          v-show="currentPlanId === 'Personal Plan'" 
          class="plan-option-btn" 
          variant="secondary"
          @click="selectPlan('Personal-Plan-Annual')"
        >
          Personal Plan - $490/Year
        </Button>
        
        <!-- Personal Plan Annual to Monthly -->
        <Button 
          v-show="currentPlanId === 'Personal-Plan-Annual'" 
          class="plan-option-btn" 
          variant="secondary"
          @click="selectPlan('Personal-Plan')"
        >
          Personal Plan - $49/Month
        </Button>
        
        <!-- Upgrade to Professional Monthly -->
        <Button 
          v-show="currentPlanId !== 'Professional Plan'" 
          class="plan-option-btn" 
          variant="secondary"
          @click="selectPlan('Professional-Plan')"
        >
          Professional Plan - $149/Month
        </Button>
        
        <!-- Upgrade to Professional Annual -->
        <Button 
          v-show="currentPlanId !== 'Professional-Plan-Annual'" 
          class="plan-option-btn" 
          variant="secondary"
          @click="selectPlan('Professional-Plan-Annual')"
        >
          Professional Plan - $1490/Year
        </Button>
        
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
    

    <!-- Loading State -->
    <div  v-else class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Processing...</p>
      </div>
    </div>
  </ModalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import Button from '@/components/ui/Button.vue'
import { botsifyApi } from '@/services/botsifyApi'
import { useWhitelabelStore } from '@/stores/whitelabelStore'
import { storeToRefs } from 'pinia'

interface Props {
  isConfigured: boolean
  currentPlanId: string
  canDowngrade: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'planChanged'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const changingPlan = ref(false)

const closeModal = () => {
  modalRef.value?.closeModal()
  emit('close')
}

// Expose methods to parent component
defineExpose({ 
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})

const getContactEmail = () => {
  return 'mailto:support@botsify.ai'
}

// Whitelabel plans computed locally
const whitelabelStore = useWhitelabelStore()
const { isConfigured: wlIsConfigured, isInitialized, packages } = storeToRefs(whitelabelStore)

const availableWhitelabelPlans = computed<Record<string, string>>(() => {
  if (!wlIsConfigured.value) return {}

  const plans: Record<string, string> = {}
  for (const pkg of packages.value) {
    if (pkg.name === props.currentPlanId) continue
    const priceNumber = parseFloat(pkg.price || '0') || 0
    const period = pkg.type === 'yearly' ? 'year' : 'month'
    plans[pkg.name] = `${pkg.name} - $${priceNumber}/${period}`
  }
  return plans
})

onMounted(async () => {
  try {
    if (!isInitialized.value) {
      await whitelabelStore.initialize()
    }
    await whitelabelStore.fetchPackages()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to prepare whitelabel plans in ChangePlanModal:', (err as any)?.message)
  }
})

// Plan selection
const selectPlan = async (planId: string) => {
  if (planId === props.currentPlanId) return
  
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
      closeModal()
      // Emit event to refresh billing data
      emit('planChanged')
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
</script>

<style scoped>
/* Plan Selection Styles */
.plan-option-btn {
  width: 100%;
  margin-bottom: var(--space-2);
}

.plan-option-btn:disabled small {
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
  margin-top: var(--space-1);
}

.no-plans-message {
  text-align: center;
  padding: var(--space-4);
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.no-plans-message p {
  margin: 0 0 var(--space-2) 0;
  font-size: 0.875rem;
}

.no-plans-message p:last-child {
  margin-bottom: 0;
  font-size: 0.8rem;
  opacity: 0.8;
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
</style>
