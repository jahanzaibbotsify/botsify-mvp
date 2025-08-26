<template>
  <ModalLayout
    ref="modalRef"
    title="Cancel Subscription"
    max-width="600px"
    @close="closeModal"
  >
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
      <Button variant="secondary" @click="closeModal">Keep Subscription</Button>
      <Button 
        variant="error" 
        @click="confirmCancellation"
        :disabled="!selectedCancellationReason || cancelling"
        :loading="cancelling"
      >
        Cancel Subscription
      </Button>
    </div>
  </ModalLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModalLayout from '@/components/ui/ModalLayout.vue'
import Button from '@/components/ui/Button.vue'
import { botsifyApi } from '@/services/botsifyApi'

interface Emits {
  (e: 'close'): void
  (e: 'subscriptionCancelled'): void
}

const emit = defineEmits<Emits>()

const modalRef = ref<InstanceType<typeof ModalLayout> | null>(null)
const cancelling = ref(false)
const selectedCancellationReason = ref('')

const cancellationReasons = ref([
  { key: 'difficult_to_use', label: 'Difficult to use' },
  { key: 'expensive', label: 'Do you think it\'s expensive?' },
  { key: 'dont_need', label: 'Don\'t need it' },
  { key: 'not_achieving_goal', label: 'Not able to achieve your goal?' }
])

const closeModal = () => {
  modalRef.value?.closeModal()
  emit('close')
  selectedCancellationReason.value = ''
}

// Expose methods to parent component
defineExpose({ 
  openModal: () => modalRef.value?.openModal(),
  closeModal: () => modalRef.value?.closeModal()
})

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
      closeModal()
      // Emit event to refresh billing data
      emit('subscriptionCancelled')
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
</script>

<style scoped>
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

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .cancellation-actions {
    flex-direction: column;
  }
}
</style>
