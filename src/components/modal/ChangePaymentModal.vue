<template>
  <ModalLayout
    ref="modalRef"
    title="Update Payment Method"
    max-width="600px"
    @close="closeModal"
  >
    <form @submit.prevent="updatePaymentMethod">
      <div class="form-group">
        <Input
          v-model="paymentForm.cardNumber"
          label="Card Number"
          placeholder="1234 5678 9012 3456"
          maxlength="19"
          @input="formatCardNumber"
          @blur="validateCardNumber"
          required
        />
      </div>
      <div class="form-row">
        <div class="form-group">
          <Input
            v-model="paymentForm.expiry"
            label="Expiry Date"
            placeholder="MM/YY"
            maxlength="5"
            @input="formatExpiry"
            @blur="validateExpiry"
            required
          />
        </div>
        <div class="form-group">
          <Input
            v-model="paymentForm.cvv"
            label="CVV"
            placeholder="123"
            maxlength="4"
            @input="formatCVV"
            @blur="validateCVV"
            required
          />
        </div>
      </div>
      <div class="form-group">
        <Input
          v-model="paymentForm.cardName"
          label="Name on Card"
          placeholder="John Doe"
          required
        />
      </div>
      <div class="form-actions">
        <Button variant="secondary" @click="closeModal">Cancel</Button>
        <Button type="submit" :disabled="updatingPayment" :loading="updatingPayment">
          Update Payment Method
        </Button>
      </div>
    </form>
  </ModalLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { botsifyApi } from '@/services/botsifyApi'
import { STRIPE_API_KEY } from '@/utils/config'

interface Props {
  currentPlanName: string
}

interface Emits {
  (e: 'close'): void
  (e: 'paymentUpdated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const updatingPayment = ref(false)

const paymentForm = ref({
  cardNumber: '',
  expiry: '',
  cvv: '',
  cardName: ''
})

const closeModal = () => {
  modalRef.value?.closeModal()
  emit('close')
  // Reset form
  paymentForm.value = {
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  }
}

// Expose methods to parent component
defineExpose({ 
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})

// Load Stripe script
const loadStripeScript = (): Promise<void> => {
  if (typeof window.Stripe !== 'undefined') {
    return Promise.resolve()
  }
  
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v2'
    script.onload = () => {
      // Wait a bit for Stripe to initialize
      setTimeout(() => {
        if (typeof window.Stripe !== 'undefined') {
          resolve()
        } else {
          reject(new Error('Stripe failed to initialize'))
        }
      }, 100)
    }
    script.onerror = () => reject(new Error('Failed to load Stripe'))
    document.head.appendChild(script)
  })
}

// Form formatting functions
const formatCardNumber = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\s/g, '').replace(/\D/g, '')
  
  // Limit to 16 digits
  value = value.slice(0, 16)
  
  // Add spaces every 4 digits
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  
  paymentForm.value.cardNumber = value
}

const formatExpiry = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  
  // Limit to 4 digits
  value = value.slice(0, 4)
  
  // Add slash after 2 digits
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  
  paymentForm.value.expiry = value
}

const formatCVV = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  
  // Limit to 4 digits (some cards have 4-digit CVV)
  value = value.slice(0, 4)
  
  paymentForm.value.cvv = value
}

// Validation functions
const validateCardNumber = () => {
  const cardNumber = paymentForm.value.cardNumber.replace(/\s/g, '')
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    window.$toast?.error('Card number must be between 13 and 19 digits')
  }
}

const validateExpiry = () => {
  const expiry = paymentForm.value.expiry
  if (expiry && !/^\d{2}\/\d{2}$/.test(expiry)) {
    window.$toast?.error('Please use MM/YY format for expiry date')
  }
}

const validateCVV = () => {
  const cvv = paymentForm.value.cvv
  if (cvv && (cvv.length < 3 || cvv.length > 4)) {
    window.$toast?.error('CVV must be 3 or 4 digits')
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
    window.Stripe.setPublishableKey(STRIPE_API_KEY)
    
    // Parse expiry date (MM/YY format)
    const expiry = paymentForm.value.expiry.split('/')
    if (expiry.length !== 2) {
      window.$toast?.error('Invalid expiry date format. Please use MM/YY format.')
      updatingPayment.value = false
      return
    }
    
    const ccData = {
      number: paymentForm.value.cardNumber.replace(/\s/g, ''),
      name: paymentForm.value.cardName,
      cvc: paymentForm.value.cvv,
      exp_month: parseInt(expiry[0]),
      exp_year: 2000 + parseInt(expiry[1]) // Convert YY to YYYY
    }
    
    // Validate card data
    if (isNaN(ccData.exp_month) || isNaN(ccData.exp_year) || ccData.exp_month < 1 || ccData.exp_month > 12) {
      window.$toast?.error('Invalid expiry date. Please use MM/YY format.')
      updatingPayment.value = false
      return
    }
    
    // Create Stripe token
    window.Stripe.card.createToken(ccData, async (status: string, response: any) => {
      console.log('Stripe token response:', status, response)
      if (response.error) {
        updatingPayment.value = false
        window.$toast?.error(response.error.message || 'Card validation failed')
      } else {
        const token = response.id
        
        // Send token to API using botsifyApi
        try {
          const apiResponse = await botsifyApi.updatePaymentMethod({
            token: token,
            plan: props.currentPlanName,
            coupon: '', // No coupon for payment method update
            card: ccData
          })
          
          if (apiResponse.success) {
            window.$toast?.success('Payment method updated successfully!')
            closeModal()
            // Emit event to refresh billing data
            emit('paymentUpdated')
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

onMounted(async () => {
  try {
    // Load Stripe script if not already loaded
    await loadStripeScript()
  } catch (error) {
    console.error('Failed to load Stripe:', error)
    window.$toast?.error('Failed to load payment system. Please try again.')
  }
})

// Declare Stripe as a global variable
declare global {
  interface Window {
    Stripe: any
  }
}
</script>

<style scoped>
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

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
