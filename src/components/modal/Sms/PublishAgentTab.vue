<script setup lang="ts">
import {Input} from "@/components/ui";
import { ref } from "vue";

// Props
interface Props {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

// Emits
const emit = defineEmits<{
  'save-settings': [settings: any];
}>();

// Twilio fields
const smsFields = ref({
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioSmsNumber: '',
  twilioSenderId: '',
});

const saveSettings = () => {
  if (!smsFields.value.twilioAccountSid || !smsFields.value.twilioAuthToken || 
      !smsFields.value.twilioSmsNumber || !smsFields.value.twilioSenderId) {
    console.error('All Twilio fields are required');
    return;
  }
  emit('save-settings', smsFields.value);
};

// Expose methods for parent component
defineExpose({
  saveSettings,
});
</script>

<template>
  <div class="tab-panel">
    <h3>Publish your agent</h3>
    <p class="subtitle">Choose your SMS provider and configure settings</p>

    <div class="form-group">
      <label for="twilio-account-sid">Twilio account SID</label>
      <Input 
        id="twilio-account-sid"
        v-model="smsFields.twilioAccountSid"
        type="text"
        placeholder="Enter your Twilio account SID"
        size="medium"
      />
      <small class="help-text">
        Find this in your Twilio Console dashboard
      </small>
    </div>
    
    <div class="form-group">
      <label for="twilio-auth-token">Twilio auth token</label>
      <Input 
        id="twilio-auth-token"
        v-model="smsFields.twilioAuthToken"
        type="password"
        placeholder="Enter your Twilio auth token"
        size="medium"
      />
      <small class="help-text">
        Keep this secure - it's your authentication token
      </small>
    </div>
    
    <div class="form-group">
      <label for="twilio-sms-number">Twilio SMS number</label>
      <Input 
        id="twilio-sms-number"
        v-model="smsFields.twilioSmsNumber"
        type="tel"
        placeholder="Enter your Twilio phone number"
        size="medium"
      />
      <small class="help-text">
        The phone number you purchased from Twilio
      </small>
    </div>
    
    <div class="form-group">
      <label for="twilio-sender-id">Twilio sender ID</label>
      <Input 
        id="twilio-sender-id"
        v-model="smsFields.twilioSenderId"
        type="text"
        placeholder="Enter your sender ID (optional)"
        size="medium"
      />
      <small class="help-text">
        The name that appears as the sender (if supported in your region)
      </small>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

.provider-selection {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.provider-button {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  background: var(--color-bg-secondary, #f9fafb);
  color: var(--color-text-primary, #111827);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  font-family: inherit;
}

.provider-button:hover {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-bg-tertiary, #f3f4f6);
}

.provider-button.active {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary, #3b82f6);
  color: white;
}

.provider-form {
  margin-bottom: 24px;
}

@media (max-width: 640px) {
  .provider-selection {
    flex-direction: column;
  }
  
  .provider-button {
    width: 100%;
  }
}
</style> 