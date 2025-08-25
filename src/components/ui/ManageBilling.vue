<script setup lang="ts">
import { ref } from 'vue';
import { BillingData } from '@/types';
import Button from './Button.vue';
import { botsifyApi } from '@/services/botsifyApi';
import BillingModal from '@/components/modal/BillingModal.vue';

defineProps<{
  iconPosition?: 'left' | 'right'
  class?: string
  size?: 'small' | 'medium' | 'large'
}>()

const billingModalRef = ref<InstanceType<typeof BillingModal> | null>(null)
const showBillingModal = ref(false)
const billingLoading = ref(false)
const billingData = ref<BillingData | null>(null)


const closeBillingModal = () => {
  showBillingModal.value = false
  billingData.value = null
}


const handleManageBilling = async () => {
  billingLoading.value = true
  try {
    const res = await botsifyApi.manageBilling()
    
    if (res && res.charges && res.stripe_subscription) {
      // Store the billing data and show modal
      billingData.value = res
      showBillingModal.value = true
    } else if(res && res.url) {
      window.open(res.url, '_blank')
    } else {
      // If no billing data, open the billing modal with empty data
      billingData.value = null
      showBillingModal.value = true
    }
  } catch (e) {
    console.error('Error fetching billing portal:', e)
    // If API call fails, open the billing modal with empty data
    billingData.value = null
    showBillingModal.value = true
  } finally {
    billingLoading.value = false
  }
}

</script>

<template>
    <Button @click="handleManageBilling" :loading="billingLoading" :disabled="billingLoading" icon="pi pi-external-link" :iconPosition="iconPosition" :class="class" :size="size">
        Manage Billing
    </Button>
    <BillingModal 
      ref="billingModalRef" 
      :show="showBillingModal" 
      :billing-data="billingData"
      @close="closeBillingModal"
    ></BillingModal>
</template>