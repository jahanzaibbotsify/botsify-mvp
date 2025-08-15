<script setup lang="ts">
import {Input, Button} from "@/components/ui";
import { ref, watch, computed } from "vue";
import { usePublishStore } from "@/stores/publishStore";
// Props
interface Props {
  isCheckingConfiguration?: boolean;
}

withDefaults(defineProps<Props>(), {
  isCheckingConfiguration: false
});

// Emits
const emit = defineEmits<{
  'check-configuration': [];
}>();

// Twilio fields
const smsFields = ref({
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioSmsNumber: '',
});

// Validation state
const errors = ref({
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioSmsNumber: '',
});

const publishStore = usePublishStore();

// Loading state
const isLoading = ref(false);

// Computed property to check if all required fields are filled
const isFormValid = computed(() => {
  return smsFields.value.twilioAccountSid.trim() !== '' &&
         smsFields.value.twilioAuthToken.trim() !== '' &&
         smsFields.value.twilioSmsNumber.trim() !== '';
});

// Load existing Twilio settings from store cache
const loadTwilioSettings = () => {
  if (publishStore.cache.thirdPartyConfig?.twilioConf) {
    const twilioConfig = publishStore.cache.thirdPartyConfig.twilioConf;
    smsFields.value = {
      twilioAccountSid: twilioConfig.sid || '',
      twilioAuthToken: twilioConfig.auth_token || '',
      twilioSmsNumber: twilioConfig.number || '',
    };
    // Clear errors when loading settings
    clearErrors();
  }
};

// Watch for when configuration checking is complete and store is loaded
watch(() => publishStore.loadingStates.thirdPartyConfig, (newValue, oldValue) => {
  // When loading is complete (false), load the settings
  if (oldValue === true && newValue === false) {
    loadTwilioSettings();
  }
}, { immediate: true });

// Also watch the store cache directly
watch(() => publishStore.cache.thirdPartyConfig, () => {
  loadTwilioSettings();
}, { immediate: true });

// Validation methods
const validateForm = () => {
  clearErrors();
  let isValid = true;

  // Validate Twilio Account SID
  if (!smsFields.value.twilioAccountSid.trim()) {
    errors.value.twilioAccountSid = 'Twilio account SID is required';
    isValid = false;
  } else if (smsFields.value.twilioAccountSid.trim().length < 10) {
    errors.value.twilioAccountSid = 'Account SID must be at least 10 characters';
    isValid = false;
  }

  // Validate Twilio Auth Token
  if (!smsFields.value.twilioAuthToken.trim()) {
    errors.value.twilioAuthToken = 'Twilio auth token is required';
    isValid = false;
  } else if (smsFields.value.twilioAuthToken.trim().length < 10) {
    errors.value.twilioAuthToken = 'Auth token must be at least 10 characters';
    isValid = false;
  }

  // Validate Twilio SMS Number
  if (!smsFields.value.twilioSmsNumber.trim()) {
    errors.value.twilioSmsNumber = 'Twilio SMS number is required';
    isValid = false;
  } else {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(smsFields.value.twilioSmsNumber.trim())) {
      errors.value.twilioSmsNumber = 'Please enter a valid phone number with country code (e.g., +1234567890)';
      isValid = false;
    }
  }

  return isValid;
};

const clearErrors = () => {
  errors.value = {
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioSmsNumber: '',
  };
};

const testBot = () => {
  isLoading.value = true;
  try {
    // Add actual test bot logic here
    if (window.$toast) {
      window.$toast.info('Bot test functionality coming soon');
    }
  } catch (error) {
    console.error('Failed to test bot:', error);
    if (window.$toast) {
      window.$toast.error('Failed to test bot');
    }
  } finally {
    isLoading.value = false;
  }
};

const saveSettings = async() => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  try {
    const result = await publishStore.saveTwilioSettings(smsFields.value);
    if (result.success) {
      // Recheck configuration after saving
    
      emit('check-configuration');
    } else {
      console.error('Failed to save Twilio settings:', result.error);
    }
  } catch (error) {
    console.error('Failed to save Twilio settings:', error);
  } finally {
    isLoading.value = false;
  }
};

// Expose methods for parent component
defineExpose({
  saveSettings,
  testBot,
});
</script>

<template>
  <div class="tab-panel">
    <h3>Publish your agent</h3>
    <p class="subtitle">Choose your SMS provider and configure settings</p>

    <!-- Loading State -->
    <div v-if="isCheckingConfiguration" class="loading-state">
      <div class="loader-spinner"></div>
      <span>Loading SMS settings...</span>
    </div>

    <!-- Form Content -->
    <div v-else class="form-section">
      <div class="form-group">
        <label for="twilio-account-sid">Twilio account SID</label>
        <Input 
          id="twilio-account-sid"
          v-model="smsFields.twilioAccountSid"
          type="text"
          placeholder="Enter your Twilio account SID"
          size="medium"
          :error="errors.twilioAccountSid"
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
          :error="errors.twilioAuthToken"
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
          :error="errors.twilioSmsNumber"
        />
        <small class="help-text">
          The phone number you purchased from Twilio
        </small>
      </div>
      <!-- Action Buttons -->
      <div class="agent-action-buttons">
        <!-- <Button 
          variant="secondary"
          size="medium"
          :loading="isLoading"
          @click="testBot"
        >
          {{ isLoading ? 'Testing...' : 'Test Agent' }}
        </Button>
         -->
        <Button 
          variant="primary"
          size="medium"
          :loading="isLoading"
          :disabled="!isFormValid"
          @click="saveSettings"
        >
          {{ isLoading ? 'Saving...' : 'Save Settings' }}
        </Button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Component-specific styles only - common styles moved to PublishAgentModal.vue */

.form-section {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.help-text {
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
  display: block;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--space-3);
  color: var(--color-text-secondary);
}

.loader-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

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