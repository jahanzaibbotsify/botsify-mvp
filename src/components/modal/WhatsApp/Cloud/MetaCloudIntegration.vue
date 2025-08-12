<template>
  <div class="meta-cloud-integration">
    <div class="integration-header">
      <h2 class="integration-title">Integrate your Chatbot with WhatsApp Cloud API</h2>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(currentStep / 6) * 100}%` }"></div>
      </div>
      <div class="step-indicator">
        Step {{ currentStep }} of 6
      </div>
    </div>
    
    <div class="integration-content">
      <!-- Step 1: Facebook Developer Account Setup -->
      <StepOne 
        v-if="currentStep === 1"
        :on-next="nextStep"
      />
      
      <!-- Step 2: Create Facebook App -->
      <StepTwo 
        v-if="currentStep === 2"
        :on-next="nextStep"
        :on-prev="prevStep"
      />
      
      <!-- Step 3: WhatsApp Business API Setup -->
      <StepThree 
        v-if="currentStep === 3"
        :on-next="nextStep"
        :on-prev="prevStep"
      />
      
      <!-- Step 4: Configuration Details -->
      <StepFour 
        v-if="currentStep === 4"
        :on-next="nextStep"
        :on-prev="prevStep"
        :form-data="formData"
      />
      
      <!-- Step 5: Additional Configuration -->
      <StepFive 
        v-if="currentStep === 5"
        :on-next="nextStep"
        :on-prev="prevStep"
        :form-data="formData"
      />
      
      <!-- Step 6: Webhook Configuration -->
      <StepSix 
        v-if="currentStep === 6"
        :on-complete="completeIntegration"
        :on-prev="prevStep"
        :webhook-url="webhookUrl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import StepOne from './StepOne.vue';
import StepTwo from './StepTwo.vue';
import StepThree from './StepThree.vue';
import StepFour from './StepFour.vue';
import StepFive from './StepFive.vue';
import StepSix from './StepSix.vue';
import { useBotStore } from '@/stores/botStore';
import { usePublishStore } from '@/stores/publishStore';

interface Props {
  onComplete: () => void;
}

const props = defineProps<Props>();

// Stores
const botStore = useBotStore();
const publishStore = usePublishStore();

// Reactive data
const currentStep = ref(1);
const formData = ref({
  temporary_token: '',
  whatsapp: '',
  whatsapp_phone_id: '',
  whatsapp_account_id: '',
  client_id: '',
  client_secret: ''
});

// Computed webhook URL
const webhookUrl = computed(() => {
  return `${window.location.origin}/api/webhook/whatsapp/${botStore.botId}`;
});

// Navigation methods
const nextStep = () => {
  if (currentStep.value < 6) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const completeIntegration = async () => {
  try {
    // Save the Meta Cloud settings
    const result = await publishStore.saveWhatsAppSettings({
        temporary_token: formData.value.temporary_token,
        whatsapp: formData.value.whatsapp,
        whatsapp_phone_id: formData.value.whatsapp_phone_id,
        whatsapp_account_id: formData.value.whatsapp_account_id,
        client_id: formData.value.client_id,
        client_secret: formData.value.client_secret,
        type: 'meta' as const,
        api_key: botStore.apiKey,
        bot_id: botStore.botId,
        interactive_buttons: false,
        webhook: webhookUrl.value,
        req_type: 'meta',
    });
    
    if (result.success) {
      window.$toast?.success('Meta Cloud integration completed successfully!');
      props.onComplete();
    } else {
      window.$toast?.error('Failed to save Meta Cloud settings');
    }
  } catch (error) {
    console.error('Failed to complete Meta Cloud integration:', error);
    window.$toast?.error('Failed to complete integration');
  }
};
</script>

<style scoped>
.meta-cloud-integration {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
}

.integration-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 0 24px;
}

.integration-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
  margin: 0 0 24px 0;
  line-height: 1.3;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary, #3b82f6), var(--color-primary-hover, #2563eb));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.step-indicator {
  font-size: 14px;
  color: var(--color-text-secondary, #6b7280);
  font-weight: 500;
}

.integration-content {
  min-height: 400px;
}

@media (max-width: 640px) {
  .integration-header {
    padding: 0 16px;
  }
  
  .integration-title {
    font-size: 24px;
  }
}
</style>
